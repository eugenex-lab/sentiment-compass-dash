import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Newspaper } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  body: string;
  published_on: number;
  imageurl: string;
  categories: string;
}

const fetchBitcoinNews = async (): Promise<NewsItem[]> => {
  const response = await fetch(
    "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=BTC&excludeCategories=Sponsored"
  );
  if (!response.ok) throw new Error("Failed to fetch news");
  const json = await response.json();
  return (json.Data || []).slice(0, 12);
};

export const BitcoinNews = () => {
  const { data: news, isLoading } = useQuery({
    queryKey: ["bitcoinNews"],
    queryFn: fetchBitcoinNews,
    staleTime: 1000 * 60 * 15,
    refetchInterval: 1000 * 60 * 30,
  });

  return (
    <div className="bg-card border border-border rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Newspaper className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Bitcoin News</h3>
          <p className="text-[10px] text-muted-foreground">
            Latest headlines affecting sentiment
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 -mx-1 px-1" style={{ maxHeight: 420 }}>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {news?.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-xl hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {item.source}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50">
                        ·
                      </span>
                      <span className="text-[10px] text-muted-foreground/70">
                        {formatDistanceToNow(
                          new Date(item.published_on * 1000),
                          { addSuffix: true }
                        )}
                      </span>
                      <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/40 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
