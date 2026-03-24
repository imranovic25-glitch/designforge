import React, { useState, useRef } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { FileImage, Download, RefreshCw, UploadCloud } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const faqItems = [
  {
    question: "How does the SVG to PNG conversion work?",
    answer:
      "The tool loads your SVG into an in-browser canvas element, rasterises it at the chosen resolution, and exports the result as a PNG file. No server processing is involved."
  },
  {
    question: "Can I set a custom output size?",
    answer:
      "Yes. Choose from preset multipliers (1×, 2×, 4×) or enter a custom pixel width. The aspect ratio is always preserved."
  },
  {
    question: "Does it support transparent backgrounds?",
    answer:
      "Yes. SVGs with no background remain transparent in the output PNG by default. You can optionally add a white background."
  },
  {
    question: "Are my files uploaded anywhere?",
    answer:
      "No. Everything runs entirely in your browser. Your SVG files never leave your device."
  }
];

const relatedGuides: { title: string; path: string }[] = [];
const relatedComparisons: { title: string; path: string }[] = [];

const scaleOptions = [
  { label: "1×", value: 1 },
  { label: "2×", value: 2 },
  { label: "4×", value: 4 },
];

export function SvgToPng() {
  const [svgFile, setSvgFile] = useState<File | null>(null);
  const [svgUrl, setSvgUrl] = useState<string | null>(null);
  const [svgDimensions, setSvgDimensions] = useState<{ w: number; h: number } | null>(null);
  const [scale, setScale] = useState(2);
  const [customWidth, setCustomWidth] = useState("");
  const [addBg, setAddBg] = useState(false);
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSvg = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".svg") && file.type !== "image/svg+xml") {
      setError("Please upload an SVG file.");
      return;
    }
    setError(null);
    setPngUrl(null);
    setSvgFile(file);

    const url = URL.createObjectURL(file);
    setSvgUrl(url);

    // Read dimensions
    const img = new Image();
    img.onload = () => {
      setSvgDimensions({ w: img.naturalWidth || 300, h: img.naturalHeight || 150 });
    };
    img.src = url;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadSvg(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) loadSvg(file);
  };

  const convert = () => {
    if (!svgUrl || !svgDimensions) return;

    const img = new Image();
    img.onload = () => {
      let targetW: number;
      let targetH: number;

      if (customWidth && parseInt(customWidth) > 0) {
        targetW = parseInt(customWidth);
        targetH = Math.round((svgDimensions.h / svgDimensions.w) * targetW);
      } else {
        targetW = svgDimensions.w * scale;
        targetH = svgDimensions.h * scale;
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d")!;

      if (addBg) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, targetW, targetH);
      }

      ctx.drawImage(img, 0, 0, targetW, targetH);
      const dataUrl = canvas.toDataURL("image/png");
      setPngUrl(dataUrl);
    };
    img.src = svgUrl;
  };

  const handleDownload = () => {
    if (!pngUrl) return;
    const link = document.createElement("a");
    link.download = (svgFile?.name.replace(/\.svg$/i, "") ?? "converted") + ".png";
    link.href = pngUrl;
    link.click();
  };

  const reset = () => {
    if (svgUrl) URL.revokeObjectURL(svgUrl);
    setSvgFile(null);
    setSvgUrl(null);
    setSvgDimensions(null);
    setPngUrl(null);
    setError(null);
    setCustomWidth("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <ToolLayout
      title="SVG to PNG Converter"
      description="Convert SVG vector graphics to high-resolution PNG images — entirely in your browser."
      icon={<FileImage className="h-7 w-7" />}
      toolSlug="svg-to-png"
      faqItems={faqItems}
      relatedGuides={relatedGuides}
      relatedComparisons={relatedComparisons}
    >
      <SEOHead
        title="Free SVG to PNG Converter — High-Res Rasterisation Online"
        description="Convert SVG files to PNG at 1×, 2×, or 4× resolution. Transparent or white background. Free, runs in your browser."
        canonical="/tools/svg-to-png"
        schema="WebApplication"
        appName="SVG to PNG Converter"
      />

      <div className="space-y-8">
        {/* Upload */}
        {!svgFile && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/10 hover:border-amber-500/30 rounded-2xl p-12 text-center cursor-pointer transition-colors group"
          >
            <UploadCloud className="h-10 w-10 mx-auto mb-4 text-white/20 group-hover:text-amber-400/60 transition-colors" />
            <p className="text-white/40 mb-2">
              Drag &amp; drop an SVG file here, or <span className="text-amber-400/70 underline underline-offset-4">browse</span>
            </p>
            <p className="text-white/20 text-sm">.svg files supported</p>
            <input ref={fileInputRef} type="file" accept=".svg,image/svg+xml" onChange={handleFileSelect} className="hidden" />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">{error}</div>
        )}

        {svgFile && svgDimensions && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Preview */}
              <div className="flex flex-col items-center">
                <div className="text-xs text-white/30 uppercase tracking-widest mb-2 self-start">SVG Preview</div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-center w-full" style={{ minHeight: 200 }}>
                  {svgUrl && <img src={svgUrl} alt="SVG preview" className="max-w-full max-h-60 object-contain" />}
                </div>
                <p className="text-white/30 text-xs mt-2">
                  {svgFile.name} — {svgDimensions.w} × {svgDimensions.h}px
                </p>
              </div>

              {/* Settings */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Scale</label>
                  <div className="flex flex-wrap gap-2">
                    {scaleOptions.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => { setScale(s.value); setCustomWidth(""); }}
                        className={`px-5 py-2 rounded-lg text-xs font-medium transition-colors ${
                          scale === s.value && !customWidth
                            ? "bg-amber-500/20 border border-amber-500/40 text-amber-400"
                            : "bg-white/5 border border-white/10 text-white/40 hover:text-white/60"
                        }`}
                      >
                        {s.label} ({svgDimensions.w * s.value} × {svgDimensions.h * s.value})
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Custom Width (px)</label>
                  <input
                    type="number"
                    min="1"
                    max="8192"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    placeholder="e.g. 1920"
                    className="w-40 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addBg}
                    onChange={(e) => setAddBg(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 accent-amber-500"
                  />
                  <span className="text-sm text-white/50">Add white background</span>
                </label>

                <Button
                  onClick={convert}
                  className="rounded-full px-8 h-12 bg-amber-500 hover:bg-amber-400 text-black font-medium"
                >
                  Convert to PNG
                </Button>
              </div>
            </div>

            {/* Result */}
            {pngUrl && (
              <div className="space-y-4">
                <div className="text-xs text-white/30 uppercase tracking-widest">Result</div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-center" style={{ background: "repeating-conic-gradient(rgba(255,255,255,0.03) 0% 25%, transparent 0% 50%) 0 0 / 16px 16px" }}>
                  <img src={pngUrl} alt="PNG result" className="max-w-full max-h-80 object-contain" />
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={handleDownload} className="rounded-full px-8 h-12 bg-amber-500 hover:bg-amber-400 text-black font-medium">
                    <Download className="h-4 w-4 mr-2" /> Download PNG
                  </Button>
                  <Button onClick={reset} variant="outline" className="rounded-full px-8 h-12 border-white/20 text-white hover:bg-white/10">
                    <RefreshCw className="h-4 w-4 mr-2" /> Start Over
                  </Button>
                </div>
              </div>
            )}

            {!pngUrl && (
              <div className="flex gap-4">
                <Button onClick={reset} variant="outline" className="rounded-full px-8 h-12 border-white/20 text-white hover:bg-white/10">
                  <RefreshCw className="h-4 w-4 mr-2" /> Start Over
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
}
