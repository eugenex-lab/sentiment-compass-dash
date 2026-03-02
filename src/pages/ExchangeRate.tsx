import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Search,
  RefreshCw,
  Moon,
  Sun,
  Globe,
  Building2,
  AlertCircle,
  Plus,
  X,
  Download,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/hooks/useTheme";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, subDays } from "date-fns";
import {
  ExchangeRateTable,
  ExchangeRateRow,
} from "@/components/exchange/ExchangeRateTable";
import { NairaNews } from "@/components/exchange/NairaNews";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CbnRate {
  id: number;
  currency: string;
  ratedate: string;
  buyingrate: string;
  centralrate: string;
  sellingrate: string;
}

interface CbnResult {
  latest: ExchangeRateRow[];
  history: CbnRate[]; // full history for the 4 focus currencies
}

// ─── Constants ────────────────────────────────────────────────────────────────

// The primary focus currencies
const FOCUS_KEYS_CBN = ["US DOLLAR", "EURO", "POUNDS STERLING"];
const FOCUS_KEYS_LIVE = ["USD", "EUR", "GBP"];

// Optional extras the user can add to the hero strip
const OPTIONAL_CBN = [
  "YEN",
  "CANADIAN DOLLAR",
  "CFA",
  "WAUA",
  "SWISS FRANC",
  "YUAN",
  "DIRHAM",
];
const OPTIONAL_LIVE = ["JPY", "CAD", "CHF", "CNY", "AED", "AUD", "SGD", "ZAR"];

// Chart line colours
const FX_COLORS: Record<string, string> = {
  "US DOLLAR": "#91c4bc", // teal
  EURO: "#61afef", // blue
  "POUNDS STERLING": "#c9b67a", // gold
  YEN: "#d19a66", // orange
  "CANADIAN DOLLAR": "#e06c75", // red
  USD: "#91c4bc",
  EUR: "#61afef",
  GBP: "#c9b67a",
  JPY: "#d19a66",
  CAD: "#e06c75",
};

// ─── CORS-safe CBN URL ────────────────────────────────────────────────────────

const CBN_URL = import.meta.env.DEV
  ? "/cbn-api/GetAllExchangeRates"
  : "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://www.cbn.gov.ng/api/GetAllExchangeRates");

// ─── Fetchers ─────────────────────────────────────────────────────────────────

const fetchCbnData = async (): Promise<CbnResult> => {
  const res = await fetch(CBN_URL);
  if (!res.ok) throw new Error("Failed to fetch CBN rates");
  const raw: CbnRate[] = await res.json();

  // — Latest per currency (for hero cards + table) —
  const latestMap = new Map<string, CbnRate>();
  for (const rate of raw) {
    const ex = latestMap.get(rate.currency);
    if (!ex || rate.ratedate > ex.ratedate) latestMap.set(rate.currency, rate);
  }
  const latest: ExchangeRateRow[] = Array.from(latestMap.values())
    .sort((a, b) => {
      const aFocus = FOCUS_KEYS_CBN.indexOf(
        FOCUS_KEYS_CBN.find((k) => a.currency.toUpperCase().includes(k)) ?? "",
      );
      const bFocus = FOCUS_KEYS_CBN.indexOf(
        FOCUS_KEYS_CBN.find((k) => b.currency.toUpperCase().includes(k)) ?? "",
      );
      if (aFocus !== -1 && bFocus !== -1) return aFocus - bFocus;
      if (aFocus !== -1) return -1;
      if (bFocus !== -1) return 1;
      return a.currency.localeCompare(b.currency);
    })
    .map((r) => ({
      currency: r.currency,
      buyingrate: r.buyingrate,
      centralrate: r.centralrate,
      sellingrate: r.sellingrate,
      ratedate: r.ratedate,
    }));

  // — Full history for focus + extras (for trend chart) —
  const history = raw.sort((a, b) => a.ratedate.localeCompare(b.ratedate));

  return { latest, history };
};

const fetchLiveRates = async (): Promise<ExchangeRateRow[]> => {
  const res = await fetch("https://open.er-api.com/v6/latest/NGN");
  if (!res.ok) throw new Error("Failed to fetch live rates");
  const json = await res.json();
  const rates: Record<string, number> = json.rates || {};
  const today = new Date().toISOString().split("T")[0];

  return Object.entries(rates)
    .filter(([code]) => code !== "NGN")
    .map(([code, fromNGN]) => {
      const ngnPer = 1 / fromNGN;
      return {
        currency: code,
        buyingrate: (ngnPer * 0.995).toFixed(4),
        centralrate: ngnPer.toFixed(4),
        sellingrate: (ngnPer * 1.005).toFixed(4),
        ratedate: today,
      };
    })
    .sort((a, b) => {
      const aF = FOCUS_KEYS_LIVE.indexOf(a.currency);
      const bF = FOCUS_KEYS_LIVE.indexOf(b.currency);
      if (aF !== -1 && bF !== -1) return aF - bF;
      if (aF !== -1) return -1;
      if (bF !== -1) return 1;
      return a.currency.localeCompare(b.currency);
    });
};

// ─── Chart helpers ────────────────────────────────────────────────────────────

type TimeRange = "30d" | "90d" | "1y" | "5y" | "max";

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
  { label: "1Y", value: "1y" },
  { label: "5Y", value: "5y" },
  { label: "All", value: "max" },
];

const cutoffForRange = (range: TimeRange): string | null => {
  const now = new Date();
  const days: Record<TimeRange, number | null> = {
    "30d": 30,
    "90d": 90,
    "1y": 365,
    "5y": 1825,
    max: null,
  };
  const d = days[range];
  return d ? subDays(now, d).toISOString().split("T")[0] : null;
};

const buildChartData = (
  history: CbnRate[],
  range: TimeRange,
  focusKeys: string[],
) => {
  const cutoff = cutoffForRange(range);
  const filtered = cutoff
    ? history.filter((r) => r.ratedate >= cutoff)
    : history;

  // Merge into unified date rows
  const dateMap = new Map<string, Record<string, number>>();
  for (const r of filtered) {
    const key = focusKeys.find((k) =>
      r.currency.toUpperCase().includes(k.toUpperCase()),
    );
    if (!key) continue;
    if (!dateMap.has(r.ratedate))
      dateMap.set(r.ratedate, { date: r.ratedate } as any);
    const row = dateMap.get(r.ratedate)!;
    row[key] = parseFloat(r.sellingrate);
  }
  return Array.from(dateMap.values()).sort((a, b) =>
    (a.date as unknown as string).localeCompare(b.date as unknown as string),
  );
};

const downloadCSV = (data: Record<string, any>[], activeKeys: string[]) => {
  if (!data.length) return;
  const headers = ["Date", ...activeKeys.map((k) => `${k} (₦)`)];
  const rows = data.map((row) => [
    row.date,
    ...activeKeys.map((k) => row[k] ?? ""),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cbn-fx-rates-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function HeroRateCard({
  label,
  buyRate,
  sellRate,
  highlight,
  onRemove,
  isOptional,
}: {
  label: string;
  buyRate: string;
  sellRate: string;
  highlight?: boolean;
  onRemove?: () => void;
  isOptional?: boolean;
}) {
  return (
    <div
      className={`glass-card rounded-2xl p-4 border flex flex-col gap-2 transition-all hover:scale-[1.02] duration-200 relative ${
        highlight
          ? "border-primary/50 bg-primary/10 shadow-[0_0_24px_hsl(var(--primary)/0.15)]"
          : "border-border/40"
      }`}
    >
      {isOptional && onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-secondary/40 hover:bg-destructive/20 hover:text-destructive flex items-center justify-center transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 pr-6">
        {label}
      </p>
      <p
        className={`text-xl sm:text-2xl font-black font-mono tracking-tight leading-none ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        ₦{sellRate}
      </p>
      <div className="flex items-center justify-between mt-auto pt-1 border-t border-border/20">
        <div>
          <p className="text-[8px] font-black uppercase tracking-wider text-muted-foreground/40">
            Buy
          </p>
          <p className="font-mono text-xs text-muted-foreground/70">
            ₦{buyRate}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[8px] font-black uppercase tracking-wider text-muted-foreground/40">
            Official
          </p>
          <p className="font-mono text-xs font-bold text-foreground/80">
            ₦{sellRate}
          </p>
        </div>
      </div>
    </div>
  );
}

const FxTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 backdrop-blur-md border border-primary/20 rounded-xl p-3.5 shadow-2xl ring-1 ring-white/5 space-y-2 min-w-[190px]">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-white/10 pb-1.5">
        {label}
      </p>
      {payload.map((entry: any) => (
        <div
          key={entry.dataKey}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {entry.name}
            </span>
          </div>
          <span
            className="font-mono text-sm font-bold"
            style={{ color: entry.color }}
          >
            ₦
            {Number(entry.value).toLocaleString("en-NG", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

type Source = "cbn" | "live";

export const ExchangeRate = () => {
  const { theme, toggleTheme } = useTheme();
  const [source, setSource] = useState<Source>("live");
  const [pinnedExtras, setPinnedExtras] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [chartRange, setChartRange] = useState<TimeRange>("1y");
  const [isSimulating, setIsSimulating] = useState(false);

  const toggleExtra = (key: string) => {
    setIsSimulating(true);
    setPinnedExtras((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
    // Simulation effect duration
    setTimeout(() => setIsSimulating(false), 1200);
  };

  // — CBN query —
  const {
    data: cbnResult,
    isLoading: cbnLoading,
    isError: cbnError,
    refetch: refetchCbn,
    isRefetching: cbnRefetching,
    dataUpdatedAt: cbnUpdatedAt,
  } = useQuery({
    queryKey: ["cbnData"],
    queryFn: fetchCbnData,
    staleTime: 1000 * 60 * 60,
    refetchInterval: 1000 * 60 * 60,
  });

  // — Live query —
  const {
    data: liveData,
    isLoading: liveLoading,
    isError: liveError,
    refetch: refetchLive,
    isRefetching: liveRefetching,
  } = useQuery({
    queryKey: ["liveRates"],
    queryFn: fetchLiveRates,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 10,
  });

  const isLoading = source === "cbn" ? cbnLoading : liveLoading;
  const isError = source === "cbn" ? cbnError : liveError;
  const isRefetching = source === "cbn" ? cbnRefetching : liveRefetching;
  const refetch = source === "cbn" ? refetchCbn : refetchLive;
  const updatedAt = source === "cbn" ? cbnUpdatedAt : undefined;

  // All latest rates for the current source
  const allLatest: ExchangeRateRow[] =
    source === "cbn" ? (cbnResult?.latest ?? []) : (liveData ?? []);

  // Focus currencies for hero cards
  const focusKeys = source === "cbn" ? FOCUS_KEYS_CBN : FOCUS_KEYS_LIVE;

  // Derive optional keys from available data (excluding focus keys)
  const optionalKeys = useMemo(() => {
    const rawOptions = allLatest
      .map((r) => r.currency)
      .filter(
        (c) =>
          !focusKeys.some((fk) => c.toUpperCase().includes(fk.toUpperCase())),
      );

    // Prioritize JPY/YEN to ensure it appears in the secondary options
    const prioritized = ["JPY", "YEN"];
    const foundPrioritized = rawOptions.filter((c) =>
      prioritized.some((p) => c.toUpperCase() === p),
    );
    const others = rawOptions.filter(
      (c) => !prioritized.some((p) => c.toUpperCase() === p),
    );

    return [...new Set([...foundPrioritized, ...others])].slice(0, 12);
  }, [allLatest, focusKeys]);

  // Active keys = focus + pinned
  const activeKeys = useMemo(
    () => [...focusKeys, ...pinnedExtras],
    [focusKeys, pinnedExtras],
  );

  const resolveRate = (key: string) =>
    allLatest.find((r) => r.currency.toUpperCase().includes(key.toUpperCase()));

  const defaultRates = useMemo(
    () => activeKeys.map(resolveRate).filter(Boolean) as ExchangeRateRow[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allLatest, source, activeKeys],
  );

  // Latest date
  const latestDate = allLatest[0]?.ratedate ?? null;

  // ── Table: search empty → only active focus/pins; search typed → all results ──
  const tableRates = useMemo(() => {
    if (!search.trim()) return defaultRates;
    return allLatest.filter((r) =>
      r.currency.toLowerCase().includes(search.toLowerCase()),
    );
  }, [allLatest, defaultRates, search]);

  const fmtRate = (val: string) => {
    const n = parseFloat(val);
    if (isNaN(n)) return "—";
    return n.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ── Trend chart data (CBN historical benchmark) ──
  const chartData = useMemo(() => {
    if (!cbnResult?.history.length) return [];
    // We map active keys to CBN names for the trend chart
    const cbnMatchKeys = activeKeys.map((k) => {
      if (source === "live") {
        const idx = FOCUS_KEYS_LIVE.indexOf(k);
        if (idx !== -1) return FOCUS_KEYS_CBN[idx];
        // For extras, try to find a match in CBN results
        const match = cbnResult.latest.find((r) =>
          r.currency.toUpperCase().includes(k.toUpperCase()),
        );
        return match?.currency ?? k;
      }
      return k;
    });
    return buildChartData(cbnResult.history, chartRange, cbnMatchKeys);
  }, [cbnResult, source, chartRange, activeKeys]);

  const tickInterval = useMemo(() => {
    const len = chartData.length;
    if (chartRange === "30d") return Math.ceil(len / 6);
    if (chartRange === "90d") return Math.ceil(len / 6);
    if (chartRange === "1y") return Math.ceil(len / 6);
    if (chartRange === "5y") return Math.ceil(len / 6);
    return Math.ceil(len / 8);
  }, [chartData, chartRange]);

  const tickFmt =
    chartRange === "30d" || chartRange === "90d" ? "MMM d" : "MMM yy";

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-8">
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
            Home
          </Link>
          <div className="flex items-center gap-2 bg-secondary/10 p-1 rounded-2xl border border-border/40">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="h-8 w-8 hover:bg-background/90 hover:text-primary transition-all rounded-xl"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
              />
            </Button>
            <div className="w-px h-5 bg-border/40" />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 hover:bg-background/90 transition-all rounded-xl"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-accent animate-in fade-in zoom-in duration-300" />
              ) : (
                <Moon className="h-4 w-4 text-primary animate-in fade-in zoom-in duration-300" />
              )}
            </Button>
          </div>
        </div>

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-2.5 rounded-2xl border border-primary/20 backdrop-blur-md shadow-inner shrink-0">
              <img
                src="https://res.cloudinary.com/dan4b75j7/image/upload/v1744208879/wealthblack/SkT3_azgue5.png"
                alt="Sankore"
                className="h-9 w-9 sm:hidden object-contain"
              />
              <img
                src="https://res.cloudinary.com/dan4b75j7/image/upload/v1744200906/wealthblack/Welcome-Sankore_fy7xvu.png"
                alt="Sankore"
                className="hidden sm:block h-10 lg:h-12 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-foreground leading-none">
                Exchange <span className="text-primary">Rates</span>
              </h1>
              <p className="text-[10px] sm:text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">
                Exchange Rate{" "}
                <span className="text-secondary">
                  Source:{" "}
                  {source === "live" ? "ExchangeRate-API" : "CBN Official"}
                </span>
              </p>
            </div>
          </div>
          {latestDate && (
            <div className="flex items-center gap-2 bg-secondary/20 rounded-xl px-3 py-2 border border-border/30 self-start sm:self-auto">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-muted-foreground/70 uppercase tracking-wider">
                Rate date: {latestDate}
              </span>
            </div>
          )}
        </div>

        {/* ── Source Tabs ── */}
        <div className="flex items-center gap-2 bg-secondary/10 p-1 rounded-2xl border border-border/30 w-fit">
          {(
            [
              ["cbn", Building2, "CBN Official"],
              ["live", Globe, "Live Market"],
            ] as const
          ).map(([val, Icon, label]) => (
            <button
              key={val}
              onClick={() => {
                setSource(val as Source);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                source === val
                  ? "bg-primary text-background shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {val === "live" ? "ExchangeRate-API (Live)" : "CBN Official"}
            </button>
          ))}
        </div>

        {/* ── Hero cards ── */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : isError ? null : (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-3">
            {/* Active Rate Cards (Focus + Pinned) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {defaultRates.map((row) => {
                const isUSD =
                  row.currency.toUpperCase().includes("US DOLLAR") ||
                  row.currency === "USD";
                const isPinned = pinnedExtras.some((p) =>
                  row.currency.toUpperCase().includes(p.toUpperCase()),
                );
                return (
                  <HeroRateCard
                    key={row.currency}
                    label={row.currency}
                    buyRate={fmtRate(row.buyingrate)}
                    sellRate={fmtRate(row.sellingrate)}
                    highlight={isUSD}
                    isOptional={isPinned}
                    onRemove={
                      isPinned
                        ? () => {
                            const key = optionalKeys.find((k) =>
                              row.currency
                                .toUpperCase()
                                .includes(k.toUpperCase()),
                            );
                            if (key) toggleExtra(key);
                          }
                        : undefined
                    }
                  />
                );
              })}
            </div>

            {/* + Add more chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mr-1">
                Add to view:
              </span>
              {optionalKeys
                .filter((k) => !pinnedExtras.includes(k))
                .map((key) => (
                  <button
                    key={key}
                    onClick={() => toggleExtra(key)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary/20 border border-border/30 text-muted-foreground/70 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-150"
                  >
                    <Plus className="h-2.5 w-2.5" />
                    {key}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Live disclaimer */}
        {source === "live" && !isLoading && (
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground/50 font-mono">
            <AlertCircle className="h-3 w-3" />
            Live rates from ExchangeRate-API (exchangerate-api.com) · Indicative
            spread ±0.5% · Not CBN official
          </div>
        )}

        {/* ── Rate Table ── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_12px_hsl(var(--primary)/0.5)]" />
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Current Rates
                <span className="ml-2 text-xs font-semibold text-muted-foreground/50">
                  {search.trim()
                    ? `(${tableRates.length} results)`
                    : `(${activeKeys.join(" · ")})`}
                </span>
              </h2>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <Input
                placeholder="Search all currencies…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm rounded-xl bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
          </div>

          {!isLoading && (
            <p className="text-[10px] text-muted-foreground/40 font-mono">
              Live data from {source === "live" ? "ExchangeRate-API" : "CBN"} ·
              Updated in real-time
            </p>
          )}

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <div className="glass-card rounded-2xl p-10 text-center border border-border/40">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
              <h3 className="text-base font-bold text-foreground mb-1">
                Failed to load rates
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {source === "cbn"
                  ? "Could not reach the CBN API. Try the Live Market source."
                  : "Could not fetch live market rates. Try the CBN source."}
              </p>
              <Button
                onClick={() => refetch()}
                variant="default"
                size="sm"
                className="rounded-xl"
              >
                Retry
              </Button>
            </div>
          ) : (
            <ExchangeRateTable rates={tableRates} />
          )}
        </div>

        {/* Trend sections (Graph then Table) */}
        {isLoading || cbnLoading ? (
          <div className="space-y-12">
            {/* Visual Trend Analysis Skeleton */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-1">
                <div className="w-1.5 h-6 bg-primary/20 rounded-full" />
                <Skeleton className="h-6 w-48 rounded-lg" />
              </div>
              <div className="glass-card rounded-2xl p-8 border border-primary/10 bg-primary/5 h-[400px] flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="w-full h-full animate-pulse bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary))_0%,transparent_70%)]" />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="relative mx-auto w-fit">
                    <RefreshCw className="h-12 w-12 text-primary/40 animate-spin" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary/60">
                      Market Rate Simulation Protocol
                    </h3>
                    <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">
                      Initializing Neural Forecast Engine · Delta Range 3023-X
                    </p>
                  </div>
                  <div className="w-full max-w-sm h-1.5 bg-secondary/20 rounded-full overflow-hidden mx-auto shimmer-progress">
                    <div className="h-full bg-primary/40 w-1/3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Trend Data Skeleton */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 px-1">
                <div className="w-1.5 h-6 bg-accent/20 rounded-full" />
                <Skeleton className="h-6 w-36 rounded-lg" />
              </div>
              <div className="overflow-hidden rounded-2xl border border-border/40 glass-card">
                <div className="p-4 space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex gap-4 justify-between items-center border-b border-border/10 pb-3 last:border-0 last:pb-0"
                    >
                      <Skeleton className="h-4 w-24 rounded-md" />
                      <div className="flex gap-8">
                        <Skeleton className="h-4 w-20 rounded-md" />
                        <Skeleton className="h-4 w-20 rounded-md" />
                        <Skeleton className="h-4 w-20 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-secondary/20 border-t border-border/20 text-center">
                  <div className="h-2 w-48 bg-muted-foreground/10 rounded-full mx-auto shimmer-progress" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          chartData.length > 0 && (
            <div className="space-y-12 animate-in fade-in transition-all duration-700">
              {/* ── Visual Trend Analysis (Chart) ── */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between px-1">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_12px_hsl(var(--primary)/0.5)]" />
                    <h2 className="text-lg font-bold text-foreground tracking-tight">
                      Visual Trend Analysis
                    </h2>
                    <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                      Market benchmark (ER-API)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-secondary/10 p-1 rounded-xl border border-border/30">
                      {TIME_RANGES.map(({ label, value }) => (
                        <button
                          key={value}
                          onClick={() => setChartRange(value)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                            chartRange === value
                              ? "bg-primary text-background shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className={`bg-card border border-border rounded-2xl p-4 sm:p-6 transition-all duration-500 overflow-hidden simulation-glow relative ${isSimulating ? "is-updating scale-[0.99] shadow-[0_0_40px_hsl(var(--primary)/0.15)]" : ""}`}
                >
                  <div className="scan-line" />
                  {isSimulating && (
                    <div className="absolute top-4 right-4 z-30 animate-in fade-in zoom-in duration-300">
                      <div className="flex items-center gap-2 bg-primary/20 backdrop-blur-md px-3 py-1 rounded-full border border-primary/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                          Simulation: Data Sync
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="h-[300px] sm:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="currentColor"
                          strokeOpacity={0.08}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(d) => {
                            try {
                              return format(new Date(d), tickFmt);
                            } catch {
                              return d;
                            }
                          }}
                          stroke="currentColor"
                          strokeOpacity={0.4}
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          interval={tickInterval}
                          className="text-muted-foreground"
                        />
                        <YAxis
                          domain={["auto", "auto"]}
                          stroke="currentColor"
                          strokeOpacity={0.4}
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) =>
                            `₦${Number(v).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`
                          }
                          width={70}
                          className="text-muted-foreground"
                        />
                        <Tooltip content={<FxTooltip />} />
                        <Legend
                          wrapperStyle={{
                            fontSize: "10px",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            paddingTop: "12px",
                          }}
                        />
                        {Object.keys(chartData[0] || {})
                          .filter((k) => k !== "date")
                          .map((key) => (
                            <Line
                              key={key}
                              type="monotone"
                              dataKey={key}
                              name={key}
                              stroke={
                                FX_COLORS[key] ||
                                "#" +
                                  Math.floor(Math.random() * 16777215).toString(
                                    16,
                                  )
                              }
                              strokeWidth={2}
                              dot={false}
                              activeDot={{
                                r: 5,
                                strokeWidth: 2,
                                stroke: "hsl(var(--background))",
                                fill: FX_COLORS[key] || "#999",
                              }}
                              connectNulls
                              animationDuration={1000}
                            />
                          ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* ── Daily Trend Data (Table) ── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-accent rounded-full shadow-[0_0_12px_hsl(var(--accent)/0.5)]" />
                    <h2 className="text-lg font-bold text-foreground tracking-tight">
                      Daily Trend Data
                    </h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const exportKeys = Object.keys(chartData[0] || {}).filter(
                        (k) => k !== "date",
                      );
                      downloadCSV(chartData, exportKeys);
                    }}
                    className="gap-2 rounded-xl border-primary/20 hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    <Download className="h-4 w-4" />
                    Download CSV
                  </Button>
                </div>

                <div
                  className={`overflow-hidden rounded-2xl border border-border/40 glass-card simulation-glow relative transition-all duration-500 ${isSimulating ? "is-updating scale-[0.995]" : ""}`}
                >
                  <div className="scan-line" />
                  {isSimulating && (
                    <div className="absolute top-4 right-4 z-30 animate-in fade-in zoom-in duration-300">
                      <div className="flex items-center gap-2 bg-accent/20 backdrop-blur-md px-3 py-1 rounded-full border border-accent/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-accent-foreground">
                          Syncing Grid...
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-secondary/95 backdrop-blur-md z-10">
                        <tr className="border-b border-border/40">
                          <th className="text-left px-5 py-3 font-black uppercase tracking-widest text-muted-foreground/70">
                            Date
                          </th>
                          {Object.keys(chartData[0] || {})
                            .filter((k) => k !== "date")
                            .map((key) => (
                              <th
                                key={key}
                                className="text-right px-5 py-3 font-black uppercase tracking-widest text-muted-foreground/70"
                              >
                                {key} (₦)
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...chartData]
                          .reverse()
                          .slice(0, 30)
                          .map((row: any, idx) => (
                            <tr
                              key={row.date}
                              className={`border-b border-border/10 last:border-0 hover:bg-secondary/10 transition-colors ${idx % 2 === 0 ? "bg-secondary/5" : ""}`}
                            >
                              <td className="px-5 py-2.5 font-mono text-muted-foreground">
                                {row.date}
                              </td>
                              {Object.keys(row)
                                .filter((k) => k !== "date")
                                .map((key) => (
                                  <td
                                    key={key}
                                    className="px-5 py-2.5 text-right font-mono font-bold text-foreground/80"
                                  >
                                    {row[key]
                                      ? row[key].toLocaleString("en-NG", {
                                          minimumFractionDigits: 2,
                                        })
                                      : "—"}
                                  </td>
                                ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-3 bg-secondary/20 border-t border-border/20 text-center">
                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">
                      Showing last 30 days of {chartRange} trend · Use Download
                      for full history
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* ── Naira News ── */}
        <div className="animate-in fade-in [animation-delay:600ms]">
          <NairaNews />
        </div>

        {/* ── Footer ── */}
        <footer className="mt-10 pb-12 border-t border-border/40 pt-10 flex flex-col items-center gap-6 text-center">
          <div className="group transition-all duration-500">
            <img
              src="https://res.cloudinary.com/dan4b75j7/image/upload/v1744208879/wealthblack/SkT3_azgue5.png"
              alt="Sankore Icon"
              className="h-10 w-10 sm:hidden object-contain opacity-80 group-hover:opacity-100"
            />
            <img
              src="https://res.cloudinary.com/dan4b75j7/image/upload/v1744200906/wealthblack/Welcome-Sankore_fy7xvu.png"
              alt="Sankore Logo"
              className="hidden sm:block h-12 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-700"
            />
          </div>
          <p className="max-w-xl text-[10px] sm:text-xs text-muted-foreground/50 font-medium uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Sankore Funds Management · FX data
            sourced from CBN and exchangerate-api.com. For internal use only.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ExchangeRate;
