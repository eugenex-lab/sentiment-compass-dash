import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendCardProps {
  direction: string;
  change: number;
  avg7Day: number;
}

export const TrendCard = ({ direction, change, avg7Day }: TrendCardProps) => {
  const Icon =
    direction === "Uptrend" ? TrendingUp : direction === "Downtrend" ? TrendingDown : Minus;
  const iconColor =
    direction === "Uptrend"
      ? "text-green-500"
      : direction === "Downtrend"
        ? "text-red-500"
        : "text-muted-foreground";
  const bgColor =
    direction === "Uptrend"
      ? "bg-green-500/10"
      : direction === "Downtrend"
        ? "bg-red-500/10"
        : "bg-muted/30";

  return (
    <div className="bg-card border border-border rounded-xl p-4 h-full">
      <div className="flex flex-col items-center text-center gap-2">
        <div className={`p-2 rounded-lg shrink-0 ${bgColor}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">7-Day Trend</p>
          <p className="text-2xl font-bold font-mono text-foreground leading-tight">
            {avg7Day}
          </p>
          <p className={`text-[10px] font-semibold ${iconColor}`}>
            {direction} ({change > 0 ? "+" : ""}{change})
          </p>
        </div>
      </div>
    </div>
  );
};
