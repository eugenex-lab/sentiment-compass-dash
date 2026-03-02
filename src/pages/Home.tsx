import { useNavigate } from "react-router-dom";
import { Moon, Sun, Bitcoin, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

const SANKORE_ICON =
  "https://res.cloudinary.com/dan4b75j7/image/upload/v1744208879/wealthblack/SkT3_azgue5.png";
const SANKORE_LOGO =
  "https://res.cloudinary.com/dan4b75j7/image/upload/v1744200906/wealthblack/Welcome-Sankore_fy7xvu.png";
const FOOTER_PATTERN = "https://sankore.com/images/FooterBG.webp";

const sections = [
  {
    id: "bitcoin",
    path: "/bitcoin",
    icon: Bitcoin,
    iconColor: "text-accent",
    iconBg: "bg-accent/10 border-accent/20",
    label: "Bitcoin Sentiment",
    sublabel: "Digital Asset Intelligence",
    description:
      "Track the Fear & Greed Index for Bitcoin with historical trend analysis, sentiment breakdowns, and institutional-grade signals.",
    tag: "Live · CoinCap",
    accentClass:
      "hover:border-accent/50 hover:shadow-[0_0_40px_hsl(var(--accent)/0.12)]",
    ping: "bg-accent",
  },
  {
    id: "exchange",
    path: "/exchange-rate",
    icon: BarChart3,
    iconColor: "text-primary",
    iconBg: "bg-primary/10 border-primary/20",
    label: "Exchange Rates",
    sublabel: "NGN FX Intelligence",
    description:
      "CBN official Naira exchange rates alongside live market data for USD, EUR, GBP and all major currencies — with today's key rates at a glance.",
    tag: "CBN · Live FX",
    accentClass:
      "hover:border-primary/50 hover:shadow-[0_0_40px_hsl(var(--primary)/0.12)]",
    ping: "bg-primary",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-background">
      {/* Background Layers */}
      <div className="absolute inset-0 z-0">
        {/* Pattern Side (Left) */}
        <div
          className="absolute inset-y-0 left-0 w-full md:w-[60%] z-0"
          style={{
            backgroundImage: `url('${FOOTER_PATTERN}')`,
            backgroundRepeat: "repeat",
            backgroundSize: "450px",
            opacity: 0.8, // High visibility
            maskImage: "linear-gradient(to right, black 50%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, black 50%, transparent 100%)",
          }}
        />

        {/* Hero Image (Right) */}
        <div
          className="absolute inset-y-0 right-0 w-full md:w-[60%] z-0"
          style={{
            backgroundImage: "url('/hero-sankore.png')",
            backgroundSize: "cover",
            backgroundPosition: "center right",
            maskImage: "linear-gradient(to left, black 50%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to left, black 50%, transparent 100%)",
          }}
        />

        {/* Global Finishes */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background opacity-90" />
        <div className="absolute inset-0 bg-background/20" />
      </div>
      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-5 sm:px-8 lg:px-12 py-5">
        <div className="bg-primary/10 p-2 sm:p-2.5 rounded-2xl border border-primary/20 backdrop-blur-md shadow-inner transition-transform hover:scale-105 duration-300">
          <img
            src={SANKORE_ICON}
            alt="Sankore"
            className="h-8 w-8 sm:hidden object-contain"
          />
          <img
            src={SANKORE_LOGO}
            alt="Sankore"
            className="hidden sm:block h-10 lg:h-11 w-auto object-contain"
          />
        </div>

        {/* Nav pills */}
        <nav className="hidden md:flex items-center gap-1 bg-secondary/20 backdrop-blur-md p-1 rounded-2xl border border-border/30">
          {["Funds", "Wealth", "Real Assets", "Innovation"].map((item) => (
            <span
              key={item}
              className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 rounded-xl"
            >
              {item}
            </span>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-xl h-9 w-9 bg-secondary/20 backdrop-blur-md border border-border/30 hover:bg-secondary/40 transition-all"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-accent animate-in fade-in zoom-in duration-300" />
          ) : (
            <Moon className="h-4 w-4 text-primary animate-in fade-in zoom-in duration-300" />
          )}
        </Button>
      </header>

      {/* ── Hero copy ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 sm:px-8 lg:px-12 py-12 sm:py-16 text-center">
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-3 mb-14">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-primary/80">
            Sankore Funds Management · Asset Intelligence
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-tight max-w-3xl">
            Time is the <span className="text-primary">ultimate</span> asset.
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground/70 max-w-lg mx-auto leading-relaxed font-medium">
            Institutional-grade market intelligence — Bitcoin sentiment and live
            Naira FX rates in one dashboard.
          </p>
        </div>

        {/* ── Section Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 [animation-delay:150ms]">
          {sections.map(
            ({
              id,
              path,
              icon: Icon,
              iconColor,
              iconBg,
              label,
              sublabel,
              description,
              tag,
              accentClass,
              ping,
            }) => (
              <button
                key={id}
                onClick={() => navigate(path)}
                className={`group glass-card text-left rounded-3xl p-6 border border-border/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${accentClass} flex flex-col gap-4`}
              >
                {/* Icon + live tag */}
                <div className="flex items-start justify-between">
                  <div
                    className={`p-3 rounded-2xl border ${iconBg} transition-transform group-hover:scale-110 duration-300`}
                  >
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                  </div>
                  <div className="flex items-center gap-1.5 bg-secondary/30 backdrop-blur-sm rounded-full px-2.5 py-1 border border-border/30">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${ping} animate-pulse`}
                    />
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">
                      {tag}
                    </span>
                  </div>
                </div>

                {/* Text */}
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                    {sublabel}
                  </p>
                  <h2 className="text-xl font-black tracking-tight text-foreground leading-tight">
                    {label}
                  </h2>
                  <p className="text-xs text-muted-foreground/70 leading-relaxed font-medium">
                    {description}
                  </p>
                </div>

                {/* CTA */}
                <div
                  className={`flex items-center gap-2 mt-auto text-xs font-black uppercase tracking-widest ${iconColor} opacity-70 group-hover:opacity-100 transition-opacity`}
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ),
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="relative z-10 flex flex-col items-center gap-3 pb-8 pt-4 text-center">
        <p className="text-[9px] sm:text-[10px] text-muted-foreground/40 font-medium uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Sankore Funds Management · For
          internal Sankore investment teams
        </p>
      </footer>
    </div>
  );
};

export default Home;
