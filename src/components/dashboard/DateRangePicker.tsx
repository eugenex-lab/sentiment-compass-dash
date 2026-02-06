import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateRangePickerProps {
  className?: string;
  dateRange: DateRange | undefined;
  onDateRangeChange: (date: DateRange | undefined) => void;
}

export function DateRangePicker({
  className,
  dateRange,
  onDateRangeChange,
}: DateRangePickerProps) {
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(
    dateRange,
  );
  const [isOpen, setIsOpen] = React.useState(false);

  // Sync temp range with dateRange when popover opens
  React.useEffect(() => {
    if (isOpen) {
      setTempRange(dateRange);
    }
  }, [isOpen, dateRange]);

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const from = e.target.value ? new Date(e.target.value) : undefined;
    setTempRange({ from, to: tempRange?.to });
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const to = e.target.value ? new Date(e.target.value) : undefined;
    setTempRange({ from: tempRange?.from, to });
  };

  const handleApply = () => {
    if (tempRange?.from && tempRange?.to) {
      onDateRangeChange(tempRange);
      setIsOpen(false);
    }
  };

  const handleReset = () => {
    onDateRangeChange(undefined);
    setTempRange(undefined);
    setIsOpen(false);
  };

  const canApply = tempRange?.from && tempRange?.to;

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[260px] lg:w-[280px] justify-start text-left font-normal h-9 text-xs border-primary/20 hover:border-primary/40 transition-all",
              !dateRange && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
            <span className="truncate">
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    <span className="font-bold">Filter:</span>{" "}
                    {format(dateRange.from, "MMM dd")} -{" "}
                    {format(dateRange.to, "MMM dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "MMM dd, y")
                )
              ) : (
                "Global Date Filter"
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-5 bg-card/95 backdrop-blur-md border-primary/20 shadow-2xl"
          align="end"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-bold leading-none text-primary flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Custom Range
              </h4>
              <p className="text-xs text-muted-foreground font-medium">
                Select evaluation period for the compass.
              </p>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="from"
                  className="text-[10px] uppercase tracking-widest font-black opacity-60"
                >
                  Start Point
                </Label>
                <Input
                  id="from"
                  type="date"
                  className="h-9 text-xs bg-background/50 border-primary/10 focus-visible:ring-primary font-mono"
                  value={
                    tempRange?.from ? format(tempRange.from, "yyyy-MM-dd") : ""
                  }
                  onChange={handleFromChange}
                />
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="to"
                  className="text-[10px] uppercase tracking-widest font-black opacity-60"
                >
                  End Point
                </Label>
                <Input
                  id="to"
                  type="date"
                  className="h-9 text-xs bg-background/50 border-primary/10 focus-visible:ring-primary font-mono"
                  value={
                    tempRange?.to ? format(tempRange.to, "yyyy-MM-dd") : ""
                  }
                  onChange={handleToChange}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] uppercase tracking-tighter h-8 hover:text-red-400 hover:bg-red-500/10 font-bold"
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button
                variant="default"
                size="sm"
                disabled={!canApply}
                className="text-[10px] uppercase tracking-tighter h-8 bg-primary hover:bg-primary/80 font-bold disabled:opacity-50"
                onClick={handleApply}
              >
                Apply Filter
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
