"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export function CartIcon() {
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <Link
      href="/carrinho"
      className="relative flex items-center justify-center w-10 h-10 rounded-[8px] hover:bg-[#1a1a1a] transition-colors"
      aria-label="Carrinho de compras"
    >
      <ShoppingCart size={20} className="text-white" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#dc2626] text-[10px] font-bold text-white">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );
}
