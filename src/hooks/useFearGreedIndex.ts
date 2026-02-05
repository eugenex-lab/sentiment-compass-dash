import { useQuery } from "@tanstack/react-query";

export interface FearGreedDataPoint {
  value: number;
  value_classification: string;
  timestamp: number;
  date: Date;
  price?: number;
  volume24h?: number;
  marketCap?: number;
  priceChange24h?: number;
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

export interface BitcoinStats {
  priceUsd: string;
  volumeUsd24Hr: string;
  marketCapUsd: string;
  changePercent24Hr: string;
}

export type Classification =
  | "Extreme Fear"
  | "Fear"
  | "Neutral"
  | "Greed"
  | "Extreme Greed";

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatCompactNumber = (number: number) => {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number);
};

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

const fetchBitcoinStats = async (): Promise<BitcoinStats | null> => {
  try {
    const response = await fetch("https://api.coincap.io/v2/assets/bitcoin");
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error("Failed to fetch BTC stats", error);
    return null;
  }
};

const fetchBitcoinHistory = async (): Promise<
  Array<{ priceUsd: string; volume24h: string; time: number }>
> => {
  try {
    // Using CoinGecko for actual Volume + Price history
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365&interval=daily",
    );
    if (!response.ok) return [];
    const json = await response.json();

    // Map CoinGecko arrays [[ts, val], ...] to a more usable format
    return json.prices.map((p: [number, number], i: number) => ({
      time: p[0],
      priceUsd: p[1].toString(),
      volume24h: json.total_volumes[i]
        ? json.total_volumes[i][1].toString()
        : "0",
    }));
  } catch (error) {
    console.error("Failed to fetch BTC history:", error);
    return [];
  }
};

const fetchFearGreedIndex = async (): Promise<FearGreedDataPoint[]> => {
  // Parallel fetch but handle failures individually to allow degradation
  const [fngResponse, btcStats, btcHistory] = await Promise.allSettled([
    fetch("https://api.alternative.me/fng/?limit=1825"),
    fetchBitcoinStats(),
    fetchBitcoinHistory(),
  ]);

  const fngOk = fngResponse.status === "fulfilled" && fngResponse.value.ok;
  if (!fngOk) {
    throw new Error(
      "Critical Failure: Unable to fetch Fear & Greed Sentiment data.",
    );
  }

  const fngJson: FearGreedResponse = await (
    fngResponse as PromiseFulfilledResult<Response>
  ).value.json();

  const btcStatsValue = btcStats.status === "fulfilled" ? btcStats.value : null;
  const btcHistoryValue =
    btcHistory.status === "fulfilled" ? btcHistory.value : [];

  const historyMap = new Map(
    btcHistoryValue.map((h) => [
      new Date(h.time).toDateString(),
      { price: parseFloat(h.priceUsd), volume: parseFloat(h.volume24h) },
    ]),
  );

  return fngJson.data.map((item, index) => {
    const timestamp = parseInt(item.timestamp, 10);
    const date = new Date(timestamp * 1000);

    const history = historyMap.get(date.toDateString());

    const point: FearGreedDataPoint = {
      value: parseInt(item.value, 10),
      value_classification: item.value_classification,
      timestamp,
      date,
      price: history?.price,
      volume24h: history?.volume,
    };

    // Enrich the latest data point with live market metrics
    if (index === 0 && btcStatsValue) {
      point.price = parseFloat(btcStatsValue.priceUsd);
      point.volume24h = parseFloat(btcStatsValue.volumeUsd24Hr);
      point.marketCap = parseFloat(btcStatsValue.marketCapUsd);
      point.priceChange24h = parseFloat(btcStatsValue.changePercent24Hr);
    }

    return point;
  });
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

export const calculatePriceVolatility = (data: FearGreedDataPoint[]) => {
  const prices = data
    .slice(0, 7)
    .map((d) => d.price)
    .filter(Boolean) as number[];
  if (prices.length < 2) return 0;

  const returns = [];
  for (let i = 0; i < prices.length - 1; i++) {
    returns.push((prices[i] - prices[i + 1]) / prices[i + 1]);
  }

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance =
    returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
  return Math.sqrt(variance) * 100; // Return as percentage
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
      volatility: 0,
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
    volatility: calculatePriceVolatility(data),
  };
};
