"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { CAR_BRANDS } from "@/constants/brands";
import { cn } from "@/lib/utils";

export function BrandsSubmenu() {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        className={cn(
          "flex items-center gap-1 text-sm font-medium transition-colors duration-200",
          open ? "text-[#dc2626]" : "text-[#9ca3af] hover:text-white"
        )}
      >
        Por Marcas
        <ChevronDown size={14} className={cn("transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-44 rounded-[8px] border border-[#1f1f1f] bg-[#111111] py-1 shadow-xl z-50">
          {/* Red accent top line */}
          <div className="h-px bg-[#dc2626] mx-3 mb-1" />
          {CAR_BRANDS.map((brand) => (
            <Link
              key={brand.slug}
              href={`/marcas/${brand.slug}`}
              className="block px-4 py-2 text-sm text-[#9ca3af] hover:text-white hover:bg-[#1a1a1a] transition-colors"
              onClick={() => setOpen(false)}
            >
              {brand.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
