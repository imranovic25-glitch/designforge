import { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { type CountryInfo, SUPPORTED_COUNTRIES } from "@/src/lib/use-country";

interface CountrySelectorProps {
  country: CountryInfo;
  onChange: (c: CountryInfo) => void;
}

export function CountrySelector({ country, onChange }: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-sm font-medium hover:bg-emerald-500/10 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{country.flag} {country.name}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute top-full left-0 mt-2 z-50 w-52 rounded-2xl border border-white/10 bg-[#111] shadow-2xl overflow-hidden"
        >
          {SUPPORTED_COUNTRIES.map(c => (
            <button
              key={c.code}
              role="option"
              aria-selected={c.code === country.code}
              onClick={() => { onChange(c); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-white/[0.06] ${
                c.code === country.code
                  ? "text-white bg-white/[0.05]"
                  : "text-white/60"
              }`}
            >
              <span className="text-base">{c.flag}</span>
              <span className="font-medium">{c.name}</span>
              {c.code === country.code && (
                <span className="ml-auto text-emerald-400 text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
