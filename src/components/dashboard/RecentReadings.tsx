import { FearGreedDataPoint, getClassificationColor } from "@/hooks/useFearGreedIndex";
import { format } from "date-fns";

interface RecentReadingsProps {
  data: FearGreedDataPoint[];
}

export const RecentReadings = ({ data }: RecentReadingsProps) => {
  const recentData = data.slice(0, 10);

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "400ms" }}>
      <h3 className="text-lg font-semibold mb-4">Recent Readings</h3>
      <div className="space-y-3">
        {recentData.map((item, index) => (
          <div
            key={item.timestamp}
            className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-20">
                {format(item.date, "MMM d")}
              </span>
              <span
                className="text-sm font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${getClassificationColor(item.value_classification)}20`,
                  color: getClassificationColor(item.value_classification),
                }}
              >
                {item.value_classification}
              </span>
            </div>
            <span
              className="text-lg font-bold font-mono"
              style={{ color: getClassificationColor(item.value_classification) }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
