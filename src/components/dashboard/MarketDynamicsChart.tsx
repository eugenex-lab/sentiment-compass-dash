import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Line,
  ComposedChart,
  Area,
} from "recharts";
import {
  FearGreedDataPoint,
  formatCompactNumber,
  formatCurrency,
} from "@/hooks/useFearGreedIndex";
import { useMemo } from "react";

interface MarketDynamicsChartProps {
  data: FearGreedDataPoint[];
}

export const MarketDynamicsChart = ({ data }: MarketDynamicsChartProps) => {
  const chartData = useMemo(() => {
    return [...data].reverse().map((d) => ({
      ...d,
      // If volume is missing, create a proxy based on sentiment change and value for visual analysis
      volumeProxy:
        d.volume24h ||
        Math.abs(d.value - 50) * 1000000 + Math.random() * 5000000,
      // Ensure we have a price for the scale even if small
      displayPrice: d.price || 0,
    }));
  }, [data]);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 h-full h-full flex flex-col relative group overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-foreground tracking-tight uppercase opacity-70">
          Price & Volume Dynamics
        </h3>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Market Velocity
        </span>
      </div>

      <div className="flex-1 w-full min-h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--accent))"
                  stopOpacity={0.1}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--accent))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="hsl(var(--muted-foreground))"
              vertical={false}
              opacity={0.05}
            />
            <XAxis dataKey="date" hide />
            <YAxis
              yAxisId="price"
              orientation="right"
              domain={["auto", "auto"]}
              hide
            />
            <YAxis yAxisId="volume" domain={["auto", "auto"]} hide />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-background/95 backdrop-blur-md border border-primary/10 rounded-xl p-3 shadow-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                        {d.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-6">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Market Price
                          </span>
                          <span className="text-sm font-bold font-mono text-accent">
                            {d.price ? formatCurrency(d.price) : "---"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Trade Volume
                          </span>
                          <span className="text-sm font-bold font-mono text-foreground/80">
                            {d.volume24h
                              ? `$${formatCompactNumber(d.volume24h)}`
                              : "Aggregating..."}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="displayPrice"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#priceGradient)"
              animationDuration={2000}
            />
            <Bar
              yAxisId="volume"
              dataKey="volume24h"
              fill="hsl(var(--primary))"
              opacity={0.4}
              radius={[2, 2, 0, 0]}
              barSize={12}
              animationDuration={1500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/20 pt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              Price
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary/40" />
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              Volume
            </span>
          </div>
        </div>
        <p className="text-[9px] font-medium text-muted-foreground/50 tracking-tight">
          Institutional Volume vs BTC Price
        </p>
      </div>
    </div>
  );
};
