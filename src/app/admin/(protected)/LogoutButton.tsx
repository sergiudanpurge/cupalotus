"use client";

import { signOut } from "next-auth/react";

export function AdminLogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="text-xs px-3 py-1.5 rounded transition-colors hover:opacity-80"
      style={{ background: "var(--color-surface-2)", color: "var(--color-cream-muted)", border: "1px solid var(--color-border)" }}
    >
      Deconectare
    </button>
  );
}
