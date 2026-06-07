"use client";

import { useState } from "react";

interface ProductTabsProps {
  description: string;
  dimensions: string | null;
  observations: string | null;
}

type Tab = "descricao" | "dimensoes" | "observacoes";

export function ProductTabs({ description, dimensions, observations }: ProductTabsProps) {
  const [active, setActive] = useState<Tab>("descricao");

  const tabs: { id: Tab; label: string; content: string | null }[] = [
    { id: "descricao", label: "Descrição", content: description },
    { id: "dimensoes", label: "Dimensões", content: dimensions },
    { id: "observacoes", label: "Observações", content: observations },
  ].filter((t) => t.content && t.content.trim().length > 0) as { id: Tab; label: string; content: string }[];

  if (tabs.length === 0) return null;

  // Ensure active tab is valid
  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div className="mt-8">
      {/* Tab bar */}
      <div className="flex border-b border-[#1f1f1f]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`relative px-5 py-3 text-sm font-medium transition-colors cursor-pointer ${
              activeTab.id === tab.id
                ? "text-white"
                : "text-[#9ca3af] hover:text-white"
            }`}
          >
            {tab.label}
            {activeTab.id === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#dc2626] rounded-t" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="py-5 text-[#9ca3af] leading-relaxed text-sm whitespace-pre-wrap">
        {activeTab.content}
      </div>
    </div>
  );
}
