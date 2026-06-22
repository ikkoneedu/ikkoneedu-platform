"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  type User,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";
import {
  getUserProfile,
  createPublicUserProfile,
} from "@/lib/services/user-profile";
import { getSchool } from "@/lib/services/schools";
import { ROLES } from "@/lib/auth/role-constants";
import type { UserProfile } from "@/lib/auth/firebase-auth-types";

interface AuthContextValue {
  /** Firebase Auth kullanıcısı (oturum yoksa null). */
  user: User | null;
  /**
   * Firestore `users/{uid}` profili (yoksa null — graceful fallback).
   * MVP'de rol ve tenant'ın TEK doğruluk kaynağıdır; yetkilendirme yalnızca
   * buradan yapılır (RoleGuard `profile.role` kullanır).
   */
  profile: UserProfile | null;
  /**
   * Firebase Auth custom claims (atanmışsa). YALNIZCA bilgilendirme amaçlıdır;
   * ileride sunucu tarafı (Admin SDK / middleware) doğrulaması için saklanır.
   * İstemci tarafı yetkilendirmede KULLANILMAZ — kaynak `profile`'dır.
   */
  claims: AuthClaims | null;
  /** Oturum durumu henüz çözülmedi mi? */
  loading: boolean;
  /** Oturum açık mı? */
  isAuthenticated: boolean;
  /** Firebase env tanımlı mı (Mock Mod değil mi)? */
  firebaseReady: boolean;
  /** Kullanıcının bağlı olduğu okul askıya alınmış mı? (süper admin hariç) */
  tenantSuspended: boolean;
  signIn: (
    email: string,
    password: string,
    remember?: boolean,
  ) => Promise<User>;
  /** Halk (genel kullanıcı) açık kaydı: hesap + PUBLIC profil oluşturur. */
  signUpPublic: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<User>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Uygulama geneli kimlik doğrulama sağlayıcısı.
 * Firebase oturumunu `onAuthStateChanged` ile dinler ve kullanıcı geldiğinde
 * Firestore profilini okur. Firebase yapılandırılmamışsa (Mock Mod) pasif kalır.
 */
export interface AuthClaims {
  role?: string;
  tenantId?: string;
  schoolId?: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [claims, setClaims] = useState<AuthClaims | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenantSuspended, setTenantSuspended] = useState(false);

  // Kullanıcının okulunun (tenant) askıda olup olmadığını belirler.
  // Süper admin, public/platform tenant'ları ve gerçek okul belgesi olmayan
  // (mock) tenant'lar muaftır → geriye dönük uyumlu.
  const resolveTenantSuspended = useCallback(
    async (prof: UserProfile | null): Promise<boolean> => {
      if (!prof || prof.role === ROLES.SUPER_ADMIN) return false;
      const tid = prof.tenantId;
      if (!tid || tid === "public" || tid === "platform") return false;
      try {
        const school = await getSchool(tid);
        return school?.status === "SUSPENDED";
      } catch {
        return false;
      }
    },
    [],
  );

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setTenantSuspended(false);
      return;
    }
    const prof = await getUserProfile(user.uid);
    setProfile(prof);
    setTenantSuspended(await resolveTenantSuspended(prof));
  }, [user, resolveTenantSuspended]);

  // Firebase oturum durumunu dinle.
  useEffect(() => {
    if (!isFirebaseConfigured() || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      // Kullanıcı geldiyse profilini oku (yoksa null kalır — fallback).
      const prof = firebaseUser ? await getUserProfile(firebaseUser.uid) : null;
      setProfile(prof);
      setTenantSuspended(await resolveTenantSuspended(prof));
      // Custom claims (varsa) — YALNIZCA bilgilendirme/gelecekte sunucu tarafı
      // doğrulama içindir. İstemci yetkilendirmesi `profile`'dan yapılır.
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdTokenResult();
          setClaims({
            role: token.claims.role as string | undefined,
            tenantId: token.claims.tenantId as string | undefined,
            schoolId: token.claims.schoolId as string | undefined,
          });
        } catch {
          setClaims(null);
        }
      } else {
        setClaims(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [resolveTenantSuspended]);

  const signIn = useCallback(
    async (email: string, password: string, remember = true) => {
      if (!isFirebaseConfigured() || !auth) {
        throw new Error(
          "Firebase yapılandırılmamış. Giriş için ortam değişkenlerini ayarlayın.",
        );
      }
      await setPersistence(
        auth,
        remember ? browserLocalPersistence : browserSessionPersistence,
      );
      const credential = await signInWithEmailAndPassword(auth, email, password);
      return credential.user;
    },
    [],
  );

  const signOut = useCallback(async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
  }, []);

  const signUpPublic = useCallback(
    async (email: string, password: string, displayName: string) => {
      if (!isFirebaseConfigured() || !auth) {
        throw new Error(
          "Firebase yapılandırılmamış. Kayıt için ortam değişkenlerini ayarlayın.",
        );
      }
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const newUser = credential.user;
      if (displayName) {
        await updateProfile(newUser, { displayName });
      }
      // PUBLIC rolüyle Firestore profili oluştur (yetki yükseltme yok).
      await createPublicUserProfile(newUser.uid, email, displayName);
      // Profili yerelde hemen yansıt.
      setProfile(await getUserProfile(newUser.uid));
      return newUser;
    },
    [],
  );

  const value: AuthContextValue = {
    user,
    profile,
    claims,
    loading,
    isAuthenticated: Boolean(user),
    firebaseReady: isFirebaseConfigured(),
    tenantSuspended,
    signIn,
    signUpPublic,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** AuthProvider içinden kimlik doğrulama durumuna erişir. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth, AuthProvider içinde kullanılmalıdır.");
  }
  return context;
}
