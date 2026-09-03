"use client";

import { Trash2, ShoppingBag, Plus, Minus } from "lucide-react";
import { useCart } from "../providers/CartProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { GlassVial } from "@/components/ui/GlassVial";
import { cn } from "@/lib/utils";
import { products } from "@/lib/products";
import { useEffect, useState } from "react";

export function CartDrawer({ onCheckout }: { onCheckout: () => void }) {
  const { cartItems, cartTotal, cartOpen, setCartOpen, removeFromCart, updateQty, getRemainingStock } = useCart();
  const { t } = useLanguage();
  const items = Object.values(cartItems);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (cartOpen) {
      requestAnimationFrame(() => setMounted(true));
      document.body.style.overflow = "hidden";
    } else {
      setMounted(false);
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen]);

  const handleRemove = (id: string, e: React.MouseEvent) => {
    setRemovingId(id);
    setTimeout(() => {
      removeFromCart(id);
      setRemovingId(null);
    }, 420);
  };

  const handleBrowseStore = () => {
    setCartOpen(false);
    if (window.location.pathname === "/") {
      setTimeout(() => {
        document.getElementById("store")?.scrollIntoView({ behavior: "smooth" });
      }, 400);
    } else {
      window.location.href = "/#store";
    }
  };

  return (
    <>
      <div
        data-lenis-prevent="true"
        className={cn(
          "fixed inset-0 z-[2000] pointer-events-none",
          cartOpen && "pointer-events-auto"
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-400 pointer-events-none",
            cartOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
          )}
          onClick={() => setCartOpen(false)}
        />

        {/* Panel */}
        <div
          className={cn(
            "absolute top-0 right-0 bottom-0 w-full sm:w-[420px] flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] pointer-events-none",
            cartOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full"
          )}
          style={{ backgroundColor: "var(--bg)" }}
        >
          {/* Close button — always top-right corner */}
          <button
            onClick={() => setCartOpen(false)}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors text-[13px] font-medium"
            style={{ backgroundColor: "var(--surface)", color: "var(--text-muted)" }}
            aria-label="Close bag"
          >
            ✕
          </button>

          {/* Header */}
          <div className="pt-12 pb-6 px-6 shrink-0">
            <h2 className="text-[28px] font-semibold tracking-tight m-0" style={{ color: "var(--text)" }}>{t("cart_title")}</h2>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 flex flex-col gap-3 pb-4 min-h-0">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 mt-20">
                <ShoppingBag size={48} strokeWidth={1} className="opacity-30" style={{ color: "var(--text-muted)" }} />
                <p className="text-[17px] tracking-tight" style={{ color: "var(--text-muted)" }}>{t("cart_empty")}</p>
                <button
                  onClick={handleBrowseStore}
                  className="mt-2 px-6 py-3 rounded-full text-[15px] font-medium cursor-pointer border-none btn-physical btn-physical-accent"
                  style={{ backgroundColor: "var(--accent)", color: "var(--accent-fg)" }}
                >
                  {t("cart_browse")}
                </button>
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={item.id}
                  className="transition-all duration-350 overflow-hidden shrink-0"
                  style={{
                    maxHeight: removingId === item.id ? "0px" : "300px",
                    marginBottom: removingId === item.id ? "-12px" : "0px",
                    opacity: removingId === item.id ? 0 : 1,
                    transition: removingId === item.id ? "max-height 0.4s cubic-bezier(0.32,0.72,0,1) 0.1s, margin-bottom 0.4s cubic-bezier(0.32,0.72,0,1) 0.1s, opacity 0.3s 0.2s" : "none",
                  }}
                >
                <div
                  className={cn(
                    "relative rounded-[18px] border overflow-hidden",
                    removingId === item.id
                      ? "opacity-0 scale-90"
                      : "opacity-100 scale-100"
                  )}
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--surface)",
                    transformOrigin: "center center",
                    transition: removingId === item.id
                      ? "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s ease-in"
                      : "none",
                    animation: mounted
                      ? `cart-item-in 0.4s ${idx * 60}ms cubic-bezier(0.32,0.72,0,1) both`
                      : "none",
                  }}
                >
                  {/* Trash button — top right */}
                  <button
                    onClick={(e) => handleRemove(item.id, e)}
                    className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center border border-primary cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 bg-[color:var(--surface)]/80 backdrop-blur-md hover:bg-[color:var(--error)] hover:border-[color:var(--error)] hover:text-[color:var(--accent-fg)] text-secondary shadow-sm"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 size={14} strokeWidth={2.5} />
                  </button>

                  <div className="flex items-stretch gap-0">
                    {/* Vial thumbnail */}
                    <div
                      className="w-[100px] shrink-0 flex items-end justify-center pt-6 pb-0 overflow-hidden"
                      style={{ backgroundColor: "var(--bg-alt)" }}
                    >
                      <div className="w-[72px]">
                        <GlassVial
                          productName={item.name}
                          weight={20}
                          unit={item.unit}
                          tag={products.find((pr) => pr.id === item.id)?.tag}
                        />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between p-4 pr-10 min-w-0">
                      <div>
                        <div
                          className="text-[15px] font-semibold leading-tight tracking-tight truncate"
                          style={{ color: "var(--text)" }}
                        >
                          {item.name}
                        </div>
                        <div className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {item.unit}
                        </div>
                      </div>

                      {(() => {
                        const remaining = getRemainingStock(item.id);
                        const atMax = remaining !== null && remaining <= 0;
                        return (
                      <>
                      <div className="flex items-center justify-between mt-3">
                        {/* Qty stepper */}
                        <div
                          className="flex items-center gap-0 rounded-full overflow-hidden border"
                          style={{ borderColor: "var(--border)" }}
                        >
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            disabled={item.qty === 1}
                            className="w-8 h-8 flex items-center justify-center border-none cursor-pointer transition-all duration-150 hover:bg-[var(--surface)] active:bg-[var(--border)] active:translate-y-px disabled:opacity-25 disabled:cursor-not-allowed"
                            style={{ backgroundColor: "var(--surface-hover)", color: "var(--text)" }}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} strokeWidth={2.5} />
                          </button>
                          <span
                            className="px-3 text-[14px] font-semibold tabular-nums"
                            style={{ color: "var(--text)", backgroundColor: "var(--surface)" }}
                          >
                            {item.qty}
                          </span>
                          <button
                            onClick={() => { if (!atMax) updateQty(item.id, 1); }}
                            disabled={atMax}
                            className="w-8 h-8 flex items-center justify-center border-none cursor-pointer transition-all duration-150 hover:bg-[var(--surface)] active:bg-[var(--border)] active:translate-y-px disabled:opacity-25 disabled:cursor-not-allowed"
                            style={{ backgroundColor: "var(--surface-hover)", color: "var(--text)" }}
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} strokeWidth={2.5} />
                          </button>
                        </div>

                        {/* Line total */}
                        <div className="text-[15px] font-medium tracking-tight" style={{ color: "var(--text)" }}>
                          ${(item.price * item.qty).toFixed(2)}
                        </div>
                      </div>
                      {atMax && (
                        <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
                          {t("stock_max_available")}
                        </p>
                      )}
                      </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="px-6 pb-10 pt-4 shrink-0">
              <div
                className="flex justify-between text-[17px] font-semibold mb-5 tracking-tight pt-4"
                style={{ color: "var(--text)", borderTop: "1px solid var(--border)" }}
              >
                <span>{t("cart_total")}</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={() => {
                  setCartOpen(false);
                  onCheckout();
                }}
                className="w-full text-white border-none py-4 rounded-full text-[17px] font-normal cursor-pointer btn-physical btn-physical-accent"
                style={{ backgroundColor: "var(--accent)" }}
              >
                {t("cart_checkout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
