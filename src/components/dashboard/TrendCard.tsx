import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendCardProps {
  direction: string;
  change: number;
  avg7Day: number;
}

export const TrendCard = ({ direction, change, avg7Day }: TrendCardProps) => {
  const Icon = direction === "Uptrend" ? TrendingUp : direction === "Downtrend" ? TrendingDown : Minus;
  const iconColor = direction === "Uptrend" ? "text-green-500" : direction === "Downtrend" ? "text-red-500" : "text-muted-foreground";

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
          direction === "Uptrend" ? "bg-green-500/10" : 
          direction === "Downtrend" ? "bg-red-500/10" : "bg-muted"
        }`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">7-Day Trend</p>
          <p className="text-xl font-bold font-mono">{avg7Day}</p>
          <p className={`text-xs font-medium ${iconColor}`}>
            {direction} ({change > 0 ? "+" : ""}{change})
          </p>
        </div>
      </div>
    </div>
  );
};
