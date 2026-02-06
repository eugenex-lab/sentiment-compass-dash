import {
  getClassificationColor,
  formatCurrency,
} from "@/hooks/useFearGreedIndex";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface SentimentGaugeProps {
  value: number;
  classification: string;
  signal: string;
  yesterdayChange: number;
  price?: number;
}

export const SentimentGauge = ({
  value,
  classification,
  signal,
  yesterdayChange,
  price,
}: SentimentGaugeProps) => {
  const color = getClassificationColor(classification);
  const rotation = (value / 100) * 180 - 90;

  const ChangeIcon =
    yesterdayChange > 0 ? ArrowUp : yesterdayChange < 0 ? ArrowDown : Minus;
  const changeColor =
    yesterdayChange > 0
      ? "text-green-500"
      : yesterdayChange < 0
        ? "text-red-500"
        : "text-muted-foreground";

  return (
    <div className="bg-card border border-border rounded-2xl p-6 h-full sm:p-8 h-full flex items-center justify-center">
      <div className="text-center">
        {/* Gauge Container */}
        <div className="relative w-56 h-28 mx-auto mb-4">
          <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient
                id="gaugeGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="hsl(var(--extreme-fear))" />
                <stop offset="35%" stopColor="hsl(var(--fear))" />
                <stop offset="50%" stopColor="hsl(var(--neutral))" />
                <stop offset="70%" stopColor="hsl(var(--greed))" />
                <stop offset="100%" stopColor="hsl(var(--extreme-greed))" />
              </linearGradient>
              <filter id="gaugeShadow">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                <feOffset dx="0" dy="1" result="offsetblur" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.3" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.05}
              strokeWidth="12"
              strokeLinecap="round"
            />

            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              filter="url(#gaugeShadow)"
            />
          </svg>

          {/* Needle */}
          <div
            className="absolute bottom-0 left-1/2 origin-bottom transition-transform duration-1000 ease-out"
            style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
          >
            <div className="w-0.5 h-16 bg-foreground rounded-full" />
            <div className="w-3 h-3 rounded-full bg-foreground -mt-1 -ml-[5px]" />
          </div>
        </div>

        {/* Value Display */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <p className="text-5xl font-bold font-mono" style={{ color }}>
              {value}
            </p>
            <div className={`flex items-center gap-0.5 ${changeColor}`}>
              <ChangeIcon className="w-4 h-4" />
              <span className="text-sm font-medium">
                {Math.abs(yesterdayChange)}
              </span>
            </div>
          </div>
          <p className="text-lg font-bold" style={{ color }}>
            {classification}
          </p>
          {price && (
            <p className="text-sm font-black font-mono tracking-tighter text-foreground/70 mt-1">
              {formatCurrency(price)}
            </p>
          )}
          <p className="text-[10px] font-medium leading-relaxed uppercase tracking-widest text-muted-foreground mt-4 px-6">
            {signal}
          </p>
        </div>
      </div>
    </div>
  );
};
