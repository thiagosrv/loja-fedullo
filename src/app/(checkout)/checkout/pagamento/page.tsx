"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { Button } from "@/components/ui/Button";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { useCartStore } from "@/store/cartStore";
import { useCheckoutStore } from "@/store/checkoutStore";
import { Shield, Lock, Loader2 } from "lucide-react";

export default function CheckoutStep3() {
  const router = useRouter();
  const { items, subtotalCents, clearCart } = useCartStore();
  const { address, shipping, coupon, setOrderId } = useCheckoutStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!address.email || !shipping) {
      router.replace("/checkout");
    }
  }, []);

  const discountCents = coupon?.discountCents ?? 0;
  const total = subtotalCents() + (shipping?.priceCents ?? 0) - discountCents;

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          shipping,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPriceCents: i.price,
            productName: i.name,
          })),
          subtotalCents: subtotalCents(),
          shippingCents: shipping!.priceCents,
          totalCents: total,
          discountCents,
          couponCode: coupon?.code ?? null,
          guestEmail: address.email,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erro ao criar pedido.");
        return;
      }

      const { orderId } = await res.json();
      setOrderId(orderId);
      clearCart();
      router.push(`/pedido/${orderId}`);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <CheckoutStepper current={3} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-4">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Payment placeholder — Stripe keys to be configured */}
          <div className="rounded-[8px] border border-[#1f1f1f] bg-[#111111] p-6">
            <h2 className="text-base font-semibold text-white mb-1">Pagamento</h2>
            <p className="text-xs text-[#9ca3af] mb-6">
              Processado com segurança pelo Stripe
            </p>

            {/* Stripe Element placeholder */}
            <div className="rounded-[8px] border border-dashed border-[#2a2a2a] bg-[#0a0a0a] p-8 text-center mb-6">
              <Lock size={24} className="text-[#4a4a4a] mx-auto mb-3" />
              <p className="text-sm text-[#9ca3af]">
                Integração Stripe ativa após configurar{" "}
                <code className="text-[#dc2626] text-xs">STRIPE_PUBLISHABLE_KEY</code> no{" "}
                <code className="text-[#dc2626] text-xs">.env</code>
              </p>
              <p className="text-xs text-[#4a4a4a] mt-2">
                O pedido será criado e você será notificado
              </p>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-[#dc2626]" />
                <span className="text-xs text-[#9ca3af]">SSL 256-bit</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock size={14} className="text-[#dc2626]" />
                <span className="text-xs text-[#9ca3af]">Dados protegidos</span>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-[#dc2626] text-center bg-[#1a0000] border border-[#dc2626]/20 rounded-[8px] p-3">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.back()} className="flex-1" disabled={loading}>
              Voltar
            </Button>
            <Button onClick={handlePlaceOrder} className="flex-1 gap-2" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Confirmar Pedido
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-[8px] border border-[#1f1f1f] bg-[#111111] p-5 sticky top-24">
            <h2 className="text-sm font-semibold text-white mb-4">Resumo do Pedido</h2>

            {address.cidade && (
              <div className="mb-4 p-3 rounded-[4px] bg-[#0a0a0a] border border-[#1f1f1f]">
                <p className="text-xs text-[#9ca3af]">Entrega em</p>
                <p className="text-sm text-white mt-0.5">
                  {address.cidade}, {address.estado}
                </p>
                {address.logradouro && (
                  <p className="text-xs text-[#4a4a4a] mt-0.5">
                    {address.logradouro}, {address.numero}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#9ca3af]">Subtotal</span>
                <PriceDisplay cents={subtotalCents()} className="text-white font-medium" />
              </div>
                {shipping && (
                <div className="flex justify-between">
                  <span className="text-[#9ca3af]">{shipping.label.split(" - ")[0]}</span>
                  <PriceDisplay cents={shipping.priceCents} className="text-white font-medium" />
                </div>
              )}
              {coupon && (
                <div className="flex justify-between">
                  <span className="text-green-400 text-xs">Cupom {coupon.code}</span>
                  <span className="text-green-400 font-medium text-sm">
                    −<PriceDisplay cents={coupon.discountCents} className="inline" />
                  </span>
                </div>
              )}
            </div>

            <div className="h-px bg-[#1f1f1f] my-3" />
            <div className="flex justify-between">
              <span className="font-bold text-white">Total</span>
              <PriceDisplay cents={total} className="text-xl font-bold text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
