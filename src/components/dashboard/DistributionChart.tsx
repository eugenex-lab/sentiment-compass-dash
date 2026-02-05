import { getClassificationColor } from "@/hooks/useFearGreedIndex";

interface DistributionChartProps {
  classificationCounts: Record<string, number>;
}

const CLASSIFICATIONS = [
  "Extreme Fear",
  "Fear",
  "Neutral",
  "Greed",
  "Extreme Greed",
];

export const DistributionChart = ({ classificationCounts }: DistributionChartProps) => {
  const total = Object.values(classificationCounts).reduce((sum, v) => sum + v, 0);

  const data = CLASSIFICATIONS.map((name) => ({
    name,
    value: classificationCounts[name] || 0,
    percentage: total > 0 ? ((classificationCounts[name] || 0) / total * 100).toFixed(1) : "0",
    color: getClassificationColor(name),
  }));

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="text-sm font-semibold mb-4 text-foreground">Sentiment Distribution</h3>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{item.name}</span>
              <span className="font-mono font-medium text-foreground">{item.percentage}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
