import { db } from "@/lib/db";
import Link from "next/link";
import { Package, Tag, ShoppingBag, Ticket, TrendingUp, AlertTriangle, Plus } from "lucide-react";

async function getStats() {
  const [products, categories, orders, coupons, recentOrders, lowStock] = await Promise.all([
    db.product.count({ where: { active: true } }),
    db.category.count(),
    db.order.count(),
    db.coupon.count({ where: { active: true } }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true } },
        items: true,
      },
    }),
    db.product.findMany({
      where: { stock: { lte: 5 }, active: true },
      select: { id: true, name: true, stock: true },
      orderBy: { stock: "asc" },
      take: 8,
    }),
  ]);

  const revenue = await db.order.aggregate({
    where: { status: { in: ["PROCESSING", "SHIPPED", "DELIVERED"] } },
    _sum: { totalCents: true },
  });

  return { products, categories, orders, coupons, recentOrders, lowStock, revenue: revenue._sum.totalCents ?? 0 };
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendente", PROCESSING: "Processando", SHIPPED: "Enviado",
  DELIVERED: "Entregue", CANCELLED: "Cancelado", REFUNDED: "Reembolsado",
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-yellow-400 bg-yellow-400/10", PROCESSING: "text-blue-400 bg-blue-400/10",
  SHIPPED: "text-purple-400 bg-purple-400/10", DELIVERED: "text-green-400 bg-green-400/10",
  CANCELLED: "text-red-400 bg-red-400/10", REFUNDED: "text-gray-400 bg-gray-400/10",
};

function fmt(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function AdminDashboard() {
  const { products, categories, orders, coupons, recentOrders, lowStock, revenue } = await getStats();

  const stats = [
    { label: "Produtos Ativos", value: products, icon: Package, href: "/admin/produtos", color: "text-blue-400" },
    { label: "Categorias", value: categories, icon: Tag, href: "/admin/categorias", color: "text-purple-400" },
    { label: "Pedidos Totais", value: orders, icon: ShoppingBag, href: "/admin/pedidos", color: "text-green-400" },
    { label: "Cupons Ativos", value: coupons, icon: Ticket, href: "/admin/cupons", color: "text-yellow-400" },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">Visão geral da loja Fedullo</p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="flex items-center gap-2 h-9 px-4 rounded-[6px] bg-[#dc2626] text-white text-sm font-semibold hover:bg-[#b91c1c] transition-colors cursor-pointer"
        >
          <Plus size={15} /> Novo Produto
        </Link>
      </div>

      {/* Revenue banner */}
      <div className="rounded-[10px] border border-[#dc2626]/20 bg-gradient-to-r from-[#dc2626]/10 to-transparent p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#dc2626]/20 flex items-center justify-center flex-shrink-0">
          <TrendingUp size={18} className="text-[#dc2626]" />
        </div>
        <div>
          <p className="text-xs text-[#9ca3af] font-medium">Receita Total (pedidos pagos)</p>
          <p className="text-2xl font-bold text-white mt-0.5">{fmt(revenue)}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="rounded-[10px] border border-[#1a1a1a] bg-[#0a0a0a] p-5 hover:border-[#2a2a2a] transition-colors cursor-pointer group"
          >
            <div className={`${color} mb-3`}><Icon size={20} /></div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-[#6b7280] mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="rounded-[10px] border border-[#1a1a1a] bg-[#0a0a0a]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
            <h2 className="font-semibold text-white text-sm">Pedidos Recentes</h2>
            <Link href="/admin/pedidos" className="text-xs text-[#dc2626] hover:text-[#f87171] transition-colors cursor-pointer">
              Ver todos →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-[#4b5563]">Nenhum pedido ainda</div>
          ) : (
            <div className="divide-y divide-[#111]">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between px-5 py-3 hover:bg-[#111]/50">
                  <div>
                    <p className="text-sm text-white font-medium">
                      {order.user?.name ?? order.guestEmail ?? "Cliente"}
                    </p>
                    <p className="text-xs text-[#4b5563] mt-0.5">
                      {order.items.length} item(s) · {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status]}`}>
                      {STATUS_LABEL[order.status]}
                    </span>
                    <span className="text-sm font-semibold text-white">{fmt(order.totalCents)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="rounded-[10px] border border-[#1a1a1a] bg-[#0a0a0a]">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[#1a1a1a]">
            <AlertTriangle size={14} className="text-yellow-400" />
            <h2 className="font-semibold text-white text-sm">Estoque Baixo</h2>
          </div>
          {lowStock.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-[#4b5563]">Todos os produtos têm estoque adequado</div>
          ) : (
            <div className="divide-y divide-[#111]">
              {lowStock.map(p => (
                <Link
                  key={p.id}
                  href={`/admin/produtos/${p.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-[#111]/50 cursor-pointer"
                >
                  <p className="text-sm text-white">{p.name}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.stock === 0 ? "text-red-400 bg-red-400/10" : "text-yellow-400 bg-yellow-400/10"}`}>
                    {p.stock === 0 ? "Esgotado" : `${p.stock} un.`}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
