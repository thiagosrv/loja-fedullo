import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = [
  { number: 1, label: "Identificação", short: "Dados" },
  { number: 2, label: "Entrega", short: "Entrega" },
  { number: 3, label: "Pagamento", short: "Pagamento" },
];

interface CheckoutStepperProps {
  current: 1 | 2 | 3;
}

export function CheckoutStepper({ current }: CheckoutStepperProps) {
  return (
    <div className="flex items-center justify-center gap-0 py-5 sm:py-6">
      {STEPS.map((step, i) => {
        const done = step.number < current;
        const active = step.number === current;

        return (
          <div key={step.number} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors duration-200",
                  done && "bg-[#dc2626] border-[#dc2626] text-white",
                  active && "bg-[#dc2626] border-[#dc2626] text-white shadow-[0_0_12px_rgba(220,38,38,0.4)]",
                  !done && !active && "bg-transparent border-[#2a2a2a] text-[#4a4a4a]"
                )}
              >
                {done ? <Check size={14} /> : step.number}
              </div>
              {/* Short label on mobile, full label on sm+ */}
              <span
                className={cn(
                  "text-[10px] sm:text-xs whitespace-nowrap transition-colors duration-200",
                  active ? "text-white font-medium" : done ? "text-[#9ca3af]" : "text-[#4a4a4a]"
                )}
              >
                <span className="sm:hidden">{step.short}</span>
                <span className="hidden sm:inline">{step.label}</span>
              </span>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "w-10 sm:w-20 h-px mx-2 sm:mx-3 mb-5 transition-colors duration-200",
                  done ? "bg-[#dc2626]" : "bg-[#1f1f1f]"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
