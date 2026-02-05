import { FearGreedDataPoint, getClassificationColor } from "@/hooks/useFearGreedIndex";
import { format } from "date-fns";

interface RecentReadingsProps {
  data: FearGreedDataPoint[];
}

export const RecentReadings = ({ data }: RecentReadingsProps) => {
  const recentData = data.slice(0, 7);

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="text-sm font-semibold mb-4 text-foreground">Recent Activity</h3>
      <div className="space-y-2">
        {recentData.map((item, index) => {
          const prevValue = recentData[index + 1]?.value;
          const change = prevValue ? item.value - prevValue : 0;
          
          return (
            <div
              key={item.timestamp}
              className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-16">
                  {format(item.date, "MMM d")}
                </span>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getClassificationColor(item.value_classification) }}
                />
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="text-lg font-bold font-mono"
                  style={{ color: getClassificationColor(item.value_classification) }}
                >
                  {item.value}
                </span>
                {index < recentData.length - 1 && (
                  <span className={`text-xs font-mono w-8 text-right ${
                    change > 0 ? "text-green-500" : change < 0 ? "text-red-500" : "text-muted-foreground"
                  }`}>
                    {change > 0 ? "+" : ""}{change}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
