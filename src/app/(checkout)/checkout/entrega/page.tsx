"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { Button } from "@/components/ui/Button";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { useCartStore } from "@/store/cartStore";
import { useCheckoutStore } from "@/store/checkoutStore";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShippingOption } from "@/lib/shipping";

export default function CheckoutStep2() {
  const router = useRouter();
  const { items, subtotalCents } = useCartStore();
  const { address, shipping, setShipping } = useCheckoutStore();
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!address.estado) {
      router.replace("/checkout");
      return;
    }

    const load = async () => {
      try {
        const res = await fetch("/api/shipping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uf: address.estado }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setOptions(data);
        if (data.length > 0 && !shipping) {
          setShipping(data[0]);
        }
      } catch {
        setError("Erro ao calcular opções de frete.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [address.estado]);

  const handleContinue = () => {
    if (!shipping) return;
    router.push("/checkout/pagamento");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <CheckoutStepper current={2} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-[8px] border border-[#1f1f1f] bg-[#111111] p-6">
            <h2 className="text-base font-semibold text-white mb-1">Opções de Entrega</h2>
            {address.cidade && address.estado && (
              <p className="text-xs text-[#9ca3af] mb-5">
                Entrega para: <span className="text-white">{address.cidade} – {address.estado}</span>
              </p>
            )}

            {loading ? (
              <div className="flex items-center gap-2 py-4 text-[#9ca3af]">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Calculando frete...</span>
              </div>
            ) : error ? (
              <p className="text-sm text-[#dc2626]">{error}</p>
            ) : (
              <div className="flex flex-col gap-3">
                {options.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setShipping(opt)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-[8px] border text-left transition-colors duration-200",
                      shipping?.label === opt.label
                        ? "border-[#dc2626] bg-[#1a0000]"
                        : "border-[#1f1f1f] hover:border-[#2a2a2a]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors",
                          shipping?.label === opt.label
                            ? "border-[#dc2626] bg-[#dc2626]"
                            : "border-[#2a2a2a]"
                        )}
                      />
                      <div>
                        <p className="text-sm font-medium text-white">{opt.label}</p>
                        <p className="text-xs text-[#9ca3af]">{opt.days}</p>
                      </div>
                    </div>
                    <PriceDisplay cents={opt.priceCents} className="text-sm font-bold text-white" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.back()} className="flex-1">
              Voltar
            </Button>
            <Button onClick={handleContinue} disabled={!shipping || loading} className="flex-1">
              Continuar para Pagamento
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-[8px] border border-[#1f1f1f] bg-[#111111] p-5 sticky top-24">
            <h2 className="text-sm font-semibold text-white mb-4">Resumo</h2>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#9ca3af]">Subtotal</span>
                <PriceDisplay cents={subtotalCents()} className="text-white font-medium" />
              </div>
              <div className="flex justify-between">
                <span className="text-[#9ca3af]">Frete</span>
                {shipping ? (
                  <PriceDisplay cents={shipping.priceCents} className="text-white font-medium" />
                ) : (
                  <span className="text-[#4a4a4a]">—</span>
                )}
              </div>
            </div>
            <div className="h-px bg-[#1f1f1f] my-3" />
            <div className="flex justify-between text-sm font-bold">
              <span className="text-white">Total</span>
              <PriceDisplay
                cents={subtotalCents() + (shipping?.priceCents ?? 0)}
                className="text-white text-base"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
