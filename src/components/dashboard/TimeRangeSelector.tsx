import { Button } from "@/components/ui/button";

interface TimeRangeSelectorProps {
  value: "7d" | "30d" | "90d" | "1y";
  onChange: (range: "7d" | "30d" | "90d" | "1y") => void;
}

const ranges = [
  { value: "7d" as const, label: "7D" },
  { value: "30d" as const, label: "30D" },
  { value: "90d" as const, label: "90D" },
  { value: "1y" as const, label: "1Y" },
];

export const TimeRangeSelector = ({ value, onChange }: TimeRangeSelectorProps) => {
  return (
    <div className="flex gap-2">
      {ranges.map((range) => (
        <Button
          key={range.value}
          variant={value === range.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(range.value)}
          className="min-w-[48px]"
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
};
