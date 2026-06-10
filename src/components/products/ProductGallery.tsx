"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  /* Touch swipe */
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  if (images.length === 0) {
    return (
      <div className="relative aspect-square rounded-[10px] bg-[#111111] border border-[#1f1f1f] flex items-center justify-center">
        <span className="text-[#2a2a2a] text-sm">Sem imagem</span>
      </div>
    );
  }

  const prev = () => setActive((a) => (a - 1 + images.length) % images.length);
  const next = () => setActive((a) => (a + 1) % images.length);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div
        className="relative aspect-square rounded-[10px] bg-[#111111] border border-[#1f1f1f] overflow-hidden group cursor-zoom-in"
        onClick={() => setZoomed(true)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={images[active].url}
          alt={images[active].alt ?? productName}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Nav arrows — always visible on mobile, hover-only on desktop */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white
                         opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-black/80 cursor-pointer"
              aria-label="Imagem anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white
                         opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-black/80 cursor-pointer"
              aria-label="Próxima imagem"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Dot indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.stopPropagation(); setActive(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === active ? "bg-white w-3" : "bg-white/40"}`}
                aria-label={`Imagem ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails — hidden on very small screens, shown from sm */}
      {images.length > 1 && (
        <div className="hidden sm:flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className={`relative flex-none w-16 h-16 rounded-[6px] overflow-hidden border-2 transition-colors cursor-pointer ${
                i === active ? "border-[#dc2626]" : "border-[#1f1f1f] hover:border-[#3a3a3a]"
              }`}
              aria-label={`Ver imagem ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${productName} ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <div
            className="relative w-full max-w-3xl aspect-square"
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchStartX.current;
              if (Math.abs(dx) > 40) {
                if (dx < 0) next();
                else prev();
              }
              touchStartX.current = null;
            }}
          >
            <Image
              src={images[active].url}
              alt={images[active].alt ?? productName}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          <button
            type="button"
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
            onClick={() => setZoomed(false)}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
          {/* Lightbox arrows */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
                aria-label="Anterior"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
                aria-label="Próxima"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
