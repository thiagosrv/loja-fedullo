import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { Badge } from "@/components/ui/Badge";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import Image from "next/image";
import type { Metadata } from "next";
import type { Product } from "@/types/product";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) return { title: "Produto não encontrado" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = (await db.product.findUnique({
    where: { slug, active: true },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      brands: { include: { brand: true } },
    },
  })) as unknown as Product | null;

  if (!product) notFound();

  const mainImage = product.images[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="relative aspect-square rounded-[8px] bg-[#111111] border border-[#1f1f1f] overflow-hidden">
          {mainImage ? (
            <Image
              src={mainImage.url}
              alt={mainImage.alt ?? product.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[#2a2a2a] text-sm">Sem imagem</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-6 bg-[#dc2626]" />
              <span className="text-xs font-bold tracking-[0.2em] text-[#dc2626] uppercase">
                {product.category.name}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white">{product.name}</h1>
            {product.sku && (
              <p className="text-xs text-[#4a4a4a] mt-1">SKU: {product.sku}</p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <PriceDisplay cents={product.price} className="text-4xl font-bold text-white" />
          </div>

          {/* Description */}
          <div className="h-px bg-[#1f1f1f]" />
          <p className="text-[#9ca3af] leading-relaxed">{product.description}</p>

          {/* Compatible brands */}
          {product.brands.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider mb-2">
                Compatível com
              </p>
              <div className="flex flex-wrap gap-2">
                {product.brands.map((pb) => (
                  <Badge key={pb.brand.slug} variant="outline">
                    {pb.brand.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="h-px bg-[#1f1f1f]" />

          {/* Stock info */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? "bg-green-500" : "bg-[#dc2626]"}`} />
            <span className="text-sm text-[#9ca3af]">
              {product.stock > 0
                ? product.stock <= 5
                  ? `Últimas ${product.stock} unidades`
                  : "Em estoque"
                : "Esgotado"}
            </span>
          </div>

          {/* Add to cart */}
          <AddToCartButton product={product} />

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4 pt-2">
            {["Compra Segura", "Frete Calculado", "Nota Fiscal"].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-[#dc2626]" />
                <span className="text-xs text-[#9ca3af]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
