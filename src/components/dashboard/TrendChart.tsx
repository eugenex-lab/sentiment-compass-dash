import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  FearGreedDataPoint,
  getClassificationColor,
} from "@/hooks/useFearGreedIndex";
import { format } from "date-fns";

interface TrendChartProps {
  data: FearGreedDataPoint[];
  timeRange?: "7d" | "30d" | "90d" | "1y" | "2y" | "5y";
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const color = getClassificationColor(data.value_classification);

    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
        <p className="text-xs text-muted-foreground mb-1">
          {format(new Date(data.date), "MMM d, yyyy")}
        </p>
        <p className="text-2xl font-bold font-mono" style={{ color }}>
          {data.value}
        </p>
        <p className="text-xs font-medium" style={{ color }}>
          {data.value_classification}
        </p>
      </div>
    );
  }
  return null;
};

export const TrendChart = ({ data, timeRange }: TrendChartProps) => {
  const getRangeData = () => {
    if (!timeRange) return [...data].reverse();

    switch (timeRange) {
      case "7d":
        return data.slice(0, 7).reverse();
      case "30d":
        return data.slice(0, 30).reverse();
      case "90d":
        return data.slice(0, 90).reverse();
      case "1y":
        return data.slice(0, 365).reverse();
      case "2y":
        return data.slice(0, 730).reverse();
      case "5y":
        return data.slice(0, 1825).reverse();
      default:
        return data.slice(0, 30).reverse();
    }
  };

  const chartData = getRangeData();

  const getTickInterval = () => {
    if (!timeRange) {
      const len = chartData.length;
      if (len <= 7) return 1;
      if (len <= 30) return 5;
      if (len <= 90) return 14;
      return Math.ceil(len / 6);
    }

    switch (timeRange) {
      case "7d":
        return 1;
      case "30d":
        return 5;
      case "90d":
        return 14;
      case "1y":
        return 60;
      case "2y":
        return 120;
      case "5y":
        return 180;
      default:
        return 7;
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-6">
      <div className="h-[280px] sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--accent))"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              strokeOpacity={0.1}
              vertical={false}
            />
            <ReferenceLine
              y={25}
              stroke="hsl(var(--extreme-fear))"
              strokeDasharray="4 4"
              strokeOpacity={0.4}
            />
            <ReferenceLine
              y={50}
              stroke="hsl(var(--neutral))"
              strokeDasharray="4 4"
              strokeOpacity={0.4}
            />
            <ReferenceLine
              y={75}
              stroke="hsl(var(--greed))"
              strokeDasharray="4 4"
              strokeOpacity={0.4}
            />
            <XAxis
              dataKey="date"
              tickFormatter={(date) =>
                format(
                  new Date(date),
                  !timeRange || timeRange === "5y" || timeRange === "2y"
                    ? "MMM yy"
                    : "MMM d",
                )
              }
              stroke="currentColor"
              strokeOpacity={0.5}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={getTickInterval()}
              className="text-muted-foreground"
            />
            <YAxis
              domain={[0, 100]}
              stroke="currentColor"
              strokeOpacity={0.5}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              ticks={[0, 25, 50, 75, 100]}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              fill="url(#colorValue)"
              animationDuration={1500}
              dot={{
                r: 3.5,
                strokeWidth: 2,
                fill: "hsl(var(--primary))",
                stroke: "hsl(var(--background))",
                fillOpacity: 1,
              }}
              activeDot={{
                r: 6,
                strokeWidth: 2,
                stroke: "hsl(var(--background))",
                fill: "hsl(var(--primary))",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-8 mt-6 text-[10px] uppercase tracking-widest font-semibold opacity-70">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-red-500/80 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
          <span>Fear</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 bg-neutral rounded-full shadow-[0_0_8px_hsl(var(--neutral)/0.4)]"
            style={{ backgroundColor: "hsl(var(--neutral))" }}
          ></div>
          <span>Neutral</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_8px_hsl(var(--primary)/0.4)]"
            style={{ backgroundColor: "hsl(var(--primary))" }}
          ></div>
          <span>Greed</span>
        </div>
      </div>
    </div>
  );
};
