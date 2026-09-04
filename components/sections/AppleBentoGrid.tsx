"use client";

import { useState, useRef, useEffect } from "react";
import { getProductFamilies, familyMinPrice } from "@/lib/products";
import { GlassVial } from "@/components/ui/GlassVial";
import { ProductPickerModal } from "@/components/modals/ProductPickerModal";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { ProductFamily, BenefitTag, Product } from "@/lib/products";
import { TAG_META } from "@/config/catalog";

function stockStatus(qty: number): Product["stock"] {
  if (qty === 0) return "out";
  if (qty <= 5) return "low";
  return "in";
}

function applyStock(families: ProductFamily[], stockMap: Record<string, number>): ProductFamily[] {
  if (Object.keys(stockMap).length === 0) return families;
  return families.map((f) => {
    const variants = f.variants.map((v) =>
      v.id in stockMap ? { ...v, stock: stockStatus(stockMap[v.id]) } : v
    );
    // minPrice depends on which variants are in stock, so it has to be recomputed
    // here — the value from getProductFamilies() was derived from the static stock
    // field and would otherwise advertise a sold-out price.
    return { ...f, variants, minPrice: familyMinPrice(variants) };
  });
}

// Tag labels and colors now live in config/catalog.ts (TAG_META) — this used
// to duplicate them here (TAG_STYLES) and again as tag_* keys in lib/i18n.ts.

// Disabled — fabricated social proof. These hashed the product name into a fake
// star rating and review count shown on every card, which is a deceptive-
// marketing exposure (Competition Act) independent of the research-use position.
// Restore only against real aggregate data from the reviews table.
// function seedRating(name: string): number {
//   let h = 0;
//   for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
//   return 4.6 + ((h >>> 0) % 5) * 0.1;
// }

// function seedReviewCount(name: string): number {
//   let h = 0;
//   for (let i = 0; i < name.length; i++) h = (h * 37 + name.charCodeAt(i)) & 0xffffffff;
//   return 18 + ((h >>> 0) % 83);
// }

type FilterKey = "all" | BenefitTag;

// The active filter pill wears its tag's colour. Deliberately a tint + coloured
// text + ring rather than a solid fill: several tag colours (amber, green, cyan)
// only reach ~3.2–3.6:1 against white, which would fail AA for 14px label text.
function filterColor(key: FilterKey): string {
  return key === "all" ? "var(--accent)" : TAG_META[key].color;
}

const containerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
  exit:   { transition: { staggerChildren: 0.03, staggerDirection: -1 as const } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 80, damping: 20 } },
  exit:   { opacity: 0, y: -12, transition: { duration: 0.15, ease: "easeIn" as const } },
};

function getFiltered(key: FilterKey): ProductFamily[] {
  const all = getProductFamilies();
  const base = key === "all" ? all : all.filter((f) => f.tag === key);
  return base.slice().sort((a, b) => {
    const aOos = a.variants.every((v) => v.stock === "out");
    const bOos = b.variants.every((v) => v.stock === "out");
    if (aOos && !bOos) return 1;
    if (!aOos && bOos) return -1;
    return 0;
  });
}

export function AppleBentoGrid() {
  const { t, lang } = useLanguage();
  const tagLabel = (tag: BenefitTag) => (lang === "fr" ? TAG_META[tag].labelFr : TAG_META[tag].labelEn);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [stockMap, setStockMap] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/stock")
      .then((r) => r.json())
      .then(setStockMap)
      .catch(() => {});
  }, []);

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: "all", label: t("filter_all") },
    ...(Object.keys(TAG_META) as BenefitTag[]).map((tag) => ({ key: tag as FilterKey, label: tagLabel(tag) })),
  ];
  const [pickerFamily, setPickerFamily] = useState<ProductFamily | null>(null);
  const [revealed, setRevealed] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setShowAll(false); }, [activeFilter]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.1, rootMargin: "-80px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const families = applyStock(getFiltered(activeFilter), stockMap);
  const visibleFamilies = showAll ? families : families.slice(0, 9);

  return (
    <section id="store" className="pt-[48px] pb-[80px] md:pt-[60px] md:pb-[100px] bg-primary overflow-hidden">
      <ProductPickerModal family={pickerFamily} onClose={() => setPickerFamily(null)} />

      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="apple-headline mb-4">{t("store_headline")}</h2>
          <p className="apple-subheadline text-secondary">{t("store_sub")}</p>
        </motion.div>

        {/* Filter Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex gap-2 mb-8 md:mb-12 overflow-x-auto md:overflow-x-visible flex-nowrap md:flex-wrap md:justify-center px-1 py-1.5"
        >
          {FILTERS.map(({ key, label }) => {
            const active = activeFilter === key;
            const color = filterColor(key);
            return (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                aria-pressed={active}
                className={cn(
                  "rounded-full px-5 py-2 text-[14px] transition-all duration-300 border-none cursor-pointer flex-shrink-0",
                  active
                    ? "font-semibold"
                    : "font-medium bg-surface text-secondary hover:text-primary hover:bg-surface-hover"
                )}
                style={
                  active
                    ? {
                        backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`,
                        color,
                        boxShadow: `inset 0 0 0 1.5px ${color}`,
                      }
                    : undefined
                }
              >
                {label}
              </button>
            );
          })}
        </motion.div>

        {/* Product Grid */}
        <div ref={sectionRef}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              variants={containerVariants}
              initial="hidden"
              animate={revealed ? "show" : "hidden"}
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {visibleFamilies.map((family) => {
                const allOos = family.variants.every((v) => v.stock === "out");
                const anyLow = !allOos && family.variants.some((v) => v.stock === "low");
                const multi = family.variants.length > 1;
                // Show the same dose ProductPickerModal will open on (first in
                // stock), so the vial label and unit don't jump when it opens.
                const displayVariant = family.variants.find((v) => v.stock !== "out") ?? family.variants[0];

                return (
                  <motion.div
                    variants={itemVariants}
                    key={family.name}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setPickerFamily(family)}
                    className={cn(
                      "bg-secondary rounded-[24px] overflow-hidden flex flex-row relative group cursor-pointer shadow-sm hover:shadow-md transition-shadow min-h-[188px]",
                      allOos && "opacity-60 grayscale-[0.4]"
                    )}
                  >
                    {/* Left — Text */}
                    <div className="flex-1 flex flex-col px-5 py-6 md:px-6 md:py-7 z-10">
                      <div className="flex items-center gap-2 mb-2.5">
                        <span
                          className="rounded-full px-3 py-0.5 text-[11px] font-semibold tracking-wide"
                          style={{ backgroundColor: TAG_META[family.tag].bg, color: TAG_META[family.tag].color }}
                        >
                          {tagLabel(family.tag)}
                        </span>
                        {anyLow && (
                          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide" style={{ backgroundColor: "rgba(245,158,11,0.12)", color: "#d97706" }}>
                            {t("badge_low_stock")}
                          </span>
                        )}
                      </div>

                      <h3 className="text-[18px] md:text-[20px] font-semibold tracking-[-0.01em] text-primary mb-1 leading-snug">
                        {family.name}
                      </h3>

                      {/* Disabled — fabricated star rating / review count (see seedRating above).
                      <div className="flex items-center gap-1 mb-1.5">
                        <span className="text-[12px]" style={{ color: "#f59e0b" }}>★</span>
                        <span className="text-[12px] font-medium text-primary">{seedRating(family.name).toFixed(1)}</span>
                        <span className="text-[11px] text-tertiary">({seedReviewCount(family.name)})</span>
                      </div>
                      */}

                      <p className="text-[13px] text-secondary mb-0">
                        {multi ? `${family.variants.length} ${t("card_options")}` : displayVariant.unit}
                      </p>

                      <div className="mt-auto pt-3 flex items-center gap-3 flex-wrap">
                        <span className="text-[15px] md:text-[16px] text-primary font-medium">
                          {multi ? `${t("card_from")} $${family.minPrice}` : `$${displayVariant.price.toFixed(2)}`}
                        </span>
                        <button
                          type="button"
                          disabled={allOos}
                          onClick={(e) => { e.stopPropagation(); setPickerFamily(family); }}
                          className={cn(
                            "rounded-full px-4 py-1.5 text-[12px] font-medium cursor-pointer border-none z-20 relative",
                            allOos
                              ? "bg-surface text-tertiary cursor-not-allowed"
                              : "bg-accent text-white hover:bg-[color:var(--accent-hover)] btn-physical btn-physical-accent"
                          )}
                        >
                          <span style={{ pointerEvents: "none" }}>
                            {allOos ? t("card_oos") : multi ? t("card_select") : t("card_add")}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Right — Vial */}
                    <div className="relative w-[104px] md:w-[120px] flex-shrink-0">
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[94px] md:w-[110px] pointer-events-none group-hover:scale-[1.02] transition-transform duration-700">
                        <GlassVial productName={family.name} weight={20} unit={displayVariant.unit} tag={family.tag} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {!showAll && families.length > 9 && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => setShowAll(true)}
                className="rounded-full px-8 py-3 text-[14px] font-medium bg-surface text-primary hover:bg-surface-hover transition-colors border-none cursor-pointer"
              >
                {t("card_show_more")} ({families.length - 9})
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
