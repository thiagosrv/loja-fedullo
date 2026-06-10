import { db } from "@/lib/db";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Pagination } from "@/components/products/Pagination";
import { ProductFilters } from "@/components/products/ProductFilters";
import type { Prisma } from "@/generated/prisma/client";
import type { Product } from "@/types/product";
import type { Metadata } from "next";

interface Props {
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `"${q}" — Busca` : "Buscar Produtos",
    description: q ? `Resultados para "${q}"` : "Busque em nosso catálogo de peças para carros preparados.",
  };
}

export default async function BuscaPage({ searchParams }: Props) {
  const { q, page: pageStr, sort = "featured" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1"));
  const limit = 12;

  const where: Prisma.ProductWhereInput = {
    active: true,
    ...(q?.trim() && {
      OR: [
        { name:        { contains: q.trim(), mode: "insensitive" } },
        { description: { contains: q.trim(), mode: "insensitive" } },
        { sku:         { contains: q.trim(), mode: "insensitive" } },
      ],
    }),
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
        images:   { orderBy: { position: "asc" }, take: 1 },
        brands:   { include: { brand: true } },
        tags:     { include: { tag: true } },
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-[#dc2626]" />
          <span className="text-xs font-bold tracking-[0.2em] text-[#dc2626] uppercase">Busca</span>
        </div>
        {q ? (
          <>
            <h1 className="text-3xl font-bold text-white">
              Resultados para{" "}
              <span className="text-[#dc2626]">&ldquo;{q}&rdquo;</span>
            </h1>
            <p className="text-[#9ca3af] mt-1">
              {total} {total === 1 ? "produto encontrado" : "produtos encontrados"}
            </p>
          </>
        ) : (
          <h1 className="text-3xl font-bold text-white">Catálogo completo</h1>
        )}
      </div>

      {/* Filters row */}
      <div className="mb-6">
        <ProductFilters sort={sort} total={total} />
      </div>

      {/* Results */}
      {products.length > 0 ? (
        <>
          <ProductGrid products={products as unknown as Product[]} />
          {pages > 1 && (
            <div className="mt-10">
              <Pagination currentPage={page} totalPages={pages} />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-white text-xl font-semibold mb-2">Nenhum produto encontrado</p>
          <p className="text-[#9ca3af] text-sm">
            {q
              ? `Não encontramos resultados para "${q}". Tente outros termos.`
              : "Nenhum produto disponível no momento."}
          </p>
        </div>
      )}
    </div>
  );
}
