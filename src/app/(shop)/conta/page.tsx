import { getUserProfile } from "@/lib/get-user-profile";
import { db } from "@/lib/db";
import Link from "next/link";
import { ShoppingBag, MapPin, ArrowRight, Package } from "lucide-react";
import { PriceDisplay } from "@/components/shared/PriceDisplay";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Aguardando pagamento",
  PROCESSING: "Em processamento",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  PROCESSING: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  SHIPPED: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  DELIVERED: "text-green-400 bg-green-400/10 border-green-400/20",
  CANCELLED: "text-[#9ca3af] bg-white/5 border-white/10",
  REFUNDED: "text-[#9ca3af] bg-white/5 border-white/10",
};

export default async function ContaDashboard() {
  const { profile } = await getUserProfile();

  const [orders, addressCount] = await Promise.all([
    db.order.findMany({
      where: { OR: [{ userId: profile.id }, { guestEmail: profile.email }] },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { items: { take: 1 } },
    }),
    db.address.count({ where: { userId: profile.id } }),
  ]);

  const firstName = profile.name.split(" ")[0];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold text-white">Olá, {firstName}!</h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Bem-vindo à sua área exclusiva.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/conta/pedidos"
          className="rounded-[10px] border border-[#1f1f1f] bg-[#0d0d0d] p-5 hover:border-[#dc2626]/40 transition-colors group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-3xl font-bold text-white">{orders.length}</p>
              <p className="text-xs text-[#6b7280] mt-1">pedidos</p>
            </div>
            <div className="w-9 h-9 rounded-[8px] bg-[#dc2626]/10 flex items-center justify-center">
              <ShoppingBag size={16} className="text-[#dc2626]" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-xs text-[#6b7280] group-hover:text-[#dc2626] transition-colors">
            Ver pedidos <ArrowRight size={11} />
          </div>
        </Link>

        <Link
          href="/conta/enderecos"
          className="rounded-[10px] border border-[#1f1f1f] bg-[#0d0d0d] p-5 hover:border-[#dc2626]/40 transition-colors group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-3xl font-bold text-white">{addressCount}</p>
              <p className="text-xs text-[#6b7280] mt-1">endereços</p>
            </div>
            <div className="w-9 h-9 rounded-[8px] bg-[#dc2626]/10 flex items-center justify-center">
              <MapPin size={16} className="text-[#dc2626]" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-xs text-[#6b7280] group-hover:text-[#dc2626] transition-colors">
            Ver endereços <ArrowRight size={11} />
          </div>
        </Link>
      </div>

      {/* Recent orders */}
      <div className="rounded-[10px] border border-[#1f1f1f] bg-[#0d0d0d]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f1f1f]">
          <h2 className="text-sm font-semibold text-white">Pedidos recentes</h2>
          <Link
            href="/conta/pedidos"
            className="text-xs text-[#9ca3af] hover:text-[#dc2626] transition-colors flex items-center gap-1"
          >
            Ver todos <ArrowRight size={10} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Package size={32} className="text-[#2a2a2a] mx-auto mb-3" />
            <p className="text-sm text-[#6b7280]">Nenhum pedido realizado ainda.</p>
            <Link
              href="/"
              className="inline-block mt-3 text-xs text-[#dc2626] hover:underline"
            >
              Explorar produtos
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#1a1a1a]">
            {orders.map((order) => (
              <div key={order.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs text-[#6b7280] font-mono">
                    #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-white font-medium mt-0.5 truncate">
                    {order.items[0]?.productName ?? "—"}
                    {order.items.length > 1 && (
                      <span className="text-[#6b7280]">
                        {" "}+{order.items.length - 1} iten{order.items.length > 2 ? "s" : ""}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[#4a4a4a] mt-1">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <PriceDisplay cents={order.totalCents} className="text-sm font-bold text-white" />
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLOR[order.status]}`}
                  >
                    {STATUS_LABEL[order.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
