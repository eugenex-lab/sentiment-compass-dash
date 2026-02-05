import { useQuery } from "@tanstack/react-query";

export interface FearGreedDataPoint {
  value: number;
  value_classification: string;
  timestamp: number;
  date: Date;
}

export interface FearGreedResponse {
  name: string;
  data: Array<{
    value: string;
    value_classification: string;
    timestamp: string;
    time_until_update?: string;
  }>;
}

export type Classification =
  | "Extreme Fear"
  | "Fear"
  | "Neutral"
  | "Greed"
  | "Extreme Greed";

export const getClassificationColor = (classification: string): string => {
  switch (classification) {
    case "Extreme Fear":
      return "hsl(var(--extreme-fear))";
    case "Fear":
      return "hsl(var(--fear))";
    case "Neutral":
      return "hsl(var(--neutral))";
    case "Greed":
      return "hsl(var(--greed))";
    case "Extreme Greed":
      return "hsl(var(--extreme-greed))";
    default:
      return "hsl(var(--primary))";
  }
};

export const getClassificationFromValue = (value: number): Classification => {
  if (value <= 24) return "Extreme Fear";
  if (value <= 44) return "Fear";
  if (value <= 55) return "Neutral";
  if (value <= 74) return "Greed";
  return "Extreme Greed";
};

const fetchFearGreedIndex = async (): Promise<FearGreedDataPoint[]> => {
  const response = await fetch("https://api.alternative.me/fng/?limit=1825");

  if (!response.ok) {
    throw new Error("Failed to fetch Fear & Greed Index data");
  }

  const json: FearGreedResponse = await response.json();

  return json.data.map((item) => ({
    value: parseInt(item.value, 10),
    value_classification: item.value_classification,
    timestamp: parseInt(item.timestamp, 10),
    date: new Date(parseInt(item.timestamp, 10) * 1000),
  }));
};

export const useFearGreedIndex = () => {
  return useQuery({
    queryKey: ["fearGreedIndex"],
    queryFn: fetchFearGreedIndex,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 10,
  });
};

export const calculateStreak = (data: FearGreedDataPoint[]) => {
  if (!data || data.length === 0) return { classification: "", days: 0 };

  const currentClassification = data[0].value_classification;
  let streakDays = 0;

  for (const point of data) {
    if (point.value_classification === currentClassification) {
      streakDays++;
    } else {
      break;
    }
  }

  return { classification: currentClassification, days: streakDays };
};

export const getTrendDirection = (data: FearGreedDataPoint[]) => {
  if (!data || data.length < 7) return { direction: "Neutral", change: 0 };

  const current = data[0].value;
  const weekAgo = data[6].value;
  const change = current - weekAgo;

  if (change > 5) return { direction: "Uptrend", change };
  if (change < -5) return { direction: "Downtrend", change };
  return { direction: "Sideways", change };
};

export const getMarketSignal = (value: number): string => {
  if (value <= 20) return "Strong buying opportunity";
  if (value <= 35) return "Potential buying opportunity";
  if (value <= 55) return "Market is balanced";
  if (value <= 75) return "Exercise caution";
  return "Consider taking profits";
};

export const calculateStats = (data: FearGreedDataPoint[]) => {
  if (!data || data.length === 0) {
    return {
      current: null,
      avg7Day: 0,
      avg30Day: 0,
      avgAll: 0,
      highest: 0,
      lowest: 100,
      classificationCounts: {} as Record<string, number>,
      streak: { classification: "", days: 0 },
      trend: { direction: "Neutral", change: 0 },
      signal: "",
      yesterdayChange: 0,
    };
  }

  const current = data[0];
  const yesterday = data[1];
  const last7Days = data.slice(0, 7);
  const last30Days = data.slice(0, 30);

  const avg7Day = Math.round(
    last7Days.reduce((sum, d) => sum + d.value, 0) / last7Days.length,
  );
  const avg30Day = Math.round(
    last30Days.reduce((sum, d) => sum + d.value, 0) / last30Days.length,
  );
  const avgAll = Math.round(
    data.reduce((sum, d) => sum + d.value, 0) / data.length,
  );

  const highest = Math.max(...data.map((d) => d.value));
  const lowest = Math.min(...data.map((d) => d.value));
  const yesterdayChange = yesterday ? current.value - yesterday.value : 0;

  const classificationCounts: Record<string, number> = {};
  data.forEach((d) => {
    classificationCounts[d.value_classification] =
      (classificationCounts[d.value_classification] || 0) + 1;
  });

  return {
    current,
    avg7Day,
    avg30Day,
    avgAll,
    highest,
    lowest,
    classificationCounts,
    streak: calculateStreak(data),
    trend: getTrendDirection(data),
    signal: getMarketSignal(current.value),
    yesterdayChange,
  };
};
