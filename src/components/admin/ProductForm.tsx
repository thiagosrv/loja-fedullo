"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Upload, X, GripVertical, Star, Tag as TagIcon, AlertCircle,
  CheckCircle, Loader2, ChevronDown,
} from "lucide-react";

interface Category { id: string; name: string }
interface Brand { id: string; name: string; slug: string }
interface TagOption { id: string; name: string; color: string; type: string }
interface ProductImage { id?: string; url: string; file?: File }

interface ProductFormProps {
  productId?: string;
  initialData?: {
    name: string; subtitle?: string | null; description: string;
    dimensions?: string | null; observations?: string | null;
    price: number; salePrice?: number | null;
    onSale: boolean; saleEndsAt?: string | null; stock: number; sku?: string | null;
    featured: boolean; active: boolean; categoryId: string;
    brandIds: string[]; imageUrls: string[]; tagIds?: string[];
  };
}

function centsToReais(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}
function reaisToCents(str: string): number {
  return Math.round(parseFloat(str.replace(",", ".").replace(/[^\d.]/g, "")) * 100) || 0;
}

export function ProductForm({ productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!productId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form fields
  const [name, setName] = useState(initialData?.name ?? "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [dimensions, setDimensions] = useState(initialData?.dimensions ?? "");
  const [observations, setObservations] = useState(initialData?.observations ?? "");
  const [price, setPrice] = useState(initialData?.price ? centsToReais(initialData.price) : "");
  const [salePrice, setSalePrice] = useState(initialData?.salePrice ? centsToReais(initialData.salePrice) : "");
  const [onSale, setOnSale] = useState(initialData?.onSale ?? false);
  const [saleEndsAt, setSaleEndsAt] = useState(initialData?.saleEndsAt ? initialData.saleEndsAt.slice(0, 16) : "");
  const [stock, setStock] = useState(String(initialData?.stock ?? 0));
  const [sku, setSku] = useState(initialData?.sku ?? "");
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [active, setActive] = useState(initialData?.active ?? true);
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? "");
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialData?.brandIds ?? []);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tagIds ?? []);
  const [images, setImages] = useState<ProductImage[]>(
    (initialData?.imageUrls ?? []).map(url => ({ url }))
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/categories").then(r => r.json()).then(d => setCategories(d.categories ?? []));
    fetch("/api/admin/brands").then(r => r.json()).then(d => setBrands(d.brands ?? [])).catch(() => {
      setBrands([
        { id: "brand_vw",   name: "Volkswagen", slug: "volkswagen" },
        { id: "brand_ford", name: "Ford",        slug: "ford" },
        { id: "brand_chev", name: "Chevrolet",   slug: "chevrolet" },
        { id: "brand_fiat", name: "Fiat",        slug: "fiat" },
      ]);
    });
    fetch("/api/admin/tags").then(r => r.json()).then(d => {
      setAvailableTags((d.tags ?? []).filter((t: TagOption & { active?: boolean }) => t.active !== false));
    }).catch(() => {});
  }, []);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    if (!fileArr.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      fileArr.forEach(f => formData.append("files", f));
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.urls) {
        setImages(prev => [...prev, ...data.urls.map((url: string) => ({ url }))]);
      } else {
        setError(data.error ?? "Erro no upload");
      }
    } catch {
      setError("Falha no upload das imagens");
    } finally {
      setUploading(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dropRef.current?.classList.remove("border-[#dc2626]");
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  function removeImage(idx: number) {
    setImages(prev => prev.filter((_, i) => i !== idx));
  }
  function moveImage(from: number, to: number) {
    setImages(prev => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !categoryId || !price) {
      setError("Preencha nome, categoria e preço");
      return;
    }
    setLoading(true);
    setError("");

    const body = {
      name:         name.trim(),
      subtitle:     subtitle.trim() || null,
      description:  description.trim(),
      dimensions:   dimensions.trim() || null,
      observations: observations.trim() || null,
      price:        reaisToCents(price),
      salePrice:    salePrice ? reaisToCents(salePrice) : null,
      onSale,
      saleEndsAt:   saleEndsAt || null,
      stock:        parseInt(stock) || 0,
      sku:          sku.trim() || null,
      featured,
      active,
      categoryId,
      brandIds:     selectedBrands,
      imageUrls:    images.map(img => img.url),
      tagIds:       selectedTags,
    };

    try {
      const url    = isEdit ? `/api/admin/products/${productId}` : "/api/admin/products";
      const method = isEdit ? "PATCH" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/admin/produtos"), 1200);
      } else {
        const data = await res.json();
        setError(data.error ?? "Erro ao salvar produto");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls    = "w-full h-10 rounded-[6px] border border-[#2a2a2a] bg-[#111] px-3 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#dc2626] transition-colors";
  const textareaCls = "w-full rounded-[6px] border border-[#2a2a2a] bg-[#111] px-3 py-2.5 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#dc2626] transition-colors resize-none";
  const labelCls    = "block text-xs font-medium text-[#9ca3af] mb-1.5";
  const sectionCls  = "rounded-[10px] border border-[#1a1a1a] bg-[#0a0a0a] p-6 space-y-4";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {success && (
        <div className="flex items-center gap-3 rounded-[6px] border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          <CheckCircle size={16} /> Produto salvo com sucesso! Redirecionando...
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 rounded-[6px] border border-[#dc2626]/30 bg-[#dc2626]/10 px-4 py-3 text-sm text-[#f87171]">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left: main info ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic info */}
          <div className={sectionCls}>
            <h2 className="text-sm font-semibold text-white border-b border-[#1a1a1a] pb-3 -mx-6 px-6">
              Informações Básicas
            </h2>

            <div>
              <label className={labelCls}>Nome do produto *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className={inputCls} placeholder="Ex: Chicote Painel Gol G3 Completo" required />
            </div>

            <div>
              <label className={labelCls}>Subtítulo <span className="text-[#4b5563]">(opcional)</span></label>
              <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)}
                className={inputCls} placeholder="Ex: Linha completa com suporte a módulo de injeção" />
            </div>

            <div>
              <label className={labelCls}>Descrição</label>
              <textarea
                value={description} onChange={e => setDescription(e.target.value)}
                rows={4} className={textareaCls}
                placeholder="Descreva o produto em detalhes..."
              />
            </div>

            <div>
              <label className={labelCls}>Dimensões <span className="text-[#4b5563]">(opcional)</span></label>
              <textarea
                value={dimensions} onChange={e => setDimensions(e.target.value)}
                rows={3} className={textareaCls}
                placeholder="Ex: Comprimento: 1,80m&#10;Peso: 320g&#10;Conector: 48 vias"
              />
            </div>

            <div>
              <label className={labelCls}>Observações <span className="text-[#4b5563]">(opcional)</span></label>
              <textarea
                value={observations} onChange={e => setObservations(e.target.value)}
                rows={3} className={textareaCls}
                placeholder="Ex: Requer módulo de injeção original VW. Não incluso."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Categoria *</label>
                <div className="relative">
                  <select
                    value={categoryId} onChange={e => setCategoryId(e.target.value)}
                    className={`${inputCls} appearance-none pr-8 cursor-pointer`} required
                  >
                    <option value="">Selecione...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b5563] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelCls}>SKU</label>
                <input type="text" value={sku} onChange={e => setSku(e.target.value)}
                  className={inputCls} placeholder="Código único" />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className={sectionCls}>
            <h2 className="text-sm font-semibold text-white border-b border-[#1a1a1a] pb-3 -mx-6 px-6">
              Preço
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Preço regular (R$) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5563] text-sm">R$</span>
                  <input type="text" value={price} onChange={e => setPrice(e.target.value)}
                    className={`${inputCls} pl-9`} placeholder="0,00" required />
                </div>
              </div>
              <div>
                <label className={labelCls}>Preço promocional (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5563] text-sm">R$</span>
                  <input type="text" value={salePrice} onChange={e => setSalePrice(e.target.value)}
                    className={`${inputCls} pl-9`} placeholder="0,00" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-[6px] border border-[#2a2a2a] bg-[#111]">
              <div>
                <p className="text-sm font-medium text-white">Em promoção</p>
                <p className="text-xs text-[#4b5563] mt-0.5">Exibe o preço promocional na loja</p>
              </div>
              <button
                type="button" onClick={() => setOnSale(!onSale)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${onSale ? "bg-[#dc2626]" : "bg-[#2a2a2a]"}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${onSale ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
            {onSale && (
              <div>
                <label className={labelCls}>Promoção válida até</label>
                <input type="datetime-local" value={saleEndsAt} onChange={e => setSaleEndsAt(e.target.value)}
                  className={`${inputCls} cursor-pointer`} />
              </div>
            )}
          </div>

          {/* Images */}
          <div className={sectionCls}>
            <h2 className="text-sm font-semibold text-white border-b border-[#1a1a1a] pb-3 -mx-6 px-6">
              Imagens do Produto
            </h2>
            <div
              ref={dropRef}
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); dropRef.current?.classList.add("border-[#dc2626]"); }}
              onDragLeave={() => dropRef.current?.classList.remove("border-[#dc2626]")}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#2a2a2a] rounded-[8px] p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-[#dc2626]/60 transition-colors"
            >
              {uploading ? (
                <Loader2 size={24} className="text-[#dc2626] animate-spin" />
              ) : (
                <Upload size={24} className="text-[#4b5563]" />
              )}
              <div className="text-center">
                <p className="text-sm text-[#9ca3af] font-medium">
                  {uploading ? "Enviando..." : "Arraste fotos aqui ou clique para selecionar"}
                </p>
                <p className="text-xs text-[#4b5563] mt-1">JPG, PNG, WebP · Máx 10MB por arquivo</p>
              </div>
              <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)} />
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="group relative aspect-square rounded-[6px] overflow-hidden bg-[#1a1a1a]">
                    <Image src={img.url} alt={`Imagem ${idx + 1}`} fill className="object-cover" sizes="120px" />
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-[#dc2626] text-white px-1.5 py-0.5 rounded">
                        CAPA
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {idx > 0 && (
                        <button type="button" onClick={() => moveImage(idx, idx - 1)}
                          className="w-7 h-7 rounded bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors cursor-pointer" title="Mover para frente">
                          <GripVertical size={13} />
                        </button>
                      )}
                      <button type="button" onClick={() => removeImage(idx)}
                        className="w-7 h-7 rounded bg-[#dc2626]/80 hover:bg-[#dc2626] flex items-center justify-center text-white transition-colors cursor-pointer">
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: settings ── */}
        <div className="space-y-6">
          {/* Visibility */}
          <div className={sectionCls}>
            <h2 className="text-sm font-semibold text-white border-b border-[#1a1a1a] pb-3 -mx-6 px-6">
              Visibilidade
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">Produto ativo</p>
                  <p className="text-xs text-[#4b5563]">Aparece na loja</p>
                </div>
                <button type="button" onClick={() => setActive(!active)}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${active ? "bg-green-500" : "bg-[#2a2a2a]"}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${active ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium flex items-center gap-1.5">
                    <Star size={13} className="text-yellow-400" /> Destaque
                  </p>
                  <p className="text-xs text-[#4b5563]">Aparece na seção em destaque</p>
                </div>
                <button type="button" onClick={() => setFeatured(!featured)}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${featured ? "bg-yellow-500" : "bg-[#2a2a2a]"}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${featured ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Stock */}
          <div className={sectionCls}>
            <h2 className="text-sm font-semibold text-white border-b border-[#1a1a1a] pb-3 -mx-6 px-6">
              Estoque
            </h2>
            <div>
              <label className={labelCls}>Quantidade em estoque</label>
              <input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)}
                className={inputCls} />
            </div>
          </div>

          {/* Brands */}
          <div className={sectionCls}>
            <h2 className="text-sm font-semibold text-white border-b border-[#1a1a1a] pb-3 -mx-6 px-6">
              <span className="flex items-center gap-2"><TagIcon size={14} /> Marcas Compatíveis</span>
            </h2>
            <div className="space-y-2">
              {brands.map(b => (
                <label key={b.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="checkbox" checked={selectedBrands.includes(b.id)}
                    onChange={e => setSelectedBrands(prev =>
                      e.target.checked ? [...prev, b.id] : prev.filter(id => id !== b.id)
                    )}
                    className="w-4 h-4 rounded border-[#2a2a2a] accent-[#dc2626] cursor-pointer"
                  />
                  <span className="text-sm text-[#9ca3af] group-hover:text-white transition-colors">{b.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className={sectionCls}>
            <h2 className="text-sm font-semibold text-white border-b border-[#1a1a1a] pb-3 -mx-6 px-6">
              <span className="flex items-center gap-2">
                <TagIcon size={14} className="text-[#dc2626]" /> Tags do Produto
              </span>
            </h2>
            {availableTags.length === 0 ? (
              <p className="text-xs text-[#4b5563]">
                Nenhuma tag cadastrada.{" "}
                <a href="/admin/tags" className="text-[#dc2626] hover:underline">
                  Criar tags
                </a>
              </p>
            ) : (
              <div className="space-y-2">
                {availableTags.map(tag => (
                  <label key={tag.id} className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="checkbox" checked={selectedTags.includes(tag.id)}
                      onChange={e => setSelectedTags(prev =>
                        e.target.checked ? [...prev, tag.id] : prev.filter(id => id !== tag.id)
                      )}
                      className="w-4 h-4 rounded border-[#2a2a2a] accent-[#dc2626] cursor-pointer"
                    />
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
            <a href="/admin/tags" className="block text-xs text-[#4b5563] hover:text-[#dc2626] transition-colors mt-1">
              + Gerenciar tags
            </a>
          </div>
        </div>
      </div>

      {/* Submit bar */}
      <div className="flex items-center gap-4 pt-2 border-t border-[#1a1a1a]">
        <button type="button" onClick={() => router.back()}
          className="h-10 px-5 rounded-[6px] border border-[#2a2a2a] text-sm text-[#9ca3af] hover:border-[#4b5563] hover:text-white transition-colors cursor-pointer">
          Cancelar
        </button>
        <button type="submit" disabled={loading || success}
          className="h-10 px-6 rounded-[6px] bg-[#dc2626] text-white text-sm font-semibold hover:bg-[#b91c1c] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-2">
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Salvando..." : isEdit ? "Salvar Alterações" : "Criar Produto"}
        </button>
      </div>
    </form>
  );
}
