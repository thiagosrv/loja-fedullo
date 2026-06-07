import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/constants/categories";
import { CAR_BRANDS } from "@/constants/brands";

export function Footer() {
  return (
    <footer className="border-t border-[#1f1f1f] bg-[#000] mt-auto">
      {/* Red accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#dc2626] to-transparent opacity-40" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Image src="/fedullo.png" alt="Fedullo" width={100} height={26} className="h-7 w-auto mb-1" />
            <p className="text-[9px] font-semibold tracking-[0.22em] text-[#dc2626] uppercase mb-4">
              Motorsport Wiring
            </p>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              Chicotes e eletroeletrônicos de alta performance para carros preparados.
            </p>
          </div>

          {/* Categorias */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#9ca3af] mb-4">Produtos</h3>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/${cat.slug}`} className="text-sm text-[#9ca3af] hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Marcas */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#9ca3af] mb-4">Por Marca</h3>
            <ul className="space-y-2">
              {CAR_BRANDS.map((brand) => (
                <li key={brand.slug}>
                  <Link href={`/marcas/${brand.slug}`} className="text-sm text-[#9ca3af] hover:text-white transition-colors">
                    {brand.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Conta */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#9ca3af] mb-4">Conta</h3>
            <ul className="space-y-2">
              {[
                { href: "/login", label: "Entrar" },
                { href: "/cadastro", label: "Criar Conta" },
                { href: "/conta", label: "Meus Pedidos" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-[#9ca3af] hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#1f1f1f] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#4a4a4a]">
            © {new Date().getFullYear()} Fedullo Motorsport Wiring. Todos os direitos reservados.
          </p>
          <p className="text-xs text-[#4a4a4a]">
            Pagamentos processados por{" "}
            <span className="text-[#9ca3af]">Stripe</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
