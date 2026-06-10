"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goTo = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    router.push(`?${params.toString()}`);
  };

  /* Build page numbers with ellipsis */
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      {/* Prev */}
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Página anterior"
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-[8px] border transition-colors duration-150 cursor-pointer",
          "border-[#1f1f1f] bg-[#0a0a0a] text-[#9ca3af] hover:border-[#2a2a2a] hover:text-white",
          "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-[#9ca3af] disabled:hover:border-[#1f1f1f]"
        )}
      >
        <ChevronLeft size={15} />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="text-[#4a4a4a] text-sm px-1">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p)}
            aria-current={p === currentPage ? "page" : undefined}
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-[8px] border text-sm transition-colors duration-150 cursor-pointer",
              p === currentPage
                ? "border-[#dc2626] bg-[#dc2626]/10 text-[#dc2626] font-semibold"
                : "border-[#1f1f1f] bg-[#0a0a0a] text-[#9ca3af] hover:border-[#2a2a2a] hover:text-white"
            )}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Próxima página"
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-[8px] border transition-colors duration-150 cursor-pointer",
          "border-[#1f1f1f] bg-[#0a0a0a] text-[#9ca3af] hover:border-[#2a2a2a] hover:text-white",
          "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-[#9ca3af] disabled:hover:border-[#1f1f1f]"
        )}
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
