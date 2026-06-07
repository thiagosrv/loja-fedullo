import { ProductForm } from "@/components/admin/ProductForm";

export default function NovoProdutoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Novo Produto</h1>
        <p className="text-sm text-[#6b7280] mt-0.5">Preencha os dados para adicionar um novo produto à loja.</p>
      </div>
      <ProductForm />
    </div>
  );
}
