import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") ?? "";
    const categoryId = searchParams.get("categoryId") ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } },
        ],
      }),
      ...(categoryId && { categoryId }),
    };

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true,
          images: { orderBy: { position: "asc" }, take: 1 },
          brands: { include: { brand: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({ products, total, page, limit });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, description, price, salePrice, onSale, saleEndsAt,
      stock, sku, featured, active, categoryId,
      brandIds = [], imageUrls = [],
    } = body;

    if (!name || !categoryId || price === undefined) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    const slug = slugify(name);

    const product = await db.product.create({
      data: {
        name,
        slug,
        description: description ?? "",
        price: Math.round(price),
        salePrice: salePrice ? Math.round(salePrice) : null,
        onSale: onSale ?? false,
        saleEndsAt: saleEndsAt ? new Date(saleEndsAt) : null,
        stock: stock ?? 0,
        sku: sku || null,
        featured: featured ?? false,
        active: active ?? true,
        categoryId,
        images: {
          create: imageUrls.map((url: string, i: number) => ({
            url,
            position: i,
          })),
        },
        brands: {
          create: brandIds.map((brandId: string) => ({ brandId })),
        },
      },
      include: {
        category: true,
        images: true,
        brands: { include: { brand: true } },
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (e: unknown) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Erro interno";
    if (msg.includes("Unique constraint") || msg.includes("UNIQUE constraint")) {
      return NextResponse.json({ error: "Produto com esse nome/SKU já existe" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
