"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/conta";
  const supabase = getSupabaseBrowser();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : "Erro ao entrar. Tente novamente."
      );
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">Entrar</h1>
        <p className="mt-2 text-sm text-[#6b7280]">
          Acesse sua conta para continuar.
        </p>
      </div>

      <div className="rounded-[12px] border border-[#1f1f1f] bg-[#0a0a0a] p-7">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={form.email}
            onChange={set("email")}
            required
          />

          <div className="relative">
            <Input
              label="Senha"
              type={showPwd ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={set("password")}
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 bottom-3 text-[#4a4a4a] hover:text-[#9ca3af] transition-colors"
              aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {error && (
            <div className="rounded-[8px] border border-[#dc2626]/30 bg-[#dc2626]/10 px-3 py-2.5 text-sm text-[#f87171]">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full mt-1" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Entrando…
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>

        <div className="mt-5 pt-5 border-t border-[#1f1f1f] text-center">
          <p className="text-sm text-[#6b7280]">
            Não tem conta?{" "}
            <Link
              href="/cadastro"
              className="text-[#dc2626] hover:text-[#f87171] font-medium transition-colors"
            >
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
