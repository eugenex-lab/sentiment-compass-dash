import { Moon, Sun, RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated?: Date;
}

export const Header = ({
  theme,
  onToggleTheme,
  onRefresh,
  isRefreshing,
  lastUpdated,
}: HeaderProps) => {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10 glow-primary">
          <TrendingUp className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Fear & Greed Index
          </h1>
          <p className="text-sm text-muted-foreground">
            Cryptocurrency Market Sentiment
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {lastUpdated && (
          <span className="text-xs text-muted-foreground hidden sm:block">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-10 w-10"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleTheme}
          className="h-10 w-10"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  );
};
