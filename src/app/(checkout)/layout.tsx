import Link from "next/link";
import Image from "next/image";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#000] flex flex-col">
      {/* Minimal header */}
      <header className="border-b border-[#1f1f1f] bg-[#000]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/">
            <Image src="/fedullo.png" alt="Fedullo" width={100} height={26} className="h-7 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-[#9ca3af]">Ambiente seguro</span>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-[#dc2626] to-transparent opacity-40" />
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#1f1f1f] py-4 text-center">
        <p className="text-xs text-[#4a4a4a]">
          Pagamentos processados com segurança por <span className="text-[#9ca3af]">Stripe</span>
        </p>
      </footer>
    </div>
  );
}
