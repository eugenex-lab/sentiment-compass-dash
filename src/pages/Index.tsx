import { useState } from "react";
import { Calendar, TrendingDown, TrendingUp, Activity, BarChart3 } from "lucide-react";
import { useFearGreedIndex, calculateStats, getClassificationFromValue } from "@/hooks/useFearGreedIndex";
import { useTheme } from "@/hooks/useTheme";
import { Header } from "@/components/dashboard/Header";
import { SentimentGauge } from "@/components/dashboard/SentimentGauge";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { DistributionChart } from "@/components/dashboard/DistributionChart";
import { RecentReadings } from "@/components/dashboard/RecentReadings";
import { TimeRangeSelector } from "@/components/dashboard/TimeRangeSelector";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";

const Index = () => {
  const { theme, toggleTheme } = useTheme();
  const { data, isLoading, isRefetching, refetch, dataUpdatedAt } = useFearGreedIndex();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  const stats = data ? calculateStats(data) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (!data || !stats || !stats.current) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Unable to load data</h2>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          onRefresh={() => refetch()}
          isRefreshing={isRefetching}
          lastUpdated={dataUpdatedAt ? new Date(dataUpdatedAt) : undefined}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Sentiment Gauge */}
          <SentimentGauge
            value={stats.current.value}
            classification={stats.current.value_classification}
          />

          {/* Stats Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <StatsCard
              title="7-Day Average"
              value={stats.avg7Day}
              subtitle={getClassificationFromValue(stats.avg7Day)}
              icon={Calendar}
              delay={100}
            />
            <StatsCard
              title="30-Day Average"
              value={stats.avg30Day}
              subtitle={getClassificationFromValue(stats.avg30Day)}
              icon={Activity}
              delay={150}
            />
            <StatsCard
              title="Year High"
              value={stats.highest}
              subtitle="Extreme Greed"
              icon={TrendingUp}
              delay={200}
            />
            <StatsCard
              title="Year Low"
              value={stats.lowest}
              subtitle="Extreme Fear"
              icon={TrendingDown}
              delay={250}
            />
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Market Trend
          </h2>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>

        {/* Trend Chart */}
        <TrendChart data={data} timeRange={timeRange} />

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <DistributionChart classificationCounts={stats.classificationCounts} />
          <RecentReadings data={data} />
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Data provided by{" "}
            <a
              href="https://alternative.me/crypto/fear-and-greed-index/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Alternative.me
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
