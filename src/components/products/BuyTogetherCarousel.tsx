"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types/product";

interface BuyTogetherCarouselProps {
  productId: string;
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function BuyTogetherCarousel({ productId }: BuyTogetherCarouselProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/products/related?productId=${productId}`)
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="mt-10 border-t border-[#1f1f1f] pt-8">
        <div className="h-5 w-48 bg-[#1a1a1a] rounded animate-pulse mb-5" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-none w-56 h-60 bg-[#111] rounded-[8px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="mt-10 border-t border-[#1f1f1f] pt-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-px w-6 bg-[#dc2626]" />
          <h2 className="text-sm font-bold tracking-[0.15em] text-[#dc2626] uppercase">
            Você pode comprar junto
          </h2>
        </div>
        {products.length > 2 && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="w-8 h-8 rounded-full border border-[#2a2a2a] flex items-center justify-center text-[#9ca3af] hover:text-white hover:border-[#4a4a4a] transition-colors cursor-pointer"
              aria-label="Rolar para esquerda"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="w-8 h-8 rounded-full border border-[#2a2a2a] flex items-center justify-center text-[#9ca3af] hover:text-white hover:border-[#4a4a4a] transition-colors cursor-pointer"
              aria-label="Rolar para direita"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((p) => {
          const displayPrice = p.onSale && p.salePrice ? p.salePrice : p.price;
          const mainImage = p.images[0];
          const tags = p.tags ?? [];

          return (
            <Link
              key={p.id}
              href={`/produto/${p.slug}`}
              className="group flex-none w-44 sm:w-56 rounded-[10px] border border-[#1f1f1f] bg-[#0d0d0d] overflow-hidden hover:border-[#3a3a3a] active:border-[#3a3a3a] transition-colors"
            >
              {/* Image */}
              <div className="relative w-full aspect-square bg-[#111] overflow-hidden">
                {mainImage ? (
                  <Image
                    src={mainImage.url}
                    alt={mainImage.alt ?? p.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="224px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[#2a2a2a] text-xs">Sem imagem</span>
                  </div>
                )}
                {/* Tags overlay */}
                {tags.length > 0 && (
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {tags.slice(0, 2).map((pt) => (
                      <span
                        key={pt.tag.id}
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white uppercase tracking-wide"
                        style={{ backgroundColor: pt.tag.color }}
                      >
                        {pt.tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-xs text-[#4b5563] mb-0.5">{p.category.name}</p>
                <p className="text-sm font-medium text-white leading-snug line-clamp-2 group-hover:text-[#f3f4f6] transition-colors">
                  {p.name}
                </p>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-base font-bold text-white">{formatPrice(displayPrice)}</span>
                  {p.onSale && p.salePrice && (
                    <span className="text-xs text-[#4b5563] line-through">{formatPrice(p.price)}</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
