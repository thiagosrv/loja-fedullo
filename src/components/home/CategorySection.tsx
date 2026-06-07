import Link from "next/link";
import { CATEGORIES } from "@/constants/categories";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  chicotes: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 10 C4 10 8 6 12 10 C16 14 20 6 24 10 C28 14 28 22 28 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 16 C4 16 8 12 12 16 C16 20 20 12 24 16 C28 20 28 26 28 26" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
      <circle cx="28" cy="22" r="2" fill="currentColor"/>
      <circle cx="28" cy="26" r="2" fill="currentColor" opacity="0.5"/>
      <rect x="2" y="8" width="4" height="12" rx="2" fill="currentColor" opacity="0.3"/>
    </svg>
  ),
  "caixa-de-rele": (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="4" y="6" width="24" height="20" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="8" y="10" width="5" height="4" rx="1" fill="currentColor" opacity="0.6"/>
      <rect x="15" y="10" width="5" height="4" rx="1" fill="currentColor" opacity="0.6"/>
      <rect x="8" y="17" width="5" height="4" rx="1" fill="currentColor" opacity="0.3"/>
      <rect x="15" y="17" width="5" height="4" rx="1" fill="currentColor" opacity="0.3"/>
      <line x1="22" y1="10" x2="22" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="22" y1="17" x2="22" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  medidores: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M6 22 A10 10 0 0 1 26 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M8.5 19.5 A8 8 0 0 1 23.5 19.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
      <line x1="16" y1="22" x2="11" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="16" cy="22" r="2" fill="currentColor"/>
      <line x1="9" y1="20" x2="10.5" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <line x1="22" y1="20" x2="23.5" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <line x1="16" y1="12" x2="16" y2="13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
    </svg>
  ),
  pecas: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="16" cy="16" r="4" fill="currentColor" opacity="0.7"/>
      <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="14.5" y="4" width="3" height="5" rx="1.5" fill="currentColor"/>
      <rect x="14.5" y="23" width="3" height="5" rx="1.5" fill="currentColor"/>
      <rect x="4" y="14.5" width="5" height="3" rx="1.5" fill="currentColor"/>
      <rect x="23" y="14.5" width="5" height="3" rx="1.5" fill="currentColor"/>
    </svg>
  ),
};

export function CategorySection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-[#dc2626]" />
          <span className="text-xs font-bold tracking-[0.2em] text-[#dc2626] uppercase">Categorias</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Explore por Categoria</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/${cat.slug}`}
            className="group relative flex flex-col items-start justify-end p-4 sm:p-6 h-32 sm:h-36 rounded-[8px] border border-[#1f1f1f] bg-[#111111] overflow-hidden hover:border-[#333] active:border-[#333] transition-all duration-300"
          >
            {/* Icon — top right, fades down on hover */}
            <div className="absolute top-5 right-5 text-white/20 group-hover:text-white/35 transition-colors duration-300">
              {CATEGORY_ICONS[cat.slug]}
            </div>

            {/* Bottom red bar grows on hover */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#dc2626] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

            <h3 className="text-base font-semibold text-white group-hover:text-white transition-colors duration-200 z-10 relative">
              {cat.name}
            </h3>
            <p className="text-xs text-[#9ca3af] mt-0.5 z-10 relative line-clamp-1">{cat.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
