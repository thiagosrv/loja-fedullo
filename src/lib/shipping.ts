import { UF_TO_REGION, SHIPPING_RATES, type ShippingRegion } from "@/constants/shipping-regions";

export interface ShippingOption {
  label: string;
  priceCents: number;
  days: string;
  region: ShippingRegion;
}

export function getShippingOptions(uf: string): ShippingOption[] {
  const region = UF_TO_REGION[uf.toUpperCase()];
  if (!region) return [];

  return SHIPPING_RATES[region].map((rate) => ({
    ...rate,
    region,
  }));
}
