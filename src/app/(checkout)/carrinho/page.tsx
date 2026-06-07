"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { useCartStore } from "@/store/cartStore";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotalCents } = useCartStore();

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-24 px-4">
          <div className="w-16 h-16 rounded-full border border-[#1f1f1f] flex items-center justify-center mb-6">
            <ShoppingCart size={24} className="text-[#4a4a4a]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Carrinho vazio</h1>
          <p className="text-[#9ca3af] mb-8">Adicione produtos para continuar</p>
          <Link href="/chicotes">
            <Button>Explorar Produtos</Button>
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px w-8 bg-[#dc2626]" />
              <span className="text-xs font-bold tracking-[0.2em] text-[#dc2626] uppercase">Checkout</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Carrinho <span className="text-[#9ca3af] text-xl font-normal">({items.length} {items.length === 1 ? "item" : "itens"})</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 p-4 rounded-[8px] border border-[#1f1f1f] bg-[#111111]"
                >
                  {/* Image */}
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-[4px] bg-[#1a1a1a] overflow-hidden">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[#2a2a2a] text-xs">–</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col gap-1">
                    <Link href={`/produto/${item.slug}`} className="text-sm font-medium text-white hover:text-[#dc2626] transition-colors line-clamp-2">
                      {item.name}
                    </Link>
                    <PriceDisplay cents={item.price} className="text-xs text-[#9ca3af]" />

                    <div className="flex items-center justify-between mt-auto">
                      {/* Quantity */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-[4px] border border-[#1f1f1f] hover:border-[#dc2626] transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-medium w-6 text-center text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-7 h-7 flex items-center justify-center rounded-[4px] border border-[#1f1f1f] hover:border-[#dc2626] transition-colors disabled:opacity-30"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Total + remove */}
                      <div className="flex items-center gap-3">
                        <PriceDisplay cents={item.price * item.quantity} className="text-sm font-bold text-white" />
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-[#4a4a4a] hover:text-[#dc2626] transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="rounded-[8px] border border-[#1f1f1f] bg-[#111111] p-6 sticky top-24">
                <h2 className="text-base font-semibold text-white mb-4">Resumo</h2>

                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#9ca3af]">Subtotal</span>
                    <PriceDisplay cents={subtotalCents()} className="text-white font-medium" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9ca3af]">Frete</span>
                    <span className="text-[#9ca3af]">Calculado no checkout</span>
                  </div>
                </div>

                <div className="h-px bg-[#1f1f1f] my-4" />

                <div className="flex justify-between mb-6">
                  <span className="font-semibold text-white">Total</span>
                  <PriceDisplay cents={subtotalCents()} className="text-xl font-bold text-white" />
                </div>

                <Link href="/checkout" className="block">
                  <Button size="lg" className="w-full">
                    Finalizar Pedido
                  </Button>
                </Link>

                <p className="text-xs text-[#4a4a4a] text-center mt-3">
                  Frete calculado na próxima etapa
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
