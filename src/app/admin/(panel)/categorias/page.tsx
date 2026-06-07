"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Check, AlertCircle } from "lucide-react";

interface Category { id: string; name: string; slug: string; description: string | null; _count: { products: number } }

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // New category form
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Delete confirmation
  const [toDelete, setToDelete] = useState<Category | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.categories ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function createCategory() {
    if (!newName.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() }),
      });
      if (res.ok) {
        setNewName(""); setNewDesc(""); setShowNew(false);
        load();
      } else {
        const d = await res.json();
        setError(d.error ?? "Erro ao criar categoria");
      }
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(id: string) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), description: editDesc.trim() }),
      });
      if (res.ok) { setEditing(null); load(); }
      else { const d = await res.json(); setError(d.error ?? "Erro ao atualizar"); }
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory() {
    if (!toDelete) return;
    const res = await fetch(`/api/admin/categories/${toDelete.id}`, { method: "DELETE" });
    if (res.ok) { setToDelete(null); load(); }
    else { const d = await res.json(); setError(d.error ?? "Erro ao excluir"); setToDelete(null); }
  }

  const inputCls = "h-9 rounded-[6px] border border-[#2a2a2a] bg-[#111] px-3 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#dc2626] transition-colors";

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categorias</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">{categories.length} categoria(s)</p>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-2 h-9 px-4 rounded-[6px] bg-[#dc2626] text-white text-sm font-semibold hover:bg-[#b91c1c] transition-colors cursor-pointer"
        >
          <Plus size={15} /> Nova Categoria
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-[6px] border border-[#dc2626]/30 bg-[#dc2626]/10 px-4 py-3 text-sm text-[#f87171]">
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError("")} className="ml-auto cursor-pointer"><X size={14} /></button>
        </div>
      )}

      {/* New category form */}
      {showNew && (
        <div className="rounded-[10px] border border-[#dc2626]/30 bg-[#0a0a0a] p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Nova Categoria</h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-[#9ca3af] mb-1.5">Nome *</label>
              <input value={newName} onChange={e => setNewName(e.target.value)}
                className={`${inputCls} w-full`} placeholder="Ex: Chicotes" />
            </div>
            <div>
              <label className="block text-xs text-[#9ca3af] mb-1.5">Descrição</label>
              <input value={newDesc} onChange={e => setNewDesc(e.target.value)}
                className={`${inputCls} w-full`} placeholder="Breve descrição..." />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setShowNew(false); setNewName(""); setNewDesc(""); }}
              className="h-9 px-4 rounded-[6px] border border-[#2a2a2a] text-sm text-[#9ca3af] hover:border-[#4b5563] transition-colors cursor-pointer">
              Cancelar
            </button>
            <button onClick={createCategory} disabled={saving || !newName.trim()}
              className="h-9 px-5 rounded-[6px] bg-[#dc2626] text-white text-sm font-semibold hover:bg-[#b91c1c] disabled:opacity-50 cursor-pointer transition-colors">
              {saving ? "Criando..." : "Criar Categoria"}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-[10px] border border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-[#4b5563]">Carregando...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide hidden md:table-cell">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide hidden sm:table-cell">Descrição</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Produtos</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="border-b border-[#111] hover:bg-[#111]/40 transition-colors">
                  <td className="px-4 py-3">
                    {editing === cat.id ? (
                      <input value={editName} onChange={e => setEditName(e.target.value)}
                        className={`${inputCls} w-full max-w-[180px]`} autoFocus />
                    ) : (
                      <span className="font-medium text-white">{cat.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <code className="text-xs text-[#6b7280] bg-[#1a1a1a] px-2 py-0.5 rounded">{cat.slug}</code>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {editing === cat.id ? (
                      <input value={editDesc} onChange={e => setEditDesc(e.target.value)}
                        className={`${inputCls} w-full max-w-[200px]`} placeholder="Descrição" />
                    ) : (
                      <span className="text-[#6b7280] truncate">{cat.description ?? "—"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs font-medium text-white bg-[#1a1a1a] px-2 py-0.5 rounded-full">
                      {cat._count.products}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {editing === cat.id ? (
                        <>
                          <button onClick={() => saveEdit(cat.id)} disabled={saving}
                            className="p-2 rounded text-green-400 hover:bg-green-400/10 cursor-pointer transition-colors">
                            <Check size={14} />
                          </button>
                          <button onClick={() => setEditing(null)}
                            className="p-2 rounded text-[#6b7280] hover:bg-[#1a1a1a] cursor-pointer transition-colors">
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditing(cat.id); setEditName(cat.name); setEditDesc(cat.description ?? ""); }}
                            className="p-2 rounded text-[#6b7280] hover:text-white hover:bg-[#1a1a1a] cursor-pointer transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setToDelete(cat)}
                            disabled={cat._count.products > 0}
                            className="p-2 rounded text-[#6b7280] hover:text-[#f87171] hover:bg-[#dc2626]/10 cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title={cat._count.products > 0 ? "Mova os produtos antes de excluir" : "Excluir"}>
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete confirmation */}
      {toDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="rounded-[10px] border border-[#2a2a2a] bg-[#0a0a0a] p-6 max-w-sm w-full">
            <h3 className="font-semibold text-white mb-2">Excluir categoria</h3>
            <p className="text-sm text-[#9ca3af] mb-6">
              Excluir <strong className="text-white">{toDelete.name}</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setToDelete(null)}
                className="flex-1 h-9 rounded-[6px] border border-[#2a2a2a] text-sm text-[#9ca3af] hover:border-[#4b5563] cursor-pointer transition-colors">
                Cancelar
              </button>
              <button onClick={deleteCategory}
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
