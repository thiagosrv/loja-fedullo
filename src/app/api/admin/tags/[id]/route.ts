import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { name, type, color, active } = await request.json();
    const data: Record<string, unknown> = {};
    if (name  !== undefined) data.name   = name.trim();
    if (type  !== undefined) data.type   = type;
    if (color !== undefined) data.color  = color;
    if (active!== undefined) data.active = active;

    const tag = await db.tag.update({ where: { id }, data });
    return NextResponse.json({ tag });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao atualizar tag" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await db.tag.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao deletar tag" }, { status: 500 });
  }
}
