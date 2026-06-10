import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { name, phone, cpf } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const profile = await db.user.findUnique({ where: { email: user.email } });
  if (!profile) {
    return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
  }

  try {
    await db.user.update({
      where: { id: profile.id },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        cpf: cpf?.trim() || null,
      },
    });

    // Also update Supabase user metadata
    await supabase.auth.updateUser({
      data: { name: name.trim(), phone: phone?.trim(), cpf: cpf?.trim() },
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "CPF já cadastrado em outra conta." }, { status: 409 });
    }
    return NextResponse.json({ error: "Erro ao salvar dados." }, { status: 500 });
  }
}
