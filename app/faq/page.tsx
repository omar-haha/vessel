"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { cn } from "@/lib/utils";
import { BRAND } from "@/config/brand";

const FAQS_EN = [
  { q: `What makes ${BRAND.name} different?`, a: `Every batch we sell is third-party lab tested for potency and purity before it ships. We publish those Certificates of Analysis on our Testing & Quality page and provide them with every order.` },
  { q: "How do I place an order?", a: "Browse the store, select your product and quantity, add it to your bag, and proceed to checkout. At checkout you'll provide your contact and shipping details, then complete payment via Interac e-Transfer or cryptocurrency. Orders are processed within 1–2 business days after payment is confirmed." },
  { q: "What payment methods do you accept?", a: "We accept Interac e-Transfer (Canadian banks) and cryptocurrency (BTC, ETH). Payment instructions are shown at checkout and on your order confirmation. All prices are in CAD unless otherwise noted." },
  { q: "How long does shipping take?", a: `Orders ship within 1–2 business days after payment is confirmed. Standard delivery within Canada is typically 2–5 business days. Expedited options may be available — contact us at ${BRAND.supportEmail} to inquire.` },
  { q: "Do you ship internationally?", a: `We currently ship within Canada and to select international destinations. You are solely responsible for ensuring compliance with all import regulations in your jurisdiction. ${BRAND.name} reserves the right to refuse shipment to any location.` },
  { q: "How should I store my supplements?", a: "Storage varies by product — check the product page for specific guidance (e.g. probiotics or certain oils may call for refrigeration; most capsules and powders just need a cool, dry place away from direct sunlight). A general storage note ships with every order." },
  { q: "Can I get the Certificate of Analysis for my order?", a: `Yes. Every batch ships with a lab-issued Certificate of Analysis, and it's available on request even after delivery. Email ${BRAND.supportEmail} with your order number and the specific product, and we'll provide it within 1 business day.` },
  { q: "What is your refund policy?", a: "Unused items in original packaging can be returned within 30 days. If you receive a damaged or incorrect order, contact us within 48 hours of delivery with photos and your order number. We will review and, at our discretion, offer a replacement, refund, or store credit. See our full Refund Policy for details." },
  { q: "Do you offer trade or bulk pricing?", a: `Yes, we work with gyms, trainers, and retail buyers on volume orders. Contact us at ${BRAND.supportEmail} with what you need and we will provide a custom quote.` },
  { q: "How is my order packaged?", a: "Orders ship in protective, unbranded outer packaging suited to each product. Shipping labels contain only the sender and recipient addresses, as with any commercial shipment." },
];

const FAQS_FR = [
  { q: `Qu'est-ce qui distingue ${BRAND.name} ?`, a: `Chaque lot que nous vendons est testé par un laboratoire tiers pour la puissance et la pureté avant l'expédition. Nous publions ces certificats d'analyse sur notre page Tests et qualité et les fournissons avec chaque commande.` },
  { q: "Comment passer une commande ?", a: "Parcourez la boutique, sélectionnez votre produit et la quantité, ajoutez-le à votre panier et passez à la caisse. Lors du paiement, vous fournirez vos coordonnées et vos informations d'expédition, puis compléterez le paiement par virement Interac ou cryptomonnaie. Les commandes sont traitées dans les 1 à 2 jours ouvrables après confirmation du paiement." },
  { q: "Quels modes de paiement acceptez-vous ?", a: "Nous acceptons le virement Interac (banques canadiennes) et les cryptomonnaies (BTC, ETH). Les instructions de paiement sont affichées à la caisse et sur la confirmation de commande. Tous les prix sont en CAD, sauf indication contraire." },
  { q: "Quel est le délai de livraison ?", a: `Les commandes sont expédiées dans les 1 à 2 jours ouvrables après confirmation du paiement. La livraison standard au Canada prend généralement 2 à 5 jours ouvrables. Des options accélérées peuvent être disponibles — contactez-nous à ${BRAND.supportEmail} pour vous renseigner.` },
  { q: "Livrez-vous à l'international ?", a: `Nous livrons actuellement au Canada et dans certaines destinations internationales. Vous êtes seul responsable du respect de toutes les réglementations d'importation applicables dans votre juridiction. ${BRAND.name} se réserve le droit de refuser toute expédition vers n'importe quel endroit.` },
  { q: "Comment conserver mes suppléments ?", a: "La conservation varie selon le produit — consultez la fiche produit pour des conseils précis (p. ex. certains probiotiques ou huiles peuvent nécessiter une réfrigération ; la plupart des capsules et poudres n'ont besoin que d'un endroit frais, sec et à l'abri de la lumière directe). Une note de conservation accompagne chaque commande." },
  { q: "Puis-je obtenir le certificat d'analyse pour ma commande ?", a: `Oui. Chaque lot est accompagné d'un certificat d'analyse émis par le laboratoire, disponible sur demande même après la livraison. Écrivez à ${BRAND.supportEmail} avec votre numéro de commande et le produit concerné, et nous vous la fournirons dans un délai d'un jour ouvrable.` },
  { q: "Quelle est votre politique de remboursement ?", a: "Les articles non utilisés dans leur emballage d'origine peuvent être retournés dans les 30 jours. Si vous recevez une commande endommagée ou incorrecte, contactez-nous dans les 48 heures suivant la livraison avec des photos et votre numéro de commande. Nous examinerons la situation et, à notre discrétion, offrirons un remplacement, un remboursement ou un crédit en boutique." },
  { q: "Offrez-vous des tarifs professionnels ou en gros ?", a: `Oui, nous travaillons avec des gyms, des entraîneurs et des détaillants pour les commandes en volume. Contactez-nous à ${BRAND.supportEmail} avec vos besoins et nous vous fournirons un devis personnalisé.` },
  { q: "Comment ma commande est-elle emballée ?", a: "Les commandes sont expédiées dans un emballage extérieur protecteur et sans marque, adapté à chaque produit. Les étiquettes d'expédition contiennent uniquement les adresses de l'expéditeur et du destinataire, comme pour tout envoi commercial." },
];

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="rounded-[16px] overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer border-none bg-transparent"
        style={{ backgroundColor: open ? "var(--surface)" : "var(--bg)" }}
      >
        <span className="text-[15px] font-medium text-primary leading-snug">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0" style={{ color: "var(--text-muted)" }}>
          <ChevronDown size={16} strokeWidth={2} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: "easeInOut" }} style={{ overflow: "hidden" }}>
            <p className="px-6 pb-5 text-[14px] text-secondary leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(null);
  const { lang, t } = useLanguage();
  const faqs = lang === "fr" ? FAQS_FR : FAQS_EN;

  return (
    <PageShell>
      <div className="max-w-[720px] mx-auto px-4 md:px-6 py-[80px] md:py-[100px]">
        <div className="mb-12">
          <p className="text-[12px] font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>
            {t("page_support")}
          </p>
          <h1 className="text-[34px] md:text-[44px] font-semibold tracking-tight text-primary mb-4">
            {t("page_faq_title")}
          </h1>
          <p className="text-[16px] text-secondary leading-relaxed">
            {t("page_faq_sub")}{" "}
            <a href={`mailto:${BRAND.supportEmail}`} className="text-[color:var(--accent)] no-underline hover:underline">
              {BRAND.supportEmail}
            </a>
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {faqs.map((item, i) => (
            <FaqItem key={i} q={item.q} a={item.a} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
          ))}
        </div>
      </div>
    </PageShell>
  );
}
