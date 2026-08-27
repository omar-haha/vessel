"use client";

import { useState } from "react";
import { AppleNav } from "@/components/ui/AppleNav";
import { AppleFooter } from "@/components/sections/AppleFooter";
import { CartDrawer } from "@/components/modals/CartDrawer";
import { CartToast } from "@/components/ui/CartToast";
import { CheckoutModal } from "@/components/modals/CheckoutModal";

export function PageShell({ children }: { children: React.ReactNode }) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  return (
    <>
      <AppleNav />
      <CartToast />
      <CartDrawer onCheckout={() => setCheckoutOpen(true)} />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <main className="pt-[76px]">{children}</main>
      <AppleFooter />
    </>
  );
}
