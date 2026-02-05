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
    <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6 pt-2">
      <div className="flex items-center gap-5">
        <div className="bg-primary/10 p-2.5 rounded-2xl border border-primary/20 backdrop-blur-md shadow-inner transition-transform hover:scale-105 duration-300">
          <img
            src="https://sankore.com/images/SankoreWhiteLogo2023.png"
            alt="Sankore Logo"
            className="h-10 sm:h-12 w-auto object-contain brightness-0 dark:brightness-100 invert dark:invert-0"
          />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground -leading-tight">
            Sentiment <span className="text-primary">Compass</span>
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground/80 flex items-center gap-2">
            Sankore Funds Management
            {lastUpdated && (
              <>
                <span className="h-1 w-1 rounded-full bg-primary/30" />
                <span className="text-[10px] sm:text-xs font-mono opacity-60 uppercase tracking-widest">
                  Updated {lastUpdated.toLocaleTimeString()}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={onDateRangeChange}
          className="shadow-md transition-shadow hover:shadow-lg rounded-xl"
        />

        <div className="flex items-center gap-2 bg-secondary/20 p-1.5 rounded-2xl border border-border/40 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={onDownload}
            className="h-9 w-9 hover:bg-background/90 hover:text-primary transition-all rounded-xl"
            title="Download CSV"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-9 w-9 hover:bg-background/90 hover:text-primary transition-all rounded-xl"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
          <div className="w-px h-5 bg-border/40 mx-1" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="h-9 w-9 hover:bg-background/90 transition-all rounded-xl"
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
