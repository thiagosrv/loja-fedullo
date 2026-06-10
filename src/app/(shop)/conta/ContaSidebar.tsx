"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, MapPin, User2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { href: "/conta", label: "Visão Geral", icon: LayoutDashboard, exact: true },
  { href: "/conta/pedidos", label: "Meus Pedidos", icon: ShoppingBag, exact: false },
  { href: "/conta/enderecos", label: "Endereços", icon: MapPin, exact: false },
  { href: "/conta/dados", label: "Meus Dados", icon: User2, exact: false },
];

interface Props {
  name: string;
  email: string;
}

export function ContaSidebar({ name, email }: Props) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const initial = name.charAt(0).toUpperCase();

  return (
    <aside className="lg:w-60 flex-shrink-0">
      {/* User card */}
      <div className="rounded-[10px] border border-[#1f1f1f] bg-[#0d0d0d] p-5 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#dc2626] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{name}</p>
            <p className="text-xs text-[#6b7280] truncate">{email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="rounded-[10px] border border-[#1f1f1f] bg-[#0d0d0d] overflow-hidden">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors border-b border-[#1a1a1a] last:border-0",
                active
                  ? "text-white bg-[#1a1a1a] border-l-2 border-l-[#dc2626] pl-[14px]"
                  : "text-[#9ca3af] hover:text-white hover:bg-[#141414]"
              )}
            >
              <Icon size={15} className={active ? "text-[#dc2626]" : "text-[#4a4a4a]"} />
              {label}
            </Link>
          );
        })}

        {/* Logout */}
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-[#6b7280] hover:text-[#dc2626] hover:bg-[#141414] transition-colors"
        >
          <LogOut size={15} />
          Sair
        </button>
      </nav>
    </aside>
  );
}
