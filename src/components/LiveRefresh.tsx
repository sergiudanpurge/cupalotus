"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Refreshează pagina la fiecare 15 secunde (polling fallback pentru Realtime)
export function LiveRefresh({ intervalMs = 15_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
