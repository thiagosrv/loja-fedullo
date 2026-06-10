"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "featured",   label: "Destaque" },
  { value: "newest",     label: "Mais Recentes" },
  { value: "price_asc",  label: "Menor Preço" },
  { value: "price_desc", label: "Maior Preço" },
];

interface Props {
  sort: string;
  total: number;
}

export function ProductFilters({ sort, total }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page"); // reset to page 1 when sorting changes
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <p className="text-sm text-[#9ca3af]">
        <span className="text-white font-medium">{total}</span>{" "}
        {total === 1 ? "produto" : "produtos"}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-[#4a4a4a] font-medium uppercase tracking-wider">Ordenar:</span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSort(opt.value)}
            className={cn(
              "px-3 py-1.5 text-xs rounded-[6px] border transition-colors duration-150 cursor-pointer",
              sort === opt.value
                ? "border-[#dc2626] bg-[#dc2626]/10 text-[#dc2626] font-medium"
                : "border-[#1f1f1f] bg-[#0a0a0a] text-[#9ca3af] hover:border-[#2a2a2a] hover:text-white"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
