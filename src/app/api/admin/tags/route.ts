import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const tags = await db.tag.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ tags });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao buscar tags" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, type, color, active } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });
    }
    const tag = await db.tag.create({
      data: {
        name:   name.trim(),
        type:   type   ?? "CUSTOM",
        color:  color  ?? "#dc2626",
        active: active ?? true,
      },
    });
    return NextResponse.json({ tag }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao criar tag" }, { status: 500 });
  }
}
