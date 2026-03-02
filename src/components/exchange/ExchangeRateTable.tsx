import { Star } from "lucide-react";

export interface ExchangeRateRow {
  currency: string;
  buyingrate: string;
  centralrate: string;
  sellingrate: string;
  ratedate: string;
}

interface ExchangeRateTableProps {
  rates: ExchangeRateRow[];
}

const fmt = (val: string) => {
  const n = parseFloat(val);
  if (isNaN(n)) return "—";
  return n.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
};

const PINNED = [
  "US DOLLAR",
  "EURO",
  "POUNDS STERLING",
  "YEN",
  "CANADIAN DOLLAR",
];

const isPinned = (currency: string) =>
  PINNED.some((p) => currency.toUpperCase().includes(p.toUpperCase()));

export const ExchangeRateTable = ({ rates }: ExchangeRateTableProps) => {
  if (rates.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground/50 text-sm font-medium">
        No currencies match your search.
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-border/40 glass-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 bg-secondary/20">
              <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                Currency
              </th>
              <th className="text-right px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                Buying (₦)
              </th>
              <th className="text-right px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                Central (₦)
              </th>
              <th className="text-right px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                Official Rate (₦)
              </th>
            </tr>
          </thead>
          <tbody>
            {rates.map((row, idx) => {
              const pinned = isPinned(row.currency);
              const isUSD = row.currency.toUpperCase().includes("US DOLLAR");
              return (
                <tr
                  key={row.currency}
                  className={`
                    border-b border-border/20 last:border-0 transition-colors duration-150
                    ${isUSD ? "bg-primary/10 hover:bg-primary/15" : pinned ? "bg-secondary/10 hover:bg-secondary/20" : idx % 2 === 0 ? "bg-secondary/5 hover:bg-secondary/15" : "hover:bg-secondary/10"}
                  `}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      {isUSD && (
                        <Star className="h-3.5 w-3.5 fill-accent text-accent shrink-0" />
                      )}
                      <span
                        className={`font-bold tracking-tight ${isUSD ? "text-primary" : pinned ? "text-foreground" : "text-foreground/80"}`}
                      >
                        {row.currency}
                      </span>
                      {isUSD && (
                        <span className="text-[9px] font-black uppercase tracking-widest bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30">
                          Reference
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-xs text-muted-foreground">
                    {fmt(row.buyingrate)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-xs text-muted-foreground">
                    {fmt(row.centralrate)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-sm font-bold text-foreground">
                    {fmt(row.sellingrate)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {rates.map((row) => {
          const isUSD = row.currency.toUpperCase().includes("US DOLLAR");
          const pinned = isPinned(row.currency);
          return (
            <div
              key={row.currency}
              className={`glass-card rounded-2xl p-4 border transition-all ${
                isUSD
                  ? "border-primary/40 bg-primary/10"
                  : pinned
                    ? "border-border/60"
                    : "border-border/30"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isUSD && (
                    <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                  )}
                  <span
                    className={`font-black text-sm tracking-tight ${isUSD ? "text-primary" : "text-foreground"}`}
                  >
                    {row.currency}
                  </span>
                  {isUSD && (
                    <span className="text-[9px] font-black uppercase tracking-widest bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30">
                      Reference
                    </span>
                  )}
                </div>
                <span className="font-mono font-bold text-sm text-foreground">
                  ₦{fmt(row.sellingrate)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Buying", value: row.buyingrate },
                  { label: "Central", value: row.centralrate },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-secondary/20 rounded-xl p-2.5 text-center"
                  >
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
                      {label}
                    </p>
                    <p className="font-mono text-xs font-bold text-foreground/80">
                      ₦{fmt(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
