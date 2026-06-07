import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const brands = await db.brand.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({ brands });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao buscar marcas" }, { status: 500 });
  }
}
