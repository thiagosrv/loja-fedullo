"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronDown, ShoppingBag } from "lucide-react";

interface Order {
  id: string; status: string; totalCents: number; createdAt: string;
  guestEmail: string | null;
  user: { name: string; email: string } | null;
  items: { quantity: number; productName: string }[];
}

const STATUS_OPTIONS = [
  { value: "", label: "Todos os status" },
  { value: "PENDING", label: "Pendente" },
  { value: "PROCESSING", label: "Processando" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "DELIVERED", label: "Entregue" },
  { value: "CANCELLED", label: "Cancelado" },
  { value: "REFUNDED", label: "Reembolsado" },
];

const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-yellow-400 bg-yellow-400/10",
  PROCESSING: "text-blue-400 bg-blue-400/10",
  SHIPPED: "text-purple-400 bg-purple-400/10",
  DELIVERED: "text-green-400 bg-green-400/10",
  CANCELLED: "text-red-400 bg-red-400/10",
  REFUNDED: "text-gray-400 bg-gray-400/10",
};

function fmt(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      load();
    } finally {
      setUpdatingId(null);
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Pedidos</h1>
          <p className="text-sm text-[#6b7280] mt-0.5">{total} pedido(s) encontrado(s)</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5563]" />
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 pl-8 pr-8 rounded-[6px] border border-[#2a2a2a] bg-[#0a0a0a] text-sm text-white focus:outline-none focus:border-[#dc2626] transition-colors cursor-pointer appearance-none"
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4b5563] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[10px] border border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Pedido</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide hidden md:table-cell">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide hidden lg:table-cell">Itens</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide hidden sm:table-cell">Data</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#111] animate-pulse">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-[#1a1a1a]" /></td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <ShoppingBag size={32} className="text-[#2a2a2a] mx-auto mb-3" />
                    <p className="text-[#4b5563] text-sm">Nenhum pedido encontrado</p>
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} className="border-b border-[#111] hover:bg-[#111]/40 transition-colors">
                    <td className="px-4 py-3">
                      <code className="text-xs text-[#9ca3af]">#{order.id.slice(-8).toUpperCase()}</code>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-white font-medium">
                        {order.user?.name ?? "Guest"}
                      </p>
                      <p className="text-xs text-[#4b5563]">
                        {order.user?.email ?? order.guestEmail ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-[#9ca3af] text-xs">
                        {order.items.slice(0, 2).map(i => `${i.quantity}× ${i.productName}`).join(", ")}
                        {order.items.length > 2 && ` +${order.items.length - 2}`}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-white">{fmt(order.totalCents)}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-[#6b7280]">
                        {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <select
                          value={order.status}
                          onChange={e => updateStatus(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#dc2626] appearance-none pr-6 ${STATUS_COLOR[order.status]} bg-transparent disabled:opacity-50`}
                        >
                          {STATUS_OPTIONS.filter(o => o.value).map(o => (
                            <option key={o.value} value={o.value} className="bg-[#111] text-white">
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={10} className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-60" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1a1a1a]">
            <p className="text-xs text-[#4b5563]">Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="h-7 px-3 rounded text-xs text-[#6b7280] border border-[#2a2a2a] hover:border-[#4b5563] disabled:opacity-40 cursor-pointer transition-colors">
                Anterior
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="h-7 px-3 rounded text-xs text-[#6b7280] border border-[#2a2a2a] hover:border-[#4b5563] disabled:opacity-40 cursor-pointer transition-colors">
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
