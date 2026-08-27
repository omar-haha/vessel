"use client";

import { FlaskConical, FileCheck, Mail, Shield } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { BRAND } from "@/config/brand";

const METHODS = [
  { method: "HPLC",         full_en: "High-Performance Liquid Chromatography", full_fr: "Chromatographie liquide à haute performance", use_en: "Potency & active ingredient verification",  use_fr: "Vérification de la puissance et des ingrédients actifs" },
  { method: "ICP-MS",       full_en: "Inductively Coupled Plasma Mass Spectrometry", full_fr: "Spectrométrie de masse à plasma à couplage inductif", use_en: "Heavy metal screening (lead, arsenic, mercury, cadmium)", use_fr: "Dépistage des métaux lourds (plomb, arsenic, mercure, cadmium)" },
  { method: "Microbial Panel", full_en: "Microbiological Testing",  full_fr: "Analyse microbiologique",               use_en: "Pathogen & contaminant screening",               use_fr: "Dépistage des pathogènes et des contaminants" },
  { method: "USP <2040>",   full_en: "Disintegration Testing",    full_fr: "Test de désintégration",                use_en: "Capsule/tablet dissolution verification",        use_fr: "Vérification de la dissolution des capsules et comprimés" },
];

export default function CoaPage() {
  const { t, lang } = useLanguage();

  const STEPS = [
    { icon: FlaskConical, title: t("page_coa_s1_title"), body: t("page_coa_s1_body") },
    { icon: Shield,       title: t("page_coa_s2_title"), body: t("page_coa_s2_body") },
    { icon: FileCheck,    title: t("page_coa_s3_title"), body: t("page_coa_s3_body") },
    { icon: Mail,         title: t("page_coa_s4_title"), body: t("page_coa_s4_body") },
  ];

  return (
    <PageShell>
      <div className="max-w-[860px] mx-auto px-4 md:px-6 py-[80px] md:py-[100px]">
        <div className="mb-14">
          <p className="text-[12px] font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>
            {t("page_coa_eyebrow")}
          </p>
          <h1 className="text-[34px] md:text-[44px] font-semibold tracking-tight text-primary mb-4">
            {t("page_coa_title")}
          </h1>
          <p className="text-[16px] text-secondary leading-relaxed max-w-[560px]">
            {t("page_coa_sub")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="rounded-[20px] p-7" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--bg-alt)" }}>
                  <Icon size={18} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
                </div>
                <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                  {t("page_coa_step")} {i + 1}
                </span>
              </div>
              <h2 className="text-[16px] font-semibold text-primary mb-2">{title}</h2>
              <p className="text-[13px] text-secondary leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="mb-14">
          <h2 className="text-[20px] font-semibold text-primary mb-6">{t("page_coa_steps_title")}</h2>
          <div className="rounded-[20px] overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            {METHODS.map((m, i) => (
              <div
                key={m.method}
                className="grid grid-cols-[80px_1fr_1fr] px-6 py-4 text-[13px]"
                style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none", backgroundColor: i % 2 === 0 ? "var(--surface)" : "transparent" }}
              >
                <span className="font-semibold text-primary">{m.method}</span>
                <span className="text-secondary">{lang === "fr" ? m.full_fr : m.full_en}</span>
                <span className="text-tertiary">{lang === "fr" ? m.use_fr : m.use_en}</span>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-tertiary leading-relaxed mt-3">
            {t("page_coa_methods_note")}
          </p>
        </div>

        <div className="rounded-[20px] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
          <div>
            <h3 className="text-[18px] font-semibold text-primary mb-1">{t("page_coa_cta_title")}</h3>
            <p className="text-[13px] text-secondary leading-relaxed">{t("page_coa_cta_sub")}</p>
          </div>
          <a
            href={`mailto:${BRAND.supportEmail}?subject=COA Request`}
            className="shrink-0 rounded-full px-6 py-3 text-[14px] font-medium text-white no-underline btn-physical btn-physical-accent"
            style={{ backgroundColor: "var(--accent)" }}
          >
            {t("page_coa_cta_btn")}
          </a>
        </div>
      </div>
    </PageShell>
  );
}
