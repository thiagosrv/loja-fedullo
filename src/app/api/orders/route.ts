import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      address,
      shipping,
      items,
      subtotalCents,
      shippingCents,
      totalCents,
      guestEmail,
    } = body;

    const order = await db.order.create({
      data: {
        guestEmail,
        subtotalCents,
        shippingCents,
        totalCents,
        shippingMethod: shipping.label,
        shippingRegion: shipping.region,
        status: "PENDING",
        shippingAddress: {
          create: {
            name: address.name,
            cep: address.cep,
            logradouro: address.logradouro,
            numero: address.numero,
            complemento: address.complemento ?? null,
            bairro: address.bairro,
            cidade: address.cidade,
            estado: address.estado,
          },
        },
        items: {
          create: items.map((item: {
            productId: string;
            quantity: number;
            unitPriceCents: number;
            productName: string;
          }) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents,
            productName: item.productName,
          })),
        },
      },
    });

    return Response.json({ orderId: order.id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Erro ao criar pedido" }, { status: 500 });
  }
}
