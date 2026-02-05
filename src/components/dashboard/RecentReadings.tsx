import {
  FearGreedDataPoint,
  getClassificationColor,
  formatCurrency,
} from "@/hooks/useFearGreedIndex";
import { format } from "date-fns";

interface RecentReadingsProps {
  data: FearGreedDataPoint[];
}

export const RecentReadings = ({ data }: RecentReadingsProps) => {
  const recentData = data.slice(0, 10);

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-foreground tracking-tight uppercase opacity-70">
          Institutional Activity Log
        </h3>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Sentiment vs Price
        </span>
      </div>
      <div className="space-y-1">
        {recentData.map((item, index) => {
          const prevValue = recentData[index + 1]?.value;
          const change = prevValue ? item.value - prevValue : 0;

          return (
            <div
              key={item.timestamp}
              className="group flex items-center justify-between py-3 px-2 rounded-xl hover:bg-primary/5 transition-colors border-b border-border/20 last:border-0"
            >
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-muted-foreground w-20">
                  {format(item.date, "MMM dd, yyyy")}
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
                    style={{
                      color: getClassificationColor(item.value_classification),
                      backgroundColor: "currentColor",
                    }}
                  />
                  <span
                    className="text-[10px] font-black uppercase tracking-wider opacity-60"
                    style={{
                      color: getClassificationColor(item.value_classification),
                    }}
                  >
                    {item.value_classification}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-8">
                {item.price && (
                  <span className="text-xs font-mono font-bold text-foreground/80">
                    {formatCurrency(item.price)}
                  </span>
                )}
                <div className="flex items-center gap-3 min-w-[60px] justify-end">
                  <span
                    className="text-base font-bold font-mono"
                    style={{
                      color: getClassificationColor(item.value_classification),
                    }}
                  >
                    {item.value}
                  </span>
                  {index < recentData.length - 1 && (
                    <span
                      className={`text-[10px] font-black font-mono w-6 text-right ${
                        change > 0
                          ? "text-green-500"
                          : change < 0
                            ? "text-red-500"
                            : "text-muted-foreground"
                      }`}
                    >
                      {change > 0 ? "+" : ""}
                      {change}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
