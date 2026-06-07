"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body style={{ background: "#000", color: "#fff", fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ color: "#dc2626", fontSize: "1.5rem", marginBottom: "0.5rem" }}>Algo deu errado</h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            {error.message ?? "Erro interno do servidor"}
          </p>
          <button
            onClick={reset}
            style={{ background: "#dc2626", color: "#fff", border: "none", padding: "0.5rem 1.5rem", borderRadius: "6px", cursor: "pointer" }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
