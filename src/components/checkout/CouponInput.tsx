"use client";

import { useState } from "react";
import { Tag, X, Loader2, CheckCircle } from "lucide-react";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useCartStore } from "@/store/cartStore";
import { PriceDisplay } from "@/components/shared/PriceDisplay";

export function CouponInput() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { coupon, setCoupon } = useCheckoutStore();
  const { subtotalCents } = useCartStore();

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed, subtotalCents: subtotalCents() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Cupom inválido.");
        return;
      }

      setCoupon({
        code: data.coupon.code,
        type: data.coupon.type,
        value: data.coupon.value,
        description: data.coupon.description,
        discountCents: data.discountCents,
      });
      setCode("");
      setError("");
    } catch {
      setError("Erro ao validar cupom. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCoupon(null);
    setCode("");
    setError("");
  };

  /* Coupon applied state */
  if (coupon) {
    return (
      <div className="rounded-[8px] border border-[#dc2626]/30 bg-[#dc2626]/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle size={16} className="text-[#dc2626] flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">
                <span className="text-[#dc2626]">{coupon.code}</span> aplicado
              </p>
              {coupon.description && (
                <p className="text-xs text-[#9ca3af] truncate">{coupon.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-sm font-bold text-green-400">
              −<PriceDisplay cents={coupon.discountCents} className="inline" />
            </span>
            <button
              onClick={handleRemove}
              aria-label="Remover cupom"
              className="text-[#4a4a4a] hover:text-[#9ca3af] transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[8px] border border-[#1f1f1f] bg-[#111111] p-5">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <Tag size={14} className="text-[#dc2626]" />
        Cupom de desconto
      </h3>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (error) setError("");
          }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleApply(); } }}
          placeholder="CÓDIGO DO CUPOM"
          className="flex-1 bg-[#0a0a0a] border border-[#2a2a2a] rounded-[6px] px-3 py-2.5 text-sm text-white placeholder:text-[#3a3a3a] uppercase tracking-wider outline-none focus:border-[#dc2626]/40 transition-colors"
        />
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="px-4 py-2.5 rounded-[6px] bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : "Aplicar"}
        </button>
      </div>
      {error && (
        <p className="text-xs text-[#dc2626] mt-2">{error}</p>
      )}
    </div>
  );
}
