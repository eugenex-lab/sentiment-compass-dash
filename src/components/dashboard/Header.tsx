import { Moon, Sun, RefreshCw } from "lucide-react";
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
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          Fear & Greed Index
        </h1>
        <p className="text-xs text-muted-foreground">
          Crypto Market Sentiment
          {lastUpdated && (
            <span className="ml-2">• Updated {lastUpdated.toLocaleTimeString()}</span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-9 w-9"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          className="h-9 w-9"
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
