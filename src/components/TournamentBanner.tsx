"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "@/contexts/LanguageContext";

const BANNER_URLS: Record<string, string> = {
  ro: "https://res.cloudinary.com/dlemr26ee/image/upload/v1782214733/87b40a13d8dfe51a93bb6f64_wmbh07.png",
  en: "https://res.cloudinary.com/dlemr26ee/image/upload/v1782214289/ChatGPT_Image_23._Juni_2026_11_21_36_bca2om.png",
  hu: "https://res.cloudinary.com/dlemr26ee/image/upload/v1782214289/ChatGPT_Image_23._Juni_2026_11_21_36_bca2om.png",
};
const BANNER_FALLBACK = "/cupa-lotus-poster.svg";

export function TournamentBanner() {
  const { lang } = useTranslation();
  const [fallback, setFallback] = useState(false);

  const imgSrc      = fallback ? BANNER_FALLBACK : (BANNER_URLS[lang] ?? BANNER_URLS.ro);
  const unoptimized = fallback;

  return (
    <div className="relative w-full rounded-xl overflow-hidden mb-8" style={{ background: "#0b0a07" }}>
      <Image
        src={imgSrc}
        alt="Cupa Lotus 2027 — banner"
        width={896}
        height={400}
        priority
        unoptimized={unoptimized}
        onError={() => setFallback(true)}
        className="w-full h-auto block"
        style={{ objectFit: "contain" }}
      />
      {/* Gradient la baza bannerului — tranziție cu fundalul */}
      <div
        className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(11,10,7,0) 0%, rgba(11,10,7,0.9) 100%)" }}
      />
    </div>
  );
}
