import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminLogoutButton } from "./LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const isLoginPage = false; // layout-ul nu se aplică pe /admin/login (are propriul layout)

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg)" }}>
      {/* Header admin */}
      <header
        className="border-b px-4 py-3 flex items-center gap-4"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <div
          className="font-bold text-lg"
          style={{ fontFamily: "var(--font-oswald)", color: "var(--color-gold)" }}
        >
          CUPA LOTUS — Admin
        </div>

        <nav className="flex gap-3 flex-1 overflow-x-auto">
          {["u12", "u11", "u10", "u9", "u8", "u7"].map((cat) => (
            <Link
              key={cat}
              href={`/admin/${cat}`}
              className="text-xs uppercase tracking-wider px-2 py-1 rounded transition-colors hover:text-[var(--color-gold)]"
              style={{ color: "var(--color-cream-muted)" }}
            >
              {cat.toUpperCase()}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/"
            className="text-xs hover:text-[var(--color-gold)] transition-colors"
            style={{ color: "var(--color-cream-muted)" }}
          >
            ← Site public
          </Link>
          <AdminLogoutButton />
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
