// Single source of truth for brand identity — name, domain, contact
// addresses, and metadata copy. Everything elsewhere in the app should
// import from here rather than hardcode any of these values, so that
// reskinning this codebase for a different brand (or syncing structural
// changes from a sibling repo with a different brand) touches this file
// and nothing else.
//
// Not included here: the BrandLogo.tsx wordmark. That's a hand-drawn SVG
// (each letter is its own <path>, not generated from text), so it isn't
// data-driven — swapping the brand name still means redrawing the mark.

export const BRAND = {
  name: "VESSEL",
  tagline: "Third-Party Tested Supplements",
  description:
    "Protein, performance, and wellness supplements with a Certificate of Analysis for every batch. Shipped Canada-wide in protective packaging.",
  keywords: [
    "supplements",
    "protein",
    "pre-workout",
    "vitamins",
    "creatine",
    "Canada",
    "third-party tested",
    "nutraceuticals",
  ],

  // No trailing slash.
  domain: "vesselwellness.example",
  get url() {
    return `https://${this.domain}`;
  },

  // Distinct addresses used for distinct purposes — keep them separate even
  // though they currently resolve to the same placeholder domain.
  supportEmail: "support@vesselwellness.example", // customer-facing: FAQ, legal, COA requests, contact page
  adminEmail: "contact@vesselwellness.example", // ADMIN_EMAIL env var fallback — where order/contact notifications go
  paymentEmail: "pay@vesselwellness.example", // Interac e-Transfer recipient shown at checkout
} as const;
