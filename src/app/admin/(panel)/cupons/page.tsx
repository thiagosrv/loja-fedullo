"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, X, AlertCircle, Ticket, ToggleLeft, ToggleRight } from "lucide-react";

interface Coupon {
  id: string; code: string; description: string | null;
  type: "PERCENTAGE" | "FIXED"; value: number;
  minOrderCents: number | null; maxUsage: number | null; usageCount: number;
  active: boolean; expiresAt: string | null; createdAt: string;
}

function fmt(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CuponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Coupon | null>(null);

  const [form, setForm] = useState({
    code: "", description: "", type: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    value: "", minOrderCents: "", maxUsage: "", active: true, expiresAt: "",
  });

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      setCoupons(data.coupons ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function createCoupon() {
    if (!form.code || !form.value) { setError("Código e valor são obrigatórios"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          description: form.description || null,
          type: form.type,
          value: form.type === "FIXED"
            ? Math.round(parseFloat(form.value.replace(",", ".")) * 100)
            : parseInt(form.value),
          minOrderCents: form.minOrderCents ? Math.round(parseFloat(form.minOrderCents.replace(",", ".")) * 100) : null,
          maxUsage: form.maxUsage ? parseInt(form.maxUsage) : null,
          active: form.active,
          expiresAt: form.expiresAt || null,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ code: "", description: "", type: "PERCENTAGE", value: "", minOrderCents: "", maxUsage: "", active: true, expiresAt: "" });
        load();
      } else {
        const d = await res.json(); setError(d.error ?? "Erro ao criar cupom");
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(coupon: Coupon) {
    await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !coupon.active }),
    });
    load();
  }

  async function deleteCoupon() {
    if (!toDelete) return;
    await fetch(`/api/admin/coupons/${toDelete.id}`, { method: "DELETE" });
    setToDelete(null);
    load();
  }

  const inputCls = "h-9 rounded-[6px] border border-[#2a2a2a] bg-[#111] px-3 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#dc2626] transition-colors w-full";

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cupons de Desconto</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">{coupons.length} cupom(ns) cadastrado(s)</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 h-9 px-4 rounded-[6px] bg-[#dc2626] text-white text-sm font-semibold hover:bg-[#b91c1c] transition-colors cursor-pointer"
        >
          <Plus size={15} /> Novo Cupom
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-[6px] border border-[#dc2626]/30 bg-[#dc2626]/10 px-4 py-3 text-sm text-[#f87171]">
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError("")} className="ml-auto cursor-pointer"><X size={14} /></button>
        </div>
      )}

      {/* New coupon form */}
      {showForm && (
        <div className="rounded-[10px] border border-[#dc2626]/30 bg-[#0a0a0a] p-6">
          <h3 className="text-sm font-semibold text-white mb-5">Criar Novo Cupom</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs text-[#9ca3af] mb-1.5">Código do Cupom *</label>
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                className={inputCls} placeholder="EX: FEDULLO10" />
            </div>

            <div>
              <label className="block text-xs text-[#9ca3af] mb-1.5">Tipo de Desconto *</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as "PERCENTAGE" | "FIXED" }))}
                className={`${inputCls} cursor-pointer`}>
                <option value="PERCENTAGE">Percentual (%)</option>
                <option value="FIXED">Valor fixo (R$)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#9ca3af] mb-1.5">
                Valor {form.type === "PERCENTAGE" ? "(%)" : "(R$)"} *
              </label>
              <input value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                className={inputCls} placeholder={form.type === "PERCENTAGE" ? "10" : "50,00"} type="text" />
            </div>

            <div>
              <label className="block text-xs text-[#9ca3af] mb-1.5">Pedido Mínimo (R$)</label>
              <input value={form.minOrderCents} onChange={e => setForm(f => ({ ...f, minOrderCents: e.target.value }))}
                className={inputCls} placeholder="Sem mínimo" type="text" />
            </div>

            <div>
              <label className="block text-xs text-[#9ca3af] mb-1.5">Limite de Usos</label>
              <input value={form.maxUsage} onChange={e => setForm(f => ({ ...f, maxUsage: e.target.value }))}
                className={inputCls} placeholder="Ilimitado" type="number" min="1" />
            </div>

            <div>
              <label className="block text-xs text-[#9ca3af] mb-1.5">Validade</label>
              <input value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                className={`${inputCls} cursor-pointer`} type="datetime-local" />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs text-[#9ca3af] mb-1.5">Descrição interna</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className={inputCls} placeholder="Ex: Cupom de lançamento" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                className="w-4 h-4 rounded accent-[#dc2626] cursor-pointer" />
              <span className="text-sm text-[#9ca3af]">Cupom ativo imediatamente</span>
            </label>

            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)}
                className="h-9 px-4 rounded-[6px] border border-[#2a2a2a] text-sm text-[#9ca3af] hover:border-[#4b5563] cursor-pointer transition-colors">
                Cancelar
              </button>
              <button onClick={createCoupon} disabled={saving}
                className="h-9 px-5 rounded-[6px] bg-[#dc2626] text-white text-sm font-semibold hover:bg-[#b91c1c] disabled:opacity-50 cursor-pointer transition-colors">
                {saving ? "Criando..." : "Criar Cupom"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupons table */}
      <div className="rounded-[10px] border border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-[#4b5563]">Carregando...</div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket size={32} className="text-[#2a2a2a] mx-auto mb-3" />
            <p className="text-[#4b5563] text-sm">Nenhum cupom cadastrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Código</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Desconto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide hidden md:table-cell">Mínimo</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide hidden sm:table-cell">Usos</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide hidden lg:table-cell">Validade</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => {
                  const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
                  const exhausted = c.maxUsage !== null && c.usageCount >= c.maxUsage;
                  const isValid = c.active && !expired && !exhausted;

                  return (
                    <tr key={c.id} className="border-b border-[#111] hover:bg-[#111]/40 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <code className="font-bold text-white bg-[#1a1a1a] px-2 py-0.5 rounded text-sm">{c.code}</code>
                          {c.description && <p className="text-xs text-[#4b5563] mt-0.5">{c.description}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-[#dc2626]">
                          {c.type === "PERCENTAGE" ? `${c.value}%` : fmt(c.value)}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-[#6b7280]">
                        {c.minOrderCents ? fmt(c.minOrderCents) : "—"}
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className="text-sm text-white">
                          {c.usageCount}
                          {c.maxUsage !== null && <span className="text-[#4b5563]">/{c.maxUsage}</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-[#6b7280] text-xs">
                        {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("pt-BR") : "Sem validade"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleActive(c)} className="cursor-pointer">
                          {isValid ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                              <ToggleRight size={12} /> Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#6b7280] bg-[#1a1a1a] px-2 py-0.5 rounded-full">
                              <ToggleLeft size={12} /> {expired ? "Expirado" : exhausted ? "Esgotado" : "Inativo"}
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <button onClick={() => setToDelete(c)}
                            className="p-2 rounded text-[#6b7280] hover:text-[#f87171] hover:bg-[#dc2626]/10 cursor-pointer transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete modal */}
      {toDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="rounded-[10px] border border-[#2a2a2a] bg-[#0a0a0a] p-6 max-w-sm w-full">
            <h3 className="font-semibold text-white mb-2">Excluir cupom</h3>
            <p className="text-sm text-[#9ca3af] mb-6">
              Excluir o cupom <code className="text-white bg-[#1a1a1a] px-1.5 py-0.5 rounded">{toDelete.code}</code>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setToDelete(null)}
                className="flex-1 h-9 rounded-[6px] border border-[#2a2a2a] text-sm text-[#9ca3af] hover:border-[#4b5563] cursor-pointer transition-colors">
                Cancelar
              </button>
              <button onClick={deleteCoupon}
                className="flex-1 h-9 rounded-[6px] bg-[#dc2626] text-white text-sm font-semibold hover:bg-[#b91c1c] cursor-pointer transition-colors">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
