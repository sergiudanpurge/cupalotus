import { ro, type Dict } from "./ro";
import { en } from "./en";
import { hu } from "./hu";

export type Lang = "ro" | "en" | "hu";
export type { Dict };

export const dicts: Record<Lang, Dict> = { ro, en, hu };

export const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: "ro", flag: "🇷🇴", label: "RO" },
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "hu", flag: "🇭🇺", label: "HU" },
];

export const STORAGE_KEY = "cupalotuslang";
