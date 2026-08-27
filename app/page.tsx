"use client";

import { useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { GlassVial } from "@/components/ui/GlassVial";
import { AppleNav } from "@/components/ui/AppleNav";
import { AppleHero } from "@/components/sections/AppleHero";
import { AppleBentoGrid } from "@/components/sections/AppleBentoGrid";
import { HomepageReviews } from "@/components/sections/HomepageReviews";
import { AppleFooter } from "@/components/sections/AppleFooter";
import { CartDrawer } from "@/components/modals/CartDrawer";
import { CheckoutModal } from "@/components/modals/CheckoutModal";
import { CartToast } from "@/components/ui/CartToast";

export default function Home() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      {/* Modals & Navigation */}
      <AppleNav />
      <CartToast />
      <CartDrawer onCheckout={() => setCheckoutOpen(true)} />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />

      <main className="pt-[76px]">
        {/* Hero: COA Ribbon */}
        <AppleHero
          variant="secondary"
          headline={t("hero_headline")}
          subheadline={t("hero_sub")}
          ctaText={t("hero_cta")}
          ctaLink="#store"
          ctaSecondaryText={t("hero_cta2")}
          ctaSecondaryLink="/coa"
        >
          <div className="w-full flex justify-center items-end px-4 -space-x-5 sm:-space-x-10 md:-space-x-16">
            <GlassVial
              productName="Creatine Monohydrate"
              weight={10}
              unit="60 Servings"
              className="w-[70px] sm:w-[120px] md:w-[160px] mb-[25px] sm:mb-[40px] md:mb-[60px] -rotate-6 z-0 opacity-90"
            />
            <GlassVial
              productName="Whey Protein Isolate"
              weight={10}
              unit="1 lb"
              className="w-[105px] sm:w-[160px] md:w-[220px] z-10"
            />
            <GlassVial
              productName="Magnesium Glycinate"
              weight={5}
              unit="90 Capsules"
              className="w-[70px] sm:w-[120px] md:w-[160px] mb-[25px] sm:mb-[40px] md:mb-[60px] rotate-6 z-0 opacity-90"
            />
          </div>
        </AppleHero>

        {/* Catalog: Bento Grid */}
        <AppleBentoGrid />

        {/* Social proof */}
        <HomepageReviews />
      </main>

      <AppleFooter />
    </>
  );
}
