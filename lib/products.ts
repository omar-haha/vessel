// Structural logic only — the actual catalog content (product data, category
// tag labels/colors) lives in config/catalog.ts. Everything below operates on
// that content without needing to know what it contains, so this file should
// never need to change when the catalog is reskinned for a different brand.

import { products, type Category, type BenefitTag, type CatalogProduct } from "@/config/catalog";

export type { Category, BenefitTag };
export { products };

export interface ProductFamily {
  name: string;
  variants: Product[];
  cat: Category;
  tag: BenefitTag;
  minPrice: number;
  bestSeller?: boolean;
}

// The "from $X" on a catalogue card has to be a price someone can actually pay,
// so it is the cheapest *in-stock* variant. Falls back to the whole family when
// every variant is out, so a fully out-of-stock card still shows a price rather
// than Infinity.
//
// Callers that override `stock` with live quantities must recompute this — see
// applyStock() in components/sections/AppleBentoGrid.tsx.
export function familyMinPrice(variants: Product[]): number {
  const available = variants.filter((v) => v.stock !== "out");
  return Math.min(...(available.length > 0 ? available : variants).map((v) => v.price));
}

export function getProductFamilies(): ProductFamily[] {
  const map = new Map<string, Product[]>();
  for (const p of products) {
    const group = map.get(p.name) ?? [];
    group.push(p);
    map.set(p.name, group);
  }
  return Array.from(map.values()).map((variants) => ({
    name: variants[0].name,
    variants,
    cat: variants[0].cat,
    tag: variants[0].tag,
    minPrice: familyMinPrice(variants),
    bestSeller: variants.some((v) => v.bestSeller),
  }));
}

// Product === CatalogProduct, re-exported under this name (rather than having
// every call site import the type from config/catalog directly) so this file
// stays the one place the rest of the app depends on for the catalog's shape.
export type Product = CatalogProduct;
