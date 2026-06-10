import { db } from "@/lib/db";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductFilters } from "@/components/products/ProductFilters";
import { Pagination } from "@/components/products/Pagination";
import { CAR_BRANDS } from "@/constants/brands";
import { notFound } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import type { Metadata } from "next";
import type { Product } from "@/types/product";

interface Props {
  params: Promise<{ brand: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
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

export default async function BrandPage({ params, searchParams }: Props) {
  const { brand: brandSlug } = await params;
  const { sort = "featured", page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1"));
  const limit = 12;

  const brandDef = CAR_BRANDS.find((b) => b.slug === brandSlug);
  if (!brandDef) notFound();

  const where: Prisma.ProductWhereInput = {
    active: true,
    brands: { some: { brand: { slug: brandSlug } } },
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    sort === "price_asc"  ? [{ price: "asc" }]
    : sort === "price_desc" ? [{ price: "desc" }]
    : sort === "newest"     ? [{ createdAt: "desc" }]
    : [{ featured: "desc" }, { createdAt: "desc" }];

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: { position: "asc" }, take: 1 },
        brands: { include: { brand: true } },
        tags:   { include: { tag: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.product.count({ where }),
  ]);

  const pages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-[#dc2626]" />
          <span className="text-xs font-bold tracking-[0.2em] text-[#dc2626] uppercase">Por Marca</span>
        </div>
        <h1 className="text-3xl font-bold text-white">{brandDef.name}</h1>
        <p className="text-[#9ca3af] mt-1">
          {total} produto{total !== 1 ? "s" : ""} compatível{total !== 1 ? "eis" : ""} com {brandDef.name}
        </p>
      </div>

      <div className="mb-6">
        <ProductFilters sort={sort} total={total} />
      </div>

      <ProductGrid
        products={products as unknown as Product[]}
        emptyMessage={`Nenhum produto disponível para ${brandDef.name} no momento.`}
      />

      {pages > 1 && (
        <div className="mt-10">
          <Pagination currentPage={page} totalPages={pages} />
        </div>
      )}
    </div>
  );
}
