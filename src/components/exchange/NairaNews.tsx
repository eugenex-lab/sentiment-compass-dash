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
  published_on: number;
  imageurl: string;
}

// Google News RSS → parsed via allorigins proxy
const GOOGLE_NEWS_QUERIES = [
  "Naira exchange rate",
  "Nigeria forex CBN",
  "Nigerian economy currency",
];

const parseRSSItems = (xml: string): NewsItem[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const items = doc.querySelectorAll("item");
  const results: NewsItem[] = [];

  items.forEach((item, idx) => {
    const title = item.querySelector("title")?.textContent || "";
    const link = item.querySelector("link")?.textContent || "";
    const pubDate = item.querySelector("pubDate")?.textContent || "";
    const sourceEl = item.querySelector("source");
    const source = sourceEl?.textContent || "Google News";

    // Extract image from media:content or description
    const desc = item.querySelector("description")?.textContent || "";
    const imgMatch = desc.match(/src="([^"]+)"/);
    const imageurl = imgMatch?.[1] || "";

    if (title && link) {
      results.push({
        id: `gn-${idx}-${Date.now()}`,
        title: title.replace(/ - .*$/, ""), // Remove " - Source Name" suffix
        url: link,
        source,
        published_on: pubDate ? Math.floor(new Date(pubDate).getTime() / 1000) : 0,
        imageurl,
      });
    }
  });

  return results;
};

const fetchNairaNews = async (): Promise<NewsItem[]> => {
  const allItems: NewsItem[] = [];

  // Fetch multiple queries in parallel for broader coverage
  const fetches = GOOGLE_NEWS_QUERIES.map(async (query) => {
    try {
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-NG&gl=NG&ceid=NG:en`;
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) return [];
      const xml = await res.text();
      return parseRSSItems(xml);
    } catch {
      return [];
    }
  });

  const results = await Promise.all(fetches);
  results.forEach((items) => allItems.push(...items));

  // Deduplicate by title similarity
  const seen = new Set<string>();
  const unique = allItems.filter((item) => {
    const key = item.title.toLowerCase().slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by most recent
  unique.sort((a, b) => b.published_on - a.published_on);

  return unique.slice(0, 16);
};

// Fallback placeholder image for items without thumbnails
const FALLBACK_IMG = "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&q=80";

export const NairaNews = () => {
  const { data: news, isLoading } = useQuery({
    queryKey: ["nairaNews"],
    queryFn: fetchNairaNews,
    staleTime: 1000 * 60 * 15,
    refetchInterval: 1000 * 60 * 30,
  });

  const featured = news?.[0];
  const rest = news?.slice(1);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-accent/10">
          <Newspaper className="h-4 w-4 text-accent" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Naira & FX News</h3>
          <p className="text-[10px] text-muted-foreground">
            Latest headlines affecting the Nigerian currency
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
      ) : !news?.length ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground/50 text-sm">
          No Naira news available right now.
        </div>
      ) : (
        <div className="space-y-4 flex-1">
          {/* Featured */}
          {featured && (
            <a
              href={featured.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group relative overflow-hidden rounded-xl"
            >
              <div className="aspect-[21/9] w-full overflow-hidden rounded-xl bg-muted">
                <img
                  src={featured.imageurl || FALLBACK_IMG}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_IMG;
                  }}
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
                  {featured.published_on > 0 && (
                    <span className="text-[10px] text-white/50">
                      {formatDistanceToNow(
                        new Date(featured.published_on * 1000),
                        { addSuffix: true },
                      )}
                    </span>
                  )}
                </div>
              </div>
            </a>
          )}

          {/* Grid */}
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
                      src={item.imageurl || FALLBACK_IMG}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_IMG;
                      }}
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
                      {item.published_on > 0 && (
                        <>
                          <span className="text-[9px] text-white/40">·</span>
                          <span className="text-[9px] text-white/40">
                            {formatDistanceToNow(
                              new Date(item.published_on * 1000),
                              { addSuffix: true },
                            )}
                          </span>
                        </>
                      )}
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
