"use client";

import Image from "next/image";

const GALLERY_IMAGES = [
  {
    src: "https://res.cloudinary.com/dlemr26ee/image/upload/v1782214954/Screenshot_2026-06-23_134223_qp97dk.jpg",
    alt: "Cupa Lotus 2027 — teren",
  },
  {
    src: "https://res.cloudinary.com/dlemr26ee/image/upload/v1782214933/WhatsApp_Image_2026-05-25_at_08.49.40_1_oddpsr.jpg",
    alt: "Cupa Lotus 2027 — echipe",
  },
];

export function HomeGallery() {
  return (
    <section className="mt-8 relative">
      {/* Gradient discret sus — blending cu fundalul paginii */}
      <div
        className="absolute top-0 left-0 right-0 h-10 pointer-events-none z-10"
        style={{ background: "linear-gradient(to bottom, var(--color-bg) 0%, transparent 100%)" }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GALLERY_IMAGES.map(({ src, alt }) => (
          <div
            key={src}
            className="relative overflow-hidden rounded-xl"
            style={{ background: "#0b0a07" }}
          >
            <Image
              src={src}
              alt={alt}
              width={600}
              height={400}
              unoptimized
              className="w-full h-auto block"
              style={{ display: "block" }}
            />
            {/* Gradient la marginea inferioară — blending cu fundalul paginii */}
            <div
              className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
              style={{
                background: "linear-gradient(to bottom, rgba(11,10,7,0) 0%, rgba(11,10,7,0.85) 100%)",
              }}
            />
          </div>
        ))}
      </div>

      {/* Gradient jos — tranziție lină spre restul paginii */}
      <div
        className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none z-10"
        style={{ background: "linear-gradient(to top, var(--color-bg) 0%, transparent 100%)" }}
      />
    </section>
  );
}
