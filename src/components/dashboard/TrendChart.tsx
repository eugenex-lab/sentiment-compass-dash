import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FearGreedDataPoint, getClassificationColor } from "@/hooks/useFearGreedIndex";
import { format } from "date-fns";

interface TrendChartProps {
  data: FearGreedDataPoint[];
  timeRange: "7d" | "30d" | "90d" | "1y";
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const color = getClassificationColor(data.value_classification);

    return (
      <div className="glass-card rounded-lg p-3 shadow-xl border border-border/50">
        <p className="text-sm font-medium mb-1">
          {format(new Date(data.date), "MMM d, yyyy")}
        </p>
        <p className="text-2xl font-bold font-mono" style={{ color }}>
          {data.value}
        </p>
        <p className="text-sm" style={{ color }}>
          {data.value_classification}
        </p>
      </div>
    );
  }
  return null;
};

export const TrendChart = ({ data, timeRange }: TrendChartProps) => {
  const getRangeData = () => {
    switch (timeRange) {
      case "7d":
        return data.slice(0, 7).reverse();
      case "30d":
        return data.slice(0, 30).reverse();
      case "90d":
        return data.slice(0, 90).reverse();
      case "1y":
        return data.slice(0, 365).reverse();
      default:
        return data.slice(0, 30).reverse();
    }
  };

  const chartData = getRangeData();

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
      <h3 className="text-lg font-semibold mb-4">Historical Trend</h3>
      <div className="h-[300px] sm:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(new Date(date), "MMM d")}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
