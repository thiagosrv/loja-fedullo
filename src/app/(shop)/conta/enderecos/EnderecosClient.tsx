"use client";

import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2, Star, Loader2, X, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Address } from "@/generated/prisma/client";

interface Props {
  userId: string;
  initialAddresses: Address[];
}

const EMPTY_FORM = {
  name: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  isDefault: false,
};

export function EnderecosClient({ userId, initialAddresses }: Props) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [error, setError] = useState("");

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  function openNew() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  }

  function openEdit(addr: Address) {
    setEditing(addr);
    setForm({
      name: addr.name,
      cep: addr.cep,
      logradouro: addr.logradouro,
      numero: addr.numero,
      complemento: addr.complemento ?? "",
      bairro: addr.bairro,
      cidade: addr.cidade,
      estado: addr.estado,
      isDefault: addr.isDefault,
    });
    setError("");
    setShowForm(true);
  }

  async function handleCepLookup(cep: string) {
    const cleaned = cep.replace(/\D/g, "");
    if (cleaned.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`/api/cep?cep=${cleaned}`);
      if (!res.ok) return;
      const data = await res.json();
      setForm((f) => ({
        ...f,
        cep: data.cep,
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
      }));
    } finally {
      setCepLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const required = ["name", "cep", "logradouro", "numero", "bairro", "cidade", "estado"] as const;
    for (const field of required) {
      if (!form[field]) {
        setError("Preencha todos os campos obrigatórios.");
        setLoading(false);
        return;
      }
    }

    const res = await fetch("/api/conta/enderecos", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, id: editing?.id, userId }),
    });

    if (!res.ok) {
      setError("Erro ao salvar endereço.");
      setLoading(false);
      return;
    }

    const { address, addresses: updated } = await res.json();
    if (updated) {
      setAddresses(updated);
    } else if (address) {
      setAddresses((prev) => {
        if (editing) return prev.map((a) => (a.id === address.id ? address : a));
        return [...prev, address];
      });
    }

    setShowForm(false);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este endereço?")) return;
    await fetch(`/api/conta/enderecos?id=${id}`, { method: "DELETE" });
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleSetDefault(id: string) {
    const res = await fetch("/api/conta/enderecos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isDefault: true }),
    });
    if (res.ok) {
      const { addresses: updated } = await res.json();
      if (updated) setAddresses(updated);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Endereços</h1>
          <p className="text-sm text-[#6b7280] mt-1">
            {addresses.length} endereço{addresses.length !== 1 ? "s" : ""} salvo{addresses.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button size="sm" onClick={openNew} className="gap-1.5">
          <Plus size={14} />
          Novo
        </Button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[12px] border border-[#1f1f1f] bg-[#0d0d0d] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">
                {editing ? "Editar endereço" : "Novo endereço"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#6b7280] hover:text-white hover:bg-[#1a1a1a] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <Input
                label="Identificação *"
                placeholder="Ex: Casa, Trabalho…"
                value={form.name}
                onChange={set("name")}
                required
              />

              <div className="relative">
                <Input
                  label="CEP *"
                  placeholder="00000-000"
                  value={form.cep}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2");
                    setForm((f) => ({ ...f, cep: v }));
                    if (v.replace(/\D/g, "").length === 8) handleCepLookup(v);
                  }}
                  className="pr-10"
                  required
                />
                <div className="absolute right-3 bottom-3">
                  {cepLoading ? (
                    <Loader2 size={14} className="text-[#9ca3af] animate-spin" />
                  ) : (
                    <Search size={14} className="text-[#4a4a4a]" />
                  )}
                </div>
              </div>

              <Input label="Logradouro *" placeholder="Rua, Avenida…" value={form.logradouro} onChange={set("logradouro")} required />

              <div className="grid grid-cols-2 gap-3">
                <Input label="Número *" placeholder="123" value={form.numero} onChange={set("numero")} required />
                <Input label="Complemento" placeholder="Apto, bloco…" value={form.complemento} onChange={set("complemento")} />
              </div>

              <Input label="Bairro *" placeholder="Seu bairro" value={form.bairro} onChange={set("bairro")} required />

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Input label="Cidade *" placeholder="Sua cidade" value={form.cidade} onChange={set("cidade")} required />
                </div>
                <Input
                  label="UF *"
                  placeholder="SP"
                  maxLength={2}
                  value={form.estado}
                  onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value.toUpperCase() }))}
                  className="uppercase"
                  required
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                  className="w-4 h-4 accent-[#dc2626] cursor-pointer"
                />
                <span className="text-sm text-[#9ca3af]">Definir como endereço padrão</span>
              </label>

              {error && (
                <div className="rounded-[8px] border border-[#dc2626]/30 bg-[#dc2626]/10 px-3 py-2.5 text-sm text-[#f87171]">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? <Loader2 size={14} className="animate-spin" /> : "Salvar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Address list */}
      {addresses.length === 0 ? (
        <div className="rounded-[10px] border border-[#1f1f1f] bg-[#0d0d0d] py-14 text-center">
          <MapPin size={32} className="text-[#2a2a2a] mx-auto mb-3" />
          <p className="text-sm text-[#6b7280]">Nenhum endereço cadastrado.</p>
          <button
            onClick={openNew}
            className="mt-3 text-sm text-[#dc2626] hover:underline"
          >
            Adicionar endereço
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`rounded-[10px] border bg-[#0d0d0d] p-5 ${
                addr.isDefault ? "border-[#dc2626]/40" : "border-[#1f1f1f]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-white">{addr.name}</p>
                    {addr.isDefault && (
                      <span className="text-[10px] font-semibold text-[#dc2626] border border-[#dc2626]/40 px-2 py-0.5 rounded-full">
                        Padrão
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#9ca3af]">
                    {addr.logradouro}, {addr.numero}
                    {addr.complemento && `, ${addr.complemento}`}
                  </p>
                  <p className="text-xs text-[#6b7280] mt-0.5">
                    {addr.bairro} · {addr.cidade}/{addr.estado} · CEP {addr.cep}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      title="Definir como padrão"
                      className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#4a4a4a] hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors"
                    >
                      <Star size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(addr)}
                    className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#4a4a4a] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#4a4a4a] hover:text-[#dc2626] hover:bg-[#dc2626]/10 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
