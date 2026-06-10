"use client";

import { useState } from "react";
import { Loader2, Check, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

interface Props {
  initialData: {
    name: string;
    phone: string;
    cpf: string;
    email: string;
  };
}

export function DadosClient({ initialData }: Props) {
  const [form, setForm] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Password change
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdError, setPwdError] = useState("");

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSaveDados(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("O nome é obrigatório.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(false);

    const res = await fetch("/api/conta/dados", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, phone: form.phone, cpf: form.cpf }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erro ao salvar.");
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }

    setLoading(false);
  }

  async function handleChangePwd(e: React.FormEvent) {
    e.preventDefault();
    if (pwd.next.length < 6) {
      setPwdError("A nova senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (pwd.next !== pwd.confirm) {
      setPwdError("As senhas não coincidem.");
      return;
    }

    setPwdLoading(true);
    setPwdError("");
    setPwdSuccess(false);

    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.updateUser({ password: pwd.next });

    if (error) {
      setPwdError(error.message);
    } else {
      setPwdSuccess(true);
      setPwd({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwdSuccess(false), 3000);
    }

    setPwdLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Meus Dados</h1>
        <p className="text-sm text-[#6b7280] mt-1">Atualize suas informações pessoais.</p>
      </div>

      {/* Personal data form */}
      <div className="rounded-[10px] border border-[#1f1f1f] bg-[#0d0d0d] p-6">
        <h2 className="text-sm font-semibold text-white mb-5">Informações pessoais</h2>

        <form onSubmit={handleSaveDados} className="flex flex-col gap-4">
          <Input
            label="Nome completo *"
            value={form.name}
            onChange={set("name")}
            placeholder="Seu nome"
            required
          />

          {/* Email is read-only — managed by Supabase */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">
              E-mail
            </label>
            <div className="h-11 w-full rounded-[8px] border border-[#1f1f1f] bg-[#0a0a0a] px-4 flex items-center text-sm text-[#6b7280] cursor-not-allowed">
              {form.email}
            </div>
            <p className="text-xs text-[#4a4a4a]">O e-mail não pode ser alterado por aqui.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Telefone"
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              placeholder="(11) 99999-9999"
            />
            <Input
              label="CPF"
              value={form.cpf}
              onChange={set("cpf")}
              placeholder="000.000.000-00"
            />
          </div>

          {error && (
            <div className="rounded-[8px] border border-[#dc2626]/30 bg-[#dc2626]/10 px-3 py-2.5 text-sm text-[#f87171]">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-[8px] border border-green-500/30 bg-green-500/10 px-3 py-2.5 text-sm text-green-400 flex items-center gap-2">
              <Check size={14} /> Dados salvos com sucesso.
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? <Loader2 size={14} className="animate-spin" /> : "Salvar dados"}
            </Button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="rounded-[10px] border border-[#1f1f1f] bg-[#0d0d0d] p-6">
        <h2 className="text-sm font-semibold text-white mb-5">Alterar senha</h2>

        <form onSubmit={handleChangePwd} className="flex flex-col gap-4">
          <div className="relative">
            <Input
              label="Nova senha *"
              type={showPwd ? "text" : "password"}
              value={pwd.next}
              onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
              placeholder="Mínimo 6 caracteres"
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 bottom-3 text-[#4a4a4a] hover:text-[#9ca3af] transition-colors"
            >
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <Input
            label="Confirmar nova senha *"
            type={showPwd ? "text" : "password"}
            value={pwd.confirm}
            onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
            placeholder="Repita a nova senha"
            required
          />

          {pwdError && (
            <div className="rounded-[8px] border border-[#dc2626]/30 bg-[#dc2626]/10 px-3 py-2.5 text-sm text-[#f87171]">
              {pwdError}
            </div>
          )}

          {pwdSuccess && (
            <div className="rounded-[8px] border border-green-500/30 bg-green-500/10 px-3 py-2.5 text-sm text-green-400 flex items-center gap-2">
              <Check size={14} /> Senha alterada com sucesso.
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={pwdLoading} className="min-w-[140px]">
              {pwdLoading ? <Loader2 size={14} className="animate-spin" /> : "Alterar senha"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
