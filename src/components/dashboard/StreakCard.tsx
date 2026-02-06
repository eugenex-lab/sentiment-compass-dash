import { Flame } from "lucide-react";
import { getClassificationColor } from "@/hooks/useFearGreedIndex";

interface StreakCardProps {
  classification: string;
  days: number;
}

export const StreakCard = ({ classification, days }: StreakCardProps) => {
  const color = getClassificationColor(classification);

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex h-full items-center">
      <div className="flex items-center gap-4 w-full flex justify-between">
        <div
          className="p-2.5 rounded-xl shrink-0 border border-white/5 shadow-inner"
          style={{ backgroundColor: `${color}15` }}
        >
          <Flame className="h-5 w-5" style={{ color }} />
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">Current Streak</p>
          <p className="text-xl font-bold font-mono text-foreground leading-tight">
            {days} days
          </p>
          <p
            className="text-[10px] font-bold uppercase tracking-wider opacity-80"
            style={{ color }}
          >
            {classification}
          </p>
        </div>
      </div>
    </div>
  );
};
