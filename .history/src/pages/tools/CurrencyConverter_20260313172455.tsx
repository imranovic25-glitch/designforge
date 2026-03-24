import { useState, useEffect } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { ArrowLeftRight, RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const faqItems = [
  {
    q: "Where do the exchange rates come from?",
    a: "Rates are fetched from ExchangeRate-API, which provides free, regularly-updated exchange rates for 160+ currencies."
  },
  {
    q: "How often are rates updated?",
    a: "The free tier of ExchangeRate-API updates rates approximately every 24 hours. For real-time trading, always check with a financial institution."
  },
  {
    q: "Are the rates accurate for international transfers?",
    a: "The mid-market rate shown is a reference rate. Banks and transfer services add a spread on top of this rate. Always compare providers before sending money internationally."
  }
];

const relatedGuides = [
  { title: "How Currency Conversion Works", path: "/guides/how-currency-conversion-works" }
];

const relatedComparisons: { title: string; path: string }[] = [];

const POPULAR_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "INR", "MXN", "BRL", "SGD", "HKD", "NOK", "SEK", "NZD", "ZAR", "AED", "KRW", "TRY"];

export function CurrencyConverter() {
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("1");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const key = process.env.EXCHANGERATE_API_KEY as string;
      const res = await fetch(`https://v6.exchangerate-api.com/v6/${key}/latest/USD`);
      if (!res.ok) throw new Error("Failed to fetch rates");
      const data = await res.json();
      if (data.result !== "success") throw new Error("API returned an error");
      setRates(data.conversion_rates);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      setError("Could not load exchange rates. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => { fetchRates(); }, []);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getConvertedAmount = (): string => {
    if (!rates || !amount) return "—";
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return "—";
    const fromRate = rates[fromCurrency] ?? 1;
    const toRate = rates[toCurrency] ?? 1;
    const result = (numAmount / fromRate) * toRate;
    return result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  const getRate = (): string => {
    if (!rates) return "—";
    const fromRate = rates[fromCurrency] ?? 1;
    const toRate = rates[toCurrency] ?? 1;
    return (toRate / fromRate).toFixed(6);
  };

  return (
    <ToolLayout
      title="Currency Converter"
      description="Convert between 160+ global currencies using live mid-market exchange rates. Updated daily."      icon={<ArrowLeftRight className="h-7 w-7" />}      faqItems={faqItems}
      relatedGuides={relatedGuides}
      relatedComparisons={relatedComparisons}
    >
      <div className="space-y-8">
        {error && (
          <div className="glass-panel border border-red-500/20 rounded-2xl p-5 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-white/40 mb-3 uppercase tracking-widest">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="any"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 h-14 text-white text-lg font-medium focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          <button
            onClick={handleSwap}
            className="h-14 w-14 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-colors self-end"
          >
            <ArrowLeftRight className="h-5 w-5" />
          </button>

          <div>
            <label className="block text-xs font-medium text-white/40 mb-3 uppercase tracking-widest">To</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 h-14 text-white font-medium focus:outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer"
            >
              {POPULAR_CURRENCIES.map((c) => (
                <option key={c} value={c} className="bg-neutral-900">{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-white/40 mb-3 uppercase tracking-widest">From</label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 h-14 text-white font-medium focus:outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer"
          >
            {POPULAR_CURRENCIES.map((c) => (
              <option key={c} value={c} className="bg-neutral-900">{c}</option>
            ))}
          </select>
        </div>

        {!loading && !error && rates && (
          <div className="glass-panel rounded-2xl p-8 text-center">
            <p className="text-white/40 text-sm mb-4 font-light">
              {amount || "1"} {fromCurrency} =
            </p>
            <p className="text-5xl font-semibold text-white mb-2">{getConvertedAmount()}</p>
            <p className="text-2xl font-light text-white/60 mb-8">{toCurrency}</p>
            <div className="flex items-center justify-center gap-3 text-sm text-white/40">
              <TrendingUp className="h-4 w-4" />
              <span>1 {fromCurrency} = {getRate()} {toCurrency}</span>
            </div>
          </div>
        )}

        {loading && (
          <div className="glass-panel rounded-2xl p-8 text-center">
            <p className="text-white/40 font-light">Loading exchange rates…</p>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-white/30">
          <span>{lastUpdated ? `Rates loaded at ${lastUpdated}` : "Fetching rates…"}</span>
          <Button variant="ghost" size="sm" onClick={fetchRates} disabled={loading} className="text-white/30 hover:text-white h-8 px-3">
            <RefreshCw className="h-3.5 w-3.5 mr-2" /> Refresh
          </Button>
        </div>

        <p className="text-xs text-white/20 font-light leading-relaxed">
          Exchange rates are for informational purposes only. Actual transaction rates from banks and money transfer providers will differ. Always compare before sending money internationally.
        </p>
      </div>
    </ToolLayout>
  );
}
