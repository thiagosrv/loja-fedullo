import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { code, description, type, value, minOrderCents, maxUsage, active, expiresAt } = body;

    const data: Record<string, unknown> = {};
    if (code !== undefined) data.code = code.toUpperCase().trim();
    if (description !== undefined) data.description = description;
    if (type !== undefined) data.type = type;
    if (value !== undefined) data.value = Math.round(value);
    if (minOrderCents !== undefined) data.minOrderCents = minOrderCents ? Math.round(minOrderCents) : null;
    if (maxUsage !== undefined) data.maxUsage = maxUsage ?? null;
    if (active !== undefined) data.active = active;
    if (expiresAt !== undefined) data.expiresAt = expiresAt ? new Date(expiresAt) : null;

    const coupon = await db.coupon.update({ where: { id }, data });
    return NextResponse.json({ coupon });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao atualizar cupom" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await db.coupon.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao deletar cupom" }, { status: 500 });
  }
}
