import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
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
  const data = CLASSIFICATIONS.map((name) => ({
    name,
    value: classificationCounts[name] || 0,
    color: getClassificationColor(name),
  })).filter((d) => d.value > 0);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentage = ((item.value / total) * 100).toFixed(1);
      return (
        <div className="glass-card rounded-lg p-3 shadow-xl border border-border/50">
          <p className="font-medium" style={{ color: item.color }}>
            {item.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {item.value} days ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
      <h3 className="text-lg font-semibold mb-4">Sentiment Distribution</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value: string) => (
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
