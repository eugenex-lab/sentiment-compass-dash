import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
}

export const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
}: StatsCardProps) => {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex h-full items-center">
      <div className="flex items-center justify-between w-full">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold font-mono text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground leading-none">
              {subtitle}
            </p>
          )}
        </div>
        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
};
