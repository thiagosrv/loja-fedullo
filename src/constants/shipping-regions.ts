export type ShippingRegion = "Sudeste" | "Sul" | "Nordeste" | "Norte" | "Centro-Oeste";

export const UF_TO_REGION: Record<string, ShippingRegion> = {
  SP: "Sudeste", RJ: "Sudeste", MG: "Sudeste", ES: "Sudeste",
  PR: "Sul", SC: "Sul", RS: "Sul",
  BA: "Nordeste", CE: "Nordeste", MA: "Nordeste", PE: "Nordeste",
  AL: "Nordeste", PB: "Nordeste", RN: "Nordeste", SE: "Nordeste",
  PI: "Nordeste",
  AM: "Norte", PA: "Norte", AC: "Norte", RO: "Norte",
  RR: "Norte", AP: "Norte", TO: "Norte",
  DF: "Centro-Oeste", GO: "Centro-Oeste", MT: "Centro-Oeste", MS: "Centro-Oeste",
};

export const SHIPPING_RATES: Record<ShippingRegion, { label: string; priceCents: number; days: string }[]> = {
  Sudeste: [
    { label: "PAC - Sudeste", priceCents: 1890, days: "7-10 dias úteis" },
    { label: "SEDEX - Sudeste", priceCents: 3490, days: "2-3 dias úteis" },
  ],
  Sul: [
    { label: "PAC - Sul", priceCents: 2290, days: "8-12 dias úteis" },
    { label: "SEDEX - Sul", priceCents: 3990, days: "3-4 dias úteis" },
  ],
  Nordeste: [
    { label: "PAC - Nordeste", priceCents: 2890, days: "10-15 dias úteis" },
    { label: "SEDEX - Nordeste", priceCents: 4990, days: "4-6 dias úteis" },
  ],
  Norte: [
    { label: "PAC - Norte", priceCents: 3590, days: "12-18 dias úteis" },
    { label: "SEDEX - Norte", priceCents: 5990, days: "5-8 dias úteis" },
  ],
  "Centro-Oeste": [
    { label: "PAC - Centro-Oeste", priceCents: 2490, days: "8-12 dias úteis" },
    { label: "SEDEX - Centro-Oeste", priceCents: 4290, days: "3-5 dias úteis" },
  ],
};
