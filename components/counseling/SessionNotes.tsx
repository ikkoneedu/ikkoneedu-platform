import { NotebookPen } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { SessionNote } from "@/lib/counseling-mock-data";

interface SessionNotesProps {
  notes: SessionNote[];
}

/**
 * Görüşme Notları listesi.
 */
export function SessionNotes({ notes }: SessionNotesProps) {
  return (
    <GlassCard tone="navy" className="flex h-full flex-col">
      <div className="mb-5 flex items-center gap-2">
        <NotebookPen size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Görüşme Notları</h2>
      </div>

      <ul className="flex flex-1 flex-col gap-3">
        {notes.map((note) => (
          <li
            key={note.id}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-content">{note.student}</span>
              <span className="inline-block rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                {note.tag}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted">{note.note}</p>
            <p className="mt-2 text-xs text-muted/80">{note.date}</p>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
