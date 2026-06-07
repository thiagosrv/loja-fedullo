import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface Props {
  params: Promise<{ orderId: string }>;
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderId } = await params;

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      shippingAddress: true,
      items: true,
    },
  });

  if (!order) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      {/* Success */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Pedido Confirmado!</h1>
        <p className="text-[#9ca3af]">
          Seu pedido foi recebido. Você receberá uma confirmação por e-mail.
        </p>
        <p className="text-xs text-[#4a4a4a] mt-2">
          Pedido #{order.id.slice(-8).toUpperCase()}
        </p>
      </div>

      {/* Order details */}
      <div className="rounded-[8px] border border-[#1f1f1f] bg-[#111111] p-6 flex flex-col gap-4">
        {/* Items */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">Itens</h2>
          <div className="flex flex-col gap-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-[#9ca3af]">{item.quantity}× {item.productName}</span>
                <PriceDisplay cents={item.unitPriceCents * item.quantity} className="text-white font-medium" />
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-[#1f1f1f]" />

        {/* Totals */}
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#9ca3af]">Subtotal</span>
            <PriceDisplay cents={order.subtotalCents} className="text-white" />
          </div>
          <div className="flex justify-between">
            <span className="text-[#9ca3af]">{order.shippingMethod}</span>
            <PriceDisplay cents={order.shippingCents} className="text-white" />
          </div>
          <div className="flex justify-between font-bold text-base pt-1">
            <span className="text-white">Total</span>
            <PriceDisplay cents={order.totalCents} className="text-white" />
          </div>
        </div>

        {/* Shipping address */}
        {order.shippingAddress && (
          <>
            <div className="h-px bg-[#1f1f1f]" />
            <div>
              <h2 className="text-sm font-semibold text-white mb-2">Endereço de Entrega</h2>
              <div className="text-sm text-[#9ca3af] leading-relaxed">
                <p>{order.shippingAddress.name}</p>
                <p>
                  {order.shippingAddress.logradouro}, {order.shippingAddress.numero}
                  {order.shippingAddress.complemento && `, ${order.shippingAddress.complemento}`}
                </p>
                <p>{order.shippingAddress.bairro}, {order.shippingAddress.cidade} – {order.shippingAddress.estado}</p>
                <p>CEP {order.shippingAddress.cep}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Red accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#dc2626] to-transparent my-8 opacity-40" />

      <div className="text-center">
        <Link href="/">
          <Button variant="outline">Continuar Comprando</Button>
        </Link>
      </div>
    </div>
  );
}
