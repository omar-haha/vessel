// The actual product catalog and category-tag metadata for this brand — the
// content half of the catalog system. The structural half (Product/
// ProductFamily shapes, family-grouping logic) stays in lib/products.ts and
// imports the `products` array from here.
//
// Reskinning this codebase for a different catalog means editing this file
// only — lib/products.ts and every component that renders a catalog never
// need to change.

export type Category = "core" | "accessory";

// Goal/use-case tags for the catalogue filter pills.
export type BenefitTag =
  | "Protein"
  | "Energy"
  | "Sleep"
  | "Recovery"
  | "Cognitive"
  | "Immunity"
  | "Wellness"
  | "Ancillary";

export interface TagMeta {
  labelEn: string;
  labelFr: string;
  bg: string;
  color: string;
}

// Consolidates what used to be split across two places: the tag_* keys in
// lib/i18n.ts (label text) and TAG_STYLES in AppleBentoGrid.tsx (colors).
// Both read from here now instead of duplicating a per-tag lookup.
export const TAG_META: Record<BenefitTag, TagMeta> = {
  Protein:   { labelEn: "Protein",   labelFr: "Protéines",     bg: "rgba(59,130,246,0.12)",  color: "#3b82f6" },
  Energy:    { labelEn: "Energy",    labelFr: "Énergie",       bg: "rgba(34,197,94,0.12)",   color: "#16a34a" },
  Sleep:     { labelEn: "Sleep",     labelFr: "Sommeil",       bg: "rgba(251,146,60,0.12)",  color: "#ea580c" },
  Recovery:  { labelEn: "Recovery",  labelFr: "Récupération",  bg: "rgba(168,85,247,0.12)",  color: "#9333ea" },
  Cognitive: { labelEn: "Cognitive", labelFr: "Cognitif",      bg: "rgba(6,182,212,0.12)",   color: "#0891b2" },
  Immunity:  { labelEn: "Immunity",  labelFr: "Immunité",      bg: "rgba(245,158,11,0.12)",  color: "#d97706" },
  Wellness:  { labelEn: "Wellness",  labelFr: "Bien-être",     bg: "rgba(239,68,68,0.12)",   color: "#dc2626" },
  Ancillary: { labelEn: "Ancillary", labelFr: "Auxiliaire",    bg: "rgba(107,114,128,0.12)", color: "#6b7280" },
};

// Kept minimal here — the full Product interface (with JSDoc-ish field
// comments) lives in lib/products.ts since it's structural, not content.
export interface CatalogProduct {
  id: string;
  name: string;
  cas: string;      // SKU / lot code
  cat: Category;
  tag: BenefitTag;
  price: number;
  unit: string;      // size / count variant label
  purity: string;    // active ingredient / labeled dose
  stock: "in" | "low" | "out";
  bestSeller?: boolean;
  description?: string;
}

const DESC: Record<string, string> = {
  'Whey Protein Isolate':        'Cold-processed whey isolate with 27g of protein per scoop and under 1g of sugar. Mixes clean with no chalky aftertaste, third-party tested for banned substances.',
  'Micellar Casein Protein':     'Slow-digesting micellar casein for overnight muscle recovery. 24g protein per serving, unflavored base blends into any shake without clumping.',
  'Plant-Based Protein Blend':   'Pea, rice, and hemp protein blend delivering a complete amino acid profile. 21g protein per serving, no gums or artificial sweeteners.',
  'Mass Gainer Formula':         'High-calorie blend of whey, oats, and MCT oil built for hardgainers. 50g protein and 750 calories per serving, mixes in a shaker with no blender required.',
  'Protein Shaker Bottle':       'BPA-free 28oz shaker with a wire whisk ball and leak-proof flip lid. Dishwasher-safe, fits most cupholders.',

  'Pre-Workout Formula':         '300mg of caffeine paired with citrulline malate and beta-alanine for sustained energy without the crash. Third-party tested, available in two flavors.',
  'Energy Capsules':             '200mg caffeine balanced with L-theanine for smooth, jitter-free focus. No sugar, no crash, portable capsule format for on-the-go dosing.',
  'Pre-Workout & Shaker Bundle': 'The pre-workout formula paired with the shaker bottle, sold together at a bundle price.',
  'B12 Energy Shots':            '5000mcg of methylcobalamin B12 in a 2oz shot, sugar-free and gluten-free. Sold as a 12-pack for daily use.',
  'Electrolyte Powder':          '1000mg sodium plus potassium and magnesium per stick pack, formulated for rehydration during and after training. No artificial dyes.',

  'Sleep Support Formula':       '5mg melatonin combined with magnesium and chamomile extract for a formula that supports falling asleep without next-day grogginess.',
  'Magnesium Glycinate':         '400mg of elemental magnesium in the glycinate form, chosen for absorption and to avoid the GI upset of cheaper magnesium salts.',
  'Sleep Stack Bundle':          'Melatonin, magnesium, and L-theanine sold together as a 30- or 60-day supply, dosed to be taken as a single nightly stack.',
  'L-Theanine Capsules':         '200mg of L-theanine per capsule, often paired with caffeine for focus or taken alone in the evening to support a calm, clear mind.',
  'Ashwagandha Extract':         'KSM-66 ashwagandha root extract standardized to 5% withanolides, 600mg per capsule, studied for stress and cortisol support.',

  'BCAA Recovery Powder':        'Branched-chain amino acids in a 2:1:1 leucine-to-isoleucine-to-valine ratio, formulated to reduce muscle soreness during training blocks.',
  'Creatine Monohydrate':        '5g of micronized creatine monohydrate per serving, unflavored and mixes instantly. The most studied supplement for strength and power output.',
  'Collagen Peptides':           'Grass-fed, hydrolyzed Type I & III collagen peptides that dissolve in hot or cold liquid without altering taste or texture.',
  'Joint Support Formula':       'Glucosamine and chondroitin sulfate at clinical doses, formulated to support joint comfort and mobility with continued daily use.',
  'Turmeric Curcumin':           'Curcumin extract standardized to 95% curcuminoids, paired with black pepper extract for absorption.',
  'Omega-3 Fish Oil':            'Molecularly distilled fish oil delivering 1000mg combined EPA and DHA per softgel, third-party tested for heavy metals.',
  'Tart Cherry Extract':         'Concentrated Montmorency tart cherry extract, studied for exercise recovery and as a natural source of melatonin.',

  'Nootropic Focus Stack':       'Alpha-GPC and L-tyrosine combined for mental clarity and sustained focus, without the stimulant load of a caffeine-based formula.',
  "Lion's Mane Extract":         "1000mg of organic lion's mane mushroom extract per serving, standardized for beta-glucan content and studied for cognitive support.",

  'Zinc + Vitamin C':            'Zinc picolinate paired with vitamin C at immune-support doses, formulated for daily use during cold and flu season.',
  'Elderberry Gummies':          'Black elderberry extract in a sugar-conscious gummy format, formulated to support immune function without a pill.',

  'Daily Multivitamin':          'A complete daily multivitamin formulated to fill common dietary gaps, with active forms of B vitamins and chelated minerals for absorption.',

  'Empty Vegetable Capsules':    'Size 00 vegetable-based capsules for custom supplement stacking, gelatin-free and easy to fill by hand or with a capsule machine.',
};

export const products: CatalogProduct[] = [
  // Whey Protein Isolate
  { id: 'whey-isolate-1lb',  name: 'Whey Protein Isolate',       cas: 'VS-WP-004', cat: 'core',      tag: 'Protein',  price: 75,  unit: '1 lb',  purity: '27g Protein/Serving', stock: 'in',  bestSeller: true, description: DESC['Whey Protein Isolate'] },
  { id: 'whey-isolate-2lb',  name: 'Whey Protein Isolate',       cas: 'VS-WP-008', cat: 'core',      tag: 'Protein',  price: 90,  unit: '2 lb',  purity: '27g Protein/Serving', stock: 'in',  description: DESC['Whey Protein Isolate'] },
  { id: 'whey-isolate-5lb',  name: 'Whey Protein Isolate',       cas: 'VS-WP-012', cat: 'core',      tag: 'Protein',  price: 180, unit: '5 lb',  purity: '27g Protein/Serving', stock: 'out', description: DESC['Whey Protein Isolate'] },

  // Micellar Casein Protein
  { id: 'casein-1lb',        name: 'Micellar Casein Protein',    cas: 'VS-CS-005', cat: 'core',      tag: 'Protein',  price: 70,  unit: '1 lb', purity: '24g Protein/Serving', stock: 'out', description: DESC['Micellar Casein Protein'] },
  { id: 'casein-2lb',        name: 'Micellar Casein Protein',    cas: 'VS-CS-008', cat: 'core',      tag: 'Protein',  price: 90,  unit: '2 lb', purity: '24g Protein/Serving', stock: 'in',  bestSeller: true, description: DESC['Micellar Casein Protein'] },
  { id: 'casein-3lb',        name: 'Micellar Casein Protein',    cas: 'VS-CS-010', cat: 'core',      tag: 'Protein',  price: 150, unit: '3 lb', purity: '24g Protein/Serving', stock: 'in',  description: DESC['Micellar Casein Protein'] },
  { id: 'casein-4lb',        name: 'Micellar Casein Protein',    cas: 'VS-CS-012', cat: 'core',      tag: 'Protein',  price: 190, unit: '4 lb', purity: '24g Protein/Serving', stock: 'out', description: DESC['Micellar Casein Protein'] },
  { id: 'casein-5lb',        name: 'Micellar Casein Protein',    cas: 'VS-CS-014', cat: 'core',      tag: 'Protein',  price: 360, unit: '5 lb', purity: '24g Protein/Serving', stock: 'out', description: DESC['Micellar Casein Protein'] },

  // Plant-Based Protein Blend
  { id: 'plant-protein',     name: 'Plant-Based Protein Blend',  cas: 'VS-PB-001', cat: 'core',      tag: 'Protein',  price: 160, unit: '2 lb',  purity: '21g Protein/Serving', stock: 'out', description: DESC['Plant-Based Protein Blend'] },

  // Mass Gainer Formula
  { id: 'mass-gainer',       name: 'Mass Gainer Formula',        cas: 'VS-MG-001', cat: 'core',      tag: 'Protein',  price: 170, unit: '6 lb',  purity: '50g Protein/Serving', stock: 'out', description: DESC['Mass Gainer Formula'] },

  // Protein Shaker Bottle
  { id: 'shaker-bottle',     name: 'Protein Shaker Bottle',      cas: 'VS-SB-001', cat: 'accessory', tag: 'Protein',  price: 75,  unit: '28oz',  purity: 'BPA-Free',            stock: 'out', description: DESC['Protein Shaker Bottle'] },

  // Pre-Workout Formula
  { id: 'preworkout',        name: 'Pre-Workout Formula',        cas: 'VS-PW-014', cat: 'core',      tag: 'Energy',   price: 150, unit: '30 Servings', purity: '300mg Caffeine',           stock: 'in',  description: DESC['Pre-Workout Formula'] },

  // Energy Capsules
  { id: 'energy-caps',       name: 'Energy Capsules',            cas: 'VS-EC-500', cat: 'core',      tag: 'Energy',   price: 120, unit: '60 Capsules', purity: '200mg Caffeine + L-Theanine', stock: 'in',  description: DESC['Energy Capsules'] },

  // Pre-Workout & Shaker Bundle
  { id: 'preworkout-shaker-set', name: 'Pre-Workout & Shaker Bundle', cas: 'VS-PW-157', cat: 'core', tag: 'Energy',   price: 110, unit: '30 Servings + Shaker', purity: 'Stim & Non-Stim', stock: 'in',  description: DESC['Pre-Workout & Shaker Bundle'] },

  // B12 Energy Shots
  { id: 'b12-shots',         name: 'B12 Energy Shots',           cas: 'VS-B12-070', cat: 'core',     tag: 'Energy',   price: 75,  unit: '12-Pack', purity: '5000mcg B12',           stock: 'out', description: DESC['B12 Energy Shots'] },

  // Electrolyte Powder
  { id: 'electrolyte-powder', name: 'Electrolyte Powder',        cas: 'VS-EL-029', cat: 'core',      tag: 'Energy',   price: 150, unit: '40 Servings', purity: '1000mg Sodium',        stock: 'in',  description: DESC['Electrolyte Powder'] },

  // Sleep Support Formula
  { id: 'sleep-formula',     name: 'Sleep Support Formula',      cas: 'VS-SL-500', cat: 'core',      tag: 'Sleep',    price: 120, unit: '60 Capsules', purity: '5mg Melatonin + Mg',   stock: 'in',  description: DESC['Sleep Support Formula'] },

  // Magnesium Glycinate
  { id: 'magnesium-glycinate', name: 'Magnesium Glycinate',      cas: 'VS-MAG-157', cat: 'core',     tag: 'Sleep',    price: 55,  unit: '90 Capsules', purity: '400mg Elemental Mg',   stock: 'in',  bestSeller: true, description: DESC['Magnesium Glycinate'] },

  // Sleep Stack Bundle
  { id: 'sleep-stack-30',    name: 'Sleep Stack Bundle',         cas: 'VS-SS-157B', cat: 'core',     tag: 'Sleep',    price: 100, unit: '30-Day Supply', purity: 'Melatonin + Mg + L-Theanine', stock: 'in',  description: DESC['Sleep Stack Bundle'] },
  { id: 'sleep-stack-60',    name: 'Sleep Stack Bundle',         cas: 'VS-SS-157C', cat: 'core',     tag: 'Sleep',    price: 190, unit: '60-Day Supply', purity: 'Melatonin + Mg + L-Theanine', stock: 'in',  description: DESC['Sleep Stack Bundle'] },

  // L-Theanine Capsules
  { id: 'l-theanine',        name: 'L-Theanine Capsules',        cas: 'VS-LT-062', cat: 'accessory', tag: 'Sleep',    price: 60,  unit: '60 Capsules', purity: '200mg/Capsule',        stock: 'out', description: DESC['L-Theanine Capsules'] },

  // Ashwagandha Extract
  { id: 'ashwagandha',       name: 'Ashwagandha Extract',        cas: 'VS-ASH-013', cat: 'accessory', tag: 'Sleep',   price: 60,  unit: '90 Capsules', purity: 'KSM-66, 600mg',        stock: 'out', description: DESC['Ashwagandha Extract'] },

  // BCAA Recovery Powder
  { id: 'bcaa-powder',       name: 'BCAA Recovery Powder',       cas: 'VS-BC-307', cat: 'accessory', tag: 'Recovery', price: 70,  unit: '30 Servings', purity: '2:1:1 Ratio',          stock: 'out', description: DESC['BCAA Recovery Powder'] },

  // Creatine Monohydrate
  { id: 'creatine-60',       name: 'Creatine Monohydrate',       cas: 'VS-CR-049', cat: 'accessory', tag: 'Recovery', price: 40,  unit: '60 Servings',  purity: '5g Micronized',       stock: 'in',  description: DESC['Creatine Monohydrate'] },
  { id: 'creatine-120',      name: 'Creatine Monohydrate',       cas: 'VS-CR-050', cat: 'accessory', tag: 'Recovery', price: 60,  unit: '120 Servings', purity: '5g Micronized',       stock: 'in',  description: DESC['Creatine Monohydrate'] },

  // Collagen Peptides
  { id: 'collagen-peptides', name: 'Collagen Peptides',          cas: 'VS-CO-070', cat: 'accessory', tag: 'Recovery', price: 45,  unit: '45 Servings', purity: 'Type I & III, Grass-Fed', stock: 'in',  description: DESC['Collagen Peptides'] },

  // Joint Support Formula
  { id: 'joint-support-60',  name: 'Joint Support Formula',      cas: 'VS-JS-140', cat: 'accessory', tag: 'Recovery', price: 140, unit: '60ct', purity: 'Glucosamine + Chondroitin', stock: 'in',  description: DESC['Joint Support Formula'] },
  { id: 'joint-support-90',  name: 'Joint Support Formula',      cas: 'VS-JS-141', cat: 'accessory', tag: 'Recovery', price: 165, unit: '90ct', purity: 'Glucosamine + Chondroitin', stock: 'out', description: DESC['Joint Support Formula'] },

  // Turmeric Curcumin
  { id: 'turmeric-60',       name: 'Turmeric Curcumin',          cas: 'VS-TC-100', cat: 'accessory', tag: 'Recovery', price: 70,  unit: '60ct',  purity: '95% Curcuminoids',    stock: 'in',  description: DESC['Turmeric Curcumin'] },
  { id: 'turmeric-120',      name: 'Turmeric Curcumin',          cas: 'VS-TC-101', cat: 'accessory', tag: 'Recovery', price: 200, unit: '120ct', purity: '95% Curcuminoids',    stock: 'out', description: DESC['Turmeric Curcumin'] },

  // Omega-3 Fish Oil
  { id: 'fish-oil',          name: 'Omega-3 Fish Oil',           cas: 'VS-OM-053', cat: 'accessory', tag: 'Recovery', price: 80,  unit: '120 Softgels', purity: '1000mg EPA/DHA',   stock: 'out', description: DESC['Omega-3 Fish Oil'] },

  // Tart Cherry Extract
  { id: 'tart-cherry',       name: 'Tart Cherry Extract',        cas: 'VS-TCH-031', cat: 'accessory', tag: 'Recovery', price: 90, unit: '90 Capsules', purity: 'Recovery & Sleep Support', stock: 'in',  description: DESC['Tart Cherry Extract'] },

  // Nootropic Focus Stack
  { id: 'nootropic-stack',   name: 'Nootropic Focus Stack',      cas: 'VS-NF-129', cat: 'core',      tag: 'Cognitive', price: 65, unit: '30 Servings', purity: 'Alpha-GPC + L-Tyrosine', stock: 'in',  description: DESC['Nootropic Focus Stack'] },

  // Lion's Mane Extract
  { id: 'lions-mane',        name: "Lion's Mane Extract",        cas: 'VS-LM-807', cat: 'accessory', tag: 'Cognitive', price: 65, unit: '60 Capsules', purity: '1000mg Organic',        stock: 'in',  description: DESC["Lion's Mane Extract"] },

  // Zinc + Vitamin C
  { id: 'zinc-vitc',         name: 'Zinc + Vitamin C',           cas: 'VS-ZC-921', cat: 'accessory', tag: 'Immunity', price: 60,  unit: '90 Tablets', purity: 'Immune Support',         stock: 'in',  description: DESC['Zinc + Vitamin C'] },

  // Elderberry Gummies
  { id: 'elderberry-gummies', name: 'Elderberry Gummies',        cas: 'VS-EB-062', cat: 'accessory', tag: 'Immunity', price: 60,  unit: '60 Gummies', purity: 'Immune Support',         stock: 'in',  description: DESC['Elderberry Gummies'] },

  // Daily Multivitamin
  { id: 'multivitamin',      name: 'Daily Multivitamin',         cas: 'VS-MV-189', cat: 'accessory', tag: 'Wellness', price: 60,  unit: '90 Tablets', purity: 'Complete Daily Formula', stock: 'in',  description: DESC['Daily Multivitamin'] },

  // Empty Vegetable Capsules
  { id: 'empty-caps-250',    name: 'Empty Vegetable Capsules',   cas: 'VS-VC-773', cat: 'accessory', tag: 'Ancillary', price: 10, unit: '250ct',  purity: 'Size 00, Vegetable-Based', stock: 'out', description: DESC['Empty Vegetable Capsules'] },
  { id: 'empty-caps-1000',   name: 'Empty Vegetable Capsules',   cas: 'VS-VC-774', cat: 'accessory', tag: 'Ancillary', price: 25, unit: '1000ct', purity: 'Size 00, Vegetable-Based', stock: 'out', description: DESC['Empty Vegetable Capsules'] },
];
