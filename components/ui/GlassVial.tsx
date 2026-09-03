"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import { TAG_META, type BenefitTag } from "@/config/catalog";
import { BrandLogo } from "./BrandLogo";

interface GlassVialProps {
  productName: string;
  weight: number;
  unit: string;
  className?: string;
  blur?: boolean;
  showLabel?: boolean;
  // Tints the cap in the product's use-case color (see config/catalog.ts
  // TAG_META) so the same silhouette reads as a coherent line instead of
  // every bottle wearing an identical cap. Falls back to the site accent
  // color when the caller doesn't have a tag on hand.
  tag?: BenefitTag;
}

export function GlassVial({ productName, weight: _weight, unit, className, blur = false, showLabel = true, tag }: GlassVialProps) {
  const productNameSize = `${Math.min(11, Math.max(6.5, 90 / productName.length))}cqi`;
  const gradientId = useId();
  const capColor = tag ? TAG_META[tag].color : "var(--accent)";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center transition-transform duration-700",
        blur ? "blur-[8px] opacity-60 scale-90" : "hover:scale-105",
        className
      )}
      style={{ perspective: "800px" }}
    >
      <div className="relative w-full h-full pointer-events-none flex justify-center">
        <div className="relative w-full">
          {/* Vector bottle silhouette — rounded shoulder tapering to a neck,
              straight cylindrical body, soft rounded base. Body gradient
              fakes a light source from the left for a frosted-plastic look
              without a raster image or filter hacks. */}
          <svg
            viewBox="0 0 385 883"
            width={385}
            height={883}
            className="w-full h-auto object-contain drop-shadow-2xl transition-all duration-300"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`${gradientId}-body`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f5f5f7" />
                <stop offset="32%" stopColor="#ffffff" />
                <stop offset="58%" stopColor="#e4e4e9" />
                <stop offset="100%" stopColor="#cdced4" />
              </linearGradient>
            </defs>
            <path
              d="M 140 88 L 245 88 L 245 150 C 280 150 330 170 360 230 L 360 845
                 A 30 30 0 0 1 330 875 L 55 875 A 30 30 0 0 1 25 845
                 L 25 230 C 55 170 105 150 140 150 Z"
              fill={`url(#${gradientId}-body)`}
              stroke="rgba(0,0,0,0.08)"
              strokeWidth="2"
            />
          </svg>

          {/* Screw cap — tinted per use-case tag */}
          <div
            className="absolute left-1/2 z-10"
            style={{
              top: "1%",
              width: "58%",
              height: "9%",
              transform: "translateX(-50%)",
              borderRadius: "10% 10% 6% 6%",
              background: `linear-gradient(180deg, ${capColor} 0%, ${capColor} 70%, rgba(0,0,0,0.18) 100%)`,
              boxShadow: "0 2px 6px rgba(0,0,0,0.25), inset 0 1px 2px rgba(255,255,255,0.35)",
            }}
          />
          <div
            className="absolute left-1/2 z-10"
            style={{
              top: "9.5%",
              width: "62%",
              height: "1.6%",
              transform: "translateX(-50%)",
              borderRadius: "2px",
              background: "rgba(0,0,0,0.15)",
            }}
          />

          {/* Gloss streak over the bottle body */}
          <div
            className="absolute inset-0 z-[5] pointer-events-none"
            style={{
              background: "linear-gradient(100deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.55) 42%, rgba(255,255,255,0) 54%)",
            }}
          />
        </div>
      </div>

      {!blur && showLabel && (
        <div
          className="vial-label absolute z-20 flex flex-col overflow-hidden pointer-events-none"
          style={{
            top: "40%",
            width: "74%",
            height: "44%",
            left: "50%",
            transform: "translateX(-50%) rotateX(2deg)",
            background: "linear-gradient(180deg, var(--label-bg) 0%, var(--label-bg-end) 100%)",
            borderRadius: "4px",
            containerType: "inline-size",
            boxShadow: "0 4px 15px rgba(0,0,0,0.3), inset 0 0 0 0.5cqi rgba(0,0,0,0.05)",
          }}
        >
          <div className="flex flex-col w-full h-full p-[6cqi] min-w-0">
            <div className="flex items-end justify-between gap-[2cqi] pb-[2cqi] border-b-[0.8cqi] border-label mb-[3cqi] min-w-0">
              <BrandLogo className="h-[7cqi] w-auto max-w-[52%] text-label shrink-0" />
              <div
                className="shrink-0 border-[0.5cqi] border-label bg-label-badge px-[2cqi] py-[0.5cqi] font-bold tracking-tight"
                style={{ fontSize: "4.5cqi" }}
              >
                {unit}
              </div>
            </div>

            <div
              className="font-[family-name:var(--font-orbitron)] font-semibold tracking-[0.04em] uppercase text-label leading-none w-full"
              style={{ fontSize: productNameSize }}
            >
              {productName}
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-[2cqi] pb-[2cqi] border-b-[0.8cqi] border-label mb-[2cqi]">
              <div
                className="bg-label-badge px-[1.5cqi] py-[0.5cqi] font-bold uppercase tracking-widest"
                style={{ fontSize: "3cqi" }}
              >
                LAB TESTED
              </div>
              <div className="flex flex-col leading-none">
                <div className="text-label-muted font-mono tracking-widest uppercase" style={{ fontSize: "3.5cqi" }}>
                  Testé en laboratoire
                </div>
                <div className="text-label-muted font-mono tracking-widest uppercase opacity-60" style={{ fontSize: "2.6cqi" }}>
                  Third-Party Verified
                </div>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div className="flex flex-col border-l-[1cqi] border-label pl-[2cqi]">
                <div className="text-label font-mono tracking-widest uppercase leading-[1.4]" style={{ fontSize: "3.5cqi" }}>
                  LOT: <span className="font-bold">7290X</span>
                </div>
                <div className="text-label font-mono tracking-widest uppercase leading-[1.4]" style={{ fontSize: "3.5cqi" }}>
                  MADE: <span className="font-bold">12/28</span>
                </div>
              </div>
              <div className="flex flex-col text-right leading-[1.3] max-w-[50%]">
                <div
                  className="text-label font-bold tracking-tight uppercase"
                  style={{ fontSize: "3.5cqi" }}
                >
                  Origine Québec
                </div>
                <div
                  className="text-label font-bold tracking-tight uppercase opacity-60"
                  style={{ fontSize: "2.6cqi" }}
                >
                  Made in Québec
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute inset-0 z-30 pointer-events-none"
            style={{
              background: [
                "linear-gradient(to right, rgba(0,0,0,0.28) 0%, transparent 22%, transparent 78%, rgba(0,0,0,0.22) 100%)",
                "linear-gradient(to bottom, rgba(255,255,255,0.13) 0%, transparent 40%, rgba(0,0,0,0.08) 100%)",
                "linear-gradient(105deg, rgba(255,255,255,0) 28%, rgba(255,255,255,0.32) 43%, rgba(255,255,255,0) 58%)",
              ].join(", "),
            }}
          />
        </div>
      )}
    </div>
  );
}
