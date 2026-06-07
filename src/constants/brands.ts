export const CAR_BRANDS = [
  { name: "Volkswagen", slug: "volkswagen" },
  { name: "Ford", slug: "ford" },
  { name: "Chevrolet", slug: "chevrolet" },
  { name: "Fiat", slug: "fiat" },
] as const;

export type BrandSlug = (typeof CAR_BRANDS)[number]["slug"];
