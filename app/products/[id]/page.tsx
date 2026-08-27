import { notFound } from "next/navigation";
import { products } from "@/lib/products";
import { ProductDetail } from "@/components/sections/ProductDetail";
import { BRAND } from "@/config/brand";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const p = products.find((p) => p.id === id);
  if (!p) return {};
  return {
    title: `${p.name} — ${BRAND.name}`,
    description: `${p.name} ${p.unit} · ${p.purity} purity · $${p.price.toFixed(2)}`,
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.id,
    description: product.description ?? `${product.name} ${product.unit}, ${product.purity} purity (supplier-reported).`,
    offers: {
      "@type": "Offer",
      url: `${BRAND.url}/products/${product.id}`,
      priceCurrency: "CAD",
      price: product.price.toFixed(2),
      availability:
        product.stock === "out"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetail product={product} />
    </>
  );
}
