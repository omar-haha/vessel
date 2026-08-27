# VESSEL — Developer Handoff

> This is a portfolio/demo project (see [README.md](README.md)) adapted from a real production codebase, with the catalog and copy swapped to a generic supplements category. The technical structure, patterns, and gotchas below are unchanged from the original and reflect real decisions made while building it — this doc is kept because documentation discipline is part of what the demo is meant to show.

## What this is

VESSEL is a supplements e-commerce storefront: Next.js 15.5 App Router, strict Apple-aesthetic design system, fully bilingual (EN/FR) UI and product labels, bag/checkout flow, Supabase-backed orders/stock/reviews, and a password-gated admin panel. Repo: `omar-haha/vessel`.

### A few things worth knowing before touching product or marketing copy

- **Product copy describes formulation and dosage, not overstated claims.** Keep it concrete and specific rather than vague ("27g protein isolate per scoop, under 1g sugar" beats "premium quality").
- **Never claim VESSEL tests or verifies potency in-house.** Testing is performed by independent, accredited third-party labs; VESSEL commissions it and relays the results but does not perform or independently re-verify it. See the Testing & Quality section below and `lib/legalContent.ts`.
- **Never re-enable the commented-out blocks** (fabricated reviews, fake star ratings, fake live-viewer counter). They're commented rather than deleted deliberately, each with a comment saying why — see "Known decisions / gotchas".

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15.5 (App Router, React 19) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Language | TypeScript (strict) |
| Animations | framer-motion v12 |
| Smooth scroll | Lenis |
| Icons | lucide-react |
| Fonts | Inter (body), Orbitron (product labels) — `next/font` |
| Database | Supabase (`orders`, `stock`, `reviews`) via `@supabase/supabase-js` |
| Transactional email | Resend |
| Rate limiting | Upstash Redis + `@upstash/ratelimit` |
| Analytics | GA4, **consent-gated** (opt-in) |
| Deployment (live demo) | Vercel, auto-deployed on push to `main` |
| Deployment (pipeline demonstrated in-repo) | Docker Compose + Caddy on a VPS, driven by GitHub Actions over SSH — not wired to this repo; see Deployment below |

---

## Running locally

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # must pass before pushing — strict TS
npm run start        # serve the production build
```

Copy `.env.example` → `.env.local` and fill in:

```
SUPABASE_URL, SUPABASE_SERVICE_KEY     # server-side only, service key
ADMIN_PASSWORD, ADMIN_TOKEN            # admin panel gate
ADMIN_EMAIL, RESEND_API_KEY, RESEND_FROM
UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
NEXT_PUBLIC_GA_ID                      # optional; unset = no analytics, no consent banner
```

Without Supabase/Resend/Upstash credentials the UI renders fine — stock and review fetches fail soft and the catalog falls back to the static `stock` field in `lib/products.ts`.

> `npm run lint` is **not usable**: ESLint has no config in this repo, so `next lint` drops into an interactive setup prompt. Use `npx tsc --noEmit` for checking instead.

---

## Deployment

**The live demo runs on Vercel**, auto-deployed via Vercel's GitHub integration on every push to `main` — no workflow file needed for that path.

This repo was adapted from a production project that deploys differently, and that pipeline still lives in the repo as a demonstrated capability, just not wired up here:

- [.github/workflows/deploy.yml](.github/workflows/deploy.yml) **does not exist in this repo.** In the original project it SSHed into a host (`appleboy/ssh-action`) on every push to `main` and ran `git reset --hard origin/main && docker compose up -d`. It was **deliberately removed** from this repo — leaving it in place would mean a portfolio-demo push could silently redeploy over a real server. If you want to stand this path up again against your own host, recreate that workflow file pointed at your own `HETZNER_HOST` / `HETZNER_USER` / `HETZNER_SSH_KEY` secrets.
- [docker-compose.yml](docker-compose.yml) — `app` (Next.js, expose 3000, env from `.env.production` **on the server**) + `caddy` (ports 80/443, TLS).
- [Caddyfile](Caddyfile) — reverse proxies the site domain to `app:3000`; update it to your own domain before deploying for real.
- [deploy/setup-server.sh](deploy/setup-server.sh) provisions a fresh host; [deploy/keepalive.sh](deploy/keepalive.sh) is a health check that also prevents Supabase/Upstash free-tier inactivity pausing.
- No staging environment either way. `main` is production.

### Database migrations

[deploy/migrations/](deploy/migrations/) holds plain SQL, applied **by hand** in the Supabase SQL editor — nothing runs them automatically, on either deploy path.

| File | Adds |
|---|---|
| `001_research_intent.sql` | `orders.research_intent`, `orders.terms_accepted` (backs the required order-notes field + Terms of Use checkbox at checkout) |
| `002_review_order_link.sql` | `reviews.order_id` (+ index) — backs the "Verified Buyer" badge |
| `003_recreate_reviews_table.sql` | Recreates `reviews` from scratch, including the `order_id` column from 002 |

All are idempotent (`IF NOT EXISTS`). The routes that use these columns **degrade gracefully** when a migration hasn't been applied: they retry the write without the new columns and log a warning rather than failing the request. If you add a column, follow that pattern — see `isMissingColumnError` in [app/api/order/route.ts](app/api/order/route.ts) and [app/api/reviews/route.ts](app/api/reviews/route.ts).

---

## Theme system

Defined in [app/globals.css](app/globals.css).

- **Default theme is light.** `:root` holds light values; `[data-theme="dark"]` overrides.
- An inline `<script>` in [app/layout.tsx](app/layout.tsx) reads **`localStorage.rc_theme`** and sets `data-theme` on `<html>` before React hydrates — prevents flash. (Note the `rc_` prefix; all this app's storage keys use it — a leftover of the codebase this demo was adapted from, harmless to keep.)
- [ThemeProvider](components/providers/ThemeProvider.tsx) initialises as `"light"` and syncs via `toggleTheme`.

### localStorage keys

| Key | Set by |
|---|---|
| `rc_theme` | ThemeProvider + anti-flash script |
| `rc_lang` | LanguageProvider |
| `rc_analytics_consent` | Analytics consent banner (`"granted"` / `"denied"`) |

To retest a first-time visit, clear `rc_analytics_consent` (devtools → Application → Local Storage).

### z-index layers

Worth knowing before adding any overlay — a mismatch here is easy to miss locally and invisible in a build:

| z-index | Layer |
|---|---|
| 999 / 1000 / 1500 | Nav, toasts |
| 2000 | Nav mobile menu |
| **2500** | **Cookie consent banner** |
| 3000 | CartDrawer, CheckoutModal |
| 4000 | Checkout success, LegalModal (if revived) |
| 5000 | Product image zoom overlay |

### Key CSS variables

```css
--bg             /* page background */
--bg-alt         /* alternate section background */
--surface        /* card/panel background */
--surface-hover  /* interactive surface hover */
--border         /* subtle border */
--text           /* primary text */
--text-muted     /* secondary text */
--text-legal     /* tertiary / legal text */
--accent         /* #0071e3 light / #2997ff dark */
--nav-bg         /* frosted glass nav background */
```

### Tailwind utility aliases (defined in globals.css)

```
bg-primary     → var(--bg)
bg-secondary   → var(--bg-alt)
bg-surface     → var(--surface)
text-primary   → var(--text)
text-secondary → var(--text-muted)
text-tertiary  → var(--text-legal)
border-primary → var(--border)
```

**Important:** `bg-surface-hover` is NOT defined as a utility. Use `bg-[var(--surface-hover)]` inline or add it to globals.css.

---

## File map

```
app/
  layout.tsx               Root layout — fonts, providers, anti-flash script, Organization JSON-LD, <Analytics/>
  page.tsx                 Homepage: Nav, CartToast, CartDrawer, CheckoutModal, AppleHero, AppleBentoGrid, HomepageReviews, Footer
  globals.css              Theme variables, utility aliases, button utilities, keyframes
  loading.tsx              Suspense shell with centered Spinner
  not-found.tsx            404
  icon.svg                 Favicon (auto-discovered by App Router)
  opengraph-image.tsx      Generated OG image
  robots.ts / sitemap.ts   Generated robots.txt + sitemap.xml
  products/[id]/page.tsx   Server component; generateStaticParams pre-renders every SKU; generateMetadata per product
  coa/page.tsx             Testing & Quality explainer (lab-issued Certificates of Analysis)
  faq/page.tsx             FAQ; content inline as FAQS_EN / FAQS_FR
  legal/page.tsx           Tabbed Disclaimers / Privacy / Terms / Refund; reads lib/legalContent.ts; deep links via #hash
  reviews/page.tsx         Full reviews page (ReviewsSection)
  shipping/page.tsx        Shipping policy; content inline EN/FR
  contact/page.tsx         Contact form → /api/contact
  admin/page.tsx           Password-gated panel: orders, stock, review moderation
  api/
    order/route.ts         POST — validates cart, re-derives prices server-side, checks live stock, inserts order, sends both emails
    stock/route.ts         GET  — variant_id → quantity map (force-dynamic)
    reviews/route.ts       GET approved reviews (+ derived `verified`) / POST a review (optional order verification)
    contact/route.ts       POST — contact form → Resend
    admin/auth/route.ts    POST — password → bearer token
    admin/orders/route.ts  GET / PATCH (status)
    admin/stock/route.ts   GET / PATCH (quantity)
    admin/reviews/route.ts GET / PATCH (approve) / DELETE

components/
  Analytics.tsx            "use client" — GA4 **gated behind an opt-in consent banner**; renders nothing without NEXT_PUBLIC_GA_ID
  PageShell.tsx            Shared chrome for sub-pages (Nav + cart stack + Footer + <main>)

  providers/
    ThemeProvider.tsx           Dark/light toggle, persists to localStorage
    LanguageProvider.tsx        EN/FR toggle + t(); persists rc_lang
    CartProvider.tsx            Bag state, live-stock caps, lastAdded toast
    SmoothScrollProvider.tsx    Lenis wrapper (duration 1.2s)
    PageTransitionProvider.tsx  framer-motion fade/slide between routes

  ui/
    AppleNav.tsx        Fixed top nav, mobile menu, bag badge, theme + language toggles; absolute hrefs only
    GlassVial.tsx       Product image + bilingual label overlay (name kept from the original codebase — see below)
    BrandLogo.tsx       SVG wordmark, colour via currentColor
    CartToast.tsx       Toast after addToCart (CartProvider.lastAdded)
    Spinner.tsx         SVG spinner

  sections/
    AppleHero.tsx       Full-viewport hero (variant: primary/secondary/tertiary); CTA uses scrollIntoView to avoid hash side-effects
    AppleBentoGrid.tsx  Catalog — one card per product family; filter pills = All + 8 use-case tags, active pill tinted in that tag's colour; 9 cards then "Show More"; IntersectionObserver reveal + AnimatePresence on filter change
    ProductDetail.tsx   "use client" full product page; brings its own nav/cart stack
    HomepageReviews.tsx Three most recent approved reviews; renders null when there are none
    ReviewsSection.tsx  Full reviews grid + submit form (incl. optional order verification)
    AppleFooter.tsx     Explore | Contact card → /contact | Legal links → /legal#<tab>

  modals/
    CartDrawer.tsx          Slide-in bag; scroll-locked; collapse-on-delete; qty steppers
    CheckoutModal.tsx       Contact + Order Notes + Shipping + Payment + click-wrap consent; success screen echoes payment instructions
    ProductPickerModal.tsx  Variant picker from a bento card; option pills, qty, Add to Bag, link to product page

lib/
  products.ts       Catalog + BenefitTag + getProductFamilies()
  legalContent.ts   SINGLE SOURCE for all published legal copy (EN + FR) + entity-name constants
  i18n.ts           translations.en / translations.fr + TranslationKey
  supabase.ts       Service-role client (server only)
  resend.ts         Resend client
  ratelimit.ts      Upstash sliding-window limiters + checkLimit()
  adminAuth.ts      isAuthorized() — bearer token check
  utils.ts          cn()
```

### Unused components — do not assume these render

Three components are defined but **imported nowhere**. Grep before you edit them, and don't infer site behaviour from them:

| File | Status |
|---|---|
| `components/sections/QualitySection.tsx` | Dead. Also lacks `"use client"` while calling `useLanguage()`, so it would break if rendered from a server component. Its former legal-disclosures block now lives at `/legal`. |
| `components/modals/LegalModal.tsx` | Dead. The footer links to `/legal#<tab>` instead of opening a modal. Still maintained (reads `lib/legalContent.ts`) in case it is revived. |
| `components/sections/ContactSection.tsx` | Dead. Superseded by `app/contact/page.tsx`. |

Some `i18n` keys are likewise orphaned (`filter_bestseller`, `filter_instock`, `card_purity`, `picker_purity`, `hero_cat_*`, `reviews_write_product`). Harmless, but don't treat their presence as evidence a feature exists.

---

## Internationalisation

[lib/i18n.ts](lib/i18n.ts) exports `translations.en` / `translations.fr`; `TranslationKey = keyof typeof translations.en`. `useLanguage()` gives `{ lang, toggle, t }`.

**EN and FR must stay in sync.** `t()` indexes `translations[lang][key]`, so a key present in `en` but missing from `fr` is a type error. When you comment a key out, comment it out in **both** blocks and remove every `t("key")` call — otherwise the build fails. (Several keys are intentionally commented out with a note explaining why; leave them that way.)

Longer prose — legal copy, FAQ entries, shipping policy — is not in `i18n.ts`. It lives as `*_EN` / `*_FR` objects in the page file, or in `lib/legalContent.ts` for legal text.

---

## Products

Defined in [lib/products.ts](lib/products.ts):

```ts
{ id, name, cas, cat: 'core' | 'accessory', tag: BenefitTag,
  price, unit, purity, stock: 'in' | 'low' | 'out',
  bestSeller?: boolean, description?: string }
```

**39 SKUs across 28 product families.** Multi-variant products (e.g. the whey isolate and casein protein SKUs) are separate entries sharing a `name`. Field names are kept from the original codebase this demo was adapted from — `cas` holds a SKU/lot code, `purity` holds a potency/dose description. Renaming them would be a bigger diff than it's worth; the UI labels (`pdp_cas`, `pdp_purity` in i18n.ts) already say "SKU" and "Potency".

- `tag` — one of eight **use-case** values: `Protein`, `Energy`, `Sleep`, `Recovery`, `Cognitive`, `Immunity`, `Wellness`, `Ancillary`.
- `description` — pulled from the `DESC` map.
- `stock: 'out'` cards are greyed out and sorted to the end. Live quantities from `/api/stock` override this field at runtime.
- `bestSeller: true` — currently 3 SKUs. Note the "Best Sellers" filter pill no longer exists, so this now only affects the PDP badge.
- To add a product: append an entry — it appears in the grid and gets a statically pre-rendered page automatically.

### ProductFamily

`getProductFamilies()` groups products by `name`:

```ts
{ name, variants: Product[], cat, tag, minPrice, bestSeller? }
```

Used by `AppleBentoGrid` (one card per family) and `ProductPickerModal` (one option pill per variant).

---

## Stock

Live quantities live in the Supabase `stock` table (`variant_id`, `quantity`) and are fetched from `/api/stock`. Three consumers apply them independently: `AppleBentoGrid`, `ProductDetail`, and `CartProvider`.

- `qty === 0` → `out`, `qty <= 5` → `low`, else `in`.
- **A variant with no row in `stock` is unrestricted** — it falls back to the static `stock` field and no cap is applied.
- `CartProvider.getRemainingStock(id)` returns what can still be added given what's in the bag (`null` = no live data, don't restrict). `addToCart` and `updateQty` clamp to the live cap.
- `/api/order` re-checks quantities server-side before accepting an order and calls the `decrement_stock` RPC per line item after insert. Client-side caps are UX, not enforcement.

---

## Checkout

[components/modals/CheckoutModal.tsx](components/modals/CheckoutModal.tsx) → `POST /api/order`. Sections in order:

1. **Contact** — first/last name, email, industry dropdown (6 options — categories like Gym / Fitness Studio, Personal Training, Retail).
2. **Order Notes** — required free-text field, minimum 15 characters (`MIN_INTENT_LENGTH`, mirrored in the API). Demonstrates a required, server-validated free-text field stored with the order; the internal variable/column names (`researchIntent`, `orders.research_intent`) are kept from the original codebase, only the label/placeholder copy changed.
3. **Shipping** — street, city, postal, country (7 options).
4. **Payment** — **Interac e-Transfer** (`pay@vesselwellness.example`) or **Cryptocurrency (BTC / ETH)** — the wallet addresses are the well-known public example addresses, not real wallets. Copy buttons per field.
5. **Click-wrap consent** — required checkbox linking to `/legal#terms`. Blocks submission.

Then: order id generated server-side, cart cleared, success screen echoes the payment instructions for the chosen method (`savedTotal` captures the total before `clearCart()`). For e-transfer it also shows the security question/answer, since autodeposit isn't enabled — the answer is the order number.

`POST /api/order` does the work that matters:

- **Re-derives every price** from `lib/products.ts`; client-supplied prices and totals are ignored.
- Rejects unknown product ids and quantities outside 1–99.
- Re-checks live stock and refuses to oversell.
- Requires `termsAccepted === true` and a ≥15-character order note — enforced server-side because client validation is bypassed by posting directly.
- **Inserts the order before emailing.** If the insert fails it returns 500 and sends nothing, so a customer never gets payment instructions for an order that doesn't exist.
- Then decrements stock, emails the admin (including the order note), and emails the customer.

---

## Reviews

- `POST /api/reviews` stores `approved: false`. Nothing appears publicly until approved in the admin panel.
- **Optional order verification:** the form takes an order number + the email on that order. Both must match for `reviews.order_id` to be set, which is what drives the public **"Verified Buyer"** badge. Mismatches publish unbadged, and the API deliberately does *not* say whether an order number exists — that would leak valid order ids.
- `GET /api/reviews` returns a derived `verified` boolean and **strips `order_id`** from the payload.
- Never render the badge on anything other than `verified === true`. The fabricated seed reviews are commented out in both review components; leave them that way.
- GET results are cached in-process for 60s (`force-dynamic` prevents ISR here — see the comment in `app/api/stock/route.ts`).
- The submit CTA is deliberately prominent (accent fill + `btn-physical-accent` + prompt/subline above and below, keys `reviews_write_prompt` / `reviews_write_sub`). The subline points at the order-number field on purpose: more reviews arriving with a real order link means more that can legitimately carry the verified badge.

---

## Admin panel

`/admin` — client-side password gate. `POST /api/admin/auth` exchanges `ADMIN_PASSWORD` for `ADMIN_TOKEN`, stored in `sessionStorage.admin_token` and sent as `Authorization: Bearer …`. Every `/api/admin/*` route checks it via `isAuthorized()`.

Three tabs: **orders** (expandable detail incl. order notes; status pending → paid → shipped → cancelled), **stock** (per-variant quantity), **reviews** (approve/delete, shows `✓ order <id>` where verified).

This is a shared-secret gate, not user accounts. The token is a static env var — rotating it logs everyone out.

---

## Rate limiting

[lib/ratelimit.ts](lib/ratelimit.ts) — Upstash sliding windows, keyed by IP: order 5/h, review 3/h, contact 5/h, admin auth 10/15m. Call `checkLimit(limiters.x, req)` first in a route; a non-null return is the 429 response to return as-is.

---

## Legal copy

**All published legal text lives in [lib/legalContent.ts](lib/legalContent.ts)** — `LEGAL_EN` / `LEGAL_FR`, each with `disclaimers`, `privacy`, `terms`, `refund`. `/legal` renders it in tabs (deep-linkable: `#disclaimers`, `#privacy`, `#terms`, `#refund`).

Never inline legal copy in a component. It used to exist in two places — `/legal` and `LegalModal` — and they drifted: the modal declared **Ontario** governing law where the page declared **Québec**, and it was missing clauses. Both now read from the one file.

The business name is derived from four constants (`ENTITY_EN/FR`, `LIABLE_PARTY_EN/FR`) so renaming the business is a two-line edit rather than a hunt through 15 clauses. This is a demo project, so these are placeholder values — read the header comment before treating them as real legal advice.

---

## Analytics & cookie consent

[components/Analytics.tsx](components/Analytics.tsx) is `"use client"` and renders **nothing** unless `NEXT_PUBLIC_GA_ID` is set. When it is, a localised banner offers "Accept analytics" / "Essential only", and the GA4 scripts load **only** after opt-in (`rc_analytics_consent`).

Québec's Law 25 expects consent *before* non-essential tracking starts, and the Privacy Policy describes exactly this behaviour. **If you change the gating, change that clause too** — otherwise the published policy becomes false. `<Analytics/>` sits inside `LanguageProvider` so the banner is localised.

### Why you may not see the banner locally

If `NEXT_PUBLIC_GA_ID` is unset — and there is no `.env.local` in a fresh checkout — `Analytics` returns `null` and no banner appears. That is intended: don't ask permission for analytics that aren't running. To exercise it locally:

```bash
echo 'NEXT_PUBLIC_GA_ID=G-TESTING123' > .env.local   # then restart the dev server
```

Then clear `rc_analytics_consent` to replay a first visit. In production the value comes from `.env.production` on the host (self-hosted path) or Vercel's project env vars (live demo).

---

## GlassVial

`<GlassVial productName unit className blur? showLabel? weight />`

The component name and internal styling (`vial-label` CSS class, etc.) are kept from the original codebase this demo was adapted from — renaming them would be a large, low-value diff. The label content shows a "LAB TESTED" / batch-and-production-date tag. Functionally it's an image with a bilingual label overlay, plus a CSS-only cap and gloss highlight layered on top (see below).

- Image: `/public/images/vial-rembg-cropped.png` — a flat tan/brown silhouette with no bottle cues on its own (no cap, no shine); it only ever read as a product because of the label text sitting on it. `GlassVial.tsx` applies `filter: grayscale(0.85) brightness(1.4) contrast(0.95)` to push the base tone toward clean frosted-plastic white, plus two absolutely-positioned divs for a screw cap (accent-coloured, positioned by percentage over the image) and a diagonal gloss-streak gradient. All CSS, no new image asset. Other PNGs in that folder are unused experiments.
- Bilingual label overlay uses `cqi` container-query units for font scaling; `productName` length drives font size.
- `weight` is accepted but unused (destructured as `_weight`) — kept for call-site compatibility.
- Label variables (`--label-bg`, `--label-fg`, …) are scoped to `.vial-label` in globals.css — always white regardless of theme.
- `perspective: 800px` on the outer div is required for the label's `rotateX(2deg)`. Do not remove it.

---

## Cart (The Bag)

`CartProvider` holds state **in memory — no persistence across reloads.** It also fetches `/api/stock` once on mount to cap quantities.

| Method | What it does |
|---|---|
| `addToCart(product, qty)` | Upserts, clamped to live stock; sets `lastAdded` (triggers CartToast) |
| `updateQty(id, delta)` | Increments/decrements, clamped to live stock; removes at 0 |
| `removeFromCart(id)` | Deletes item, triggers collapse animation in CartDrawer |
| `clearCart()` | Wipes all items (after checkout confirmation) |
| `clearLastAdded()` | Dismisses the toast |
| `getRemainingStock(id)` | Addable remainder, or `null` when there's no live data |

---

## Button system

- **`.btn-physical`** — flat 2D button; on `:active` an inset shadow blooms from the top and side inner edges (40ms in, 220ms fade out), giving a tactile press without translateY.
- **`.btn-physical-accent`** — sets `--inset-shadow` to deep dark blue (`rgba(0,25,110,0.55)`); dark-mode variant included.
- "Add to Bag" also uses **`.animate-btn-pop`** (`btn-press-confirm`, 0.4s) plus **`.animate-text-warp`** on the inner `<span>` (`text-warp-confirm`, 0.42s), both triggered from React state.

---

## Animations (globals.css keyframes)

| Name | Used by |
|---|---|
| `blob-drift-1/2/3` | Drifting radial-gradient blobs (14s / 18s / 22s) — only in the now-unused QualitySection |
| `cart-item-in` | CartDrawer — staggered slide-in on open |
| `btn-press-confirm` | `.animate-btn-pop` |
| `text-warp-confirm` | `.animate-text-warp` |

framer-motion handles all other entry/scroll animation (spring variants in AppleHero, AppleBentoGrid, ProductPickerModal, PageTransitionProvider).

**framer-motion v12 gotcha:** `type: "spring"` in variant objects must be `"spring" as const` — a plain string isn't assignable to `AnimationGeneratorType`. Same for `staggerDirection: -1 as const`.

---

## Known decisions / gotchas

- **Build is strict TypeScript.** The dev server tolerates errors the build rejects. Run `npm run build` (or `npx tsc --noEmit`) before pushing — `main` deploys straight to production (Vercel).
- **`npm run lint` is unusable** — no ESLint config; `next lint` prompts interactively. Use `tsc --noEmit`.
- **EN/FR translation blocks must stay in sync** — a key in `en` but not `fr` is a type error. Comment out in both, and remove the `t()` calls.
- **Commented-out fake-social-proof code is deliberate.** Fabricated seed reviews, hashed star ratings, and the fake live-viewer counter are commented with a reason. Don't "clean up" by restoring them — they were disabled because presenting fabricated content as real customer activity is a real deceptive-marketing issue, not a style preference.
- **All nav/footer links are absolute** (`/`, `/#store`, `/coa`, …). A bare `#store` resolves relative to the current path — on `/products/[id]` it becomes `/products/[id]#store`.
- **Active filter pills use a tint, not a solid fill, on purpose.** Several tag colours (`#d97706` amber, `#16a34a` green, `#0891b2` cyan) only reach ~3.2–3.6:1 against white, so a solid fill with white label text fails WCAG AA at 14px. `filterColor()` + `color-mix(in srgb, <colour> 16%, transparent)` keeps the colour identity and stays legible in both themes. If you switch to solid fills, darken those three first.
- **`color-mix()` is used in inline styles** (filter pills). Fine in current evergreen browsers; if you need to support anything older, precompute the tints instead.
- **Inline styles beat Tailwind hover classes.** With `style={{ backgroundColor }}`, `hover:bg-*` won't apply — use `bg-[var(--x)]` instead.
- **Supabase writes should degrade, not fail.** Follow the `isMissingColumnError` retry pattern when adding columns so a missing migration doesn't take checkout down.
- **Order emails go out only after a successful insert** in `/api/order`. Keep that ordering.
- **Body scroll lock:** CartDrawer, CheckoutModal (and LegalModal, if revived) set `document.body.style.overflow = "hidden"` while open and restore on close/unmount.
- **`data-lenis-prevent="true"`** is needed on scrollable modal bodies so Lenis doesn't hijack their scroll.
- **CartDrawer `shrink-0`** on each item wrapper stops flexbox squashing cards and hiding qty steppers.
- **`h-full` inside auto-height flex containers** resolves to auto in most browsers — relied on in GlassVial so the image sizes naturally.
- **Add to Bag inner `<span>`** has `pointer-events: none` so clicks in the button padding hit the button, not the span.
- **AnimatePresence + IntersectionObserver in AppleBentoGrid:** `whileInView` with `once: true` only fires on first scroll, so initial reveal uses `IntersectionObserver`, then `AnimatePresence mode="wait"` with `key={activeFilter}` animates items out/in on filter change.
- **Testing claims:** never state or imply VESSEL performs its own potency/purity testing in-house. Testing is lab-performed by independent third parties; VESSEL commissions it and relays the results but does not independently re-verify them. The Testing & Quality page and the legal Testing Data clause must keep saying so.
