import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { position: "asc" } },
        brands: { include: { brand: true } },
      },
    });
    if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    return NextResponse.json({ product });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao buscar produto" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const {
      name, description, price, salePrice, onSale, saleEndsAt,
      stock, sku, featured, active, categoryId,
      brandIds, imageUrls,
    } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) { data.name = name; data.slug = slugify(name); }
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = Math.round(price);
    if (salePrice !== undefined) data.salePrice = salePrice ? Math.round(salePrice) : null;
    if (onSale !== undefined) data.onSale = onSale;
    if (saleEndsAt !== undefined) data.saleEndsAt = saleEndsAt ? new Date(saleEndsAt) : null;
    if (stock !== undefined) data.stock = stock;
    if (sku !== undefined) data.sku = sku || null;
    if (featured !== undefined) data.featured = featured;
    if (active !== undefined) data.active = active;
    if (categoryId !== undefined) data.categoryId = categoryId;

    // Handle images replacement
    if (imageUrls !== undefined) {
      await db.productImage.deleteMany({ where: { productId: id } });
      data.images = {
        create: imageUrls.map((url: string, i: number) => ({ url, position: i })),
      };
    }

    // Handle brands replacement
    if (brandIds !== undefined) {
      await db.productBrand.deleteMany({ where: { productId: id } });
      data.brands = {
        create: brandIds.map((brandId: string) => ({ brandId })),
      };
    }

    const product = await db.product.update({
      where: { id },
      data,
      include: {
        category: true,
        images: { orderBy: { position: "asc" } },
        brands: { include: { brand: true } },
      },
    });

    return NextResponse.json({ product });
  } catch (e: unknown) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Erro interno";
    if (msg.includes("Record to update not found")) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await db.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao deletar produto" }, { status: 500 });
  }
}
