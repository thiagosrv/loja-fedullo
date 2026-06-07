import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { notFound } from "next/navigation";

export default async function EditProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await db.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      brands: { include: { brand: true } },
    },
  });

  if (!product) notFound();

  const initialData = {
    name: product.name,
    description: product.description,
    price: product.price,
    salePrice: product.salePrice,
    onSale: product.onSale,
    saleEndsAt: product.saleEndsAt?.toISOString() ?? null,
    stock: product.stock,
    sku: product.sku,
    featured: product.featured,
    active: product.active,
    categoryId: product.categoryId,
    brandIds: product.brands.map(pb => pb.brandId),
    imageUrls: product.images.map(img => img.url),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Editar Produto</h1>
        <p className="text-sm text-[#6b7280] mt-0.5">{product.name}</p>
      </div>
      <ProductForm productId={id} initialData={initialData} />
    </div>
  );
}
