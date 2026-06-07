import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ coupons });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao buscar cupons" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, description, type, value, minOrderCents, maxUsage, active, expiresAt } = body;

    if (!code || !type || value === undefined) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }
    if (!["PERCENTAGE", "FIXED"].includes(type)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }
    if (type === "PERCENTAGE" && (value < 1 || value > 100)) {
      return NextResponse.json({ error: "Percentual deve ser entre 1 e 100" }, { status: 400 });
    }

    const coupon = await db.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        description: description ?? null,
        type,
        value: Math.round(value),
        minOrderCents: minOrderCents ? Math.round(minOrderCents) : null,
        maxUsage: maxUsage ?? null,
        active: active ?? true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (e: unknown) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Erro interno";
    if (msg.includes("Unique constraint") || msg.includes("UNIQUE constraint")) {
      return NextResponse.json({ error: "Código de cupom já existe" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
