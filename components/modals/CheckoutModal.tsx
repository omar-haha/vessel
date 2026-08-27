"use client";

import { X, CheckCircle2, Copy, Check } from "lucide-react";
import { useCart } from "../providers/CartProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/Spinner";
import { BRAND } from "@/config/brand";

const INPUT_CLASS =
  "w-full bg-secondary border border-transparent rounded-[12px] p-4 text-[17px] text-primary placeholder:text-secondary outline-none transition-all focus:border-[color:var(--accent)] focus:bg-primary";

type PayMethod = "etransfer" | "crypto";
type CryptoCoin = "BTC" | "ETH";

const ETRANSFER_EMAIL = BRAND.paymentEmail;

// Portfolio demo — these are the well-known BIP-173 / public example
// addresses, not real wallets. Replace before accepting real payments.
const CRYPTO_ADDRESSES: Record<CryptoCoin, string> = {
  BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  ETH: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
};

// The research-intent statement is the paper trail that turns "we suspected but
// did nothing" into "they told us in writing" — a dropdown selection does not
// create the same record, so require a typed sentence of reasonable length.
const MIN_INTENT_LENGTH = 15;

export function CheckoutModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { t } = useLanguage();
  const items = Object.values(cartItems);

  const [successOpen, setSuccessOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [savedTotal, setSavedTotal] = useState(0);
  const [payMethod, setPayMethod] = useState<PayMethod>("etransfer");
  const [cryptoCoin, setCryptoCoin] = useState<CryptoCoin>("BTC");
  const [copied, setCopied] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [researchIntent, setResearchIntent] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  // Disabled — fabricated "X people viewing" counter (random number on a timer).
  // const [liveCount, setLiveCount] = useState(() => 12 + Math.floor(Math.random() * 36));

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", industry: "",
    street: "", city: "", postal: "", country: "Canada",
  });
  const setField = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  // Disabled — drove the fabricated viewer counter above.
  // useEffect(() => {
  //   if (!isOpen) return;
  //   const id = setInterval(() => {
  //     setLiveCount((n) => {
  //       const delta = Math.random() < 0.5 ? 1 : -1;
  //       return Math.min(47, Math.max(12, n + delta));
  //     });
  //   }, 3800);
  //   return () => clearInterval(id);
  // }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen || successOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen, successOpen]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2200);
  };

  const handlePlaceOrder = async () => {
    if (!form.firstName.trim() || !form.email.trim()) {
      setFormError(t("checkout_err_required"));
      return;
    }
    if (researchIntent.trim().length < MIN_INTENT_LENGTH) {
      setFormError(t("checkout_err_intent"));
      return;
    }
    if (!termsAccepted) {
      setFormError(t("checkout_err_consent"));
      return;
    }
    setFormError("");
    setIsSubmitting(true);
    setSavedTotal(cartTotal);

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: Object.values(cartItems),
          total: cartTotal,
          payMethod,
          cryptoCoin: payMethod === "crypto" ? cryptoCoin : undefined,
          researchIntent: researchIntent.trim(),
          termsAccepted,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "error");
      setOrderId(data.orderId);
      clearCart();
      setSuccessOpen(true);
    } catch {
      setFormError(t("checkout_err_failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccess = () => {
    setSuccessOpen(false);
    onClose();
  };

  if (!isOpen && !successOpen) return null;

  return (
    <>
      {/* ── Checkout form ── */}
      {isOpen && !successOpen && (
        <div
          data-lenis-prevent="true"
          className="fixed inset-0 z-[3000] flex items-center justify-center p-4 sm:p-6"
          style={{ backdropFilter: "blur(20px) saturate(160%)", backgroundColor: "rgba(0,0,0,0.58)" }}
          onClick={onClose}
        >
          <div
            className="bg-primary rounded-[24px] w-full max-w-[580px] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-7 py-5 border-b border-primary flex items-center justify-between shrink-0">
              <h2 className="text-[20px] font-semibold tracking-tight text-primary m-0">{t("checkout_title")}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full border-none flex items-center justify-center cursor-pointer transition-colors"
                style={{ backgroundColor: "var(--surface-hover)", color: "var(--text-muted)" }}
              >
                <X size={15} strokeWidth={2.5} />
              </button>
            </div>

            {/* Disabled — fabricated live-viewer social proof (random number on a timer).
                Reinstate only against a real analytics figure.
            <div className="px-7 py-2.5 flex items-center gap-2 shrink-0" style={{ backgroundColor: "var(--bg-alt)", borderBottom: "1px solid var(--border)" }}>
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#16a34a' }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#16a34a' }} />
              </span>
              <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                {lang === "fr" ? (
                  <><span className="font-semibold text-primary">{liveCount}</span> {t("checkout_live_pre")}</>
                ) : (
                  <><span className="font-semibold text-primary">{liveCount} {t("checkout_people")}</span> {t("checkout_live_pre")}</>
                )}
              </span>
            </div>
            */}

            {/* Scrollable body */}
            <div
              className={cn(
                "px-7 py-7 overflow-y-auto flex flex-col gap-8 transition-opacity duration-300",
                isSubmitting && "opacity-40 pointer-events-none"
              )}
            >
              {/* Contact */}
              <section>
                <p className="text-[11px] font-semibold tracking-widest uppercase mb-3.5" style={{ color: "var(--text-legal)" }}>
                  {t("checkout_contact")}
                </p>
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder={t("checkout_first")} className={INPUT_CLASS} value={form.firstName} onChange={setField("firstName")} />
                    <input type="text" placeholder={t("checkout_last")} className={INPUT_CLASS} value={form.lastName} onChange={setField("lastName")} />
                  </div>
                  <input type="email" placeholder={t("checkout_email")} className={INPUT_CLASS} value={form.email} onChange={setField("email")} />
                  <select className={cn(INPUT_CLASS, "appearance-none cursor-pointer")} value={form.industry} onChange={setField("industry")}>
                    <option value="">{t("checkout_industry")}</option>
                    <option>{t("checkout_ind_analytical")}</option>
                    <option>{t("checkout_ind_biotech")}</option>
                    <option>{t("checkout_ind_industrial")}</option>
                    <option>{t("checkout_ind_chemical")}</option>
                    <option>{t("checkout_ind_academic")}</option>
                    <option>{t("checkout_ind_private")}</option>
                  </select>
                </div>
              </section>

              {/* Research use — typed intent statement (required) */}
              <section>
                <p className="text-[11px] font-semibold tracking-widest uppercase mb-3.5" style={{ color: "var(--text-legal)" }}>
                  {t("checkout_intent_section")}
                </p>
                <div className="flex flex-col gap-2">
                  <label htmlFor="research-intent" className="text-[13px] font-medium text-primary">
                    {t("checkout_intent_label")}
                  </label>
                  <textarea
                    id="research-intent"
                    required
                    rows={3}
                    value={researchIntent}
                    onChange={(e) => setResearchIntent(e.target.value)}
                    placeholder={t("checkout_intent_ph")}
                    className={cn(INPUT_CLASS, "resize-none leading-relaxed")}
                  />
                  <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                    {t("checkout_intent_hint")}
                  </p>
                </div>
              </section>

              {/* Shipping */}
              <section>
                <p className="text-[11px] font-semibold tracking-widest uppercase mb-3.5" style={{ color: "var(--text-legal)" }}>
                  {t("checkout_shipping")}
                </p>
                <div className="flex flex-col gap-3">
                  <input type="text" placeholder={t("checkout_street")} className={INPUT_CLASS} value={form.street} onChange={setField("street")} />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder={t("checkout_city")} className={INPUT_CLASS} value={form.city} onChange={setField("city")} />
                    <input type="text" placeholder={t("checkout_postal")} className={INPUT_CLASS} value={form.postal} onChange={setField("postal")} />
                  </div>
                  <select className={cn(INPUT_CLASS, "appearance-none cursor-pointer")} value={form.country} onChange={setField("country")}>
                    <option>{t("checkout_country_ca")}</option>
                    <option>{t("checkout_country_us")}</option>
                    <option>{t("checkout_country_uk")}</option>
                    <option>{t("checkout_country_de")}</option>
                    <option>{t("checkout_country_au")}</option>
                    <option>{t("checkout_country_nl")}</option>
                    <option>{t("checkout_country_se")}</option>
                  </select>
                </div>
              </section>

              {/* Payment */}
              <section>
                <p className="text-[11px] font-semibold tracking-widest uppercase mb-3.5" style={{ color: "var(--text-legal)" }}>
                  {t("checkout_payment")}
                </p>

                {/* Toggle cards */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {(["etransfer", "crypto"] as PayMethod[]).map((method) => {
                    const active = payMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPayMethod(method)}
                        className="rounded-[14px] p-4 text-left border-none transition-all duration-200 relative cursor-pointer"
                        style={{
                          backgroundColor: active ? "var(--surface)" : "var(--bg-alt)",
                          outline: active ? "2px solid var(--accent)" : "2px solid transparent",
                        }}
                      >
                        <div className="text-[14px] font-semibold text-primary mb-0.5 leading-tight">
                          {method === "etransfer" ? t("checkout_etransfer") : t("checkout_crypto")}
                        </div>
                        <div className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                          {method === "etransfer" ? t("checkout_etransfer_sub") : t("checkout_crypto_sub")}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Interac panel */}
                {payMethod === "etransfer" && (
                  <div className="rounded-[14px] p-5 flex flex-col gap-4" style={{ backgroundColor: "var(--bg-alt)" }}>
                    <div>
                      <p className="text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--text-legal)" }}>
                        {t("checkout_send_to")}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-[15px] font-mono font-medium text-primary flex-1">
                          {ETRANSFER_EMAIL}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(ETRANSFER_EMAIL, "email")}
                          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border-none cursor-pointer text-[12px] font-medium transition-colors"
                          style={{ backgroundColor: "var(--surface-hover)", color: "var(--text-muted)" }}
                        >
                          {copied === "email" ? <Check size={12} /> : <Copy size={12} />}
                          {copied === "email" ? t("checkout_copied") : t("checkout_copy")}
                        </button>
                      </div>
                    </div>
                    <div className="h-px" style={{ backgroundColor: "var(--border)" }} />
                    <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      {t("checkout_etransfer_note")}
                    </p>
                  </div>
                )}

                {/* Crypto panel */}
                {payMethod === "crypto" && (
                  <div className="rounded-[14px] p-5 flex flex-col gap-4" style={{ backgroundColor: "var(--bg-alt)" }}>
                    {/* Coin tabs */}
                    <div className="flex gap-2">
                      {(["BTC", "ETH"] as CryptoCoin[]).map((coin) => (
                        <button
                          key={coin}
                          type="button"
                          onClick={() => { setCryptoCoin(coin); setCopied(null); }}
                          className="px-4 py-1.5 rounded-full text-[12px] font-semibold border-none cursor-pointer transition-all"
                          style={
                            cryptoCoin === coin
                              ? { backgroundColor: "var(--accent)", color: "#fff" }
                              : { backgroundColor: "var(--surface-hover)", color: "var(--text-muted)" }
                          }
                        >
                          {coin}
                        </button>
                      ))}
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--text-legal)" }}>
                        {t("checkout_wallet")}
                      </p>
                      <div className="flex items-start gap-3">
                        <span className="text-[12px] font-mono text-primary break-all leading-relaxed flex-1">
                          {CRYPTO_ADDRESSES[cryptoCoin]}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(CRYPTO_ADDRESSES[cryptoCoin], "wallet")}
                          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border-none cursor-pointer text-[12px] font-medium transition-colors mt-0.5"
                          style={{ backgroundColor: "var(--surface-hover)", color: "var(--text-muted)" }}
                        >
                          {copied === "wallet" ? <Check size={12} /> : <Copy size={12} />}
                          {copied === "wallet" ? t("checkout_copied") : t("checkout_copy")}
                        </button>
                      </div>
                    </div>
                    <div className="h-px" style={{ backgroundColor: "var(--border)" }} />
                    <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      {t("checkout_crypto_note_pre")} <span className="font-semibold text-primary">{cryptoCoin}</span>.{" "}
                      {t("checkout_crypto_note_suf")}
                    </p>
                  </div>
                )}
              </section>

              {/* Order total + CTA */}
              <div>
                {/* Click-wrap consent — an affirmative, conspicuous act with the Terms
                    linked directly from it. Browse-wrap ("by purchasing you agree")
                    is routinely thrown out because there is no record the buyer saw
                    the terms, let alone agreed to them. */}
                <label
                  htmlFor="terms-accept"
                  className="flex items-start gap-3 mb-5 p-4 rounded-[12px] cursor-pointer"
                  style={{ backgroundColor: "var(--bg-alt)", border: "1px solid var(--border)" }}
                >
                  <input
                    id="terms-accept"
                    type="checkbox"
                    required
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 shrink-0 w-[18px] h-[18px] cursor-pointer"
                    style={{ accentColor: "var(--accent)" }}
                  />
                  <span className="text-[13px] leading-relaxed" style={{ color: "var(--text)" }}>
                    {t("checkout_consent_pre")}{" "}
                    <a
                      href="/legal#terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="underline"
                      style={{ color: "var(--accent)" }}
                    >
                      {t("checkout_consent_link")}
                    </a>
                    {t("checkout_consent_post")}
                  </span>
                </label>

                {formError && (
                  <p className="text-[13px] mb-4 text-center" style={{ color: "var(--color-error, #dc2626)" }}>
                    {formError}
                  </p>
                )}
                <div className="flex justify-between items-baseline mb-5">
                  <span className="text-[14px]" style={{ color: "var(--text-muted)" }}>
                    {items.length} {t("checkout_item")}{items.length !== 1 && "s"}
                  </span>
                  <span className="text-[26px] font-semibold tracking-tight text-primary">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full text-white border-none py-[15px] rounded-full text-[16px] font-medium cursor-pointer flex items-center justify-center min-h-[52px] btn-physical btn-physical-accent"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  {isSubmitting ? <Spinner size={22} /> : t("checkout_place")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Success ── */}
      {successOpen && (
        <div
          data-lenis-prevent="true"
          className="fixed inset-0 z-[4000] flex items-center justify-center p-6"
          style={{ backdropFilter: "blur(20px) saturate(160%)", backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          <div className="bg-primary rounded-[28px] p-9 text-center max-w-[400px] w-full shadow-2xl">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-5 mx-auto"
              style={{ backgroundColor: "var(--success)1a", color: "var(--success)" }}
            >
              <CheckCircle2 size={28} strokeWidth={2} />
            </div>

            <h3 className="text-[24px] font-semibold tracking-tight mb-2 text-primary">{t("checkout_success_title")}</h3>
            <p className="text-[14px] mb-6" style={{ color: "var(--text-muted)" }}>
              {t("checkout_success_sub")}
            </p>

            {/* Order number */}
            <div className="rounded-[12px] p-4 mb-4" style={{ backgroundColor: "var(--bg-alt)" }}>
              <div className="text-[11px] font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--text-legal)" }}>
                {t("checkout_order_no")}
              </div>
              <div className="text-[19px] font-mono text-primary">{orderId}</div>
            </div>

            {/* Payment reminder */}
            <div className="rounded-[12px] p-4 mb-7 text-left" style={{ backgroundColor: "var(--bg-alt)" }}>
              {payMethod === "etransfer" ? (
                <>
                  <div className="text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--text-legal)" }}>
                    {t("checkout_etransfer_to")}
                  </div>
                  <div className="text-[14px] font-mono font-medium text-primary mb-1">{ETRANSFER_EMAIL}</div>
                  <div className="text-[12px] mb-2" style={{ color: "var(--text-muted)" }}>
                    {t("checkout_memo")}: <span className="font-semibold text-primary">{orderId}</span>
                  </div>
                  <div className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                    {t("checkout_security_q")}: <span className="font-semibold text-primary">{t("checkout_security_question_text")}</span>
                  </div>
                  <div className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                    {t("checkout_security_a")}: <span className="font-semibold text-primary font-mono">{orderId}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--text-legal)" }}>
                    {t("checkout_send_coin")} {cryptoCoin}
                  </div>
                  <div className="text-[11px] font-mono text-primary break-all mb-1">{CRYPTO_ADDRESSES[cryptoCoin]}</div>
                  <div className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                    {t("checkout_amount")}: <span className="font-semibold text-primary">${savedTotal.toFixed(2)} USD</span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleCloseSuccess}
              className="w-full py-3.5 rounded-full text-[15px] font-medium cursor-pointer transition-colors border"
              style={{
                backgroundColor: "transparent",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-alt)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              {t("checkout_return")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
