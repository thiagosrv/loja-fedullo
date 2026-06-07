import { db } from "@/lib/db";
import { ProductGrid } from "@/components/products/ProductGrid";
import type { Metadata } from "next";
import type { Product } from "@/types/product";

export const metadata: Metadata = {
  title: "Caixa de Relé",
  description: "Caixas de relé e fusíveis profissionais para instalações automotivas.",
};

export default async function CaixaRelePage() {
  const products = (await db.product.findMany({
    where: { active: true, category: { slug: "caixa-de-rele" } },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      brands: { include: { brand: true } },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  })) as unknown as Product[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-[#dc2626]" />
          <span className="text-xs font-bold tracking-[0.2em] text-[#dc2626] uppercase">Categoria</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Caixa de Relé</h1>
        <p className="text-[#9ca3af] mt-1">Caixas de relé e fusíveis profissionais para instalações automotivas</p>
      </div>
      <ProductGrid products={products} />
    </div>
  );
}
