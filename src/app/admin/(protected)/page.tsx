import Link from "next/link";

const CATEGORII = ["u12", "u11", "u10", "u9", "u8", "u7"] as const;

export default function AdminHomePage() {
  return (
    <div>
      <h1
        className="text-3xl font-bold mb-6"
        style={{ fontFamily: "var(--font-oswald)", color: "var(--color-cream)" }}
      >
        Selectează categoria
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CATEGORII.map((cat) => (
          <Link
            key={cat}
            href={`/admin/${cat}`}
            className="rounded-xl border p-5 hover:border-[var(--color-gold)] transition-all"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <div
              className="text-4xl font-bold"
              style={{ fontFamily: "var(--font-oswald)", color: "var(--color-gold)" }}
            >
              {cat.toUpperCase()}
            </div>
            <div className="text-sm mt-2" style={{ color: "var(--color-cream-muted)" }}>
              Editare meciuri + echipe
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
