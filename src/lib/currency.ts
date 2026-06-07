export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function centsFromBRL(brl: string): number {
  const num = parseFloat(brl.replace(/[^\d,]/g, "").replace(",", "."));
  return Math.round(num * 100);
}
