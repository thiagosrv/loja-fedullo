"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Credenciais inválidas");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#000] flex items-center justify-center px-4">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          opacity: 0.022,
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/fedullo.png" alt="Fedullo" width={600} height={350} className="h-10 w-auto" />
        </div>

        <div className="rounded-[10px] border border-[#1f1f1f] bg-[#0a0a0a] p-8">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-white">Painel Administrativo</h1>
            <p className="text-sm text-[#6b7280] mt-1">Entre com suas credenciais para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#9ca3af] mb-1.5" htmlFor="username">
                Usuário
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="w-full h-10 rounded-[6px] border border-[#2a2a2a] bg-[#111] px-3 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#dc2626] transition-colors"
                placeholder="Usuário"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9ca3af] mb-1.5" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full h-10 rounded-[6px] border border-[#2a2a2a] bg-[#111] px-3 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-[#dc2626] transition-colors"
                placeholder="••••••••••••"
                required
              />
            </div>

            {error && (
              <div className="rounded-[6px] border border-[#dc2626]/30 bg-[#dc2626]/10 px-3 py-2 text-sm text-[#f87171]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-[6px] bg-[#dc2626] text-white text-sm font-semibold hover:bg-[#b91c1c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#374151] mt-6">
          Fedullo Motorsport Wiring — Admin
        </p>
      </div>
    </div>
  );
}
