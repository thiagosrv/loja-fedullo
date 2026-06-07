import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const categories = await db.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ categories });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao buscar categorias" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();
    if (!name) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });

    const category = await db.category.create({
      data: { name, slug: slugify(name), description: description ?? "" },
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (e: unknown) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Erro interno";
    if (msg.includes("Unique constraint") || msg.includes("UNIQUE constraint")) {
      return NextResponse.json({ error: "Categoria já existe" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
