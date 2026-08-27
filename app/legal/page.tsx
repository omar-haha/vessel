"use client";

import { useState, useEffect } from "react";
import { PageShell } from "@/components/PageShell";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { cn } from "@/lib/utils";
// Copy lives in lib/legalContent.ts so this page and the footer LegalModal can
// never drift apart again — they previously declared different governing law.
import { LEGAL_EN, LEGAL_FR } from "@/lib/legalContent";
import { BRAND } from "@/config/brand";

type TabId = "disclaimers" | "privacy" | "terms" | "refund";

const VALID_TABS: TabId[] = ["disclaimers", "privacy", "terms", "refund"];

export default function LegalPage() {
  const [tab, setTab] = useState<TabId>("disclaimers");
  const { t } = useLanguage();

  useEffect(() => {
    const readHash = () => {
      const hash = window.location.hash.slice(1) as TabId;
      if (VALID_TABS.includes(hash)) setTab(hash);
    };
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  const switchTab = (id: TabId) => {
    setTab(id);
    history.replaceState(null, "", `/legal#${id}`);
  };

  const TABS: { id: TabId; label: string }[] = [
    { id: "disclaimers", label: t("page_legal_tab_disc") },
    { id: "privacy",     label: t("page_legal_tab_priv") },
    { id: "terms",       label: t("page_legal_tab_terms") },
    { id: "refund",      label: t("page_legal_tab_ref") },
  ];

  const { lang } = useLanguage();
  const content = lang === "fr" ? LEGAL_FR[tab] : LEGAL_EN[tab];

  return (
    <PageShell>
      <div className="max-w-[800px] mx-auto px-4 md:px-6 py-[80px] md:py-[100px]">
        <div className="mb-10">
          <p className="text-[12px] font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>
            {t("page_legal_eyebrow")}
          </p>
          <h1 className="text-[34px] md:text-[44px] font-semibold tracking-tight text-primary">
            {t("page_legal_title")}
          </h1>
        </div>

        <div className="flex flex-wrap gap-1.5 p-1.5 rounded-[14px] mb-10 w-fit" style={{ backgroundColor: "var(--surface)" }}>
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => switchTab(id)}
              className={cn(
                "rounded-[10px] px-4 py-2 text-[13px] font-medium cursor-pointer border-none transition-all duration-200",
                tab === id ? "text-primary shadow-sm" : "text-secondary hover:text-primary"
              )}
              style={tab === id ? { backgroundColor: "var(--bg)" } : { backgroundColor: "transparent" }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-8">
          {content.map((s) => (
            <div key={s.heading}>
              <h2 className="text-[16px] font-semibold text-primary mb-2">{s.heading}</h2>
              <p className="text-[14px] text-secondary leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-[16px] p-6 text-[12px] text-secondary leading-relaxed" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
          {t("page_legal_footer")}{" "}
          <a href={`mailto:${BRAND.supportEmail}`} className="text-[color:var(--accent)] no-underline hover:underline">
            {BRAND.supportEmail}
          </a>
        </div>
      </div>
    </PageShell>
  );
}
