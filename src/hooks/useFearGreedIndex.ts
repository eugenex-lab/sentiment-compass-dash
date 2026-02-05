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

export type Classification = "Extreme Fear" | "Fear" | "Neutral" | "Greed" | "Extreme Greed";

export const getClassificationColor = (classification: string): string => {
  switch (classification) {
    case "Extreme Fear":
      return "#ef4444";
    case "Fear":
      return "#f97316";
    case "Neutral":
      return "#22c55e";
    case "Greed":
      return "#eab308";
    case "Extreme Greed":
      return "#10b981";
    default:
      return "#3b82f6";
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
  const response = await fetch("https://api.alternative.me/fng/?limit=365");
  
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
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // 10 minutes
  });
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
    };
  }

  const current = data[0];
  const last7Days = data.slice(0, 7);
  const last30Days = data.slice(0, 30);

  const avg7Day = Math.round(
    last7Days.reduce((sum, d) => sum + d.value, 0) / last7Days.length
  );
  const avg30Day = Math.round(
    last30Days.reduce((sum, d) => sum + d.value, 0) / last30Days.length
  );
  const avgAll = Math.round(
    data.reduce((sum, d) => sum + d.value, 0) / data.length
  );

  const highest = Math.max(...data.map((d) => d.value));
  const lowest = Math.min(...data.map((d) => d.value));

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
  };
};
