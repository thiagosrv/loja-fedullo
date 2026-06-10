import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const category = searchParams.get("category");
  const brand    = searchParams.get("brand");
  const featured = searchParams.get("featured");
  const q        = searchParams.get("q")?.trim();
  const sort     = searchParams.get("sort") ?? "featured";
  const page     = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit    = Math.min(48, Math.max(1, parseInt(searchParams.get("limit") ?? "12")));

  try {
    const where: Prisma.ProductWhereInput = {
      active: true,
      ...(category && { category: { slug: category } }),
      ...(brand    && { brands: { some: { brand: { slug: brand } } } }),
      ...(featured === "true" && { featured: true }),
      ...(q && {
        OR: [
          { name:        { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { sku:         { contains: q, mode: "insensitive" } },
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

    return Response.json({ products, total, page, limit, pages: Math.ceil(total / limit) });
  } catch {
    return Response.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}
