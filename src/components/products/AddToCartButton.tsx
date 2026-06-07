"use client";

import { useState } from "react";
import { ShoppingCart, Check, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types/product";

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  if (product.stock === 0) {
    return (
      <button
        disabled
        className="w-full h-12 rounded-[8px] border border-[#2a2a2a] text-sm text-[#4b5563] cursor-not-allowed select-none"
      >
        Produto Esgotado
      </button>
    );
  }

  const max = Math.min(product.stock, 99);

  const decrement = () => setQty((q) => Math.max(1, q - 1));
  const increment = () => setQty((q) => Math.min(max, q + 1));

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addItem({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.onSale && product.salePrice ? product.salePrice : product.price,
        imageUrl: product.images[0]?.url ?? null,
        stock: product.stock,
      });
    }
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setQty(1);
    }, 2200);
  };

  return (
    <div className="flex items-stretch gap-3">
      {/* Qty selector */}
      <div className="flex items-center border border-[#2a2a2a] rounded-[8px] overflow-hidden bg-[#111]">
        <button
          type="button"
          onClick={decrement}
          disabled={qty <= 1 || added}
          className="w-10 h-12 flex items-center justify-center text-[#9ca3af] hover:text-white disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
          aria-label="Diminuir quantidade"
        >
          <Minus size={15} />
        </button>
        <span className="w-10 text-center text-sm font-semibold text-white select-none">
          {qty}
        </span>
        <button
          type="button"
          onClick={increment}
          disabled={qty >= max || added}
          className="w-10 h-12 flex items-center justify-center text-[#9ca3af] hover:text-white disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
          aria-label="Aumentar quantidade"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Add to cart CTA */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={added}
        className={`flex-1 h-12 rounded-[8px] text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer select-none ${
          added
            ? "bg-green-600 text-white"
            : "bg-[#dc2626] hover:bg-[#b91c1c] text-white"
        }`}
      >
        {added ? (
          <>
            <Check size={17} strokeWidth={2.5} />
            Adicionado!
          </>
        ) : (
          <>
            <ShoppingCart size={17} />
            Adicionar ao Carrinho
          </>
        )}
      </button>
    </div>
  );
}
