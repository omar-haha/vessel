"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Minus, Plus, ZoomIn } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { GlassVial } from "@/components/ui/GlassVial";
import { AppleNav } from "@/components/ui/AppleNav";
import { AppleFooter } from "@/components/sections/AppleFooter";
import { CartDrawer } from "@/components/modals/CartDrawer";
import { CartToast } from "@/components/ui/CartToast";
import { CheckoutModal } from "@/components/modals/CheckoutModal";
import { cn } from "@/lib/utils";
import { products } from "@/lib/products";
import type { Product } from "@/lib/products";

function stockStatus(qty: number): Product["stock"] {
  if (qty === 0) return "out";
  if (qty <= 5) return "low";
  return "in";
}

// First buyable dose, or `fallback` when the whole family is out of stock.
function firstAvailable(variants: Product[], fallback: Product): Product {
  return variants.find((v) => v.stock !== "out") ?? fallback;
}

export function ProductDetail({ product: initial }: { product: Product }) {
  const variants = products.filter((p) => p.name === initial.name);
  const { addToCart, getRemainingStock } = useCart();
  const { t } = useLanguage();
  // Resolved from static stock so the first paint is already correct; the effect
  // below re-checks once live stock arrives.
  const [selected, setSelected] = useState<Product>(() =>
    initial.stock === "out" ? firstAvailable(variants, initial) : initial
  );
  const [qty, setQty] = useState(1);
  const [clicked, setClicked] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [liveVariants, setLiveVariants] = useState<Product[]>(variants);

  // Fetch live stock and override the static stock field
  useEffect(() => {
    fetch("/api/stock")
      .then((r) => r.json())
      .then((map: Record<string, number>) => {
        setLiveVariants(
          variants.map((v) => (v.id in map ? { ...v, stock: stockStatus(map[v.id]) } : v))
        );
      })
      .catch(() => {});
  }, [initial.id]);

  // Keep selected in sync if variants update, and prefer a dose that can actually
  // be bought. The SKU in the URL may be out of stock — arrived at from a related-
  // product card, a stale link, or stock selling out — in which case show an
  // available sibling dose rather than a dead "Out of Stock" button. Runs on mount
  // against the static stock field and again when live stock lands.
  //
  // This can't override a deliberate choice: out-of-stock dose pills are disabled,
  // so a selection the visitor made by hand is in stock by construction. The URL
  // is intentionally left pointing at the requested SKU; the dose pills show which
  // one is actually selected.
  useEffect(() => {
    const updated = liveVariants.find((v) => v.id === selected.id) ?? selected;
    if (updated.stock === "out") {
      const available = firstAvailable(liveVariants, updated);
      if (available.id !== updated.id) {
        setSelected(available);
        setQty(1);
        return;
      }
    }
    setSelected(updated);
  }, [liveVariants]);

  const p = selected;
  const oos = p.stock === "out";
  const remaining = getRemainingStock(p.id);
  const atMax = remaining !== null && qty >= remaining;

  const stockLabel = p.stock === "in" ? t("pdp_in_stock") : p.stock === "low" ? t("pdp_low_stock") : t("pdp_out_stock");
  const stockColor = p.stock === "in" ? "var(--success)" : p.stock === "low" ? "#f59e0b" : "var(--error)";

  const handleAdd = () => {
    if (oos) return;
    addToCart(p, qty);
    setClicked(true);
    setTimeout(() => setClicked(false), 420);
  };

  const SPECS = [
    [t("pdp_cas"),      p.cas],
    [t("pdp_unit"),     p.unit],
    [t("pdp_purity"),   p.purity],
    [t("pdp_category"), p.cat.charAt(0).toUpperCase() + p.cat.slice(1)],
  ];

  // Related: same tag, different name, in-stock first, max 3
  const related = products
    .filter((rp) => rp.tag === p.tag && rp.name !== p.name)
    .reduce<Product[]>((acc, rp) => {
      if (acc.some((x) => x.name === rp.name)) return acc;
      return [...acc, rp];
    }, [])
    .sort((a, b) => {
      const aOos = a.stock === "out" ? 1 : 0;
      const bOos = b.stock === "out" ? 1 : 0;
      return aOos - bOos;
    })
    .slice(0, 3);

  return (
    <>
      <AppleNav />
      <CartToast />
      <CartDrawer onCheckout={() => setCheckoutOpen(true)} />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />

      {/* Zoom overlay */}
      <AnimatePresence>
        {zoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[5000] flex items-center justify-center cursor-zoom-out"
            style={{ backdropFilter: "blur(28px) saturate(180%)", backgroundColor: "rgba(0,0,0,0.72)" }}
            onClick={() => setZoomOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring" as const, stiffness: 320, damping: 26 }}
              className="w-[min(300px,72vw)]"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassVial productName={p.name} weight={20} unit={p.unit} />
            </motion.div>
            <button
              onClick={() => setZoomOpen(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#fff" }}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-[76px] min-h-screen bg-primary">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-10 md:py-16">

          <Link
            href="/#store"
            className="inline-flex items-center gap-1 text-[14px] text-secondary hover:text-primary transition-colors no-underline mb-10 md:mb-14"
          >
            <ChevronLeft size={16} strokeWidth={2} />
            {t("pdp_back")}
          </Link>

          {/* Two-column layout */}
          <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start">

            {/* Vial */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="w-full md:w-[400px] shrink-0"
            >
              <div
                className="relative rounded-[28px] overflow-hidden flex items-end justify-center cursor-zoom-in group"
                style={{ backgroundColor: "var(--bg-alt)", paddingTop: "56px", minHeight: "480px" }}
                onClick={() => setZoomOpen(true)}
              >
                <div className="w-[180px] md:w-[210px] transition-transform duration-700 group-hover:scale-[1.04] group-hover:-translate-y-3">
                  <GlassVial productName={p.name} weight={20} unit={p.unit} />
                </div>
                <div
                  className="absolute bottom-4 right-4 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ backgroundColor: "rgba(0,0,0,0.30)", color: "#fff" }}
                >
                  <ZoomIn size={14} strokeWidth={2} />
                </div>
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="flex-1 min-w-0 pt-2"
            >
              {/* Badges */}
              <div className="flex items-center gap-2.5 mb-4 flex-wrap">
                <span className="text-[11px] font-semibold tracking-widest uppercase text-tertiary">{p.cat}</span>
                {p.bestSeller && (
                  <span className="text-[11px] font-semibold tracking-widest uppercase px-2.5 py-0.5 rounded-full" style={{ backgroundColor: "var(--accent)22", color: "var(--accent)" }}>
                    {t("pdp_best_seller")}
                  </span>
                )}
                <span className="text-[11px] font-semibold tracking-widest uppercase px-2.5 py-0.5 rounded-full" style={{ backgroundColor: stockColor + "22", color: stockColor }}>
                  {stockLabel}
                </span>
              </div>

              <h1 className="text-[36px] md:text-[48px] font-semibold tracking-[-0.02em] text-primary leading-[1.05] mb-3">
                {p.name}
              </h1>
              <p className="text-[16px] text-secondary mb-6">{p.unit} · {p.purity} Purity</p>

              {/* Variant selector */}
              {liveVariants.length > 1 && (
                <div className="mb-6">
                  <p className="text-[11px] font-semibold tracking-widest uppercase mb-2.5" style={{ color: "var(--text-legal)" }}>
                    {t("pdp_select_dose")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {liveVariants.map((v) => {
                      const isActive = v.id === p.id;
                      const vOos = v.stock === "out";
                      return (
                        <button
                          key={v.id}
                          type="button"
                          disabled={vOos}
                          onClick={() => { setSelected(v); setQty(1); setClicked(false); }}
                          className="rounded-full px-4 py-1.5 text-[13px] font-medium border cursor-pointer transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                          style={
                            isActive
                              ? { backgroundColor: "var(--accent)", borderColor: "var(--accent)", color: "#fff" }
                              : { backgroundColor: "transparent", borderColor: "var(--border)", color: "var(--text-muted)" }
                          }
                        >
                          {v.unit.split(" ×")[0]} · ${v.price}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="text-[34px] font-semibold tracking-tight text-primary mb-8">
                ${p.price.toFixed(2)}
              </div>

              {/* Qty + Add */}
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center rounded-full border shrink-0 overflow-hidden" style={{ borderColor: "var(--border)" }}>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty === 1 || oos}
                    className="w-11 h-11 flex items-center justify-center border-none cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150"
                    style={{ backgroundColor: "var(--surface-hover)", color: "var(--text)" }}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={13} strokeWidth={2.5} />
                  </button>
                  <span className="px-4 text-[15px] font-semibold tabular-nums select-none" style={{ backgroundColor: "var(--surface)", color: "var(--text)" }}>
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => (atMax ? q : q + 1))}
                    disabled={oos || atMax}
                    className="w-11 h-11 flex items-center justify-center border-none cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150"
                    style={{ backgroundColor: "var(--surface-hover)", color: "var(--text)" }}
                    aria-label="Increase quantity"
                  >
                    <Plus size={13} strokeWidth={2.5} />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={oos}
                  onClick={handleAdd}
                  className={cn(
                    "flex-1 py-[13px] rounded-full text-[15px] font-medium text-white border-none cursor-pointer relative z-10",
                    oos
                      ? "bg-surface text-tertiary cursor-not-allowed"
                      : clicked
                      ? "bg-accent animate-btn-pop"
                      : "bg-accent hover:bg-[color:var(--accent-hover)] btn-physical btn-physical-accent"
                  )}
                >
                  <span className={clicked ? "animate-text-warp" : undefined} style={{ pointerEvents: "none" }}>
                    {oos ? t("pdp_out_stock") : t("pdp_add")}
                  </span>
                </button>
              </div>

              <p className="text-[12px] mb-8 h-[15px]" style={{ color: "var(--text-muted)" }}>
                {!oos && atMax ? `${t("stock_max_available")}: ${remaining}` : ""}
              </p>

              {/* Specs */}
              <div className="rounded-[16px] overflow-hidden border mb-8" style={{ borderColor: "var(--border)" }}>
                {SPECS.map(([label, value], i) => (
                  <div
                    key={label}
                    className="flex justify-between items-center px-5 py-3.5 text-[14px]"
                    style={{
                      borderBottom: i < SPECS.length - 1 ? "1px solid var(--border)" : "none",
                      backgroundColor: i % 2 === 0 ? "var(--surface)" : "var(--bg-alt)",
                    }}
                  >
                    <span style={{ color: "var(--text-muted)" }}>{label}</span>
                    <span className="font-medium font-mono text-[13px]" style={{ color: "var(--text)" }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Description */}
              {p.description && (
                <div>
                  <p className="text-[11px] font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>
                    {t("pdp_about")}
                  </p>
                  <p className="text-[15px] text-secondary leading-relaxed">{p.description}</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="mt-20 md:mt-28"
            >
              <h2 className="text-[22px] font-semibold tracking-tight text-primary mb-8">{t("pdp_related")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {related.map((rp) => {
                  const rOos = rp.stock === "out";
                  return (
                    <Link
                      key={rp.id}
                      href={`/products/${rp.id}`}
                      className={cn(
                        "rounded-[20px] overflow-hidden flex flex-row no-underline transition-shadow hover:shadow-md min-h-[160px]",
                        rOos && "opacity-60 grayscale-[0.4]"
                      )}
                      style={{ backgroundColor: "var(--surface)" }}
                    >
                      <div className="flex-1 flex flex-col px-5 py-5">
                        <h3 className="text-[16px] font-semibold text-primary mb-1 leading-snug">{rp.name}</h3>
                        <p className="text-[13px] text-secondary mb-auto">{rp.unit}</p>
                        <p className="text-[15px] font-medium text-primary mt-3">${rp.price.toFixed(2)}</p>
                      </div>
                      <div className="relative w-[80px] shrink-0 flex items-end justify-center pb-2">
                        <div className="w-[58px]">
                          <GlassVial productName={rp.name} weight={20} unit={rp.unit} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}

        </div>
      </main>

      <AppleFooter />
    </>
  );
}
