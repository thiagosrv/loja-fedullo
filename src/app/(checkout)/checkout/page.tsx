"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { useCartStore } from "@/store/cartStore";
import { useCheckoutStore } from "@/store/checkoutStore";
import { Search, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CouponInput } from "@/components/checkout/CouponInput";

export default function CheckoutStep1() {
  const router = useRouter();
  const { items, subtotalCents } = useCartStore();
  const { address, setAddress } = useCheckoutStore();

  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");
  const [formError, setFormError] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);

  const handleCepLookup = async (cep: string) => {
    const cleaned = cep.replace(/\D/g, "");
    if (cleaned.length !== 8) return;

    setCepLoading(true);
    setCepError("");
    try {
      const res = await fetch(`/api/cep?cep=${cleaned}`);
      if (!res.ok) {
        setCepError("CEP não encontrado. Preencha o endereço manualmente.");
        return;
      }
      const data = await res.json();
      setAddress({
        cep: data.cep,
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
      });
    } catch {
      setCepError("Erro ao buscar CEP.");
    } finally {
      setCepLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const required = ["name", "email", "cep", "logradouro", "numero", "bairro", "cidade", "estado"] as const;
    for (const field of required) {
      if (!address[field]) {
        setFormError("Preencha todos os campos obrigatórios.");
        return;
      }
    }
    setFormError("");
    router.push("/checkout/entrega");
  };

  const subtotal = subtotalCents();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-28 lg:pb-6">
      <CheckoutStepper current={1} />

      {/* Mobile collapsible summary */}
      <div className="lg:hidden mb-4 rounded-[8px] border border-[#1f1f1f] bg-[#111111] overflow-hidden">
        <button
          type="button"
          onClick={() => setSummaryOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
        >
          <span className="text-xs text-[#9ca3af]">
            {items.length} {items.length === 1 ? "item" : "itens"} no pedido
          </span>
          <div className="flex items-center gap-2">
            <PriceDisplay cents={subtotal} className="text-sm font-bold text-white" />
            <ChevronDown
              size={14}
              className={cn("text-[#4a4a4a] transition-transform duration-200", summaryOpen && "rotate-180")}
            />
          </div>
        </button>
        {summaryOpen && (
          <div className="border-t border-[#1f1f1f] px-4 py-3 space-y-2">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between gap-2 text-xs">
                <span className="text-[#9ca3af] line-clamp-1 flex-1">
                  {item.quantity}× {item.name}
                </span>
                <PriceDisplay cents={item.price * item.quantity} className="text-white font-medium flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 flex flex-col gap-5">
          {/* Personal data */}
          <div className="rounded-[8px] border border-[#1f1f1f] bg-[#111111] p-4 sm:p-6">
            <h2 className="text-base font-semibold text-white mb-5">Dados Pessoais</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Nome completo *"
                  placeholder="Seu nome"
                  value={address.name ?? ""}
                  onChange={(e) => setAddress({ name: e.target.value })}
                />
              </div>
              <Input
                label="E-mail *"
                type="email"
                placeholder="seu@email.com"
                value={address.email ?? ""}
                onChange={(e) => setAddress({ email: e.target.value })}
              />
              <Input
                label="Telefone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={address.phone ?? ""}
                onChange={(e) => setAddress({ phone: e.target.value })}
              />
              <div className="sm:col-span-2">
                <Input
                  label="CPF (opcional)"
                  placeholder="000.000.000-00"
                  value={address.cpf ?? ""}
                  onChange={(e) => setAddress({ cpf: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="rounded-[8px] border border-[#1f1f1f] bg-[#111111] p-4 sm:p-6">
            <h2 className="text-base font-semibold text-white mb-5">Endereço de Entrega</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* CEP */}
              <div className="sm:col-span-2 relative">
                <Input
                  label="CEP *"
                  placeholder="00000-000"
                  value={address.cep ?? ""}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2");
                    setAddress({ cep: v });
                    if (v.replace(/\D/g, "").length === 8) handleCepLookup(v);
                  }}
                  error={cepError}
                  className="pr-10"
                />
                <div className="absolute right-3 bottom-3">
                  {cepLoading ? (
                    <Loader2 size={14} className="text-[#9ca3af] animate-spin" />
                  ) : (
                    <Search size={14} className="text-[#4a4a4a]" />
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Logradouro *"
                  placeholder="Rua, Avenida..."
                  value={address.logradouro ?? ""}
                  onChange={(e) => setAddress({ logradouro: e.target.value })}
                />
              </div>

              <Input
                label="Número *"
                placeholder="123"
                value={address.numero ?? ""}
                onChange={(e) => setAddress({ numero: e.target.value })}
              />
              <Input
                label="Complemento"
                placeholder="Apto, bloco..."
                value={address.complemento ?? ""}
                onChange={(e) => setAddress({ complemento: e.target.value })}
              />
              <Input
                label="Bairro *"
                placeholder="Seu bairro"
                value={address.bairro ?? ""}
                onChange={(e) => setAddress({ bairro: e.target.value })}
              />
              <Input
                label="Cidade *"
                placeholder="Sua cidade"
                value={address.cidade ?? ""}
                onChange={(e) => setAddress({ cidade: e.target.value })}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Estado (UF) *"
                  placeholder="SP"
                  maxLength={2}
                  value={address.estado ?? ""}
                  onChange={(e) => setAddress({ estado: e.target.value.toUpperCase() })}
                  className="uppercase"
                />
              </div>
            </div>
          </div>

          {/* Coupon */}
          <CouponInput />

          {formError && (
            <p className="text-sm text-[#dc2626] text-center">{formError}</p>
          )}

          <Button type="submit" size="lg" className="w-full">
            Continuar para Entrega
          </Button>
        </form>

        {/* Desktop order summary */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="rounded-[8px] border border-[#1f1f1f] bg-[#111111] p-5 sticky top-24">
            <h2 className="text-sm font-semibold text-white mb-4">
              Seu pedido ({items.length} {items.length === 1 ? "item" : "itens"})
            </h2>
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between gap-2 text-xs">
                  <span className="text-[#9ca3af] line-clamp-2 flex-1">
                    {item.quantity}× {item.name}
                  </span>
                  <PriceDisplay cents={item.price * item.quantity} className="text-white font-medium flex-shrink-0" />
                </div>
              ))}
            </div>
            <div className="h-px bg-[#1f1f1f] my-4" />
            <div className="flex justify-between text-sm">
              <span className="text-[#9ca3af]">Subtotal</span>
              <PriceDisplay cents={subtotal} className="text-white font-bold" />
            </div>
            <div className="flex justify-between text-xs mt-2">
              <span className="text-[#9ca3af]">Frete</span>
              <span className="text-[#9ca3af]">+ cálculo na etapa 2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#0a0a0a]/96 backdrop-blur-md border-t border-[#1f1f1f] px-4 pt-3"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[10px] text-[#9ca3af] uppercase tracking-wider leading-none mb-0.5">Subtotal</p>
            <PriceDisplay cents={subtotal} className="text-sm font-bold text-white" />
          </div>
          <Button
            type="button"
            size="lg"
            className="flex-1 h-11 text-sm"
            onClick={() => {
              const required = ["name", "email", "cep", "logradouro", "numero", "bairro", "cidade", "estado"] as const;
              for (const field of required) {
                if (!address[field]) {
                  setFormError("Preencha todos os campos obrigatórios.");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  return;
                }
              }
              setFormError("");
              router.push("/checkout/entrega");
            }}
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
