"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { GlassVial } from "@/components/ui/GlassVial";
import { cn } from "@/lib/utils";
import type { ProductFamily } from "@/lib/products";

// Open on a dose the visitor can actually buy. `family` already carries live
// stock (AppleBentoGrid applies /api/stock before handing it over), so prefer the
// first available variant and only fall back to variants[0] when the whole family
// is out — otherwise the modal opens on a dead "Out of Stock" button even though
// another dose is in stock.
function defaultVariantId(family: ProductFamily): string {
  return (family.variants.find((v) => v.stock !== "out") ?? family.variants[0]).id;
}

function PickerContent({ family, onClose }: { family: ProductFamily; onClose: () => void }) {
  const { addToCart, getRemainingStock } = useCart();
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState<string>(() => defaultVariantId(family));
  const [qty, setQty] = useState(1);
  const [clicked, setClicked] = useState(false);

  const selected = family.variants.find((v) => v.id === selectedId) ?? family.variants[0];
  const oos = selected.stock === "out";
  const remaining = getRemainingStock(selected.id);
  const atMax = remaining !== null && qty >= remaining;

  const handleAdd = () => {
    if (oos) return;
    addToCart(selected, qty);
    setClicked(true);
    setTimeout(() => { setClicked(false); onClose(); }, 480);
  };

  return (
    <motion.div
      initial={{ scale: 0.93, opacity: 0, y: 18 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.93, opacity: 0, y: 18 }}
      transition={{ type: "spring" as const, stiffness: 360, damping: 30 }}
      className="w-full max-w-[620px] rounded-[28px] overflow-hidden"
      style={{ backgroundColor: "var(--surface)" }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-7 pt-6">
        <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: "var(--text-legal)" }}>
          {family.cat}
        </span>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer"
          style={{ backgroundColor: "var(--surface-hover)", color: "var(--text-muted)" }}
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Body: vial + info side by side */}
      <div className="flex flex-col sm:flex-row items-stretch">
        {/* Vial panel */}
        <div
          className="sm:w-[200px] shrink-0 flex items-center justify-center px-7 sm:pl-7 sm:pr-0 pb-0 pt-4"
          style={{ minHeight: "210px" }}
        >
          <div className="w-[142px]">
            <GlassVial productName={family.name} weight={20} unit={selected.unit} tag={family.tag} />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 px-7 pt-5 pb-7">
          <h2 className="text-[26px] font-semibold tracking-[-0.02em] mb-1" style={{ color: "var(--text)" }}>
            {family.name}
          </h2>
          {selected.cas !== "N/A" && (
            <p className="text-[13px] mb-5" style={{ color: "var(--text-muted)" }}>
              CAS {selected.cas}
            </p>
          )}

          {/* Variant selector — only if more than one */}
          {family.variants.length > 1 && (
            <div className="mb-5">
              <p className="text-[11px] font-semibold tracking-widest uppercase mb-2.5" style={{ color: "var(--text-legal)" }}>
                {t("picker_dose")}
              </p>
              <div className="flex flex-wrap gap-2">
                {family.variants.map((v) => {
                  const isActive = v.id === selected.id;
                  const vOos = v.stock === "out";
                  const doseLabel = v.unit.split(" ×")[0];
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={vOos}
                      onClick={() => setSelectedId(v.id)}
                      className="rounded-full px-3.5 py-1.5 text-[12px] font-medium border cursor-pointer transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={
                        isActive
                          ? { backgroundColor: "var(--accent)", borderColor: "var(--accent)", color: "#fff" }
                          : { backgroundColor: "transparent", borderColor: "var(--border)", color: "var(--text-muted)" }
                      }
                    >
                      {doseLabel} · ${v.price}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="text-[28px] font-semibold tracking-tight mb-5" style={{ color: "var(--text)" }}>
            ${selected.price.toFixed(2)}
          </div>

          {/* Qty stepper + Add to Bag */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center rounded-full border shrink-0 overflow-hidden"
              style={{ borderColor: "var(--border)" }}
            >
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty === 1 || oos}
                className="w-10 h-10 flex items-center justify-center border-none cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed"
                style={{ backgroundColor: "var(--surface-hover)", color: "var(--text)" }}
                aria-label="Decrease"
              >
                <Minus size={12} strokeWidth={2.5} />
              </button>
              <span
                className="px-3.5 text-[14px] font-semibold tabular-nums select-none"
                style={{ backgroundColor: "var(--surface)", color: "var(--text)" }}
              >
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => (atMax ? q : q + 1))}
                disabled={oos || atMax}
                className="w-10 h-10 flex items-center justify-center border-none cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed"
                style={{ backgroundColor: "var(--surface-hover)", color: "var(--text)" }}
                aria-label="Increase"
              >
                <Plus size={12} strokeWidth={2.5} />
              </button>
            </div>

            <button
              type="button"
              disabled={oos}
              onClick={handleAdd}
              className={cn(
                "flex-1 py-[11px] rounded-full text-[14px] font-medium text-white border-none cursor-pointer relative",
                oos
                  ? "cursor-not-allowed"
                  : clicked
                  ? "bg-accent animate-btn-pop"
                  : "bg-accent hover:bg-[color:var(--accent-hover)] btn-physical btn-physical-accent"
              )}
              style={oos ? { backgroundColor: "var(--surface)", color: "var(--text-legal)" } : {}}
            >
              <span className={clicked ? "animate-text-warp" : undefined} style={{ pointerEvents: "none" }}>
                {oos ? t("picker_oos") : t("picker_add")}
              </span>
            </button>
          </div>

          {!oos && atMax && (
            <p className="text-[12px] mt-2" style={{ color: "var(--text-muted)" }}>
              {t("stock_max_available")}: {remaining}
            </p>
          )}

          <Link
            href={`/products/${selected.id}`}
            onClick={onClose}
            className="inline-block mt-4 text-[12px] no-underline transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            {t("picker_view")}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function ProductPickerModal({
  family,
  onClose,
}: {
  family: ProductFamily | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {family && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[3000] flex items-center justify-center px-4"
          style={{
            backdropFilter: "blur(24px) saturate(160%)",
            backgroundColor: "rgba(0,0,0,0.52)",
          }}
          onClick={onClose}
        >
          <PickerContent key={family.name} family={family} onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
