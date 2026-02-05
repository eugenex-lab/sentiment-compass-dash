import { Flame } from "lucide-react";
import { getClassificationColor } from "@/hooks/useFearGreedIndex";

interface StreakCardProps {
  classification: string;
  days: number;
}

export const StreakCard = ({ classification, days }: StreakCardProps) => {
  const color = getClassificationColor(classification);

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <Flame className="h-5 w-5" style={{ color }} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Current Streak</p>
          <p className="text-xl font-bold font-mono">{days} days</p>
          <p className="text-xs font-medium" style={{ color }}>{classification}</p>
        </div>
      </div>
    </div>
  );
};
