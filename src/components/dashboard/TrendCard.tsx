import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendCardProps {
  direction: string;
  change: number;
  avg7Day: number;
}

export const TrendCard = ({ direction, change, avg7Day }: TrendCardProps) => {
  const Icon =
    direction === "Uptrend"
      ? TrendingUp
      : direction === "Downtrend"
        ? TrendingDown
        : Minus;
  const iconColor =
    direction === "Uptrend"
      ? "text-green-500"
      : direction === "Downtrend"
        ? "text-red-500"
        : "text-muted-foreground";

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex h-full items-center">
      <div className="flex items-center gap-4 w-full">
        <div
          className={`p-2.5 rounded-xl shrink-0 border border-white/5 shadow-inner ${
            direction === "Uptrend"
              ? "bg-green-500/15"
              : direction === "Downtrend"
                ? "bg-red-500/15"
                : "bg-muted/30"
          }`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">7-Day Trend</p>
          <p className="text-xl font-bold font-mono text-foreground leading-tight">
            {avg7Day}
          </p>
          <p
            className={`text-[10px] font-bold uppercase tracking-wider ${iconColor} opacity-80`}
          >
            {direction} ({change > 0 ? "+" : ""}
            {change})
          </p>
        </div>
      </div>
    </div>
  );
};
