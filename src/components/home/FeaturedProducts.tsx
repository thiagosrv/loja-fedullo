import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductGrid } from "@/components/products/ProductGrid";
import type { Product } from "@/types/product";

interface FeaturedProductsProps {
  products: Product[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8 bg-[#dc2626]" />
            <span className="text-xs font-bold tracking-[0.2em] text-[#dc2626] uppercase">Destaques</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Produtos em Destaque</h2>
        </div>
        <Link
          href="/pecas"
          className="hidden sm:flex items-center gap-1.5 text-sm text-[#9ca3af] hover:text-[#dc2626] transition-colors"
        >
          Ver todos <ArrowRight size={14} />
        </Link>
      </div>

      <ProductGrid products={products} />
    </section>
  );
}
