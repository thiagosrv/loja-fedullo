import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[4px] px-2 py-0.5 text-xs font-medium",
        {
          default: "bg-[#1a1a1a] text-[#9ca3af] border border-[#1f1f1f]",
          accent: "bg-[#dc2626] text-white",
          outline: "border border-[#dc2626] text-[#dc2626] bg-transparent",
        }[variant],
        className
      )}
      {...props}
    />
  );
}
