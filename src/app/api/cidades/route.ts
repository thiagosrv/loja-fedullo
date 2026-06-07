export const revalidate = 86400; // 24h cache

interface IBGEMunicipio {
  id: number;
  nome: string;
  microrregiao: {
    mesorregiao: {
      UF: {
        sigla: string;
      };
    };
  };
}

export async function GET() {
  try {
    const res = await fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome",
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) throw new Error("IBGE API error");

    const data: IBGEMunicipio[] = await res.json();

    const cidades = data.map((m) => ({
      nome: m.nome,
      uf: m.microrregiao.mesorregiao.UF.sigla,
    }));

    return Response.json(cidades);
  } catch {
    return Response.json({ error: "Erro ao buscar cidades" }, { status: 500 });
  }
}
