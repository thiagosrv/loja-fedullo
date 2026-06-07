import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroBanner } from "@/components/home/HeroBanner";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CategorySection } from "@/components/home/CategorySection";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types/product";

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    return await db.product.findMany({
      where: { active: true, featured: true },
      include: {
        category: true,
        images: { orderBy: { position: "asc" } },
        brands: { include: { brand: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }) as unknown as Product[];
  } catch (e) {
    console.error("getFeaturedProducts error:", e);
    return [];
  }
}

async function getLatestProducts(): Promise<Product[]> {
  try {
    return await db.product.findMany({
      where: { active: true },
      include: {
        category: true,
        images: { orderBy: { position: "asc" } },
        brands: { include: { brand: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }) as unknown as Product[];
  } catch (e) {
    console.error("getLatestProducts error:", e);
    return [];
  }
}

export default async function HomePage() {
  const [featuredProducts, latestProducts] = await Promise.all([
    getFeaturedProducts(),
    getLatestProducts(),
  ]);

  return (
    <>
      <Header />
      {/* Hero vai de 0 a 0 — header transparente flutua sobre ele */}
      <main className="flex-1">
        <HeroBanner />

        <div className="h-px bg-[#1f1f1f]" />

        {/* Categories — revela ao rolar */}
        <ScrollReveal>
          <CategorySection />
        </ScrollReveal>

        {/* Featured */}
        {featuredProducts.length > 0 && (
          <>
            <div className="h-px bg-[#1f1f1f] max-w-7xl mx-auto" />
            <ScrollReveal delay={0.05}>
              <FeaturedProducts products={featuredProducts} />
            </ScrollReveal>
          </>
        )}

        {/* Latest */}
        <div className="h-px bg-[#1f1f1f]" />
        <ScrollReveal delay={0.05}>
          <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-px w-8 bg-[#dc2626]" />
                  <span className="text-xs font-bold tracking-[0.2em] text-[#dc2626] uppercase">Loja</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Novidades</h2>
              </div>
              <Link
                href="/chicotes"
                className="hidden sm:flex items-center gap-1.5 text-sm text-[#9ca3af] hover:text-[#dc2626] transition-colors"
              >
                Ver todos <ArrowRight size={14} />
              </Link>
            </div>
            <ProductGrid products={latestProducts} />
          </section>
        </ScrollReveal>
      </main>
      <Footer />
    </>
  );
}
