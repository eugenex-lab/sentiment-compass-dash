import { Button } from "@/components/ui/button";

interface TimeRangeSelectorProps {
  value: "7d" | "30d" | "90d" | "1y" | "2y" | "5y" | "10y" | "max";
  onChange: (
    range: "7d" | "30d" | "90d" | "1y" | "2y" | "5y" | "10y" | "max",
  ) => void;
}

const ranges = [
  { value: "7d" as const, label: "7D" },
  { value: "30d" as const, label: "30D" },
  { value: "90d" as const, label: "90D" },
  { value: "1y" as const, label: "1Y" },
  { value: "2y" as const, label: "2Y" },
  { value: "5y" as const, label: "5Y" },
  { value: "10y" as const, label: "10Y" },
  { value: "max" as const, label: "MAX" },
];

export const TimeRangeSelector = ({
  value,
  onChange,
}: TimeRangeSelectorProps) => {
  return (
    <div className="flex gap-1.5 bg-secondary/50 p-1 rounded-lg">
      {ranges.map((range) => (
        <Button
          key={range.value}
          variant={value === range.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(range.value)}
          className={`min-w-[40px] h-8 text-xs font-medium ${
            value === range.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
};
