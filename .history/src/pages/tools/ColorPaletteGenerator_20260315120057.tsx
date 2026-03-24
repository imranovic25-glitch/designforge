import React, { useState, useCallback } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { Palette, Copy, Check, RefreshCw, Lock, Unlock } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const faqItems = [
  {
    question: "How are color palettes generated?",
    answer:
      "The tool uses color theory algorithms — analogous, complementary, triadic, split-complementary, and random harmony — to generate aesthetically pleasing 5-color palettes from a seed hue."
  },
  {
    question: "Can I lock specific colors?",
    answer:
      "Yes. Click the lock icon on any swatch to keep that color fixed while regenerating the rest of the palette."
  },
  {
    question: "What color formats are supported?",
    answer:
      "Each swatch shows its HEX value. You can copy individual colors or the entire palette as a comma-separated hex list."
  },
  {
    question: "Is anything stored on a server?",
    answer:
      "No. Everything runs locally in your browser. No data is sent anywhere."
  }
];

const relatedGuides: { title: string; path: string }[] = [];
const relatedComparisons: { title: string; path: string }[] = [];

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

type PaletteMode = "analogous" | "complementary" | "triadic" | "split" | "random";

function generatePalette(mode: PaletteMode, baseHue?: number): string[] {
  const h = baseHue ?? Math.floor(Math.random() * 360);
  const s = 55 + Math.floor(Math.random() * 25);
  switch (mode) {
    case "analogous":
      return [-20, -10, 0, 10, 20].map((off) => hslToHex(h + off, s, 50 + Math.floor(Math.random() * 15)));
    case "complementary":
      return [0, 0, 180, 180, 180].map((off, i) => hslToHex(h + off, s, 35 + i * 8));
    case "triadic":
      return [0, 0, 120, 120, 240].map((off, i) => hslToHex(h + off, s, 40 + i * 6));
    case "split":
      return [0, 150, 150, 210, 210].map((off, i) => hslToHex(h + off, s, 38 + i * 7));
    case "random":
    default:
      return Array.from({ length: 5 }, () =>
        hslToHex(Math.floor(Math.random() * 360), 40 + Math.floor(Math.random() * 40), 40 + Math.floor(Math.random() * 30))
      );
  }
}

function textColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 140 ? "#000000" : "#ffffff";
}

const modes: { label: string; value: PaletteMode }[] = [
  { label: "Analogous", value: "analogous" },
  { label: "Complementary", value: "complementary" },
  { label: "Triadic", value: "triadic" },
  { label: "Split", value: "split" },
  { label: "Random", value: "random" },
];

interface Swatch {
  color: string;
  locked: boolean;
}

export function ColorPaletteGenerator() {
  const [mode, setMode] = useState<PaletteMode>("random");
  const [swatches, setSwatches] = useState<Swatch[]>(() =>
    generatePalette("random").map((c) => ({ color: c, locked: false }))
  );
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [pickerColor, setPickerColor] = useState("#6366f1");

  const regenerate = useCallback(() => {
    const [h] = hexToHsl(pickerColor);
    const newColors = generatePalette(mode, mode === "random" ? undefined : h);
    setSwatches((prev) =>
      prev.map((s, i) => (s.locked ? s : { color: newColors[i], locked: false }))
    );
  }, [mode, pickerColor]);

  const toggleLock = (idx: number) => {
    setSwatches((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, locked: !s.locked } : s))
    );
  };

  const copyColor = async (hex: string, idx: number) => {
    await navigator.clipboard.writeText(hex);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const copyAll = async () => {
    const text = swatches.map((s) => s.color).join(", ");
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <ToolLayout
      title="Color Palette Generator"
      description="Generate beautiful color palettes using color theory. Lock colors, pick a seed, and copy hex values instantly."
      icon={<Palette className="h-7 w-7" />}
      toolSlug="color-palette-generator"
      faqItems={faqItems}
      relatedGuides={relatedGuides}
      relatedComparisons={relatedComparisons}
    >
      <SEOHead
        title="Free Color Palette Generator — Create Harmonious Color Schemes"
        description="Generate beautiful color palettes with analogous, complementary, triadic, and random harmonies. Copy hex values instantly. Free online tool."
        canonical="/tools/color-palette-generator"
        schema="WebApplication"
        appName="Color Palette Generator"
      />

      <div className="space-y-8">
        {/* Controls row */}
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Seed Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={pickerColor}
                onChange={(e) => setPickerColor(e.target.value)}
                className="h-10 w-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
              />
              <span className="text-white/50 text-sm font-mono">{pickerColor}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Harmony</label>
            <div className="flex flex-wrap gap-2">
              {modes.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                    mode === m.value
                      ? "bg-amber-500/20 border border-amber-500/40 text-amber-400"
                      : "bg-white/5 border border-white/10 text-white/40 hover:text-white/60"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Palette swatches */}
        <div className="grid grid-cols-5 gap-3 min-h-[240px]">
          {swatches.map((swatch, i) => {
            const fg = textColor(swatch.color);
            return (
              <div
                key={i}
                className="rounded-2xl flex flex-col items-center justify-end p-4 relative group cursor-pointer transition-transform hover:scale-[1.03]"
                style={{ backgroundColor: swatch.color, minHeight: 200 }}
                onClick={() => copyColor(swatch.color, i)}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); toggleLock(i); }}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: fg }}
                >
                  {swatch.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </button>
                {swatch.locked && (
                  <Lock className="absolute top-3 right-3 h-4 w-4 group-hover:opacity-0 transition-opacity" style={{ color: fg, opacity: 0.5 }} />
                )}
                <div className="text-center">
                  {copiedIdx === i ? (
                    <span className="text-xs font-bold flex items-center gap-1" style={{ color: fg }}>
                      <Check className="h-3 w-3" /> Copied
                    </span>
                  ) : (
                    <span className="text-sm font-mono font-bold" style={{ color: fg }}>
                      {swatch.color.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={regenerate}
            className="rounded-full px-8 h-12 bg-amber-500 hover:bg-amber-400 text-black font-medium"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Generate
          </Button>
          <Button
            onClick={copyAll}
            variant="outline"
            className="rounded-full px-8 h-12 border-white/20 text-white hover:bg-white/10"
          >
            {copiedAll ? (
              <><Check className="h-4 w-4 mr-2 text-green-400" /> Copied!</>
            ) : (
              <><Copy className="h-4 w-4 mr-2" /> Copy All</>
            )}
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}
