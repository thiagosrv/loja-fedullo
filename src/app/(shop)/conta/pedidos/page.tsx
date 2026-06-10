import { getUserProfile } from "@/lib/get-user-profile";
import { db } from "@/lib/db";
import { Package, ChevronRight } from "lucide-react";
import Link from "next/link";
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

export const metadata = { title: "Meus Pedidos" };

export default async function PedidosPage() {
  const { profile } = await getUserProfile();

  const orders = await db.order.findMany({
    where: { OR: [{ userId: profile.id }, { guestEmail: profile.email }] },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      shippingAddress: true,
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Meus Pedidos</h1>
        <p className="text-sm text-[#6b7280] mt-1">
          {orders.length} pedido{orders.length !== 1 ? "s" : ""} realizado{orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-[10px] border border-[#1f1f1f] bg-[#0d0d0d] py-16 text-center">
          <Package size={36} className="text-[#2a2a2a] mx-auto mb-4" />
          <p className="text-sm text-[#6b7280]">Nenhum pedido ainda.</p>
          <Link href="/" className="inline-block mt-3 text-sm text-[#dc2626] hover:underline">
            Começar a comprar
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-[10px] border border-[#1f1f1f] bg-[#0d0d0d] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#1a1a1a]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0">
                    <p className="text-xs font-mono text-[#6b7280]">Pedido</p>
                    <p className="text-sm font-semibold text-white font-mono">
                      #{order.id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div className="h-6 w-px bg-[#1f1f1f]" />
                  <p className="text-xs text-[#6b7280]">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${STATUS_COLOR[order.status]}`}
                >
                  {STATUS_LABEL[order.status]}
                </span>
              </div>

              {/* Items */}
              <div className="px-5 py-4 space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-2 text-sm">
                    <span className="text-[#9ca3af] min-w-0 truncate">
                      <span className="text-white font-medium">{item.quantity}×</span>{" "}
                      {item.productName}
                    </span>
                    <PriceDisplay
                      cents={item.unitPriceCents * item.quantity}
                      className="text-white font-medium flex-shrink-0 text-xs"
                    />
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#1a1a1a] bg-[#0a0a0a]">
                <div className="text-xs text-[#6b7280]">
                  Frete:{" "}
                  <PriceDisplay
                    cents={order.shippingCents}
                    className="text-[#9ca3af] font-medium inline"
                  />
                  {" · "}
                  <span className="text-[#9ca3af]">{order.shippingRegion}</span>
                </div>
                <div className="flex items-center gap-3">
                  <PriceDisplay
                    cents={order.totalCents}
                    className="text-white font-bold text-sm"
                  />
                  <ChevronRight size={14} className="text-[#4a4a4a]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
