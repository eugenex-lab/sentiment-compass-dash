import { useState, useMemo } from "react";
import { TrendingDown, TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFearGreedIndex, calculateStats } from "@/hooks/useFearGreedIndex";
import { useTheme } from "@/hooks/useTheme";
import { Header } from "@/components/dashboard/Header";
import { SentimentGauge } from "@/components/dashboard/SentimentGauge";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { DistributionChart } from "@/components/dashboard/DistributionChart";
import { RecentReadings } from "@/components/dashboard/RecentReadings";
import { TimeRangeSelector } from "@/components/dashboard/TimeRangeSelector";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { TrendCard } from "@/components/dashboard/TrendCard";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { DateRange } from "react-day-picker";
import { isWithinInterval, startOfDay, endOfDay, format } from "date-fns";
import { downloadCSV } from "@/lib/csv";

const Index = () => {
  const { theme, toggleTheme } = useTheme();
  const { data, isLoading, isRefetching, refetch, dataUpdatedAt } =
    useFearGreedIndex();
  const [timeRange, setTimeRange] = useState<
    "7d" | "30d" | "90d" | "1y" | "2y" | "5y"
  >("1y");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const filteredData = useMemo(() => {
    if (!data) return null;
    if (!dateRange || !dateRange.from || !dateRange.to) return data;

    return data.filter((point) => {
      const date = new Date(point.date);
      return isWithinInterval(date, {
        start: startOfDay(dateRange.from!),
        end: endOfDay(dateRange.to!),
      });
    });
  }, [data, dateRange]);

  const stats = filteredData ? calculateStats(filteredData) : null;

  const handleDownload = () => {
    if (filteredData) {
      const filename = `fear-greed-data-${new Date().toISOString().split("T")[0]}.csv`;
      downloadCSV(filteredData, filename);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (!data || !stats || (!stats.current && data.length > 0)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2 text-foreground">
            {dateRange?.from
              ? "No data for selected range"
              : "Unable to load data"}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {dateRange?.from
              ? "Try selecting a different date range or clearing the filter."
              : "Please try again later."}
          </p>
          {dateRange?.from && (
            <Button variant="default" onClick={() => setDateRange(undefined)}>
              Clear filter
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-10 selection:bg-primary/20">
      <div className="max-w-7xl mx-auto space-y-10">
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          onRefresh={() => refetch()}
          isRefreshing={isRefetching}
          lastUpdated={dataUpdatedAt ? new Date(dataUpdatedAt) : undefined}
          onDownload={handleDownload}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        {/* Global Filter Indicator */}
        {dateRange?.from && dateRange?.to && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="bg-primary/20 border-2 border-primary/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl shadow-[0_0_25px_rgba(145,196,188,0.15)] ring-1 ring-white/10">
              <div className="flex items-center gap-5">
                <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                  <BarChart3 className="h-6 w-6 text-background" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground tracking-tight">
                    Active Portfolio Filter
                  </h3>
                  <p className="text-xs text-muted-foreground font-semibold">
                    Synthesizing sentiment data from{" "}
                    <span className="text-primary font-bold">
                      {format(dateRange.from, "MMMM dd, yyyy")}
                    </span>{" "}
                    —{" "}
                    <span className="text-primary font-bold">
                      {format(dateRange.to, "MMMM dd, yyyy")}
                    </span>
                  </p>
                </div>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={() => setDateRange(undefined)}
                className="rounded-xl px-6 bg-primary hover:bg-primary/80 text-background font-black text-xs uppercase tracking-tighter transition-all shadow-md shadow-primary/10"
              >
                Reset Dashboard
              </Button>
            </div>
          </div>
        )}

        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in [animation-delay:200ms]">
          {/* Sentiment Gauge */}
          <div className="lg:col-span-4 h-full">
            <SentimentGauge
              value={stats.current.value}
              classification={stats.current.value_classification}
              signal={stats.signal}
              yesterdayChange={stats.yesterdayChange}
            />
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-4">
            <StreakCard
              classification={stats.streak.classification}
              days={stats.streak.days}
            />
            <TrendCard
              direction={stats.trend.direction}
              change={stats.trend.change}
              avg7Day={stats.avg7Day}
            />
            <StatsCard
              title="30-Day Avg"
              value={stats.avg30Day}
              icon={BarChart3}
            />
            <StatsCard
              title="All-Time Avg"
              value={stats.avgAll}
              icon={BarChart3}
            />
          </div>

          {/* Extremes & Distribution */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-4">
            <StatsCard
              title="Highest"
              value={stats.highest}
              subtitle="Period high"
              icon={TrendingUp}
            />
            <StatsCard
              title="Lowest"
              value={stats.lowest}
              subtitle="Period low"
              icon={TrendingDown}
            />
            <div className="col-span-2 h-full">
              <DistributionChart
                classificationCounts={stats.classificationCounts}
              />
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="animate-fade-in [animation-delay:400ms] space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_12px_hsl(var(--primary)/0.5)]" />
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                Market Sentiment Trend
              </h2>
            </div>
            {!dateRange?.from && (
              <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
            )}
          </div>
          <TrendChart
            data={filteredData || []}
            timeRange={dateRange?.from && dateRange?.to ? undefined : timeRange}
          />
        </div>

        {/* Recent Readings */}
        <div className="animate-fade-in [animation-delay:600ms]">
          <RecentReadings data={filteredData || []} />
        </div>

        {/* Footer */}
        <footer className="mt-20 pb-12 border-t border-border/40 pt-10 flex flex-col items-center gap-6 text-center">
          <div className="group transition-all duration-500 flex items-center gap-4">
            <img
              src="https://storage.googleapis.com/context-bucket/6763567/8381861788710317540_0.png"
              alt="Sankore Icon"
              className="h-8 w-8 object-contain opacity-40 group-hover:opacity-100 transition-opacity"
            />
            <img
              src="https://sankore.com/images/SankoreWhiteLogo2023.png"
              alt="Sankore Logo"
              className="h-9 w-auto opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 brightness-0 dark:brightness-100 invert dark:invert-0"
            />
          </div>
          <div className="space-y-2">
            <p className="max-w-xl text-[10px] sm:text-xs text-muted-foreground/50 leading-relaxed font-medium uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Sankore Funds Management.
              Professional Financial Advisory & Investment Services.
            </p>
            <p className="text-[9px] text-muted-foreground/40 font-mono">
              Market data sourced via Alternative.me f&g API. For internal use
              by Sankore investment teams.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
