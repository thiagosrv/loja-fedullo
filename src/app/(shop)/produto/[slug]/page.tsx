import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductTabs } from "@/components/products/ProductTabs";
import { BuyTogetherCarousel } from "@/components/products/BuyTogetherCarousel";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { ShieldCheck, Truck, RotateCcw, Zap } from "lucide-react";
import type { Metadata } from "next";
import type { Product } from "@/types/product";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });
  if (!product) return { title: "Produto não encontrado" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = (await db.product.findUnique({
    where: { slug, active: true },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      brands: { include: { brand: true } },
      tags:   { include: { tag: true } },
    },
  })) as unknown as Product | null;

  if (!product) notFound();

  const displayPrice =
    product.onSale && product.salePrice ? product.salePrice : product.price;
  const hasDiscount = product.onSale && product.salePrice;
  const discountPct = hasDiscount
    ? Math.round(100 - (product.salePrice! / product.price) * 100)
    : 0;

  const activeTags = (product.tags ?? []).filter((pt) => pt.tag);

  const TRUST = [
    { icon: ShieldCheck, label: "Compra Segura" },
    { icon: Truck,        label: "Frete Calculado" },
    { icon: RotateCcw,    label: "Política de Troca" },
    { icon: Zap,          label: "Envio Rápido" },
  ];

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://loja-fedullo.vercel.app";
  const productUrl = `${baseUrl}/produto/${product.slug}`;
  const firstImage = product.images?.[0]?.url;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku ?? undefined,
    url: productUrl,
    ...(firstImage && { image: [firstImage] }),
    brand: {
      "@type": "Brand",
      name: "Fedullo",
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "BRL",
      price: (displayPrice / 100).toFixed(2),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Fedullo Motorsport",
      },
    },
    category: product.category.name,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#4b5563] mb-8">
        <a href="/" className="hover:text-white transition-colors">Início</a>
        <span>/</span>
        <a
          href={`/${product.category.slug}`}
          className="hover:text-white transition-colors"
        >
          {product.category.name}
        </a>
        <span>/</span>
        <span className="text-[#9ca3af] truncate max-w-[160px]">{product.name}</span>
      </nav>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
        {/* ── Gallery ── */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* ── Info ── */}
        <div className="flex flex-col gap-5">
          {/* Category label */}
          <div className="flex items-center gap-3">
            <div className="h-px w-6 bg-[#dc2626]" />
            <span className="text-xs font-bold tracking-[0.2em] text-[#dc2626] uppercase">
              {product.category.name}
            </span>
          </div>

          {/* Title + subtitle */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
              {product.name}
            </h1>
            {product.subtitle && (
              <p className="text-[#9ca3af] mt-1.5 text-sm leading-relaxed">
                {product.subtitle}
              </p>
            )}
            {product.sku && (
              <p className="text-xs text-[#3a3a3a] mt-1.5">SKU: {product.sku}</p>
            )}
          </div>

          {/* Tags */}
          {activeTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeTags.map((pt) => (
                <span
                  key={pt.tag.id}
                  className="inline-flex items-center px-2.5 py-1 rounded-[4px] text-[11px] font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: pt.tag.color }}
                >
                  {pt.tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Compatible brands */}
          {product.brands.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#4b5563] font-medium">Compatível com:</span>
              {product.brands.map((pb) => (
                <span
                  key={pb.brand.slug}
                  className="px-2.5 py-1 rounded-[4px] border border-[#2a2a2a] bg-[#111] text-xs text-[#9ca3af] font-medium"
                >
                  {pb.brand.name}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-[#1f1f1f]" />

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <PriceDisplay
              cents={displayPrice}
              className="text-3xl sm:text-4xl font-bold text-white"
            />
            {hasDiscount && (
              <>
                <span className="text-base text-[#4b5563] line-through">
                  {(product.price / 100).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
                <span className="px-2 py-0.5 rounded-[4px] bg-[#dc2626] text-white text-xs font-bold">
                  -{discountPct}%
                </span>
              </>
            )}
          </div>

          {/* Stock indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                product.stock > 0 ? "bg-green-500" : "bg-[#dc2626]"
              }`}
            />
            <span className="text-sm text-[#9ca3af]">
              {product.stock === 0
                ? "Esgotado"
                : product.stock <= 5
                ? `Últimas ${product.stock} unidades`
                : "Em estoque"}
            </span>
          </div>

          {/* Qty + Add to cart */}
          <AddToCartButton product={product} />

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 pt-1">
            {TRUST.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 rounded-[8px] border border-[#1a1a1a] bg-[#0a0a0a] py-3 px-2"
              >
                <Icon size={18} className="text-[#dc2626]" strokeWidth={1.5} />
                <span className="text-[10px] text-[#6b7280] text-center leading-tight font-medium">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs: Descrição / Dimensões / Observações ── */}
      <ProductTabs
        description={product.description}
        dimensions={product.dimensions ?? null}
        observations={product.observations ?? null}
      />

      {/* ── You might also like ── */}
      <BuyTogetherCarousel productId={product.id} />
    </div>
  );
}
