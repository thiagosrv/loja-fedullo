"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Pencil, Trash2, Star, Tag, AlertCircle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  onSale: boolean;
  stock: number;
  featured: boolean;
  active: boolean;
  sku: string | null;
  category: { name: string };
  images: { url: string }[];
}

function fmt(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      setProducts(data.products ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  async function toggleField(id: string, field: "featured" | "active" | "onSale", value: boolean) {
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    load();
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(toDelete.id);
    await fetch(`/api/admin/products/${toDelete.id}`, { method: "DELETE" });
    setToDelete(null);
    setDeleting(null);
    load();
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Produtos</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">{total} produto(s) encontrado(s)</p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="flex items-center gap-2 h-9 px-4 rounded-[6px] bg-[#dc2626] text-white text-sm font-semibold hover:bg-[#b91c1c] transition-colors cursor-pointer w-fit"
        >
          <Plus size={15} /> Novo Produto
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5563]" />
        <input
          type="text"
          placeholder="Buscar por nome ou SKU..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full h-10 pl-9 pr-4 rounded-[6px] border border-[#2a2a2a] bg-[#0a0a0a] text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#dc2626] transition-colors max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-[10px] border border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Produto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide hidden md:table-cell">Categoria</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Preço</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide hidden sm:table-cell">Estoque</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide hidden lg:table-cell">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#111] animate-pulse">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-[4px] bg-[#1a1a1a]" /><div className="h-4 w-32 rounded bg-[#1a1a1a]" /></div></td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-20 rounded bg-[#1a1a1a]" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-[#1a1a1a]" /></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 w-8 rounded bg-[#1a1a1a] mx-auto" /></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-16 rounded bg-[#1a1a1a] mx-auto" /></td>
                    <td className="px-4 py-3"><div className="h-8 w-20 rounded bg-[#1a1a1a] ml-auto" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle size={24} className="text-[#374151]" />
                      <span className="text-[#4b5563] text-sm">Nenhum produto encontrado</span>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className="border-b border-[#111] hover:bg-[#111]/40 transition-colors">
                    {/* Name + image */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[4px] bg-[#1a1a1a] overflow-hidden flex-shrink-0 relative">
                          {p.images[0] ? (
                            <Image src={p.images[0].url} alt={p.name} fill className="object-cover" sizes="40px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Tag size={12} className="text-[#374151]" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate max-w-[180px]">{p.name}</p>
                          {p.sku && <p className="text-xs text-[#4b5563]">{p.sku}</p>}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-[#9ca3af] text-xs bg-[#1a1a1a] px-2 py-0.5 rounded-full">
                        {p.category.name}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3">
                      <div>
                        {p.onSale && p.salePrice ? (
                          <>
                            <p className="font-semibold text-[#dc2626]">{fmt(p.salePrice)}</p>
                            <p className="text-xs text-[#4b5563] line-through">{fmt(p.price)}</p>
                          </>
                        ) : (
                          <p className="font-semibold text-white">{fmt(p.price)}</p>
                        )}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        p.stock === 0 ? "text-red-400 bg-red-400/10" :
                        p.stock <= 5 ? "text-yellow-400 bg-yellow-400/10" :
                        "text-green-400 bg-green-400/10"
                      }`}>
                        {p.stock}
                      </span>
                    </td>

                    {/* Badges */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => toggleField(p.id, "featured", !p.featured)}
                          title={p.featured ? "Remover destaque" : "Destacar"}
                          className={`p-1 rounded transition-colors cursor-pointer ${p.featured ? "text-yellow-400" : "text-[#374151] hover:text-yellow-400"}`}
                        >
                          <Star size={14} fill={p.featured ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={() => toggleField(p.id, "onSale", !p.onSale)}
                          title={p.onSale ? "Remover promoção" : "Colocar em promoção"}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors ${p.onSale ? "bg-[#dc2626]/20 text-[#dc2626]" : "bg-[#1a1a1a] text-[#4b5563] hover:text-[#dc2626]"}`}
                        >
                          PROMO
                        </button>
                        <button
                          onClick={() => toggleField(p.id, "active", !p.active)}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors ${p.active ? "bg-green-400/10 text-green-400" : "bg-[#1a1a1a] text-[#4b5563]"}`}
                        >
                          {p.active ? "ATIVO" : "INATIVO"}
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/produtos/${p.id}`}
                          className="p-2 rounded-[4px] text-[#6b7280] hover:text-white hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          onClick={() => setToDelete(p)}
                          disabled={deleting === p.id}
                          className="p-2 rounded-[4px] text-[#6b7280] hover:text-[#f87171] hover:bg-[#dc2626]/10 transition-colors cursor-pointer disabled:opacity-40"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1a1a1a]">
            <p className="text-xs text-[#4b5563]">
              Mostrando {(page - 1) * limit + 1}–{Math.min(page * limit, total)} de {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-7 px-3 rounded text-xs text-[#6b7280] border border-[#2a2a2a] hover:border-[#4b5563] disabled:opacity-40 cursor-pointer transition-colors"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-7 px-3 rounded text-xs text-[#6b7280] border border-[#2a2a2a] hover:border-[#4b5563] disabled:opacity-40 cursor-pointer transition-colors"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {toDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="rounded-[10px] border border-[#2a2a2a] bg-[#0a0a0a] p-6 max-w-sm w-full">
            <h3 className="font-semibold text-white mb-2">Confirmar exclusão</h3>
            <p className="text-sm text-[#9ca3af] mb-6">
              Tem certeza que deseja excluir <strong className="text-white">{toDelete.name}</strong>?
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setToDelete(null)}
                className="flex-1 h-9 rounded-[6px] border border-[#2a2a2a] text-sm text-[#9ca3af] hover:border-[#4b5563] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 h-9 rounded-[6px] bg-[#dc2626] text-white text-sm font-semibold hover:bg-[#b91c1c] transition-colors cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
