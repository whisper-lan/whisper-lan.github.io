"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

type ThemeToggleProps = {
  labels: {
    loading: string;
    switchToLight: string;
    switchToDark: string;
  };
};

const controlClass =
  "inline-grid min-h-11 min-w-11 place-items-center rounded-md border border-line bg-panel text-ink transition-colors hover:border-signal hover:text-signal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:cursor-wait disabled:opacity-70";

export function ThemeToggle({ labels }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button type="button" className={controlClass} aria-label={labels.loading} disabled>
        <Sun aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      className={controlClass}
      aria-label={isDark ? labels.switchToLight : labels.switchToDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <Sun aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
      ) : (
        <Moon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
      )}
    </button>
  );
}
