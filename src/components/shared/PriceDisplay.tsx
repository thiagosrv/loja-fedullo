import { formatBRL } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  cents: number;
  className?: string;
}

export function PriceDisplay({ cents, className }: PriceDisplayProps) {
  return (
    <span className={cn("tabular-nums", className)}>
      {formatBRL(cents)}
    </span>
  );
}
