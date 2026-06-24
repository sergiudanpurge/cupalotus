"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [user, setUser]       = useState("");
  const [pass, setPass]       = useState("");
  const [eroare, setEroare]   = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEroare("");
    setLoading(true);

    const res = await signIn("credentials", {
      username: user,
      password: pass,
      redirect: false,
    });

    setLoading(false);
    if (res?.ok) {
      router.push("/admin");
    } else {
      setEroare("Utilizator sau parolă incorecte.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--color-bg)" }}>
      <div
        className="w-full max-w-sm rounded-xl border p-8"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="text-3xl font-bold"
            style={{ fontFamily: "var(--font-oswald)", color: "var(--color-gold)" }}
          >
            CUPA LOTUS 2027 · EDIȚIA A IV-A
          </div>
          <div className="text-sm mt-1" style={{ color: "var(--color-cream-muted)" }}>
            Panou Administrator
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "var(--color-cream-muted)" }}>
              Utilizator
            </label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              required
              autoFocus
              className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1"
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                color: "var(--color-cream)",
              }}
            />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: "var(--color-cream-muted)" }}>
              Parolă
            </label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1"
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                color: "var(--color-cream)",
              }}
            />
          </div>

          {eroare && (
            <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(179,64,47,0.15)", color: "var(--color-red)" }}>
              {eroare}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-bold text-sm transition-opacity disabled:opacity-60"
            style={{
              fontFamily: "var(--font-oswald)",
              background: "var(--color-gold)",
              color: "var(--color-bg)",
            }}
          >
            {loading ? "Se conectează..." : "Intră în panou"}
          </button>
        </form>
      </div>
    </main>
  );
}
