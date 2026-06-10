import { db } from "@/lib/db";
import { ProductGrid } from "@/components/products/ProductGrid";
import { CAR_BRANDS } from "@/constants/brands";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Product } from "@/types/product";

interface Props {
  params: Promise<{ brand: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand: brandSlug } = await params;
  const brand = CAR_BRANDS.find((b) => b.slug === brandSlug);
  if (!brand) return { title: "Marca não encontrada" };
  return {
    title: brand.name,
    description: `Produtos para ${brand.name} — chicotes, relés, medidores e mais.`,
  };
}

export async function generateStaticParams() {
  return CAR_BRANDS.map((b) => ({ brand: b.slug }));
}

export default async function BrandPage({ params }: Props) {
  const { brand: brandSlug } = await params;
  const brandDef = CAR_BRANDS.find((b) => b.slug === brandSlug);
  if (!brandDef) notFound();

  const products = (await db.product.findMany({
    where: {
      active: true,
      brands: { some: { brand: { slug: brandSlug } } },
    },
    include: {
      category: true,
      images: { orderBy: { position: "asc" }, take: 1 },
      brands: { include: { brand: true } },
      tags:   { include: { tag: true } },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  })) as unknown as Product[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-[#dc2626]" />
          <span className="text-xs font-bold tracking-[0.2em] text-[#dc2626] uppercase">Por Marca</span>
        </div>
        <h1 className="text-3xl font-bold text-white">{brandDef.name}</h1>
        <p className="text-[#9ca3af] mt-1">
          {products.length} produto{products.length !== 1 ? "s" : ""} compatível{products.length !== 1 ? "eis" : ""} com {brandDef.name}
        </p>
      </div>
      <ProductGrid products={products} emptyMessage={`Nenhum produto disponível para ${brandDef.name} no momento.`} />
    </div>
  );
}
