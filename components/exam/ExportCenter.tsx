"use client";

import { Download, FileText, FileSpreadsheet, FileJson, FileCode2 } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import type { GeneratedQuestion } from "@/lib/exam-mock-data";
import {
  downloadCSV,
  downloadJSON,
  downloadXML,
  printToPDF,
  htmlTable,
} from "@/lib/export/download";

interface ExportCenterProps {
  questions: GeneratedQuestion[];
}

/**
 * Dışa Aktarma Merkezi — üretilen soruları GERÇEK dosya olarak indirir.
 * PDF (yazdır → PDF olarak kaydet), CSV, XML ve JSON. Harici kütüphane yok.
 */
export function ExportCenter({ questions }: ExportCenterProps) {
  const columns = [
    { key: "number", label: "No" },
    { key: "text", label: "Soru" },
    { key: "type", label: "Tür" },
    { key: "difficulty", label: "Zorluk" },
    { key: "outcome", label: "Kazanım" },
  ];

  const exportPdf = () => {
    const rows = questions.map((q) => [q.number, q.text, q.type, q.difficulty, q.outcome]);
    printToPDF(
      "Üretilen Sınav",
      `<h1>Üretilen Sınav</h1><p class="meta">${questions.length} soru</p>` +
        htmlTable(columns, rows),
    );
  };

  const exportCsv = () =>
    downloadCSV("uretilen-sinav.csv", columns, questions as unknown as Record<string, unknown>[]);

  const exportXml = () =>
    downloadXML("uretilen-sinav.xml", "sinav", "soru", questions as unknown as Record<string, unknown>[]);

  const exportJson = () => downloadJSON("uretilen-sinav.json", questions);

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex items-center gap-2">
        <Download size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Dışa Aktarma Merkezi</h2>
        <span className="ml-auto text-xs text-muted">{questions.length} soru</span>
      </div>
      <div className="flex flex-wrap gap-3">
        <PrimaryButton size="md" onClick={exportPdf} className="flex-1 sm:flex-none">
          <FileText size={16} aria-hidden="true" />
          PDF Olarak İndir
        </PrimaryButton>
        <PrimaryButton variant="secondary" size="md" onClick={exportCsv} className="flex-1 sm:flex-none">
          <FileSpreadsheet size={16} aria-hidden="true" />
          CSV
        </PrimaryButton>
        <PrimaryButton variant="secondary" size="md" onClick={exportXml} className="flex-1 sm:flex-none">
          <FileCode2 size={16} aria-hidden="true" />
          XML
        </PrimaryButton>
        <PrimaryButton variant="secondary" size="md" onClick={exportJson} className="flex-1 sm:flex-none">
          <FileJson size={16} aria-hidden="true" />
          JSON
        </PrimaryButton>
      </div>
    </GlassCard>
  );
}
