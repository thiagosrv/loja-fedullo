"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, ShoppingBag, MapPin, LayoutDashboard, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import gsap from "gsap";

export function UserMenu() {
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Animate dropdown open/close
  useEffect(() => {
    const el = dropdownRef.current?.querySelector<HTMLElement>("[data-dropdown]");
    if (!el) return;
    if (open) {
      gsap.fromTo(el, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.18, ease: "power2.out" });
    }
  }, [open]);

  if (loading) {
    return (
      <div className="w-9 h-9 rounded-full bg-[#1a1a1a] animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        aria-label="Entrar"
        className="relative flex items-center justify-center w-11 h-11 rounded-full hover:bg-white/5 transition-colors duration-200"
      >
        <User size={17} strokeWidth={1.4} className="text-white" />
      </Link>
    );
  }

  const initial = (user.user_metadata?.name as string | undefined)?.charAt(0).toUpperCase()
    ?? user.email?.charAt(0).toUpperCase()
    ?? "U";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Minha conta"
        aria-expanded={open}
        className="flex items-center gap-1.5 h-11 px-1 rounded-full hover:bg-white/5 transition-colors duration-200"
      >
        <div className="w-7 h-7 rounded-full bg-[#dc2626] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {initial}
        </div>
        <ChevronDown
          size={12}
          className={cn(
            "text-[#6b7280] transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          data-dropdown
          className="absolute right-0 top-full mt-2 w-52 rounded-[10px] border border-[#1f1f1f] bg-[#0d0d0d] shadow-2xl overflow-hidden z-50"
        >
          {/* User info */}
          <div className="px-4 py-3.5 border-b border-[#1a1a1a]">
            <p className="text-xs font-semibold text-white truncate">
              {(user.user_metadata?.name as string | undefined) ?? "Minha Conta"}
            </p>
            <p className="text-xs text-[#6b7280] truncate mt-0.5">{user.email}</p>
          </div>

          {/* Links */}
          <div className="py-1">
            {[
              { href: "/conta", label: "Visão Geral", Icon: LayoutDashboard },
              { href: "/conta/pedidos", label: "Meus Pedidos", Icon: ShoppingBag },
              { href: "/conta/enderecos", label: "Endereços", Icon: MapPin },
            ].map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#9ca3af] hover:text-white hover:bg-[#141414] transition-colors"
              >
                <Icon size={13} className="text-[#4a4a4a]" />
                {label}
              </Link>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-[#1a1a1a] py-1">
            <button
              onClick={() => { setOpen(false); signOut(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#9ca3af] hover:text-[#dc2626] hover:bg-[#dc2626]/5 transition-colors"
            >
              <LogOut size={13} />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
