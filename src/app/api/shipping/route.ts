import { NextRequest } from "next/server";
import { getShippingOptions } from "@/lib/shipping";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uf } = body as { uf: string };

    if (!uf) {
      return Response.json({ error: "UF obrigatório" }, { status: 400 });
    }

    const options = getShippingOptions(uf);
    if (options.length === 0) {
      return Response.json({ error: "Região não suportada" }, { status: 400 });
    }

    return Response.json(options);
  } catch {
    return Response.json({ error: "Erro ao calcular frete" }, { status: 500 });
  }
}
