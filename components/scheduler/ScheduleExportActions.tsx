"use client";

import { FileText, FileSpreadsheet, FileJson } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import {
  downloadCSV,
  downloadJSON,
  printToPDF,
} from "@/lib/export/download";
import type { ScheduleEntry } from "@/lib/scheduler-mock-data";

interface ScheduleExportActionsProps {
  days: string[];
  hours: string[];
  timetable: (ScheduleEntry | null)[][];
}

/**
 * Ders programını GERÇEK dosya olarak indirir/yazdırır.
 * PDF (ızgara tablo), CSV (düzleştirilmiş) ve JSON.
 */
export function ScheduleExportActions({
  days,
  hours,
  timetable,
}: ScheduleExportActionsProps) {
  const flat = () => {
    const rows: Record<string, string>[] = [];
    timetable.forEach((row, h) => {
      row.forEach((cell, d) => {
        if (!cell) return;
        rows.push({
          saat: hours[h] ?? "",
          gun: days[d] ?? "",
          ders: cell.lesson,
          ogretmen: cell.teacher,
          sinif: cell.classGroup,
          salon: cell.room,
        });
      });
    });
    return rows;
  };

  const exportPdf = () => {
    const head = `<tr><th>Saat</th>${days.map((d) => `<th>${d}</th>`).join("")}</tr>`;
    const body = timetable
      .map((row, h) => {
        const cells = row
          .map((cell) =>
            cell
              ? `<td><strong>${cell.lesson}</strong><br/><span style="color:#667;font-size:11px">${cell.teacher} · ${cell.room}</span></td>`
              : "<td>—</td>",
          )
          .join("");
        return `<tr><td><strong>${hours[h] ?? ""}</strong></td>${cells}</tr>`;
      })
      .join("");
    printToPDF(
      "Ders Programı",
      `<h1>Ders Programı</h1><table><thead>${head}</thead><tbody>${body}</tbody></table>`,
    );
  };

  const exportCsv = () =>
    downloadCSV(
      "ders-programi.csv",
      [
        { key: "saat", label: "Saat" },
        { key: "gun", label: "Gün" },
        { key: "ders", label: "Ders" },
        { key: "ogretmen", label: "Öğretmen" },
        { key: "sinif", label: "Sınıf" },
        { key: "salon", label: "Salon" },
      ],
      flat(),
    );

  const exportJson = () => downloadJSON("ders-programi.json", { days, hours, timetable });

  return (
    <GlassCard tone="navy">
      <h2 className="mb-4 text-lg font-semibold text-content">Kaydet ve Dışa Aktar</h2>
      <div className="flex flex-wrap gap-3">
        <PrimaryButton size="md" onClick={exportPdf} className="flex-1 sm:flex-none">
          <FileText size={16} aria-hidden="true" />
          PDF / Yazdır
        </PrimaryButton>
        <PrimaryButton variant="secondary" size="md" onClick={exportCsv} className="flex-1 sm:flex-none">
          <FileSpreadsheet size={16} aria-hidden="true" />
          CSV
        </PrimaryButton>
        <PrimaryButton variant="secondary" size="md" onClick={exportJson} className="flex-1 sm:flex-none">
          <FileJson size={16} aria-hidden="true" />
          JSON
        </PrimaryButton>
      </div>
    </GlassCard>
  );
}
