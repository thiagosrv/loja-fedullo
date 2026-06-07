import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const featured = searchParams.get("featured");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  try {
    const where = {
      active: true,
      ...(category && { category: { slug: category } }),
      ...(brand && { brands: { some: { brand: { slug: brand } } } }),
      ...(featured === "true" && { featured: true }),
    };

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true,
          images: { orderBy: { position: "asc" } },
          brands: { include: { brand: true } },
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return Response.json({ products, total, page, limit });
  } catch {
    return Response.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}
