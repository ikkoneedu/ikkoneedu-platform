"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Plus,
  KeyRound,
  Copy,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Users,
  School,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import {
  createClass,
  listMyClasses,
  createCodedAccount,
  listMyCodes,
  type ClassRecord,
  type AccessCodeRecord,
  type CodeRole,
} from "@/lib/services/access-codes";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

/**
 * Öğretmen sınıf + erişim kodu yöneticisi.
 * Sınıf oluşturur, öğrenci/veli kodu üretir (gizli hesap), kodları listeler.
 */
export function ClassCodeManager() {
  const { user, profile, firebaseReady, loading } = useAuth();
  const tenantId = profile?.tenantId;
  const teacherUid = user?.uid;
  const canManage =
    firebaseReady && Boolean(tenantId) && Boolean(teacherUid) && profile?.role === ROLES.TEACHER;

  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [codes, setCodes] = useState<AccessCodeRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [lastCode, setLastCode] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!tenantId || !teacherUid) return;
    try {
      const [cls, cds] = await Promise.all([
        listMyClasses(tenantId, teacherUid),
        listMyCodes(tenantId, teacherUid),
      ]);
      setClasses(cls);
      setCodes(cds);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }, [tenantId, teacherUid]);

  useEffect(() => {
    if (canManage) void refresh();
  }, [canManage, refresh]);

  const handleCreateClass = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantId || !teacherUid || busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("className") ?? "").trim();
    const gradeLevel = String(data.get("gradeLevel") ?? "").trim();
    if (!name) return;

    setBusy(true);
    setError(null);
    try {
      await createClass({ tenantId, teacherUid, name, gradeLevel });
      form.reset();
      await refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleGenerate = async (
    event: FormEvent<HTMLFormElement>,
    role: CodeRole,
  ) => {
    event.preventDefault();
    if (!tenantId || !teacherUid || busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const displayName = String(data.get("displayName") ?? "").trim();
    const classId = String(data.get("classId") ?? "").trim() || undefined;
    if (!displayName) return;

    setBusy(true);
    setError(null);
    setLastCode(null);
    try {
      const result = await createCodedAccount({
        tenantId,
        teacherUid,
        role,
        displayName,
        classId,
      });
      setLastCode(result.code);
      form.reset();
      await refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  if (loading) {
    return (
      <GlassCard tone="navy" className="text-sm text-muted">
        Yükleniyor…
      </GlassCard>
    );
  }

  if (!canManage) {
    return (
      <GlassCard tone="navy" className="flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
        <div className="text-sm text-muted">
          <p className="font-semibold text-content">Sınıf yönetimi kullanılamıyor</p>
          <p className="mt-1">
            Bu özellik yalnızca giriş yapmış, bir okula bağlı öğretmen hesabıyla
            ve Firebase yapılandırması aktifken çalışır.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
          <AlertCircle size={16} aria-hidden="true" />
          {error}
        </p>
      )}

      {/* Sınıf oluştur */}
      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <School size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Sınıf Oluştur</h2>
        </div>
        <form onSubmit={handleCreateClass} className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
          <TextField label="Sınıf Adı" name="className" placeholder="6-A" required />
          <TextField label="Kademe (opsiyonel)" name="gradeLevel" placeholder="Ortaokul" />
          <PrimaryButton type="submit" size="md" disabled={busy}>
            <Plus size={16} aria-hidden="true" />
            Sınıf Ekle
          </PrimaryButton>
        </form>
        {classes.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {classes.map((c) => (
              <span
                key={c.id}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-muted"
              >
                {c.name}
                {c.gradeLevel ? ` · ${c.gradeLevel}` : ""}
              </span>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Kod üret */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard tone="navy">
          <div className="mb-4 flex items-center gap-2">
            <GraduationCap size={18} className="text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-content">Öğrenci Kodu Üret</h2>
          </div>
          <form onSubmit={(e) => handleGenerate(e, ROLES.STUDENT)} className="space-y-3">
            <TextField label="Öğrenci Ad Soyad" name="displayName" placeholder="Ad Soyad" required />
            <ClassSelect classes={classes} />
            <PrimaryButton type="submit" size="md" className="w-full" disabled={busy}>
              <KeyRound size={16} aria-hidden="true" />
              Öğrenci Kodu Üret
            </PrimaryButton>
          </form>
        </GlassCard>

        <GlassCard tone="navy">
          <div className="mb-4 flex items-center gap-2">
            <Users size={18} className="text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-content">Veli Kodu Üret</h2>
          </div>
          <form onSubmit={(e) => handleGenerate(e, ROLES.PARENT)} className="space-y-3">
            <TextField label="Öğrenci Ad Soyad (velisi)" name="displayName" placeholder="Ad Soyad velisi" required />
            <ClassSelect classes={classes} />
            <PrimaryButton type="submit" size="md" className="w-full" disabled={busy}>
              <KeyRound size={16} aria-hidden="true" />
              Veli Kodu Üret
            </PrimaryButton>
          </form>
        </GlassCard>
      </div>

      {lastCode && (
        <GlassCard tone="navy" className="flex items-center justify-between gap-4 border-accent/30">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Yeni Üretilen Kod</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-accent">{lastCode}</p>
            <p className="mt-1 text-xs text-muted">Bu kodu öğrenci/veliye verin; kod ile giriş yapacaklar.</p>
          </div>
          <PrimaryButton type="button" variant="secondary" size="md" onClick={() => copy(lastCode)}>
            {copied === lastCode ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            {copied === lastCode ? "Kopyalandı" : "Kopyala"}
          </PrimaryButton>
        </GlassCard>
      )}

      {/* Üretilen kodlar */}
      {codes.length > 0 && (
        <GlassCard tone="navy">
          <h2 className="mb-4 text-lg font-semibold text-content">Üretilen Kodlar</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted">
                  <th className="pb-2 pr-4 font-medium">Ad</th>
                  <th className="pb-2 pr-4 font-medium">Tür</th>
                  <th className="pb-2 pr-4 font-medium">Kod</th>
                  <th className="pb-2 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {codes.map((c) => (
                  <tr key={c.code} className="text-content">
                    <td className="py-2.5 pr-4">{c.displayName}</td>
                    <td className="py-2.5 pr-4 text-muted">
                      {c.role === ROLES.STUDENT ? "Öğrenci" : "Veli"}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-accent">{c.code}</td>
                    <td className="py-2.5">
                      <button
                        type="button"
                        onClick={() => copy(c.code)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-muted transition-colors hover:border-accent/30 hover:text-content"
                        aria-label="Kodu kopyala"
                      >
                        {copied === c.code ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function ClassSelect({ classes }: { classes: ClassRecord[] }) {
  if (classes.length === 0) {
    return (
      <p className="text-xs text-muted">
        Önce bir sınıf oluşturun (opsiyonel — sınıfsız da kod üretebilirsiniz).
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted">Sınıf (opsiyonel)</label>
      <select
        name="classId"
        defaultValue=""
        className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      >
        <option value="" className="bg-surface">Sınıf seçilmedi</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id} className="bg-surface">
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
