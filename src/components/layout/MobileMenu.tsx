"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, User, LogIn } from "lucide-react";
import { CATEGORIES } from "@/constants/categories";
import { CAR_BRANDS } from "@/constants/brands";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const { user, signOut } = useAuth();

  /* Trava o scroll da página enquanto o drawer está aberto */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        className="md:hidden flex items-center justify-center w-11 h-11 rounded-[8px] hover:bg-[#1a1a1a] transition-colors"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        aria-expanded={open}
      >
        <Menu size={20} className="text-white" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/80 z-40"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-[#111111] border-r border-[#1f1f1f] z-50 transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#1f1f1f]">
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-bold text-white tracking-wider">FEDULLO</span>
            <span className="text-[8px] font-semibold tracking-[0.2em] text-[#dc2626] uppercase">Motorsport Wiring</span>
          </div>
          <button
            onClick={close}
            aria-label="Fechar menu"
            className="flex items-center justify-center w-11 h-11 rounded-[8px] hover:bg-[#1a1a1a] transition-colors"
          >
            <X size={18} className="text-[#9ca3af]" />
          </button>
        </div>

        {/* Red accent line */}
        <div className="h-px bg-[#dc2626]" />

        <nav className="flex flex-col p-4 gap-1">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              onClick={close}
              className="px-3 py-3.5 text-sm font-medium text-[#9ca3af] hover:text-white hover:bg-[#1a1a1a] active:bg-[#1a1a1a] rounded-[8px] transition-colors"
            >
              {cat.name}
            </Link>
          ))}

          <button
            onClick={() => setBrandsOpen(!brandsOpen)}
            className="flex items-center justify-between px-3 py-3.5 text-sm font-medium text-[#9ca3af] hover:text-white hover:bg-[#1a1a1a] active:bg-[#1a1a1a] rounded-[8px] transition-colors"
          >
            Por Marcas
            <span className={cn("transition-transform duration-200 text-xs", brandsOpen && "rotate-180")}>▼</span>
          </button>

          {brandsOpen && (
            <div className="pl-4 flex flex-col gap-1">
              {CAR_BRANDS.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/marcas/${brand.slug}`}
                  onClick={close}
                  className="px-3 py-3 text-sm text-[#9ca3af] hover:text-white hover:bg-[#1a1a1a] active:bg-[#1a1a1a] rounded-[8px] transition-colors"
                >
                  {brand.name}
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Account section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-[#1f1f1f] p-4">
          {user ? (
            <div className="flex flex-col gap-1">
              <Link
                href="/conta"
                onClick={close}
                className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-[#9ca3af] hover:text-white hover:bg-[#1a1a1a] rounded-[8px] transition-colors"
              >
                <User size={15} />
                Minha Conta
              </Link>
              <button
                onClick={() => { close(); signOut(); }}
                className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-[#6b7280] hover:text-[#dc2626] hover:bg-[#dc2626]/5 rounded-[8px] transition-colors w-full text-left"
              >
                <LogIn size={15} className="rotate-180" />
                Sair
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={close}
              className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-[#9ca3af] hover:text-white hover:bg-[#1a1a1a] rounded-[8px] transition-colors"
            >
              <LogIn size={15} />
              Entrar / Criar conta
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
