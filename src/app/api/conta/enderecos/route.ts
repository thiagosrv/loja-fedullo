import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { db } from "@/lib/db";

async function getAuthUser() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// GET — list addresses
export async function GET() {
  const user = await getAuthUser();
  if (!user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const profile = await db.user.findUnique({ where: { email: user.email } });
  if (!profile) return NextResponse.json({ addresses: [] });

  const addresses = await db.address.findMany({
    where: { userId: profile.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ addresses });
}

// POST — create address
export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const profile = await db.user.findUnique({ where: { email: user.email } });
  if (!profile) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

  const body = await req.json();
  const { name, cep, logradouro, numero, complemento, bairro, cidade, estado, isDefault } = body;

  if (!name || !cep || !logradouro || !numero || !bairro || !cidade || !estado) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
  }

  // If setting as default, unset others
  if (isDefault) {
    await db.address.updateMany({
      where: { userId: profile.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await db.address.create({
    data: {
      userId: profile.id,
      name,
      cep,
      logradouro,
      numero,
      complemento: complemento || null,
      bairro,
      cidade,
      estado,
      isDefault: isDefault ?? false,
    },
  });

  return NextResponse.json({ address });
}

// PATCH — update address
export async function PATCH(req: NextRequest) {
  const user = await getAuthUser();
  if (!user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const profile = await db.user.findUnique({ where: { email: user.email } });
  if (!profile) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

  const body = await req.json();
  const { id, isDefault, ...rest } = body;

  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

  // Verify ownership
  const existing = await db.address.findFirst({ where: { id, userId: profile.id } });
  if (!existing) return NextResponse.json({ error: "Endereço não encontrado" }, { status: 404 });

  // If setting as default, unset others first
  if (isDefault) {
    await db.address.updateMany({
      where: { userId: profile.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  await db.address.update({
    where: { id },
    data: {
      ...(rest.name && { name: rest.name }),
      ...(rest.cep && { cep: rest.cep }),
      ...(rest.logradouro && { logradouro: rest.logradouro }),
      ...(rest.numero && { numero: rest.numero }),
      complemento: rest.complemento || null,
      ...(rest.bairro && { bairro: rest.bairro }),
      ...(rest.cidade && { cidade: rest.cidade }),
      ...(rest.estado && { estado: rest.estado }),
      ...(isDefault !== undefined && { isDefault }),
    },
  });

  // Return all updated addresses
  const addresses = await db.address.findMany({
    where: { userId: profile.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ addresses });
}

// DELETE — remove address
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser();
  if (!user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const profile = await db.user.findUnique({ where: { email: user.email } });
  if (!profile) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

  const existing = await db.address.findFirst({ where: { id, userId: profile.id } });
  if (!existing) return NextResponse.json({ error: "Endereço não encontrado" }, { status: 404 });

  await db.address.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
