import { useState, useEffect } from "react";

export type CountryInfo = {
  code: string;
  name: string;
  flag: string;
};

export const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸", GB: "🇬🇧", CA: "🇨🇦", AU: "🇦🇺",
  IN: "🇮🇳", AE: "🇦🇪", SG: "🇸🇬", NZ: "🇳🇿",
  DE: "🇩🇪", FR: "🇫🇷", JP: "🇯🇵", BR: "🇧🇷",
  MX: "🇲🇽", ZA: "🇿🇦", NG: "🇳🇬", PK: "🇵🇰",
};

// Countries that have localised finance data; others fall back to US
export const SUPPORTED_COUNTRIES: CountryInfo[] = [
  { code: "US", name: "United States",    flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom",   flag: "🇬🇧" },
  { code: "CA", name: "Canada",           flag: "🇨🇦" },
  { code: "AU", name: "Australia",        flag: "🇦🇺" },
  { code: "IN", name: "India",            flag: "🇮🇳" },
  { code: "AE", name: "UAE",              flag: "🇦🇪" },
  { code: "SG", name: "Singapore",        flag: "🇸🇬" },
];

const CACHE_KEY = "df-country-v2";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getFlag(code: string): string {
  return COUNTRY_FLAGS[code] ?? "🌐";
}

function getSupportedCode(code: string): string {
  return SUPPORTED_COUNTRIES.some(c => c.code === code) ? code : "US";
}

export function useCountry() {
  const [country, setCountryState] = useState<CountryInfo>({
    code: "US",
    name: "United States",
    flag: "🇺🇸",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check localStorage cache
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const { data, ts } = JSON.parse(raw) as { data: CountryInfo; ts: number };
        if (Date.now() - ts < CACHE_TTL) {
          setCountryState(data);
          setLoading(false);
          return;
        }
      }
    } catch { /* ignore */ }

    // 2. Fetch from IP geolocation API
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    fetch("https://ipapi.co/json/", { signal: controller.signal })
      .then(r => r.json())
      .then((json: { country_code?: string; country_name?: string }) => {
        const raw = json.country_code ?? "US";
        const code = getSupportedCode(raw);
        const supported = SUPPORTED_COUNTRIES.find(c => c.code === code);
        const data: CountryInfo = {
          code,
          name: code === raw ? (json.country_name ?? "United States") : (supported?.name ?? "United States"),
          flag: getFlag(code),
        };
        setCountryState(data);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
        } catch { /* ignore */ }
      })
      .catch(() => { /* keep default US */ })
      .finally(() => {
        clearTimeout(timer);
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  function setCountry(info: CountryInfo) {
    const data = { ...info, flag: getFlag(info.code) };
    setCountryState(data);
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
    } catch { /* ignore */ }
  }

  return { country, setCountry, loading };
}
