"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function CadastroPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    cpf: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          phone: form.phone || undefined,
          cpf: form.cpf || undefined,
        },
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        setError("Este e-mail já está cadastrado. Tente entrar.");
      } else {
        setError(authError.message);
      }
      setLoading(false);
      return;
    }

    if (data.session) {
      // Email confirmation disabled → logged in right away
      router.push("/conta");
      router.refresh();
    } else {
      // Email confirmation required
      setEmailSent(true);
    }
  }

  if (emailSent) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="rounded-[12px] border border-[#1f1f1f] bg-[#0a0a0a] p-8 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#dc2626]/10 border border-[#dc2626]/30 flex items-center justify-center">
            <Mail size={24} className="text-[#dc2626]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Confirme seu e-mail</h2>
            <p className="mt-2 text-sm text-[#6b7280] leading-relaxed">
              Enviamos um link de confirmação para{" "}
              <span className="text-[#9ca3af]">{form.email}</span>.
              <br />
              Clique no link para ativar sua conta.
            </p>
          </div>
          <Link href="/login" className="text-sm text-[#dc2626] hover:underline font-medium">
            Ir para o login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">Criar conta</h1>
        <p className="mt-2 text-sm text-[#6b7280]">
          Crie sua conta para acompanhar pedidos.
        </p>
      </div>

      <div className="rounded-[12px] border border-[#1f1f1f] bg-[#0a0a0a] p-7">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nome completo *"
            type="text"
            autoComplete="name"
            placeholder="Seu nome"
            value={form.name}
            onChange={set("name")}
            required
          />

          <Input
            label="E-mail *"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={form.email}
            onChange={set("email")}
            required
          />

          <div className="relative">
            <Input
              label="Senha *"
              type={showPwd ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
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

          <Input
            label="Confirmar senha *"
            type={showPwd ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repita a senha"
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            required
          />

          {/* Divisor */}
          <div className="h-px bg-[#1f1f1f] my-1" />

          <Input
            label="Telefone (opcional)"
            type="tel"
            autoComplete="tel"
            placeholder="(11) 99999-9999"
            value={form.phone}
            onChange={set("phone")}
          />

          <Input
            label="CPF (opcional)"
            placeholder="000.000.000-00"
            value={form.cpf}
            onChange={set("cpf")}
          />

          {error && (
            <div className="rounded-[8px] border border-[#dc2626]/30 bg-[#dc2626]/10 px-3 py-2.5 text-sm text-[#f87171]">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full mt-1" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Criando conta…
              </>
            ) : (
              "Criar conta"
            )}
          </Button>
        </form>

        <div className="mt-5 pt-5 border-t border-[#1f1f1f] text-center">
          <p className="text-sm text-[#6b7280]">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="text-[#dc2626] hover:text-[#f87171] font-medium transition-colors"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
