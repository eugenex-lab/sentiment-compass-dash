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
  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const from = e.target.value ? new Date(e.target.value) : undefined;
    onDateRangeChange({ from, to: dateRange?.to });
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const to = e.target.value ? new Date(e.target.value) : undefined;
    onDateRangeChange({ from: dateRange?.from, to });
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
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
                    dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : ""
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
                    dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : ""
                  }
                  onChange={handleToChange}
                />
              </div>
            </div>
            {(dateRange?.from || dateRange?.to) && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-[10px] uppercase tracking-tighter h-7 hover:text-red-400 hover:bg-red-500/10 font-bold"
                onClick={() => onDateRangeChange(undefined)}
              >
                Reset to Global View
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
