"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, Tag, Ticket, ShoppingBag,
  LogOut, Menu, X, ChevronRight,
} from "lucide-react";

const NAV = [
  { href: "/admin",           label: "Dashboard",    icon: LayoutDashboard },
  { href: "/admin/produtos",  label: "Produtos",     icon: Package },
  { href: "/admin/categorias",label: "Categorias",   icon: Tag },
  { href: "/admin/cupons",    label: "Cupons",       icon: Ticket },
  { href: "/admin/pedidos",   label: "Pedidos",      icon: ShoppingBag },
];

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={
        mobile
          ? "flex flex-col h-full bg-[#0a0a0a] border-r border-[#1a1a1a] w-64"
          : "hidden lg:flex flex-col h-full bg-[#0a0a0a] border-r border-[#1a1a1a] w-60 fixed top-0 left-0 bottom-0 z-30"
      }
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-[#1a1a1a] flex-shrink-0">
        <Image src="/fedullo.png" alt="Fedullo" width={600} height={350} className="h-6 w-auto" />
        <span className="text-[9px] font-bold tracking-[0.2em] text-[#dc2626] uppercase">Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 mb-2">
          <span className="text-[10px] font-bold tracking-[0.15em] text-[#374151] uppercase px-2">
            Gestão
          </span>
        </div>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-[6px] text-sm font-medium transition-colors cursor-pointer mb-0.5 ${
                active
                  ? "bg-[#dc2626]/15 text-white"
                  : "text-[#6b7280] hover:text-white hover:bg-[#111]"
              }`}
            >
              <Icon size={16} className={active ? "text-[#dc2626]" : ""} />
              {label}
              {active && <ChevronRight size={12} className="ml-auto text-[#dc2626]" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-[#1a1a1a] pt-4 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[6px] text-sm text-[#6b7280] hover:text-[#f87171] hover:bg-[#dc2626]/10 transition-colors cursor-pointer"
        >
          <LogOut size={15} />
          Sair
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#000] text-white">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 lg:hidden transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar mobile />
      </div>

      {/* Main content */}
      <div className="lg:pl-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-14 bg-[#000]/90 backdrop-blur border-b border-[#1a1a1a] flex items-center px-4 sm:px-6 gap-4">
          <button
            className="lg:hidden text-[#6b7280] hover:text-white transition-colors cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#374151]">Admin</span>
            {pathname !== "/admin" && (
              <>
                <span className="text-[#1f1f1f]">/</span>
                <span className="text-[#9ca3af] capitalize">
                  {NAV.find(n => n.href !== "/admin" && pathname.startsWith(n.href))?.label ?? ""}
                </span>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#4b5563] hover:text-white transition-colors cursor-pointer"
            >
              Ver loja →
            </a>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
