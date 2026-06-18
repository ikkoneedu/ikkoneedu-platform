"use client";

import { useState } from "react";

interface ToggleProps {
  defaultOn?: boolean;
  label?: string;
}

/**
 * Açma/kapama anahtarı (mock).
 * Durum yalnızca yerel tutulur; kalıcı değildir (backend yoktur).
 */
export function Toggle({ defaultOn = false, label }: ToggleProps) {
  const [on, setOn] = useState(defaultOn);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => setOn((prev) => !prev)}
      className={[
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        on ? "bg-accent" : "bg-white/15",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          on ? "translate-x-6" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}
