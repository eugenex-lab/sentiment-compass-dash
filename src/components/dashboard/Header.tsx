import { Moon, Sun, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "./DateRangePicker";
import { DateRange } from "react-day-picker";

interface HeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated?: Date;
  onDownload: () => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (date: DateRange | undefined) => void;
}

export const Header = ({
  theme,
  onToggleTheme,
  onRefresh,
  isRefreshing,
  lastUpdated,
  onDownload,
  dateRange,
  onDateRangeChange,
}: HeaderProps) => {
  return (
    <header className="flex flex-col lg:flex-row md:items-center justify-between mb-8 md:mb-12 gap-6 pt-2">
      <div className="flex items-center gap-4 sm:gap-5">
        <div className="bg-primary/10 p-2 sm:p-2.5 rounded-2xl border border-primary/20 backdrop-blur-md shadow-inner transition-transform hover:scale-105 duration-300 shrink-0">
          <img
            src="https://res.cloudinary.com/dan4b75j7/image/upload/v1744208879/wealthblack/SkT3_azgue5.png"
            alt="Sankore Icon"
            className="h-9 w-9 sm:hidden object-contain"
          />
          <img
            src="https://res.cloudinary.com/dan4b75j7/image/upload/v1744200906/wealthblack/Welcome-Sankore_fy7xvu.png"
            alt="Sankore Logo"
            className="hidden sm:block h-10 lg:h-12 w-auto object-contain"
          />
        </div>
        <div className="space-y-0.5 sm:space-y-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-foreground leading-none">
            Bitcoin <span className="text-primary">Fear & Greed</span> Index
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground/60 uppercase tracking-widest whitespace-nowrap">
              Institutional Sentiment Intelligence
            </p>
            {lastUpdated && (
              <div className="flex items-center gap-1.5 opacity-60">
                <span className="h-1 w-1 rounded-full bg-primary/30" />
                <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest">
                  Updated{" "}
                  {lastUpdated.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 sm:flex-none">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
            className="shadow-md transition-shadow hover:shadow-lg rounded-xl"
          />
        </div>

        <div className="flex items-center justify-center gap-1.5 bg-secondary/10 p-1 rounded-2xl border border-border/40 backdrop-blur-sm self-end sm:self-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={onDownload}
            className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-background/90 hover:text-primary transition-all rounded-xl"
            title="Download CSV"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-background/90 hover:text-primary transition-all rounded-xl"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
          <div className="w-px h-5 bg-border/40 mx-0.5" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-background/90 transition-all rounded-xl"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-accent animate-in fade-in zoom-in duration-300" />
            ) : (
              <Moon className="h-4 w-4 text-primary animate-in fade-in zoom-in duration-300" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};
