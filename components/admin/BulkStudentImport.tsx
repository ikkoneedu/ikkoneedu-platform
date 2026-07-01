"use client";

import { useMemo, useState } from "react";
import {
  GraduationCap,
  ClipboardList,
  Play,
  Copy,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { createStudent } from "@/lib/services/students";
import { createParent, linkParentToStudent, type ParentRecord } from "@/lib/services/parents";
import { provisionParentAccount } from "@/lib/services/account-provisioning";
import type { SchoolClass } from "@/lib/services/classes";
import { printCredentialCards } from "@/lib/print/credential-cards";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** "Ayşe Nur Yılmaz" → { firstName: "Ayşe Nur", lastName: "Yılmaz" } */
function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts[parts.length - 1] };
}

/** Sınıf adını hoşgörülü eşleştir: "1-A" = "1 A" = "1a". */
const normClass = (s: string) => s.trim().toLocaleLowerCase("tr-TR").replace(/[\s-]/g, "");

interface ParsedRow {
  line: number;
  studentName: string;
  classId: string;
  className: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  problem: string | null;
}

type RowStatus =
  | { state: "pending" }
  | { state: "running" }
  | { state: "ok"; parentPassword?: string }
  | { state: "error"; message: string };

interface BulkStudentImportProps {
  tenantId: string;
  schoolId: string;
  createdBy: string;
  classes: SchoolClass[];
  /** Veli giriş hesabı (ve hoş geldin e-postası) açma yetkisi var mı? */
  canCreateAccounts: boolean;
  onDone: () => void | Promise<void>;
}

/**
 * Toplu öğrenci/veli ekleme — yönetici "Öğrenci Adı, Sınıf, Veli Adı, Veli
 * E-posta, Veli Telefon" satırlarını yapıştırır. Her satır için: öğrenci kaydı
 * (+ sınıfa atama) → veli kaydı → öğrenci-veli bağı → (e-posta varsa ve yetki
 * varsa) veli giriş hesabı + hoş geldin e-postası. Öğrenciler kod ile
 * girdiğinden öğrenci giriş hesabı açılmaz. Hatalı satır toplu işlemi durdurmaz.
 */
export function BulkStudentImport({
  tenantId,
  schoolId,
  createdBy,
  classes,
  canCreateAccounts,
  onDone,
}: BulkStudentImportProps) {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [running, setRunning] = useState(false);
  const [statuses, setStatuses] = useState<Record<number, RowStatus>>({});
  const [done, setDone] = useState(false);

  const classMap = useMemo(() => {
    const m = new Map<string, { id: string; name: string }>();
    classes
      .filter((c) => c.status !== "archived")
      .forEach((c) => m.set(normClass(c.name), { id: c.id, name: c.name }));
    return m;
  }, [classes]);

  const rows = useMemo<ParsedRow[]>(() => {
    const out: ParsedRow[] = [];
    raw.split(/\r?\n/).forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const parts = trimmed.split(/[,;\t]/).map((p) => p.trim());
      const studentName = parts[0] ?? "";
      // Başlık satırını atla.
      if (i === 0 && normClass(studentName).startsWith("öğrenci")) return;
      const classRaw = parts[1] ?? "";
      const parentName = parts[2] ?? "";
      const parentEmail = (parts[3] ?? "").toLowerCase();
      const parentPhone = parts[4] ?? "";

      const matched = classRaw ? classMap.get(normClass(classRaw)) : undefined;
      let problem: string | null = null;
      if (studentName.trim().length < 2) problem = "Öğrenci adı gerekli";
      else if (classRaw && !matched) problem = `Sınıf bulunamadı: "${classRaw}"`;
      else if (parentEmail && !EMAIL_RE.test(parentEmail)) problem = "Geçersiz veli e-postası";
      else if (parentEmail && !parentName) problem = "Veli e-postası için veli adı gerekli";

      out.push({
        line: i + 1,
        studentName,
        classId: matched?.id ?? "",
        className: matched?.name ?? (classRaw || "—"),
        parentName,
        parentEmail,
        parentPhone,
        problem,
      });
    });
    return out;
  }, [raw, classMap]);

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
        const s = splitName(r.studentName);
        const studentId = await createStudent(tenantId, schoolId, {
          firstName: s.firstName,
          lastName: s.lastName,
          classId: r.classId || undefined,
        });

        let parentPassword: string | undefined;
        if (r.parentName) {
          const pn = splitName(r.parentName);
          const parentId = await createParent(tenantId, schoolId, {
            firstName: pn.firstName,
            lastName: pn.lastName,
            email: r.parentEmail || undefined,
            phone: r.parentPhone || undefined,
          });
          await linkParentToStudent(tenantId, parentId, studentId);

          if (r.parentEmail && canCreateAccounts) {
            const parentRecord: ParentRecord = {
              id: parentId,
              tenantId,
              schoolId,
              firstName: pn.firstName,
              lastName: pn.lastName,
              fullName: `${pn.firstName} ${pn.lastName}`.trim(),
              phone: r.parentPhone || "",
              email: r.parentEmail,
              linkedStudentIds: [studentId],
              status: "active",
              userId: "",
              createdAt: null,
              updatedAt: null,
            };
            const res = await provisionParentAccount(tenantId, schoolId, parentRecord, r.parentEmail, createdBy);
            if (res.ok) parentPassword = res.tempPassword;
          }
        }
        next[r.line] = { state: "ok", parentPassword };
      } catch (e) {
        next[r.line] = {
          state: "error",
          message: e instanceof Error ? e.message : "Oluşturulamadı",
        };
      }
      setStatuses({ ...next });
    }
    setRunning(false);
    setDone(true);
    await onDone();
  };

  const parentCreds = rows
    .map((r) => ({ r, s: statuses[r.line] }))
    .filter((x) => x.s?.state === "ok" && (x.s as Extract<RowStatus, { state: "ok" }>).parentPassword)
    .map((x) => ({
      r: x.r,
      password: (x.s as Extract<RowStatus, { state: "ok" }>).parentPassword as string,
    }));

  const okCount = rows.filter((r) => statuses[r.line]?.state === "ok").length;

  const credsCsv = parentCreds
    .map((x) => `${x.r.parentName},${x.r.parentEmail},${x.password}`)
    .join("\n");

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(`veli,e-posta,geçici şifre\n${credsCsv}`);
    } catch {
      /* pano yok say */
    }
  };

  const downloadCsv = () => {
    const blob = new Blob([`veli,e-posta,gecici_sifre\n${credsCsv}\n`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "veli-hesaplari.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const printCards = () => {
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
    printCredentialCards(
      parentCreds.map((x) => ({
        displayName: x.r.parentName,
        email: x.r.parentEmail,
        password: x.password,
        roleLabel: "Veli",
      })),
      { loginUrl: appUrl ? `${appUrl}/login` : undefined },
    );
  };

  return (
    <GlassCard tone="navy">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 text-left"
        aria-expanded={open}
      >
        <GraduationCap size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Toplu Öğrenci / Veli Ekle</h2>
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
              Biçim: <span className="font-mono">Öğrenci Adı Soyadı, Sınıf, Veli Adı Soyadı, Veli E-posta, Veli Telefon</span>
            </p>
            <p className="mt-1">
              Sınıf mevcut sınıf adıyla eşleşmeli (ör. 1-A). Veli e-postası verilirse
              (ve yetkiniz varsa) veli giriş hesabı açılır + hoş geldin e-postası gider.
              Öğrenciler kod ile giriş yaptığından öğrenci hesabı açılmaz. Örnek:
            </p>
            <pre className="mt-1.5 overflow-x-auto rounded-lg bg-overlay/[0.04] p-2 font-mono text-[11px] text-muted">{`Ayşe Yılmaz, 1-A, Fatma Yılmaz, fatma@ornek.com, 05321112233
Mehmet Demir, 2-B, Ali Demir, ali@ornek.com`}</pre>
          </div>

          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={7}
            spellCheck={false}
            placeholder={"Ayşe Yılmaz, 1-A, Fatma Yılmaz, fatma@ornek.com\nMehmet Demir, 2-B, Ali Demir, ali@ornek.com"}
            disabled={running}
            className="w-full rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-3 font-mono text-sm text-content placeholder:text-muted/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />

          {rows.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-overlay/10">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-muted">
                    <th className="p-2.5 font-medium">Öğrenci</th>
                    <th className="p-2.5 font-medium">Sınıf</th>
                    <th className="p-2.5 font-medium">Veli</th>
                    <th className="p-2.5 font-medium">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-overlay/5">
                  {rows.map((r) => {
                    const s = statuses[r.line];
                    return (
                      <tr key={r.line} className="text-content">
                        <td className="p-2.5">{r.studentName || "—"}</td>
                        <td className="p-2.5 text-muted">{r.className}</td>
                        <td className="p-2.5 text-muted">{r.parentName || "—"}</td>
                        <td className="p-2.5">
                          {r.problem ? (
                            <span className="inline-flex items-center gap-1 text-xs text-brand">
                              <AlertCircle size={13} aria-hidden="true" />
                              {r.problem}
                            </span>
                          ) : s?.state === "ok" ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                              <CheckCircle2 size={13} aria-hidden="true" />
                              {s.parentPassword ? `Veli şifresi: ${s.parentPassword}` : "Eklendi"}
                            </span>
                          ) : s?.state === "error" ? (
                            <span className="inline-flex items-center gap-1 text-xs text-brand">
                              <AlertCircle size={13} aria-hidden="true" />
                              {s.message}
                            </span>
                          ) : s?.state === "running" ? (
                            <span className="text-xs text-accent">Ekleniyor…</span>
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
              {running ? "Ekleniyor…" : `Ekle (${validRows.length})`}
            </PrimaryButton>
            {invalidCount > 0 && (
              <span className="text-xs text-amber-400">{invalidCount} satır hatalı — atlanacak.</span>
            )}
            {done && parentCreds.length > 0 && (
              <>
                <PrimaryButton type="button" variant="secondary" size="sm" onClick={copyAll}>
                  <Copy size={15} aria-hidden="true" />
                  Veli Bilgilerini Kopyala
                </PrimaryButton>
                <PrimaryButton type="button" variant="secondary" size="sm" onClick={downloadCsv}>
                  <Download size={15} aria-hidden="true" />
                  CSV İndir
                </PrimaryButton>
                <PrimaryButton type="button" variant="secondary" size="sm" onClick={printCards}>
                  <Printer size={15} aria-hidden="true" />
                  Veli Kartları Yazdır
                </PrimaryButton>
              </>
            )}
          </div>

          {done && (
            <p className="text-sm text-muted">
              {okCount} öğrenci eklendi{parentCreds.length > 0 ? `, ${parentCreds.length} veli hesabı açıldı` : ""}.
              {parentCreds.length > 0 && " Veli geçici şifrelerini güvenli biçimde iletin."}
            </p>
          )}
        </div>
      )}
    </GlassCard>
  );
}
