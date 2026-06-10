"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const handleClose = () => {
    setOpen(false);
    setValue("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/busca?q=${encodeURIComponent(q)}`);
    handleClose();
  };

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      {!open && (
        <button
          onClick={handleOpen}
          aria-label="Buscar produtos"
          className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-white/5 transition-colors duration-200"
        >
          <Search size={17} strokeWidth={1.4} className="text-white" />
        </button>
      )}

      {/* Expanded search input */}
      {open && (
        <form
          onSubmit={handleSubmit}
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2",
            "bg-[#111111] border border-[#2a2a2a] rounded-full px-4 py-2",
            "shadow-lg shadow-black/40",
            /* Clamp width so it never overflows the viewport on narrow screens */
            "w-[min(20rem,calc(100vw-5rem))]"
          )}
        >
          <Search size={14} strokeWidth={1.6} className="text-[#4a4a4a] flex-shrink-0" />
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Buscar produtos..."
            className="flex-1 bg-transparent text-white text-[16px] sm:text-sm placeholder:text-[#4a4a4a] outline-none min-w-0"
          />
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar busca"
            className="flex-shrink-0 text-[#4a4a4a] hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </form>
      )}
    </div>
  );
}
