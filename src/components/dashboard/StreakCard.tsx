import { Flame } from "lucide-react";
import { getClassificationColor } from "@/hooks/useFearGreedIndex";

interface StreakCardProps {
  classification: string;
  days: number;
}

export const StreakCard = ({ classification, days }: StreakCardProps) => {
  const color = getClassificationColor(classification);

  return (
    <div className="bg-card border border-border rounded-xl p-4 h-full">
      <div className="flex flex-col items-center text-center gap-2">
        <div
          className="p-2 rounded-lg shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <Flame className="h-4 w-4" style={{ color }} />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Current Streak</p>
          <p className="text-2xl font-bold font-mono text-foreground leading-tight">
            {days}
          </p>
          <p className="text-[10px] font-semibold" style={{ color }}>
            days · {classification}
          </p>
        </div>
      </div>
    </div>
  );
};
