"use client";

export default function ContaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center px-4">
      <div className="w-12 h-12 rounded-full bg-[#dc2626]/10 border border-[#dc2626]/30 flex items-center justify-center">
        <span className="text-[#dc2626] text-xl font-bold">!</span>
      </div>
      <div>
        <h2 className="text-base font-semibold text-white">Erro ao carregar</h2>
        <p className="text-sm text-[#6b7280] mt-1 max-w-xs">
          Ocorreu um erro ao buscar seus dados. Tente novamente.
        </p>
        {error.digest && (
          <p className="text-xs text-[#4a4a4a] mt-2 font-mono">
            digest: {error.digest}
          </p>
        )}
      </div>
      <button
        onClick={reset}
        className="h-9 px-5 text-sm rounded-[8px] bg-[#dc2626] text-white hover:bg-[#b91c1c] transition-colors cursor-pointer"
      >
        Tentar novamente
      </button>
    </div>
  );
}
