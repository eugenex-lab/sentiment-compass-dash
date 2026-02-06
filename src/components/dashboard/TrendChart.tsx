import { useMemo } from "react";
import {
  AreaChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  FearGreedDataPoint,
  getClassificationColor,
  formatCurrency,
  formatCompactNumber,
} from "@/hooks/useFearGreedIndex";
import { format } from "date-fns";

interface TrendChartProps {
  data: FearGreedDataPoint[];
  timeRange?: "7d" | "30d" | "90d" | "1y" | "2y" | "5y" | "10y" | "max";
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const color = getClassificationColor(data.value_classification);

    return (
      <div className="bg-card/95 backdrop-blur-md border border-primary/20 rounded-xl p-4 shadow-2xl ring-1 ring-white/5 space-y-3 min-w-[180px]">
        <div className="border-b border-white/10 pb-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            {format(new Date(data.date), "MMMM dd, yyyy")}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Sentiment
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black font-mono" style={{ color }}>
                {data.value}
              </span>
              <span
                className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-current bg-current/5"
                style={{ color }}
              >
                {data.value_classification}
              </span>
            </div>
          </div>

          {data.price && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                BTC Price
              </span>
              <span className="text-sm font-bold font-mono text-foreground">
                {formatCurrency(data.price)}
              </span>
            </div>
          )}

          {data.volume24h && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Volume
              </span>
              <span className="text-sm font-bold font-mono text-foreground/80">
                ${formatCompactNumber(data.volume24h)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const TrendChart = ({ data, timeRange }: TrendChartProps) => {
  const chartData = useMemo(() => [...data].reverse(), [data]);

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
      case "10y":
        return 365;
      case "max":
        return Math.ceil(chartData.length / 8);
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
              yAxisId="sentiment"
              y={25}
              stroke="hsl(var(--extreme-fear))"
              strokeDasharray="4 4"
              strokeOpacity={0.4}
            />
            <ReferenceLine
              yAxisId="sentiment"
              y={50}
              stroke="hsl(var(--neutral))"
              strokeDasharray="4 4"
              strokeOpacity={0.4}
            />
            <ReferenceLine
              yAxisId="sentiment"
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
                  !timeRange ||
                    timeRange === "5y" ||
                    timeRange === "2y" ||
                    timeRange === "10y" ||
                    timeRange === "max"
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
              yAxisId="sentiment"
              domain={[0, 100]}
              stroke="currentColor"
              strokeOpacity={0.5}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              ticks={[0, 25, 50, 75, 100]}
              className="text-muted-foreground"
            />
            <YAxis
              yAxisId="price"
              orientation="right"
              domain={["auto", "auto"]}
              stroke="currentColor"
              strokeOpacity={0.3}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `$${formatCompactNumber(val)}`}
              className="text-muted-foreground font-medium"
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Volume Bars (Background) */}
            <Bar
              yAxisId="sentiment"
              dataKey="volume24h"
              fill="hsl(var(--primary))"
              fillOpacity={0.15}
              animationDuration={1000}
            />

            {/* Price Line */}
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{
                r: 4,
                fill: "hsl(var(--accent))",
                stroke: "hsl(var(--background))",
                strokeWidth: 2,
              }}
              animationDuration={2000}
            />

            {/* Sentiment Area */}
            <Area
              yAxisId="sentiment"
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
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mt-6 text-[10px] uppercase tracking-widest font-bold opacity-70">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
          <span>Fear Ranges</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_8px_hsl(var(--primary)/0.4)]"
            style={{ backgroundColor: "hsl(var(--primary))" }}
          ></div>
          <span>Sentiment Index</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-accent border-b-2 border-dashed border-accent"></div>
          <span className="text-accent">BTC Price (USD)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary/20 rounded-sm"></div>
          <span>Trade Volume</span>
        </div>
      </div>
    </div>
  );
};
