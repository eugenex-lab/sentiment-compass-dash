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

  const featured = news?.[0];
  const rest = news?.slice(1);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-5">
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

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4 flex-1">
          {/* Featured Article */}
          {featured && (
            <a
              href={featured.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group relative overflow-hidden rounded-xl"
            >
              <div className="aspect-[21/9] w-full overflow-hidden rounded-xl">
                <img
                  src={featured.imageurl}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-xl" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white text-sm sm:text-base font-bold leading-snug line-clamp-2 drop-shadow-lg">
                  {featured.title}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-white/70 font-semibold bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    {featured.source}
                  </span>
                  <span className="text-[10px] text-white/50">
                    {formatDistanceToNow(new Date(featured.published_on * 1000), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </a>
          )}

          {/* News Grid */}
          <ScrollArea style={{ maxHeight: 400 }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {rest?.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group relative overflow-hidden rounded-xl bg-muted/30"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={item.imageurl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <p className="text-white text-[11px] font-semibold leading-tight line-clamp-2 drop-shadow-md">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[9px] text-white/60 font-medium">
                        {item.source}
                      </span>
                      <span className="text-[9px] text-white/40">·</span>
                      <span className="text-[9px] text-white/40">
                        {formatDistanceToNow(new Date(item.published_on * 1000), { addSuffix: true })}
                      </span>
                      <ExternalLink className="h-2.5 w-2.5 text-white/30 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
