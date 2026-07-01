"use client";

import { useMemo, useState } from "react";
import {
  Users2,
  ClipboardList,
  Play,
  Copy,
  Download,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/auth/role-constants";
import { createManagedAccount } from "@/lib/services/users";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Alt kadro (herkesin açabildiği) + üst kadro (yalnız üst yönetim). */
const LOWER_ROLES: Role[] = [ROLES.TEACHER, ROLES.PR, ROLES.SALES, ROLES.DRIVER];
const MGMT_ROLES: Role[] = [ROLES.COORDINATOR, ROLES.VICE_PRINCIPAL, ROLES.PRINCIPAL];

/** Serbest girilen rol metnini role koduna çevirir (TR/İng eş anlamlılar). */
const ROLE_ALIASES: Record<string, Role> = {
  teacher: ROLES.TEACHER, ogretmen: ROLES.TEACHER, "öğretmen": ROLES.TEACHER,
  pr: ROLES.PR, "halkla ilişkiler": ROLES.PR, "halkla iliskiler": ROLES.PR,
  sales: ROLES.SALES, "satış": ROLES.SALES, satis: ROLES.SALES, "satış ekibi": ROLES.SALES,
  driver: ROLES.DRIVER, "şoför": ROLES.DRIVER, sofor: ROLES.DRIVER, "servis şoförü": ROLES.DRIVER,
  coordinator: ROLES.COORDINATOR, "koordinatör": ROLES.COORDINATOR, koordinator: ROLES.COORDINATOR,
  vice_principal: ROLES.VICE_PRINCIPAL, "müdür yardımcısı": ROLES.VICE_PRINCIPAL,
  "mudur yardimcisi": ROLES.VICE_PRINCIPAL, vice: ROLES.VICE_PRINCIPAL,
  principal: ROLES.PRINCIPAL, "müdür": ROLES.PRINCIPAL, mudur: ROLES.PRINCIPAL,
};

interface ParsedRow {
  line: number;
  email: string;
  displayName: string;
  role: Role;
  /** Geçersizse hata sebebi; geçerliyse null. */
  problem: string | null;
}

type RowStatus =
  | { state: "pending" }
  | { state: "running" }
  | { state: "ok"; password: string; emailSent?: boolean }
  | { state: "error"; message: string };

interface BulkStaffImportProps {
  tenantId: string;
  createdBy: string;
  /** Üst yönetim mi? (müdür/koordinatör gibi üst rolleri açabilir mi?) */
  isTopManager: boolean;
  /** Toplu işlem bitince listeyi tazelemek için. */
  onDone: () => void | Promise<void>;
}

/**
 * Toplu personel oluşturma — yönetici, satır satır "e-posta, Ad Soyad, Rol"
 * listesi yapıştırır; her satır doğrulanır ve tek tek (ikincil app ile, tested
 * `createManagedAccount` yolu) oluşturulur. Her hesaba geçici şifre + (e-posta
 * servisi hazırsa) hoş geldin e-postası gider. Hatalı satır toplu işlemi
 * durdurmaz; sonuçta tüm giriş bilgileri kopyalanır/indirilebilir.
 */
export function BulkStaffImport({ tenantId, createdBy, isTopManager, onDone }: BulkStaffImportProps) {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [running, setRunning] = useState(false);
  const [statuses, setStatuses] = useState<Record<number, RowStatus>>({});
  const [done, setDone] = useState(false);

  const allowedRoles = useMemo(
    () => (isTopManager ? [...LOWER_ROLES, ...MGMT_ROLES] : LOWER_ROLES),
    [isTopManager],
  );

  const rows = useMemo<ParsedRow[]>(() => {
    const seen = new Set<string>();
    const out: ParsedRow[] = [];
    raw.split(/\r?\n/).forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const parts = trimmed.split(/[,;\t]/).map((p) => p.trim());
      const email = (parts[0] ?? "").toLowerCase();
      // Başlık satırını atla.
      if (i === 0 && (email === "email" || email === "e-posta" || email === "eposta")) return;
      const displayName = parts[1] || email.split("@")[0];
      const roleRaw = (parts[2] ?? "").toLocaleLowerCase("tr-TR");
      const role = roleRaw ? ROLE_ALIASES[roleRaw] : ROLES.TEACHER;

      let problem: string | null = null;
      if (!EMAIL_RE.test(email)) problem = "Geçersiz e-posta";
      else if (seen.has(email)) problem = "Listede tekrar eden e-posta";
      else if (roleRaw && !role) problem = `Bilinmeyen rol: "${parts[2]}"`;
      else if (role && !allowedRoles.includes(role)) problem = `Bu rolü oluşturamazsınız: ${ROLE_LABELS[role]}`;
      seen.add(email);

      out.push({ line: i + 1, email, displayName, role: role ?? ROLES.TEACHER, problem });
    });
    return out;
  }, [raw, allowedRoles]);

  const validRows = rows.filter((r) => !r.problem);
  const invalidCount = rows.length - validRows.length;

  const run = async () => {
    if (running || validRows.length === 0) return;
    setRunning(true);
    setDone(false);
    const next: Record<number, RowStatus> = {};
    validRows.forEach((r) => (next[r.line] = { state: "pending" }));
    setStatuses({ ...next });

    for (const r of validRows) {
      next[r.line] = { state: "running" };
      setStatuses({ ...next });
      try {
        const res = await createManagedAccount({
          tenantId,
          createdBy,
          role: r.role,
          displayName: r.displayName,
          email: r.email,
        });
        next[r.line] = { state: "ok", password: res.tempPassword, emailSent: res.emailSent };
      } catch (e) {
        const code = (e as { code?: string })?.code ?? "";
        next[r.line] = {
          state: "error",
          message: code.includes("email-already-in-use") ? "E-posta zaten kayıtlı" : "Oluşturulamadı",
        };
      }
      setStatuses({ ...next });
    }
    setRunning(false);
    setDone(true);
    await onDone();
  };

  const okResults = rows
    .map((r) => ({ r, s: statuses[r.line] }))
    .filter((x) => x.s?.state === "ok") as { r: ParsedRow; s: Extract<RowStatus, { state: "ok" }> }[];

  const credentialsText = okResults
    .map((x) => `${x.r.email},${x.r.displayName},${ROLE_LABELS[x.r.role]},${x.s.password}`)
    .join("\n");

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(`e-posta,ad,rol,geçici şifre\n${credentialsText}`);
    } catch {
      /* pano erişilemezse yok say */
    }
  };

  const downloadCsv = () => {
    const blob = new Blob([`e-posta,ad,rol,gecici_sifre\n${credentialsText}\n`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "yeni-hesaplar.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <GlassCard tone="navy">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 text-left"
        aria-expanded={open}
      >
        <Users2 size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Toplu Personel Oluştur</h2>
        <ChevronDown
          size={18}
          className={`ml-auto text-muted transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-overlay/10 bg-overlay/[0.03] p-3 text-xs text-muted">
            <p className="flex items-center gap-1.5 font-medium text-content">
              <ClipboardList size={14} className="text-accent" aria-hidden="true" />
              Biçim: her satırda <span className="font-mono">e-posta, Ad Soyad, Rol</span>
            </p>
            <p className="mt-1">
              Rol boş bırakılırsa <strong>Öğretmen</strong> varsayılır. Kabul edilen roller:{" "}
              {allowedRoles.map((r) => ROLE_LABELS[r]).join(", ")}. Örnek:
            </p>
            <pre className="mt-1.5 overflow-x-auto rounded-lg bg-overlay/[0.04] p-2 font-mono text-[11px] text-muted">{`ayse@okul.com, Ayşe Yılmaz, Öğretmen
mehmet@okul.com, Mehmet Demir, Koordinatör`}</pre>
          </div>

          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={7}
            spellCheck={false}
            placeholder={"ayse@okul.com, Ayşe Yılmaz, Öğretmen\nmehmet@okul.com, Mehmet Demir, Müdür Yardımcısı"}
            disabled={running}
            className="w-full rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-3 font-mono text-sm text-content placeholder:text-muted/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />

          {rows.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-overlay/10">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-muted">
                    <th className="p-2.5 font-medium">E-posta</th>
                    <th className="p-2.5 font-medium">Ad</th>
                    <th className="p-2.5 font-medium">Rol</th>
                    <th className="p-2.5 font-medium">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-overlay/5">
                  {rows.map((r) => {
                    const s = statuses[r.line];
                    return (
                      <tr key={r.line} className="text-content">
                        <td className="p-2.5 text-muted">{r.email}</td>
                        <td className="p-2.5">{r.displayName}</td>
                        <td className="p-2.5 text-muted">{ROLE_LABELS[r.role]}</td>
                        <td className="p-2.5">
                          {r.problem ? (
                            <span className="inline-flex items-center gap-1 text-xs text-brand">
                              <AlertCircle size={13} aria-hidden="true" />
                              {r.problem}
                            </span>
                          ) : s?.state === "ok" ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                              <CheckCircle2 size={13} aria-hidden="true" />
                              {s.password}
                              {s.emailSent ? " · e-posta ✓" : ""}
                            </span>
                          ) : s?.state === "error" ? (
                            <span className="inline-flex items-center gap-1 text-xs text-brand">
                              <AlertCircle size={13} aria-hidden="true" />
                              {s.message}
                            </span>
                          ) : s?.state === "running" ? (
                            <span className="text-xs text-accent">Oluşturuluyor…</span>
                          ) : (
                            <span className="text-xs text-muted">Hazır</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <PrimaryButton type="button" size="md" onClick={run} disabled={running || validRows.length === 0}>
              <Play size={16} aria-hidden="true" />
              {running ? "Oluşturuluyor…" : `Oluştur (${validRows.length})`}
            </PrimaryButton>
            {invalidCount > 0 && (
              <span className="text-xs text-amber-400">{invalidCount} satır hatalı — atlanacak.</span>
            )}
            {done && okResults.length > 0 && (
              <>
                <PrimaryButton type="button" variant="secondary" size="sm" onClick={copyAll}>
                  <Copy size={15} aria-hidden="true" />
                  Bilgileri Kopyala
                </PrimaryButton>
                <PrimaryButton type="button" variant="secondary" size="sm" onClick={downloadCsv}>
                  <Download size={15} aria-hidden="true" />
                  CSV İndir
                </PrimaryButton>
              </>
            )}
          </div>

          {done && (
            <p className="text-sm text-muted">
              {okResults.length} hesap oluşturuldu.{" "}
              {okResults.length > 0 &&
                "Geçici şifreleri güvenli biçimde ilgili kişilere iletin (indirdiğiniz CSV'yi işiniz bitince silin)."}
            </p>
          )}
        </div>
      )}
    </GlassCard>
  );
}
