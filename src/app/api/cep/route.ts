import { NextRequest } from "next/server";
import { fetchCEP } from "@/lib/viacep";

export async function GET(request: NextRequest) {
  const cep = request.nextUrl.searchParams.get("cep");
  if (!cep) {
    return Response.json({ error: "CEP obrigatório" }, { status: 400 });
  }

  const data = await fetchCEP(cep);
  if (!data) {
    return Response.json({ error: "CEP não encontrado" }, { status: 404 });
  }

  return Response.json({
    cep: data.cep,
    logradouro: data.logradouro,
    bairro: data.bairro,
    cidade: data.localidade,
    estado: data.uf,
  });
}
