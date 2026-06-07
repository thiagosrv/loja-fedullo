import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "h-11 w-full rounded-[8px] border border-[#1f1f1f] bg-[#111111] px-4 text-sm text-white placeholder:text-[#4a4a4a]",
            "focus:outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]",
            "transition-colors duration-200",
            error && "border-[#dc2626]",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#dc2626]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
