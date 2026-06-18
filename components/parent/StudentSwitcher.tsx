"use client";

import { useState } from "react";
import { GraduationCap, Check } from "lucide-react";
import type { ParentStudent } from "@/lib/mock-data";

interface StudentSwitcherProps {
  students: ParentStudent[];
}

/**
 * Öğrenci seçimi.
 * Birden fazla çocuğu olan veliler için aktif öğrenciyi değiştirir;
 * seçili kart aksan vurgusuyla öne çıkarılır.
 */
export function StudentSwitcher({ students }: StudentSwitcherProps) {
  const [selectedId, setSelectedId] = useState(students[0]?.id);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-2xl">
      {students.map((student) => {
        const isActive = student.id === selectedId;
        return (
          <button
            key={student.id}
            type="button"
            onClick={() => setSelectedId(student.id)}
            aria-pressed={isActive}
            className={[
              "flex items-center gap-4 rounded-2xl border p-4 text-left backdrop-blur-xl transition-all",
              isActive
                ? "border-accent/50 bg-accent/10 ring-1 ring-inset ring-accent/20"
                : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06]",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border",
                isActive
                  ? "border-accent/30 bg-navy/50 text-accent"
                  : "border-white/10 bg-white/[0.03] text-muted",
              ].join(" ")}
            >
              <GraduationCap size={24} aria-hidden="true" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-content">
                {student.name}
              </span>
              <span className="block text-xs text-muted">{student.grade}</span>
            </span>
            {isActive && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-navy">
                <Check size={14} aria-hidden="true" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
