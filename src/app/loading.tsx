// Suspense fallback para Server Components da homepage
// Renderizado instantaneamente enquanto os dados do Turso carregam
export default function Loading() {
  return (
    <div className="min-h-screen bg-[#000] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#dc2626] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-[#3a3a3a] tracking-[0.2em] uppercase">carregando</span>
      </div>
    </div>
  );
}
