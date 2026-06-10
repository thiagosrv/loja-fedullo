import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { code, subtotalCents } = await req.json();

  if (!code?.trim()) {
    return NextResponse.json({ error: "Código inválido." }, { status: 400 });
  }

  const coupon = await db.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!coupon || !coupon.active) {
    return NextResponse.json({ error: "Cupom não encontrado ou inativo." }, { status: 404 });
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Este cupom expirou." }, { status: 400 });
  }

  if (coupon.maxUsage !== null && coupon.usageCount >= coupon.maxUsage) {
    return NextResponse.json({ error: "Este cupom atingiu o limite de usos." }, { status: 400 });
  }

  if (coupon.minOrderCents && subtotalCents < coupon.minOrderCents) {
    const min = (coupon.minOrderCents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return NextResponse.json(
      { error: `Pedido mínimo para este cupom: ${min}.` },
      { status: 400 }
    );
  }

  const discountCents =
    coupon.type === "PERCENTAGE"
      ? Math.round((subtotalCents * coupon.value) / 100)
      : Math.min(coupon.value, subtotalCents);

  return NextResponse.json({
    coupon: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      description: coupon.description,
    },
    discountCents,
  });
}
