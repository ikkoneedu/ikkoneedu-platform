"use client";

import { FileText, FileSpreadsheet, FileJson, FileCode2 } from "lucide-react";
import {
  downloadCSV,
  downloadJSON,
  downloadXML,
  printToPDF,
  htmlTable,
} from "@/lib/export/download";

export interface ExportColumn {
  key: string;
  label: string;
}

interface DataExportButtonsProps {
  /** Uzantısız dosya adı (ör. "finans-ozeti"). */
  filename: string;
  /** PDF başlığı / kök eleman adı. */
  title: string;
  columns: ExportColumn[];
  rows: Record<string, unknown>[];
  /** Hangi formatlar gösterilsin (varsayılan hepsi). */
  formats?: ("pdf" | "csv" | "xml" | "json")[];
  className?: string;
  size?: "sm" | "md";
}

/**
 * Gerçek veri dışa aktarma çubuğu — herhangi bir tabloyu PDF/CSV/XML/JSON
 * olarak indirir. Veri yoğun panellerde tek satırda kullanılır.
 */
export function DataExportButtons({
  filename,
  title,
  columns,
  rows,
  formats = ["pdf", "csv", "xml", "json"],
  className = "",
  size = "sm",
}: DataExportButtonsProps) {
  const pad = size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm";
  const base =
    "inline-flex items-center gap-1.5 rounded-lg border border-overlay/10 bg-overlay/[0.04] text-muted transition-colors hover:border-accent/30 hover:text-content";

  const pdf = () => {
    const table = htmlTable(
      columns.map((c) => ({ label: c.label })),
      rows.map((r) => columns.map((c) => String(r[c.key] ?? ""))),
    );
    printToPDF(title, `<h1>${title}</h1>${table}`);
  };
  const csv = () => downloadCSV(`${filename}.csv`, columns, rows);
  const xml = () => downloadXML(`${filename}.xml`, "veri", "kayit", rows);
  const json = () => downloadJSON(`${filename}.json`, rows);

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {formats.includes("pdf") && (
        <button type="button" onClick={pdf} className={`${base} ${pad}`}>
          <FileText size={14} aria-hidden="true" /> PDF
        </button>
      )}
      {formats.includes("csv") && (
        <button type="button" onClick={csv} className={`${base} ${pad}`}>
          <FileSpreadsheet size={14} aria-hidden="true" /> CSV
        </button>
      )}
      {formats.includes("xml") && (
        <button type="button" onClick={xml} className={`${base} ${pad}`}>
          <FileCode2 size={14} aria-hidden="true" /> XML
        </button>
      )}
      {formats.includes("json") && (
        <button type="button" onClick={json} className={`${base} ${pad}`}>
          <FileJson size={14} aria-hidden="true" /> JSON
        </button>
      )}
    </div>
  );
}
