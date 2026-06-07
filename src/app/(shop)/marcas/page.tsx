import Link from "next/link";
import type { Metadata } from "next";
import { CAR_BRANDS } from "@/constants/brands";

export const metadata: Metadata = {
  title: "Por Marca",
  description: "Encontre peças e chicotes elétricos compatíveis com seu carro.",
};

const BRAND_ICONS: Record<string, React.ReactNode> = {
  volkswagen: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M13 14 L17 26 L20 19 L23 26 L27 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  ford: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="6" y="13" width="28" height="14" rx="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M14 20 H26 M14 20 L17 16 M14 20 L17 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M20 16 V24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M24 16 C24 16 27 16 27 20 C27 24 24 24 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  chevrolet: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M7 17 H17 V21 H7 V25 H22 V21 H32 V17 H22 V13 H7 V17Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  fiat: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="20" cy="20" r="13" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M14 20 H26 M14 16 H26 M14 24 H26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

export default function MarcasPage() {
  return (
    <main className="min-h-screen bg-[#000] pt-[52px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-8 bg-[#dc2626]" />
            <span className="text-xs font-bold tracking-[0.2em] text-[#dc2626] uppercase">Marcas</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Encontre pelo seu carro</h1>
          <p className="text-[#9ca3af] mt-2 text-sm">Peças e chicotes compatíveis com sua marca.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CAR_BRANDS.map((brand) => (
            <Link
              key={brand.slug}
              href={`/marcas/${brand.slug}`}
              className="group relative flex flex-col items-center justify-center gap-4 py-10 px-6 rounded-[8px] border border-[#1f1f1f] bg-[#111111] overflow-hidden hover:border-[#333] transition-all duration-300"
            >
              <div className="text-white/25 group-hover:text-white/45 transition-colors duration-300">
                {BRAND_ICONS[brand.slug]}
              </div>
              <span className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors duration-200">
                {brand.name}
              </span>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#dc2626] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
