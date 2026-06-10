import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#000] flex flex-col">
      {/* Subtle grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          opacity: 0.018,
        }}
      />

      {/* Minimal header */}
      <header className="relative z-10 border-b border-[#111] py-4 px-6">
        <div className="mx-auto max-w-sm flex justify-center">
          <Link href="/" className="flex flex-col items-center gap-1 group">
            <Image
              src="/fedullo.png"
              alt="Fedullo"
              width={600}
              height={350}
              className="h-7 w-auto opacity-90 group-hover:opacity-100 transition-opacity"
            />
            <span
              className="text-[#dc2626] uppercase tracking-[0.28em]"
              style={{ fontSize: "6px", fontWeight: 700 }}
            >
              Motorsport Wiring
            </span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      <footer className="relative z-10 py-5 text-center">
        <p className="text-xs text-[#374151]">
          © {new Date().getFullYear()} Fedullo Motorsport Wiring
        </p>
      </footer>
    </div>
  );
}
