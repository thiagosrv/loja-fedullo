"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";

interface Tag {
  id: string;
  name: string;
  type: string;
  color: string;
  active: boolean;
  createdAt: string;
}

const TAG_TYPES = [
  { value: "FRETE_GRATIS",   label: "Frete Grátis" },
  { value: "PROMOCAO",       label: "Promoção" },
  { value: "NOVO",           label: "Novo" },
  { value: "MAIS_VENDIDO",   label: "Mais Vendido" },
  { value: "GARANTIA",       label: "Garantia" },
  { value: "COMPATIBILIDADE",label: "Compatibilidade" },
  { value: "CUSTOM",         label: "Personalizado" },
];

const PRESET_COLORS = [
  "#dc2626", "#16a34a", "#2563eb", "#d97706",
  "#7c3aed", "#0891b2", "#be185d", "#374151",
];

const DEFAULT_FORM = { name: "", type: "CUSTOM", color: "#dc2626", active: true };

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const showToast = (type: "ok" | "err", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  async function loadTags() {
    setLoading(true);
    const res = await fetch("/api/admin/tags");
    const data = await res.json();
    setTags(data.tags ?? []);
    setLoading(false);
  }

  useEffect(() => { loadTags(); }, []);

  function openNew() {
    setEditId(null);
    setForm(DEFAULT_FORM);
    setShowForm(true);
  }

  function openEdit(tag: Tag) {
    setEditId(tag.id);
    setForm({ name: tag.name, type: tag.type, color: tag.color, active: tag.active });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setForm(DEFAULT_FORM);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const url    = editId ? `/api/admin/tags/${editId}` : "/api/admin/tags";
      const method = editId ? "PATCH" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showToast("ok", editId ? "Tag atualizada!" : "Tag criada!");
        closeForm();
        loadTags();
      } else {
        const d = await res.json();
        showToast("err", d.error ?? "Erro ao salvar");
      }
    } catch {
      showToast("err", "Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deletar esta tag?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/tags/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("ok", "Tag deletada");
        setTags(prev => prev.filter(t => t.id !== id));
      } else {
        showToast("err", "Erro ao deletar");
      }
    } catch {
      showToast("err", "Erro de conexão");
    } finally {
      setDeletingId(null);
    }
  }

  const inputCls   = "w-full h-9 rounded-[6px] border border-[#2a2a2a] bg-[#111] px-3 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#dc2626] transition-colors";
  const labelCls   = "block text-xs font-medium text-[#9ca3af] mb-1";

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tags</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">
            Gerencie as tags exibidas nos produtos da loja
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="flex items-center gap-2 h-9 px-4 rounded-[6px] bg-[#dc2626] text-white text-sm font-semibold hover:bg-[#b91c1c] transition-colors cursor-pointer"
        >
          <Plus size={15} /> Nova Tag
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`flex items-center gap-3 rounded-[6px] border px-4 py-3 text-sm ${
            toast.type === "ok"
              ? "border-green-500/30 bg-green-500/10 text-green-400"
              : "border-[#dc2626]/30 bg-[#dc2626]/10 text-[#f87171]"
          }`}
        >
          {toast.type === "ok" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-md rounded-[12px] border border-[#1f1f1f] bg-[#0a0a0a] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">
                {editId ? "Editar Tag" : "Nova Tag"}
              </h2>
              <button type="button" onClick={closeForm} className="w-7 h-7 flex items-center justify-center text-[#4b5563] hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className={labelCls}>Nome da tag *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={inputCls}
                  placeholder="Ex: Frete Grátis"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className={labelCls}>Tipo</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className={`${inputCls} appearance-none cursor-pointer`}
                >
                  {TAG_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Cor</label>
                {/* Preset swatches */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer hover:scale-110 ${
                        form.color === c ? "border-white scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                  {/* Custom color */}
                  <label className="w-7 h-7 rounded-full border-2 border-[#2a2a2a] overflow-hidden cursor-pointer hover:scale-110 transition-transform" title="Cor personalizada">
                    <input
                      type="color"
                      value={form.color}
                      onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                      className="w-8 h-8 -ml-0.5 -mt-0.5 cursor-pointer opacity-0 absolute"
                    />
                    <span className="block w-full h-full" style={{ backgroundColor: form.color }} />
                  </label>
                </div>
                {/* Preview */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-[#4b5563]">Preview:</span>
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-[4px] text-[11px] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: form.color }}
                  >
                    {form.name || "Tag"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-[6px] border border-[#2a2a2a] bg-[#111]">
                <div>
                  <p className="text-sm font-medium text-white">Ativa</p>
                  <p className="text-xs text-[#4b5563]">Tag aparece nos produtos</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.active ? "bg-green-500" : "bg-[#2a2a2a]"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.active ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button type="button" onClick={closeForm}
                  className="flex-1 h-9 rounded-[6px] border border-[#2a2a2a] text-sm text-[#9ca3af] hover:text-white hover:border-[#4b5563] transition-colors cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 h-9 rounded-[6px] bg-[#dc2626] text-white text-sm font-semibold hover:bg-[#b91c1c] disabled:opacity-50 cursor-pointer transition-colors flex items-center justify-center gap-2">
                  {saving && <Loader2 size={13} className="animate-spin" />}
                  {saving ? "Salvando..." : editId ? "Salvar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tag list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="text-[#dc2626] animate-spin" />
        </div>
      ) : tags.length === 0 ? (
        <div className="rounded-[10px] border border-[#1a1a1a] bg-[#0a0a0a] p-10 text-center">
          <p className="text-[#4b5563] text-sm">Nenhuma tag cadastrada ainda.</p>
          <button
            type="button"
            onClick={openNew}
            className="mt-4 h-9 px-5 rounded-[6px] border border-[#dc2626] text-sm text-[#dc2626] hover:bg-[#dc2626] hover:text-white transition-colors cursor-pointer"
          >
            Criar primeira tag
          </button>
        </div>
      ) : (
        <div className="rounded-[10px] border border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#4b5563] uppercase tracking-wider">
                  Tag
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#4b5563] uppercase tracking-wider hidden sm:table-cell">
                  Tipo
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#4b5563] uppercase tracking-wider hidden sm:table-cell">
                  Status
                </th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-[#111] transition-colors">
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-[4px] text-[11px] font-bold uppercase tracking-wider text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#9ca3af] hidden sm:table-cell">
                    {TAG_TYPES.find(t => t.value === tag.type)?.label ?? tag.type}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                        tag.active
                          ? "bg-green-500/10 text-green-400"
                          : "bg-[#1a1a1a] text-[#4b5563]"
                      }`}
                    >
                      {tag.active ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(tag)}
                        className="w-7 h-7 rounded flex items-center justify-center text-[#4b5563] hover:text-white hover:bg-[#1f1f1f] transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(tag.id)}
                        disabled={deletingId === tag.id}
                        className="w-7 h-7 rounded flex items-center justify-center text-[#4b5563] hover:text-[#dc2626] hover:bg-[#dc2626]/10 transition-colors cursor-pointer disabled:opacity-40"
                        title="Deletar"
                      >
                        {deletingId === tag.id
                          ? <Loader2 size={13} className="animate-spin" />
                          : <Trash2 size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
