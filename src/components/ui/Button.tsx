import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

const variantClasses = {
  primary:
    "bg-[#dc2626] text-white hover:bg-[#b91c1c] border border-[#dc2626] hover:border-[#b91c1c]",
  outline:
    "bg-transparent text-white border border-[#1f1f1f] hover:border-[#dc2626] hover:text-[#dc2626]",
  ghost:
    "bg-transparent text-[#9ca3af] hover:text-white hover:bg-[#1a1a1a] border border-transparent",
  danger:
    "bg-transparent text-[#dc2626] border border-[#dc2626] hover:bg-[#dc2626] hover:text-white",
};

const sizeClasses = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-[8px] font-medium transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
