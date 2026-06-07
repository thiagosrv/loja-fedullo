"use client";

import { create } from "zustand";

export interface CheckoutAddress {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface SelectedShipping {
  label: string;
  priceCents: number;
  days: string;
  region: string;
}

interface CheckoutState {
  address: Partial<CheckoutAddress>;
  shipping: SelectedShipping | null;
  orderId: string | null;
  setAddress: (address: Partial<CheckoutAddress>) => void;
  setShipping: (shipping: SelectedShipping) => void;
  setOrderId: (id: string) => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>()((set) => ({
  address: {},
  shipping: null,
  orderId: null,
  setAddress: (address) => set((s) => ({ address: { ...s.address, ...address } })),
  setShipping: (shipping) => set({ shipping }),
  setOrderId: (orderId) => set({ orderId }),
  reset: () => set({ address: {}, shipping: null, orderId: null }),
}));
