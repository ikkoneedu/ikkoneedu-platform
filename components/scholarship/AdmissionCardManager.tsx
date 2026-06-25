import { CalendarCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { GlassCard } from "@/components/shared/GlassCard";
import { DataExportButtons } from "@/components/shared/DataExportButtons";
import {
  activeExam,
  applications,
  examRules,
} from "@/lib/scholarship-exam-mock-data";

/**
 * Sınav Giriş Belgesi Yönetimi.
 * Örnek giriş belgesi kartı, sınav kuralları ve toplu aksiyon butonları.
 */
export function AdmissionCardManager() {
  const sample = applications[0];

  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <CalendarCheck size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">
          Sınav Giriş Belgesi Yönetimi
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Örnek giriş belgesi */}
        <div className="rounded-2xl border border-overlay/10 bg-overlay/[0.03] p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Giriş Belgesi</p>
              <p className="mt-1 font-semibold text-content">{activeExam.name}</p>
            </div>
            <div className="shrink-0 rounded-xl bg-white p-1.5">
              <QRCodeSVG
                value={[
                  "IKK-ADMISSION",
                  sample.applicationNo,
                  sample.studentName,
                  activeExam.name,
                  activeExam.examDate,
                ].join("|")}
                size={64}
                level="M"
                marginSize={0}
                aria-label="Giriş belgesi QR kodu"
              />
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-muted">Başvuru No</dt>
              <dd className="font-mono text-xs text-content">{sample.applicationNo}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Öğrenci</dt>
              <dd className="text-content">{sample.studentName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Tarih / Saat</dt>
              <dd className="text-content">
                {activeExam.examDate} · {activeExam.examTime}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Kampüs</dt>
              <dd className="text-content">{sample.campusPreference}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Salon</dt>
              <dd className="text-content">{sample.room}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Sıra No</dt>
              <dd className="text-content">{sample.seatNo}</dd>
            </div>
          </dl>
        </div>

        {/* Sınav kuralları */}
        <div className="rounded-2xl border border-overlay/10 bg-overlay/[0.03] p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
            Sınav Kuralları
          </p>
          <ul className="space-y-2">
            {examRules.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-sm text-content">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted">Toplu giriş belgeleri:</span>
        <DataExportButtons
          size="md"
          filename="giris-belgeleri"
          title="Sınav Giriş Belgeleri"
          columns={[
            { key: "applicationNo", label: "Başvuru No" },
            { key: "studentName", label: "Öğrenci" },
            { key: "campusPreference", label: "Kampüs" },
            { key: "room", label: "Salon" },
            { key: "seatNo", label: "Sıra No" },
            { key: "status", label: "Durum" },
          ]}
          rows={applications as unknown as Record<string, unknown>[]}
        />
      </div>
    </GlassCard>
  );
}
