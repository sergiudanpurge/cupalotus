"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const TABS = [
  { id: "clasament",   label: "Clasament" },
  { id: "program",     label: "Program" },
  { id: "calificari",  label: "Calificări" },
  { id: "golgheteri",  label: "Golgheteri" },
  { id: "podium",      label: "Podium" },
];

export function TabNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "clasament";

  return (
    <div
      className="flex gap-1 overflow-x-auto pb-px scrollbar-none"
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      {TABS.map(({ id, label }) => {
        const isActive = activeTab === id;
        return (
          <Link
            key={id}
            href={`${pathname}?tab=${id}`}
            scroll={false}
            className="whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors relative"
            style={{
              fontFamily: "var(--font-inter)",
              color: isActive ? "var(--color-gold)" : "var(--color-cream-muted)",
              borderBottom: isActive ? "2px solid var(--color-gold)" : "2px solid transparent",
              marginBottom: "-1px",
            }}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
