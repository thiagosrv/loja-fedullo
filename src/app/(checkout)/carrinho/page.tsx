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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12
                        pb-28 lg:pb-12">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px w-8 bg-[#dc2626]" />
              <span className="text-xs font-bold tracking-[0.2em] text-[#dc2626] uppercase">Checkout</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Carrinho{" "}
              <span className="text-[#9ca3af] text-lg sm:text-xl font-normal">
                ({items.length} {items.length === 1 ? "item" : "itens"})
              </span>
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Items */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-[8px] border border-[#1f1f1f] bg-[#111111]"
                >
                  {/* Image */}
                  <div className="relative w-18 h-18 sm:w-20 sm:h-20 flex-shrink-0 rounded-[4px] bg-[#1a1a1a] overflow-hidden"
                       style={{ width: 72, height: 72 }}>
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[#2a2a2a] text-xs">–</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <Link
                      href={`/produto/${item.slug}`}
                      className="text-sm font-medium text-white hover:text-[#dc2626] transition-colors line-clamp-2 leading-snug"
                    >
                      {item.name}
                    </Link>
                    <PriceDisplay cents={item.price} className="text-xs text-[#9ca3af]" />

                    <div className="flex items-center justify-between mt-auto pt-1 gap-2">
                      {/* Quantity — 40px touch target */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center rounded-[6px] border border-[#1f1f1f] hover:border-[#dc2626] active:border-[#dc2626] transition-colors"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="text-sm font-medium w-7 text-center text-white select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-10 h-10 flex items-center justify-center rounded-[6px] border border-[#1f1f1f] hover:border-[#dc2626] active:border-[#dc2626] transition-colors disabled:opacity-30"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Total + remove */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <PriceDisplay
                          cents={item.price * item.quantity}
                          className="text-sm font-bold text-white"
                        />
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="w-9 h-9 flex items-center justify-center rounded-[6px] text-[#4a4a4a] hover:text-[#dc2626] hover:bg-[#1a1a1a] active:text-[#dc2626] transition-colors"
                          aria-label="Remover item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop summary — oculto no mobile (sticky bar cuida disso) */}
            <div className="hidden lg:block lg:col-span-1">
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

      {/* ── Sticky checkout bar — mobile only ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#0a0a0a]/96 backdrop-blur-md border-t border-[#1f1f1f]"
        style={{ paddingBottom: "calc(0.875rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="flex items-center gap-3 px-4 pt-3">
          <div className="min-w-0">
            <p className="text-[10px] text-[#9ca3af] leading-none mb-0.5 uppercase tracking-wider">Total</p>
            <PriceDisplay cents={subtotalCents()} className="text-base font-bold text-white" />
          </div>
          <Link href="/checkout" className="flex-1">
            <Button size="lg" className="w-full h-11 text-sm">
              Finalizar Pedido
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
