// Single source of truth for all published legal copy.
//
// This content is rendered in two places — /legal (app/legal/page.tsx) and the
// footer modal (components/modals/LegalModal.tsx) — so both surfaces always
// agree, instead of drifting into two independently-edited copies.
//
// ── Entity naming ───────────────────────────────────────────────────────────
//
// Every published reference to the business flows from the four constants
// below (sourced from config/brand.ts) so that incorporating (or renaming) is
// a one-place edit instead of a hunt through every clause in two languages.
//
// NOTE: this is a portfolio/demo project. VESSEL is not a real registered
// business — these values and the legal copy below are placeholders that
// demonstrate the pattern, not real legal advice or a binding agreement.

import { BRAND } from "@/config/brand";

const ENTITY_EN = BRAND.name;
const LIABLE_PARTY_EN = `${BRAND.name}, including its owner and operators,`;

const ENTITY_FR = BRAND.name;
const LIABLE_PARTY_FR = `${BRAND.name}, y compris son propriétaire et ses exploitants,`;

export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalContent {
  disclaimers: LegalSection[];
  privacy: LegalSection[];
  terms: LegalSection[];
  refund: LegalSection[];
}

export const LEGAL_EN: LegalContent = {
  disclaimers: [
    { heading: "Product Descriptions", body: "We make every effort to display product formulas, serving sizes, and packaging as accurately as possible. Actual appearance may vary slightly due to display settings and normal batch-to-batch variation (e.g. powder colour, capsule size)." },
    { heading: "Not Professional Advice", body: `Care and use guidance provided on this site is general in nature and not a substitute for the manufacturer's specific care instructions included with your order.` },
    { heading: "Purchaser Eligibility", body: "By ordering, purchasers confirm they are of legal age and solely responsible for compliance with all applicable local, provincial, and federal laws in their jurisdiction." },
    { heading: "Shipping & Customs", body: `Purchasers are responsible for compliance with all import regulations in their jurisdiction for international orders. ${ENTITY_EN} reserves the right to refuse or cancel any order at its sole discretion.` },
    { heading: "Limitation of Liability", body: `${LIABLE_PARTY_EN} is not liable for any damages arising from the purchase or use of any product beyond the purchase price paid. Purchasers agree to indemnify ${LIABLE_PARTY_EN} from any claims resulting from misuse of products.` },
    { heading: "Testing & Lab Data", body: `Potency, purity, and contaminant-screening data are produced by independent third-party labs and supplied to you as received. ${ENTITY_EN} does not perform this testing in-house and does not alter lab-provided results. Certificates of Analysis are lab-issued documents; we retain them and provide them on request.` },
    { heading: "Universal Disclaimer", body: `${ENTITY_EN} makes no representations or warranties, expressed or implied, beyond those stated in these disclosures. All products are sold subject to ${ENTITY_EN}'s Terms of Use. These terms are subject to change without notice. By completing a purchase, you acknowledge that you have read, understood, and agreed to all terms, conditions, and disclosures stated herein and on the ${ENTITY_EN} website.` },
  ],
  privacy: [
    { heading: "Information We Collect", body: "We collect information you provide directly when placing an order: name, email address, shipping address, phone number, industry (optional), and any order notes you provide at checkout, together with your acceptance of our Terms of Use. We do not store payment credentials — all payment is completed externally via Interac e-Transfer or cryptocurrency." },
    { heading: "How We Use Your Information", body: "Your information is used to process and fulfill your order, communicate order status, maintain the records described below, and comply with applicable legal obligations. We do not sell or rent your personal information. We share it only with the service providers needed to operate the store — our database host, our transactional email provider, and shipping carriers — and, only if you have consented to analytics, with Google as described under Cookies & Analytics." },
    { heading: "Data Retention", body: "Order records are retained for a minimum of seven years as required by Canadian tax and business regulations. You may request deletion of your personal data at any time, subject to these legal retention requirements." },
    { heading: "Cookies & Analytics", body: "Essential cookies and local storage required for the site to function (session state, language selection, and your cookie choice) are always active. Analytics are optional: only if you accept them do we load Google Analytics 4, which sets its own cookies (_ga and _ga_*) and transfers aggregate usage data to Google LLC, including to servers outside Canada. Analytics remain switched off until you accept, declining costs you no functionality, and you can withdraw consent at any time by clearing this site's data in your browser. We use no advertising cookies and run no cross-site tracking." },
    { heading: "Security", body: "We implement reasonable technical and organizational measures to protect your personal information. No method of transmission over the internet is 100% secure, and we cannot guarantee absolute security." },
    { heading: "Your Rights (PIPEDA & Law 25)", body: `Under PIPEDA (Canada) and, for Québec residents, the Act respecting the protection of personal information in the private sector (Law 25), you have the right to access, correct, or request deletion of your personal information held by ${ENTITY_EN}, to withdraw a consent you have given, and to know whether your information has been transferred outside Québec. Contact us at ${BRAND.supportEmail} to exercise these rights.` },
    { heading: "Contact", body: `Questions regarding this policy may be directed to ${BRAND.supportEmail}. This policy was last updated August 2026 and is subject to change without notice.` },
  ],
  terms: [
    { heading: "Acceptance", body: "By accessing this website or placing an order, you agree to be bound by these Terms of Use and all applicable laws. If you do not agree, do not use this site." },
    { heading: "Order Acknowledgement", body: `At checkout you must affirmatively accept these Terms of Use before an order can be placed. That acceptance forms part of this agreement and is retained with your order record.` },
    { heading: "Eligibility", body: `You must be of legal age in your province or territory to place an order. ${ENTITY_EN} reserves the right to refuse service to any person or entity at its sole discretion.` },
    { heading: "Orders & Payment", body: `All prices are in Canadian dollars unless stated otherwise. Orders are accepted subject to product availability. Payment must be received before shipment. ${ENTITY_EN} reserves the right to cancel any order prior to fulfillment.` },
    { heading: "Shipping Compliance", body: `You are solely responsible for ensuring that the purchase, import, and use of any product complies with all applicable laws in your jurisdiction. ${ENTITY_EN} makes no representation that any product is available for sale or import in your jurisdiction.` },
    { heading: "Testing Data", body: `Lab testing and potency data, including any Certificate of Analysis provided to you, are produced by independent third-party labs and are passed on as received. ${ENTITY_EN} commissions this testing but does not perform it in-house and makes no warranty as to the accuracy of lab-provided data.` },
    { heading: "Intellectual Property", body: `All content on this site — including text, graphics, logos, and design — is the property of ${ENTITY_EN} and may not be reproduced or used without prior written permission.` },
    { heading: "Limitation of Liability", body: `${LIABLE_PARTY_EN} shall not be liable for any indirect, incidental, special, or consequential damages arising from use of this site or any product purchased. Your sole remedy for dissatisfaction is to stop using the site and products.` },
    { heading: "Governing Law", body: "These terms are governed by the laws of the Province of Québec and the federal laws of Canada applicable therein, without regard to conflict of law principles." },
  ],
  refund: [
    { heading: "Return Window", body: "Unused items in original packaging may be returned within 30 days of delivery for a refund or store credit. Made-to-order and final-sale items are excluded — check the product page before ordering." },
    { heading: "Damaged or Incorrect Orders", body: `If you receive a product that is damaged in transit or materially different from what was ordered, contact us at ${BRAND.supportEmail} within 48 hours of delivery with photos and your order number. We will assess and, at our discretion, offer a replacement or store credit.` },
    { heading: "Lost Shipments", body: `If tracking confirms a shipment is lost in transit, contact us and we will investigate with the carrier. Replacement or credit is issued at ${ENTITY_EN}'s sole discretion after investigation is complete.` },
    { heading: "Order Cancellation", body: `Orders may be cancelled within 2 hours of placement if they have not yet been processed. Contact us immediately at ${BRAND.supportEmail}. Once an order is in fulfillment it cannot be cancelled.` },
  ],
};

export const LEGAL_FR: LegalContent = {
  disclaimers: [
    { heading: "Descriptions des produits", body: "Nous faisons tous les efforts possibles pour afficher les formules, formats et emballages des produits aussi fidèlement que possible. L'apparence réelle peut varier légèrement en raison des paramètres d'affichage et de la variation normale d'un lot à l'autre (p. ex. couleur de la poudre, taille des capsules)." },
    { heading: "Conseils non professionnels", body: "Les conseils d'entretien fournis sur ce site sont de nature générale et ne remplacent pas les instructions d'entretien spécifiques du fabricant incluses avec votre commande." },
    { heading: "Admissibilité de l'acheteur", body: "En passant une commande, les acheteurs confirment qu'ils sont majeurs et entièrement responsables du respect de toutes les lois locales, provinciales et fédérales applicables dans leur juridiction." },
    { heading: "Expédition et douanes", body: `Les acheteurs sont responsables du respect de toutes les réglementations d'importation applicables pour les commandes internationales. ${ENTITY_FR} se réserve le droit de refuser ou d'annuler toute commande à sa seule discrétion.` },
    { heading: "Limitation de responsabilité", body: `${LIABLE_PARTY_FR} n'est pas responsable des dommages résultant de l'achat ou de l'utilisation d'un produit au-delà du prix d'achat payé. Les acheteurs acceptent d'indemniser ${LIABLE_PARTY_FR} contre toute réclamation résultant d'une mauvaise utilisation des produits.` },
    { heading: "Tests et données de laboratoire", body: `Les données de puissance, de pureté et de dépistage des contaminants sont produites par des laboratoires tiers indépendants et vous sont transmises telles que reçues. ${ENTITY_FR} n'effectue pas ces tests à l'interne et ne modifie pas les résultats fournis par les laboratoires. Les certificats d'analyse sont des documents émis par les laboratoires ; nous les conservons et les fournissons sur demande.` },
    { heading: "Avertissement universel", body: `${ENTITY_FR} ne fait aucune représentation ni garantie, expresse ou implicite, au-delà de celles énoncées dans ces avis. Tous les produits sont vendus selon les conditions d'utilisation de ${ENTITY_FR}, susceptibles d'être modifiées sans préavis. En effectuant un achat, vous reconnaissez avoir lu, compris et accepté toutes les conditions et mentions légales figurant sur le site ${ENTITY_FR}.` },
  ],
  privacy: [
    { heading: "Informations collectées", body: "Nous collectons les informations que vous fournissez directement lors d'une commande : nom, adresse courriel, adresse de livraison, numéro de téléphone, secteur d'activité (facultatif), ainsi que toute note de commande fournie au paiement et votre acceptation de nos conditions d'utilisation. Nous ne stockons pas vos données de paiement — tout paiement est effectué en dehors de notre plateforme via virement Interac ou cryptomonnaie." },
    { heading: "Utilisation de vos informations", body: "Vos informations sont utilisées pour traiter et expédier votre commande, communiquer son statut, tenir les dossiers décrits ci-dessous et respecter les obligations légales applicables. Nous ne vendons ni ne louons vos informations personnelles. Nous les partageons uniquement avec les fournisseurs de services nécessaires à l'exploitation de la boutique — l'hébergeur de notre base de données, notre fournisseur de courriels transactionnels et les transporteurs — et, uniquement si vous avez consenti aux statistiques, avec Google comme décrit sous « Témoins et statistiques »." },
    { heading: "Conservation des données", body: "Les dossiers de commandes sont conservés pendant au moins sept ans, conformément aux réglementations fiscales et commerciales canadiennes. Vous pouvez demander la suppression de vos données personnelles à tout moment, sous réserve de ces exigences légales de conservation." },
    { heading: "Témoins et statistiques", body: "Les témoins et le stockage local essentiels au fonctionnement du site (état de session, choix de langue et votre choix relatif aux témoins) sont toujours actifs. Les statistiques sont facultatives : ce n'est que si vous les acceptez que nous chargeons Google Analytics 4, qui dépose ses propres témoins (_ga et _ga_*) et transfère des données d'utilisation agrégées à Google LLC, y compris vers des serveurs situés hors du Canada. Les statistiques restent désactivées jusqu'à votre acceptation, un refus ne vous prive d'aucune fonctionnalité, et vous pouvez retirer votre consentement à tout moment en effaçant les données de ce site dans votre navigateur. Nous n'utilisons aucun témoin publicitaire et ne faisons aucun suivi intersites." },
    { heading: "Sécurité", body: "Nous mettons en œuvre des mesures techniques et organisationnelles raisonnables pour protéger vos informations personnelles. Aucun mode de transmission sur Internet n'est sécurisé à 100 % et nous ne pouvons garantir une sécurité absolue." },
    { heading: "Vos droits (LPRPDE et Loi 25)", body: `En vertu de la LPRPDE (Canada) et, pour les résidents du Québec, de la Loi sur la protection des renseignements personnels dans le secteur privé (Loi 25), vous avez le droit d'accéder à vos renseignements personnels détenus par ${ENTITY_FR}, de les corriger ou d'en demander la suppression, de retirer un consentement accordé, et de savoir si vos renseignements ont été communiqués hors du Québec. Contactez-nous à ${BRAND.supportEmail} pour exercer ces droits.` },
    { heading: "Contact", body: `Les questions relatives à cette politique peuvent être adressées à ${BRAND.supportEmail}. Cette politique a été mise à jour en août 2026 et peut être modifiée sans préavis.` },
  ],
  terms: [
    { heading: "Acceptation", body: "En accédant à ce site ou en passant une commande, vous acceptez d'être lié par ces conditions d'utilisation et toutes les lois applicables. Si vous n'acceptez pas, veuillez ne pas utiliser ce site." },
    { heading: "Confirmation de commande", body: "Lors du paiement, vous devez accepter expressément les présentes conditions d'utilisation avant qu'une commande puisse être passée. Cette acceptation fait partie intégrante de la présente entente et est conservée avec votre dossier de commande." },
    { heading: "Admissibilité", body: `Vous devez être majeur dans votre province ou territoire pour passer une commande. ${ENTITY_FR} se réserve le droit de refuser le service à toute personne ou entité à sa seule discrétion.` },
    { heading: "Commandes et paiement", body: `Tous les prix sont en dollars canadiens, sauf indication contraire. Les commandes sont acceptées sous réserve de disponibilité des produits. Le paiement doit être reçu avant l'expédition. ${ENTITY_FR} se réserve le droit d'annuler toute commande avant son exécution.` },
    { heading: "Conformité d'expédition", body: `Vous êtes seul responsable de vous assurer que l'achat, l'importation et l'utilisation de tout produit sont conformes à toutes les lois applicables dans votre juridiction. ${ENTITY_FR} ne garantit pas qu'un produit est disponible à la vente ou à l'importation dans votre juridiction.` },
    { heading: "Données de test", body: `Les données de test en laboratoire et de puissance, y compris tout certificat d'analyse qui vous est fourni, sont produites par des laboratoires tiers indépendants et vous sont transmises telles que reçues. ${ENTITY_FR} commande ces tests mais ne les effectue pas à l'interne et ne garantit pas l'exactitude des données fournies par les laboratoires.` },
    { heading: "Propriété intellectuelle", body: `Tout le contenu de ce site — textes, graphiques, logos et design — est la propriété de ${ENTITY_FR} et ne peut être reproduit ou utilisé sans autorisation écrite préalable.` },
    { heading: "Limitation de responsabilité", body: `${LIABLE_PARTY_FR} ne sera pas responsable des dommages indirects, accessoires, spéciaux ou consécutifs découlant de l'utilisation de ce site ou de tout produit acheté. Votre seul recours en cas d'insatisfaction est de cesser d'utiliser le site et les produits.` },
    { heading: "Droit applicable", body: "Ces conditions sont régies par les lois de la province de Québec et les lois fédérales du Canada applicables, sans égard aux principes de conflits de lois." },
  ],
  refund: [
    { heading: "Délai de retour", body: "Les articles non utilisés dans leur emballage d'origine peuvent être retournés dans les 30 jours suivant la livraison pour un remboursement ou un crédit en boutique. Les articles sur mesure et de vente finale sont exclus — vérifiez la fiche produit avant de commander." },
    { heading: "Commandes endommagées ou incorrectes", body: `Si vous recevez un produit endommagé lors du transport ou sensiblement différent de ce qui a été commandé, contactez-nous à ${BRAND.supportEmail} dans les 48 heures suivant la livraison avec des photos et votre numéro de commande. Nous évaluerons la situation et, à notre discrétion, offrirons un remplacement ou un crédit en boutique.` },
    { heading: "Colis perdus", body: `Si le suivi confirme qu'un colis a été perdu en transit, contactez-nous et nous mènerons une enquête auprès du transporteur. Un remplacement ou un crédit est accordé à la seule discrétion de ${ENTITY_FR} après la fin de l'enquête.` },
    { heading: "Annulation de commande", body: `Les commandes peuvent être annulées dans les 2 heures suivant leur passage si elles n'ont pas encore été traitées. Contactez-nous immédiatement à ${BRAND.supportEmail}. Une fois une commande en cours de traitement, elle ne peut être annulée.` },
  ],
};
