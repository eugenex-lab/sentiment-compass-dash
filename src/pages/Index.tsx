import { useState } from "react";
import { TrendingDown, TrendingUp, BarChart3 } from "lucide-react";
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

const Index = () => {
  const { theme, toggleTheme } = useTheme();
  const { data, isLoading, isRefetching, refetch, dataUpdatedAt } = useFearGreedIndex();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y" | "2y" | "5y">("1y");

  const stats = data ? calculateStats(data) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (!data || !stats || !stats.current) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2 text-foreground">Unable to load data</h2>
          <p className="text-muted-foreground text-sm">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          onRefresh={() => refetch()}
          isRefreshing={isRefetching}
          lastUpdated={dataUpdatedAt ? new Date(dataUpdatedAt) : undefined}
        />

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Sentiment Gauge */}
          <SentimentGauge
            value={stats.current.value}
            classification={stats.current.value_classification}
            signal={stats.signal}
            yesterdayChange={stats.yesterdayChange}
          />

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
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

          {/* Extremes */}
          <div className="grid grid-cols-2 gap-3">
            <StatsCard
              title="Highest"
              value={stats.highest}
              subtitle="All-time high"
              icon={TrendingUp}
            />
            <StatsCard
              title="Lowest"
              value={stats.lowest}
              subtitle="All-time low"
              icon={TrendingDown}
            />
            <div className="col-span-2">
              <DistributionChart classificationCounts={stats.classificationCounts} />
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Market Trend</h2>
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          </div>
          <TrendChart data={data} timeRange={timeRange} />
        </div>

        {/* Recent Readings */}
        <RecentReadings data={data} />

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-muted-foreground">
          Data from{" "}
          <a
            href="https://alternative.me/crypto/fear-and-greed-index/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Alternative.me
          </a>
        </footer>
      </div>
    </div>
  );
};

export default Index;
