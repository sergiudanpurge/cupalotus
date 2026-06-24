"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslation } from "@/contexts/LanguageContext";

export function TabNav() {
  const pathname    = usePathname();
  const searchParams = useSearchParams();
  const activeTab   = searchParams.get("tab") ?? "clasament";
  const { t }       = useTranslation();

  const TABS = [
    { id: "clasament",  label: t.tabs.clasament },
    { id: "program",    label: t.tabs.program },
    { id: "calificari", label: t.tabs.calificari },
    { id: "golgheteri", label: t.tabs.golgheteri },
    { id: "podium",     label: t.tabs.podium },
  ];

  return (
    <div
      className="flex pb-px"
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      {TABS.map(({ id, label }) => {
        const isActive = activeTab === id;
        return (
          <Link
            key={id}
            href={`${pathname}?tab=${id}`}
            scroll={false}
            className="flex-1 text-center whitespace-nowrap px-1 py-2 text-xs sm:text-sm font-medium transition-colors relative"
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
