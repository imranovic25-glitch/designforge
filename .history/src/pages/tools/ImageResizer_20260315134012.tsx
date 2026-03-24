import { useState, useRef } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { UploadCloud, Download, RefreshCw, Lock, Unlock, Maximize2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const faqItems = [
  {
    question: "Does resizing reduce image quality?",
    answer:
      "Upscaling will slightly reduce sharpness because interpolation cannot add real detail. Downscaling typically maintains quality well. Export as PNG for lossless output."
  },
  {
    question: "What does 'lock aspect ratio' do?",
    answer:
      "When locked, changing width automatically recalculates height (and vice versa) to keep the original proportions. Unlock it to set arbitrary dimensions."
  },
  {
    question: "Which output format should I pick?",
    answer:
      "PNG for lossless (screenshots, logos, transparent images). JPG for photos where file size matters. WebP for modern web use — best compression-to-quality ratio."
  },
  {
    question: "What is the maximum resolution?",
    answer:
      "The browser's Canvas API handles images up to a few thousand pixels per side on most devices. Very large images (>8000×8000) may fail on low-memory devices."
  }
];

const relatedGuides = [
  { title: "How to Remove Image Backgrounds", path: "/guides/how-to-remove-image-background" },
];
const relatedComparisons = [
  { title: "Best Image Resizer Tools", path: "/comparisons/best-image-resizer-tools" },
  { title: "Best AI Background Remover Tools", path: "/comparisons/best-ai-background-remover-tools" },
];

type OutputFormat = "jpeg" | "png" | "webp";

const FORMAT_OPTIONS: { value: OutputFormat; label: string; mime: string; ext: string }[] = [
  { value: "jpeg", label: "JPG",  mime: "image/jpeg", ext: "jpg"  },
  { value: "png",  label: "PNG",  mime: "image/png",  ext: "png"  },
  { value: "webp", label: "WebP", mime: "image/webp", ext: "webp" },
];

const PRESET_PERCENTS = [25, 50, 75, 150, 200];

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

function resizeImage(
  img: HTMLImageElement,
  w: number,
  h: number,
  format: OutputFormat,
  quality: number
): Promise<{ blob: Blob; url: string }> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    if (format === "jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(img, 0, 0, w, h);
    const opt = FORMAT_OPTIONS.find((f) => f.value === format)!;
    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error("Resize failed")); return; }
        resolve({ blob, url: URL.createObjectURL(blob) });
      },
      opt.mime,
      format === "png" ? undefined : quality / 100
    );
  });
}

export function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [origImg, setOrigImg] = useState<HTMLImageElement | null>(null);
  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [locked, setLocked] = useState(true);
  const [format, setFormat] = useState<OutputFormat>("png");
  const [quality, setQuality] = useState(85);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; size: number; name: string } | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = (f: File) => {
    setResult(null);
    setError("");
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      setFile(f);
      setOrigImg(img);
      setOrigW(img.naturalWidth);
      setOrigH(img.naturalHeight);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.onerror = () => setError("Could not load image");
    img.src = url;
  };

  const handleWidthChange = (val: string) => {
    const w = parseInt(val, 10) || 1;
    setWidth(w);
    if (locked && origW) setHeight(Math.round((w / origW) * origH));
  };

  const handleHeightChange = (val: string) => {
    const h = parseInt(val, 10) || 1;
    setHeight(h);
    if (locked && origH) setWidth(Math.round((h / origH) * origW));
  };

  const applyPercent = (pct: number) => {
    const w = Math.round(origW * pct / 100);
    const h = Math.round(origH * pct / 100);
    setWidth(w);
    setHeight(h);
  };

  const handleResize = async () => {
    if (!origImg || !file) return;
    setIsProcessing(true);
    setResult(null);
    setError("");
    try {
      const { blob, url } = await resizeImage(origImg, width, height, format, quality);
      const stem = file.name.replace(/\.[^.]+$/, "");
      const ext = FORMAT_OPTIONS.find((f) => f.value === format)!.ext;
      setResult({ url, size: blob.size, name: `${stem}_${width}x${height}.${ext}` });
    } catch (e) {
      setError((e as Error).message);
    }
    setIsProcessing(false);
  };

  const handleReset = () => {
    setFile(null);
    setOrigImg(null);
    setResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const noQuality = format === "png";
  const hasFile = !!file;

  return (
    <ToolLayout
      title="Image Resizer"
      description="Resize any image to exact pixel dimensions or a percentage. Supports JPG, PNG, WebP, GIF, BMP, AVIF — all in-browser."
      icon={<Maximize2 className="h-7 w-7" />}
      toolSlug="image-resizer"
      faqItems={faqItems}
      relatedGuides={relatedGuides}
      relatedComparisons={relatedComparisons}
    >
      <SEOHead
        title="Free Image Resizer Online — Resize Images Instantly"
        description="Resize images to exact dimensions or percentages free. No quality loss. Supports JPEG, PNG, WebP."
        canonical="/tools/image-resizer"
        schema="WebApplication"
        appName="Image Resizer"
      />
      <div className="space-y-8">
        {/* Drop zone */}
        {!hasFile ? (
          <div
            className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-10 text-center cursor-pointer hover:border-white/30 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) loadFile(f); }}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 mb-6">
              <UploadCloud className="h-7 w-7" />
            </div>
            <p className="text-white font-medium mb-2">Drop an image here or click to browse</p>
            <p className="text-white/40 text-sm font-light">JPG · PNG · WebP · GIF · BMP · AVIF</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); }}
            />
          </div>
        ) : (
          <>
            {/* File info */}
            <div className="glass-panel rounded-xl px-4 py-3 flex items-center gap-4">
              <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 text-[10px] font-bold uppercase shrink-0">
                {file!.name.split(".").pop()}
              </div>
              <span className="flex-1 text-white text-sm truncate">{file!.name}</span>
              <span className="text-white/30 text-xs shrink-0">{origW}×{origH} px</span>
              <span className="text-white/30 text-xs shrink-0">{formatSize(file!.size)}</span>
            </div>

            {/* Dimension inputs */}
            <div className="space-y-4">
              <p className="text-sm font-medium text-white/40 uppercase tracking-widest">Target size</p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-white/30 mb-2">Width (px)</label>
                  <input
                    type="number" min={1} max={16000}
                    value={width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-11 text-white text-sm focus:outline-none focus:border-white/30"
                  />
                </div>

                {/* Lock button */}
                <button
                  onClick={() => setLocked((v) => !v)}
                  title={locked ? "Unlock aspect ratio" : "Lock aspect ratio"}
                  className={`mt-5 h-11 w-11 flex items-center justify-center rounded-xl border transition-all ${
                    locked ? "border-white/30 bg-white/10 text-white" : "border-white/10 bg-white/5 text-white/30 hover:text-white/60"
                  }`}
                >
                  {locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </button>

                <div className="flex-1">
                  <label className="block text-xs text-white/30 mb-2">Height (px)</label>
                  <input
                    type="number" min={1} max={16000}
                    value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 h-11 text-white text-sm focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              {/* Percent presets */}
              <div className="flex flex-wrap gap-2">
                {PRESET_PERCENTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => applyPercent(p)}
                    className="px-3 h-8 text-xs rounded-full border border-white/10 text-white/50 hover:border-white/30 hover:text-white/80 transition-all"
                  >
                    {p}%
                  </button>
                ))}
                <span className="self-center text-white/20 text-xs ml-1">of original</span>
              </div>
            </div>

            {/* Format selector */}
            <div>
              <p className="text-sm font-medium text-white/40 mb-4 uppercase tracking-widest">Output format</p>
              <div className="flex gap-3">
                {FORMAT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFormat(opt.value)}
                    className={`flex-1 rounded-2xl py-3 text-sm font-medium border transition-all ${
                      format === opt.value
                        ? "border-white/40 bg-white/10 text-white"
                        : "border-white/10 bg-white/5 text-white/40 hover:border-white/20 hover:text-white/70"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality slider */}
            {!noQuality && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-medium text-white/40 uppercase tracking-widest">Quality</p>
                  <span className="text-white font-semibold tabular-nums">{quality}%</span>
                </div>
                <input
                  type="range" min={10} max={100} step={5}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-white h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-white/30 mt-2">
                  <span>Smaller file</span><span>Best quality</span>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="glass-panel rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{result.name}</p>
                    <p className="text-white/40 text-sm mt-1">{width}×{height} px · {formatSize(result.size)}</p>
                  </div>
                  <a href={result.url} download={result.name}>
                    <Button className="rounded-full px-6 h-10 gap-2">
                      <Download className="h-4 w-4" /> Download
                    </Button>
                  </a>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              {!result ? (
                <Button onClick={handleResize} disabled={isProcessing} className="rounded-full px-8 h-12">
                  {isProcessing ? "Resizing…" : `Resize to ${width}×${height}`}
                </Button>
              ) : null}
              <Button variant="outline" onClick={handleReset} className="rounded-full px-8 h-12 border-white/20 text-white hover:bg-white/10">
                <RefreshCw className="h-4 w-4 mr-2" /> New Image
              </Button>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
