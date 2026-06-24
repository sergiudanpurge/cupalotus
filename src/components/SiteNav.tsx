"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSelector } from "./LanguageSelector";

const LOGO_SRC =
  "https://res.cloudinary.com/dlemr26ee/image/upload/v1782214633/WhatsApp_Image_2026-05-25_at_16.12.48-removebg-preview_i5h5rv.png";

export function SiteNav() {
  const pathname = usePathname();
  // Admin pages have their own full header
  if (pathname.startsWith("/admin")) return null;

  return (
    <header
      className="border-b px-4 sm:px-6 py-2 flex items-center gap-3 sticky top-0 z-40"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      {/* Logo + Titlu */}
      <Link
        href="/"
        className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity min-w-0"
      >
        <Image
          src={LOGO_SRC}
          alt="Cupa Lotus logo"
          width={36}
          height={36}
          className="flex-shrink-0 rounded-md"
          style={{ objectFit: "contain" }}
          unoptimized
        />
        <span
          className="font-bold tracking-wide leading-tight"
          style={{ fontFamily: "var(--font-oswald)", color: "var(--color-gold)" }}
        >
          <span className="text-sm hidden sm:block whitespace-nowrap">CUPA LOTUS 2027 · EDIȚIA A IV-A</span>
          <span className="text-sm sm:hidden">CUPA LOTUS 2027</span>
        </span>
      </Link>

      <div className="flex-1" />

      {/* Butoane limbă */}
      <LanguageSelector />

    </header>
  );
}
