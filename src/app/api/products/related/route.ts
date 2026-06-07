import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/products/related?productId=xxx
 * Retorna até 3 produtos:
 *  1. Mesmas marcas do carro, categoria diferente, em estoque
 *  2. Fallback: produtos em destaque de qualquer categoria
 */
export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ products: [] });
  }

  try {
    // Busca marcas e categoria do produto atual
    const current = await db.product.findUnique({
      where: { id: productId },
      select: {
        categoryId: true,
        brands: { select: { brandId: true } },
      },
    });

    if (!current) return NextResponse.json({ products: [] });

    const brandIds = current.brands.map((b) => b.brandId);
    const INCLUDE = {
      category: true,
      images: { orderBy: { position: "asc" as const }, take: 1 },
      brands: { include: { brand: true } },
      tags: { include: { tag: true } },
    };

    let related = [];

    // 1ª opção: mesma marca, categoria diferente
    if (brandIds.length > 0) {
      related = await db.product.findMany({
        where: {
          active: true,
          stock: { gt: 0 },
          id: { not: productId },
          categoryId: { not: current.categoryId },
          brands: { some: { brandId: { in: brandIds } } },
        },
        include: INCLUDE,
        orderBy: { featured: "desc" },
        take: 3,
      });
    }

    // Fallback: completa com destaque se não tiver 3
    if (related.length < 3) {
      const exclude = [productId, ...related.map((p: { id: string }) => p.id)];
      const fill = await db.product.findMany({
        where: {
          active: true,
          stock: { gt: 0 },
          id: { notIn: exclude },
          categoryId: { not: current.categoryId },
        },
        include: INCLUDE,
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: 3 - related.length,
      });
      related = [...related, ...fill];
    }

    return NextResponse.json({ products: related });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ products: [] });
  }
}
