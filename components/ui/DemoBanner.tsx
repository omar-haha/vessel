"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

// Permanent, not dismissible — the point is that any visitor, on any visit,
// can tell this is a portfolio piece rather than a real store. Height is
// fixed (h-8, 32px) and everything that assumes the nav starts at the old
// top-0/44px offset (AppleNav itself, its mobile menu, and every page's
// <main> padding) has been shifted down by that same 32px. If this banner's
// height ever changes, grep for "76px" and "top-8" and update those too.
export function DemoBanner() {
  const { t } = useLanguage();

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[1100] h-8 flex items-center justify-center gap-2 px-4 text-[12px] text-white"
      style={{ backgroundColor: "var(--accent)" }}
    >
      <span className="truncate">
        {t("demo_banner_short")}{" "}
        <span className="hidden sm:inline opacity-85">{t("demo_banner_long")}</span>
      </span>
      <a
        href="https://github.com/omar-haha/rcca"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 underline underline-offset-2 hover:opacity-80"
      >
        {t("demo_banner_link")} →
      </a>
    </div>
  );
}
