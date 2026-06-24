import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import { SessionProvider } from "@/components/SessionProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SiteNav } from "@/components/SiteNav";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cupa Lotus 2027 · Ediția a IV-a",
  description: "Turneu de fotbal juvenil · 28–30 mai 2027 · Baza Sportivă C.S. Lotus Băile Felix",
  openGraph: {
    title: "Cupa Lotus 2027 · Ediția a IV-a",
    description: "Turneu de fotbal juvenil · 28–30 mai 2027",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={`${oswald.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col">
        <LanguageProvider>
          <SessionProvider>
            <SiteNav />
            {children}
          </SessionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
