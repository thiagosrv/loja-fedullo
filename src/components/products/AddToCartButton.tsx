"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types/product";

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  if (product.stock === 0) {
    return (
      <Button variant="outline" size="lg" disabled className="w-full">
        Produto Esgotado
      </Button>
    );
  }

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imageUrl: product.images[0]?.url ?? null,
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Button size="lg" onClick={handleAdd} className="w-full gap-2">
      {added ? (
        <>
          <Check size={18} />
          Adicionado ao Carrinho
        </>
      ) : (
        <>
          <ShoppingCart size={18} />
          Adicionar ao Carrinho
        </>
      )}
    </Button>
  );
}
