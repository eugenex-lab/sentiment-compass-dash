import { getClassificationColor } from "@/hooks/useFearGreedIndex";

interface SentimentGaugeProps {
  value: number;
  classification: string;
}

export const SentimentGauge = ({ value, classification }: SentimentGaugeProps) => {
  const color = getClassificationColor(classification);
  const rotation = (value / 100) * 180 - 90;

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 animate-fade-in glow-primary">
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground mb-4">
          Current Sentiment
        </p>

        {/* Gauge Container */}
        <div className="relative w-64 h-32 mx-auto mb-6">
          {/* Background Arc */}
          <svg
            viewBox="0 0 200 100"
            className="w-full h-full overflow-visible"
          >
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="25%" stopColor="#f97316" />
                <stop offset="50%" stopColor="#22c55e" />
                <stop offset="75%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            
            {/* Background arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="12"
              strokeLinecap="round"
            />
            
            {/* Colored arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (value / 100) * 251.2}
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Needle */}
          <div
            className="absolute bottom-0 left-1/2 origin-bottom transition-transform duration-1000 ease-out"
            style={{
              transform: `translateX(-50%) rotate(${rotation}deg)`,
            }}
          >
            <div
              className="w-1 h-20 rounded-full"
              style={{ backgroundColor: color }}
            />
            <div
              className="w-4 h-4 rounded-full -mt-1 -ml-1.5"
              style={{ backgroundColor: color }}
            />
          </div>
        </div>

        {/* Value Display */}
        <div className="space-y-2">
          <p
            className="text-6xl sm:text-7xl font-bold font-mono tracking-tight"
            style={{ color }}
          >
            {value}
          </p>
          <p
            className="text-xl sm:text-2xl font-semibold"
            style={{ color }}
          >
            {classification}
          </p>
        </div>
      </div>
    </div>
  );
};
