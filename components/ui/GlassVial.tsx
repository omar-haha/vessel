"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import { TAG_META, type BenefitTag } from "@/config/catalog";
import { BrandLogo } from "./BrandLogo";

// Product render: a semi-realistic wide-mouth supplement tub, drawn as SVG.
//
// Everything is gradients — no SVG filters. The catalog page renders 30+ of
// these at once and feGaussianBlur that many times is a measurable cost, so
// the specular highlights are radial-gradient ellipses instead of blurred
// shapes. Each instance carries its own <defs> (ids are per-instance) rather
// than sharing one hoisted def block; that keeps the component self-contained
// at the cost of some DOM weight.

const GEO = {
  W: 620,
  H: 820,
  capL: 75,
  capR: 545,
  capTopY: 44,
  capBotY: 158,
  capRy: 26,
  bodyL: 90,
  bodyR: 530,
  bodyTopY: 164,
  bodyBotY: 716,
  bodyRy: 50,
};

// The jar's material. One finish for the whole line — a real brand doesn't mix
// tub colors across its catalog — so this is a single constant, not a prop.
const BODY_STOPS: [number, string][] = [
  [0, "#25282c"],
  [5, "#2f3237"],
  [15, "#3d4147"],
  [30, "#565b62"],
  [42, "#4b4f55"],
  [60, "#3b3e43"],
  [78, "#2d3034"],
  [92, "#232529"],
  [100, "#1d1f22"],
];
const SPEC_OPACITY = 0.3;
// Rim light down both edges. Without it a near-black tub loses its silhouette
// against the dark theme's background — and it's how a dark product is lit in
// a real photo anyway, so it earns its place in light mode too.
const RIM_OPACITY = 0.42;
const OUTLINE = "rgba(0,0,0,0.35)";

const CAP_RX = (GEO.capR - GEO.capL) / 2;
const BODY_RX = (GEO.bodyR - GEO.bodyL) / 2;
const CAP_CX = (GEO.capL + GEO.capR) / 2;
const BODY_CX = (GEO.bodyL + GEO.bodyR) / 2;

const BODY_PATH = `M ${GEO.bodyL} ${GEO.bodyTopY} L ${GEO.bodyL} ${GEO.bodyBotY} A ${BODY_RX} ${GEO.bodyRy} 0 0 0 ${GEO.bodyR} ${GEO.bodyBotY} L ${GEO.bodyR} ${GEO.bodyTopY} Z`;
const CAP_PATH = `M ${GEO.capL} ${GEO.capTopY} L ${GEO.capL} ${GEO.capBotY} A ${CAP_RX} ${GEO.capRy} 0 0 0 ${GEO.capR} ${GEO.capBotY} L ${GEO.capR} ${GEO.capTopY} A ${CAP_RX} ${GEO.capRy} 0 0 1 ${GEO.capL} ${GEO.capTopY} Z`;

interface GlassVialProps {
  productName: string;
  weight: number;
  unit: string;
  className?: string;
  blur?: boolean;
  showLabel?: boolean;
  // Colors the lid with the product's use-case color (see config/catalog.ts
  // TAG_META) so the catalog reads as one product line in several flavors
  // rather than one object recolored nowhere. Falls back to the site accent
  // when the caller has no tag on hand.
  tag?: BenefitTag;
}

export function GlassVial({ productName, weight: _weight, unit, className, blur = false, showLabel = true, tag }: GlassVialProps) {
  // Label type is sized in cqi (1% of the label's width), so a long product
  // name shrinks to fit rather than overflowing the wrap.
  const productNameSize = `${Math.min(6.6, Math.max(3.9, 54 / productName.length))}cqi`;
  // useId() contains colons, which are legal in an id but unreliable inside
  // url(#...) references in some browsers — strip them.
  const uid = useId().replace(/:/g, "");
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
          <svg
            viewBox={`0 0 ${GEO.W} ${GEO.H}`}
            width={GEO.W}
            height={GEO.H}
            className="w-full h-auto object-contain transition-all duration-300"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="1" y2="0">
                {BODY_STOPS.map(([offset, color]) => (
                  <stop key={offset} offset={`${offset}%`} stopColor={color} />
                ))}
              </linearGradient>

              {/* Cylindrical shading laid over whatever hue the tag supplies, so
                  an arbitrary color still reads as molded plastic. */}
              <linearGradient id={`${uid}-capshade`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#000" stopOpacity="0.42" />
                <stop offset="8%" stopColor="#000" stopOpacity="0.20" />
                <stop offset="26%" stopColor="#fff" stopOpacity="0.26" />
                <stop offset="38%" stopColor="#fff" stopOpacity="0.10" />
                <stop offset="58%" stopColor="#000" stopOpacity="0.06" />
                <stop offset="80%" stopColor="#000" stopOpacity="0.26" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.48" />
              </linearGradient>

              <linearGradient id={`${uid}-captop`} x1="0.15" y1="0" x2="0.9" y2="1">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.34" />
                <stop offset="45%" stopColor="#fff" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.18" />
              </linearGradient>

              <pattern id={`${uid}-ribs`} patternUnits="userSpaceOnUse" width={17} height={4}>
                <rect x={0} y={0} width={7} height={4} fill="#000" opacity={0.13} />
                <rect x={9} y={0} width={3} height={4} fill="#fff" opacity={0.1} />
              </pattern>

              <radialGradient id={`${uid}-spec`} cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#fff" stopOpacity={SPEC_OPACITY} />
                <stop offset="55%" stopColor="#fff" stopOpacity={SPEC_OPACITY * 0.34} />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </radialGradient>

              <radialGradient id={`${uid}-rim`} cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#fff" stopOpacity={RIM_OPACITY} />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </radialGradient>

              <linearGradient id={`${uid}-topshade`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#000" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#000" stopOpacity="0" />
              </linearGradient>

              <linearGradient id={`${uid}-ao`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#000" stopOpacity="0" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.22" />
              </linearGradient>

              <radialGradient id={`${uid}-ground`} cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#000" stopOpacity="0.30" />
                <stop offset="60%" stopColor="#000" stopOpacity="0.11" />
                <stop offset="100%" stopColor="#000" stopOpacity="0" />
              </radialGradient>

              <clipPath id={`${uid}-bodyclip`}>
                <path d={BODY_PATH} />
              </clipPath>
              <clipPath id={`${uid}-capclip`}>
                <path d={CAP_PATH} />
              </clipPath>
            </defs>

            {/* Contact shadow */}
            <ellipse
              cx={BODY_CX}
              cy={GEO.bodyBotY + GEO.bodyRy + 6}
              rx={BODY_RX + 20}
              ry={30}
              fill={`url(#${uid}-ground)`}
            />

            {/* Body */}
            <path d={BODY_PATH} fill={`url(#${uid}-body)`} />
            <g clipPath={`url(#${uid}-bodyclip)`}>
              {/* Shadow the lid casts onto the shoulder, then contact darkening at the base */}
              <rect x={GEO.bodyL} y={GEO.bodyTopY} width={GEO.bodyR - GEO.bodyL} height={120} fill={`url(#${uid}-topshade)`} />
              <rect
                x={GEO.bodyL}
                y={GEO.bodyBotY - 130}
                width={GEO.bodyR - GEO.bodyL}
                height={GEO.bodyRy + 140}
                fill={`url(#${uid}-ao)`}
              />
              <ellipse cx={GEO.bodyL + 82} cy={470} rx={54} ry={230} fill={`url(#${uid}-spec)`} />
              <ellipse cx={GEO.bodyR - 14} cy={470} rx={26} ry={250} fill={`url(#${uid}-rim)`} />
              <ellipse cx={GEO.bodyL + 12} cy={470} rx={20} ry={250} fill={`url(#${uid}-rim)`} />
            </g>
            <path d={BODY_PATH} fill="none" stroke={OUTLINE} strokeWidth={2} />

            {/* Lid — ribbed side wall */}
            <path d={CAP_PATH} fill={capColor} />
            <g clipPath={`url(#${uid}-capclip)`}>
              <rect
                x={GEO.capL}
                y={GEO.capTopY}
                width={GEO.capR - GEO.capL}
                height={GEO.capBotY + GEO.capRy - GEO.capTopY}
                fill={`url(#${uid}-ribs)`}
              />
              <rect
                x={GEO.capL}
                y={GEO.capTopY}
                width={GEO.capR - GEO.capL}
                height={GEO.capBotY + GEO.capRy - GEO.capTopY}
                fill={`url(#${uid}-capshade)`}
              />
              <ellipse cx={GEO.capL + 78} cy={106} rx={34} ry={54} fill={`url(#${uid}-spec)`} />
            </g>

            {/* Lid — top face */}
            <ellipse cx={CAP_CX} cy={GEO.capTopY} rx={CAP_RX} ry={GEO.capRy} fill={capColor} />
            <ellipse cx={CAP_CX} cy={GEO.capTopY} rx={CAP_RX} ry={GEO.capRy} fill={`url(#${uid}-captop)`} />
            <ellipse
              cx={CAP_CX}
              cy={GEO.capTopY}
              rx={CAP_RX - 16}
              ry={GEO.capRy - 7}
              fill="none"
              stroke="#000"
              strokeOpacity={0.1}
              strokeWidth={2}
            />
            <ellipse
              cx={CAP_CX}
              cy={GEO.capTopY}
              rx={CAP_RX}
              ry={GEO.capRy}
              fill="none"
              stroke="#000"
              strokeOpacity={0.16}
              strokeWidth={2}
            />
          </svg>
        </div>
      </div>

      {!blur && showLabel && (
        <div
          className="vial-label absolute z-20 flex flex-col overflow-hidden pointer-events-none"
          style={{
            top: "41%",
            // Matches the body silhouette exactly, so the label wraps the jar
            // edge to edge instead of floating on it as a sticker. Height is
            // tuned so the content fills it — any taller and the middle opens
            // into an obvious empty band.
            width: "71%",
            height: "35%",
            left: "50%",
            transform: "translateX(-50%) rotateX(2deg)",
            background: "linear-gradient(180deg, var(--label-bg) 0%, var(--label-bg-end) 100%)",
            containerType: "inline-size",
            // The only shadows are the hairlines the label's own thickness casts.
            boxShadow: "0 1px 2px rgba(0,0,0,0.35), 0 -1px 2px rgba(0,0,0,0.22)",
          }}
        >
          <div className="flex flex-col w-full h-full p-[4cqi] min-w-0">
            <div className="flex items-end justify-between gap-[1.4cqi] pb-[1.4cqi] border-b-[0.55cqi] border-label mb-[2cqi] min-w-0">
              <BrandLogo className="h-[4.4cqi] w-auto max-w-[52%] text-label shrink-0" />
              <div
                className="shrink-0 border-[0.35cqi] border-label bg-label-badge px-[1.4cqi] py-[0.35cqi] font-bold tracking-tight"
                style={{ fontSize: "3cqi" }}
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

            <div className="flex items-center gap-[1.4cqi] pb-[1.4cqi] border-b-[0.55cqi] border-label mb-[1.4cqi]">
              <div
                className="bg-label-badge px-[1cqi] py-[0.35cqi] font-bold uppercase tracking-widest"
                style={{ fontSize: "2.1cqi" }}
              >
                LAB TESTED
              </div>
              <div className="flex flex-col leading-none">
                <div className="text-label-muted font-mono tracking-widest uppercase" style={{ fontSize: "2.4cqi" }}>
                  Testé en laboratoire
                </div>
                <div className="text-label-muted font-mono tracking-widest uppercase opacity-60" style={{ fontSize: "1.9cqi" }}>
                  Third-Party Verified
                </div>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div className="flex flex-col border-l-[0.7cqi] border-label pl-[1.4cqi]">
                <div className="text-label font-mono tracking-widest uppercase leading-[1.4]" style={{ fontSize: "2.4cqi" }}>
                  LOT: <span className="font-bold">7290X</span>
                </div>
                <div className="text-label font-mono tracking-widest uppercase leading-[1.4]" style={{ fontSize: "2.4cqi" }}>
                  MADE: <span className="font-bold">12/28</span>
                </div>
              </div>
              <div className="flex flex-col text-right leading-[1.3] max-w-[50%]">
                <div className="text-label font-bold tracking-tight uppercase" style={{ fontSize: "2.4cqi" }}>
                  Origine Québec
                </div>
                <div className="text-label font-bold tracking-tight uppercase opacity-60" style={{ fontSize: "1.9cqi" }}>
                  Made in Québec
                </div>
              </div>
            </div>
          </div>

          {/* Curvature: the label darkens where it wraps out of sight, plus a sheen */}
          <div
            className="absolute inset-0 z-30 pointer-events-none"
            style={{
              background: [
                "linear-gradient(to right, rgba(0,0,0,0.30) 0%, transparent 18%, transparent 82%, rgba(0,0,0,0.24) 100%)",
                "linear-gradient(to bottom, rgba(255,255,255,0.13) 0%, transparent 40%, rgba(0,0,0,0.08) 100%)",
                "linear-gradient(105deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.26) 44%, rgba(255,255,255,0) 58%)",
              ].join(", "),
            }}
          />
        </div>
      )}
    </div>
  );
}
