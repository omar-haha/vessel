"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/providers/CartProvider";

export function CartToast() {
  const { lastAdded, setCartOpen, clearLastAdded } = useCart();

  return (
    <div
      className="fixed top-[54px] right-4 z-[1500] pointer-events-none"
      aria-live="polite"
    >
      <div
        onClick={() => { setCartOpen(true); clearLastAdded(); }}
        // pointer-events tracks lastAdded, not just opacity — this box sits
        // right over the nav's language/theme/cart buttons (fixed, higher
        // z-index than the nav), so leaving it interactive while "hidden"
        // silently swallowed clicks meant for those buttons.
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-[14px] shadow-2xl transition-all duration-300 cursor-pointer",
          lastAdded ? "pointer-events-auto" : "pointer-events-none"
        )}
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          opacity: lastAdded ? 1 : 0,
          transform: lastAdded ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.97)",
          transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        <CheckCircle2 size={16} strokeWidth={2} style={{ color: "var(--accent)", flexShrink: 0 }} />
        <div className="flex flex-col min-w-0">
          <span className="text-[13px] font-semibold tracking-tight truncate max-w-[180px]" style={{ color: "var(--text)" }}>
            {lastAdded?.name ?? ""}
          </span>
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            Added to Bag
          </span>
        </div>
      </div>
    </div>
  );
}
