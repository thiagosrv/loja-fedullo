import { db } from "@/lib/db";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductFilters } from "@/components/products/ProductFilters";
import { Pagination } from "@/components/products/Pagination";
import type { Prisma } from "@/generated/prisma/client";
import type { Metadata } from "next";
import type { Product } from "@/types/product";

export const metadata: Metadata = {
  title: "Chicotes",
  description: "Chicotes elétricos de alta performance para carros preparados.",
};

interface Props {
  searchParams: Promise<{ sort?: string; page?: string }>;
}

export default async function ChicotesPage({ searchParams }: Props) {
  const { sort = "featured", page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1"));
  const limit = 12;

  const where: Prisma.ProductWhereInput = { active: true, category: { slug: "chicotes" } };
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
          <span className="text-xs font-bold tracking-[0.2em] text-[#dc2626] uppercase">Categoria</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Chicotes</h1>
        <p className="text-[#9ca3af] mt-1">Chicotes elétricos de alta performance para carros preparados</p>
      </div>

      <div className="mb-6">
        <ProductFilters sort={sort} total={total} />
      </div>

      <ProductGrid products={products as unknown as Product[]} />

      {pages > 1 && (
        <div className="mt-10">
          <Pagination currentPage={page} totalPages={pages} />
        </div>
      )}
    </div>
  );
}
