import Link from "next/link";
import Image from "next/image";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { Badge } from "@/components/ui/Badge";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images?.[0];

  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group flex flex-col rounded-[8px] border border-[#1f1f1f] bg-[#111111] overflow-hidden hover:border-[#2a2a2a] transition-colors duration-200"
    >
      {/* Image */}
      <div className="relative aspect-square bg-[#1a1a1a] overflow-hidden">
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={mainImage.alt ?? product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #111 0%, #0a0a0a 100%)" }}
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="opacity-[0.12]">
              <rect x="4" y="4" width="28" height="28" rx="3" stroke="white" strokeWidth="1.5"/>
              <circle cx="13" cy="14" r="3" stroke="white" strokeWidth="1.5"/>
              <path d="M4 24 L11 17 L17 23 L22 18 L32 28" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}

        {mainImage && product.featured && (
          <div className="absolute top-2 left-2">
            <Badge variant="accent">Destaque</Badge>
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-sm font-medium text-[#9ca3af]">Esgotado</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <p className="text-xs text-[#9ca3af]">{product.category.name}</p>
        <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-[#dc2626] transition-colors duration-200">
          {product.name}
        </h3>

        {/* Compatible brands */}
        {product.brands.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {product.brands.slice(0, 3).map((pb) => (
              <Badge key={pb.brand.slug} variant="default">
                {pb.brand.name}
              </Badge>
            ))}
            {product.brands.length > 3 && (
              <Badge variant="default">+{product.brands.length - 3}</Badge>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1f1f1f]">
          <PriceDisplay cents={product.price} className="text-base font-bold text-white" />
          {product.stock > 0 && product.stock <= 5 && (
            <span className="text-xs text-[#dc2626]">Últimas {product.stock}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
