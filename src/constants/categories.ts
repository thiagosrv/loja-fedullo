export const CATEGORIES = [
  { name: "Chicotes", slug: "chicotes", description: "Chicotes elétricos para carros preparados" },
  { name: "Caixa de Relé", slug: "caixa-de-rele", description: "Caixas de relé e fusíveis de alta performance" },
  { name: "Medidores", slug: "medidores", description: "Instrumentação e medidores automotivos" },
  { name: "Peças", slug: "pecas", description: "Peças e acessórios para preparação" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];
