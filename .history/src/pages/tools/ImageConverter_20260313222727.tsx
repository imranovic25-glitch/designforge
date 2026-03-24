import { useState, useRef } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { UploadCloud, Download, RefreshCw, CheckCircle2, ArrowRightLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const faqItems = [
  {
    question: "Which formats can I convert between?",
    answer:
      "You can upload JPG, PNG, WebP, GIF, BMP, AVIF, or SVG images and convert them to JPG, PNG, WebP, or BMP. All conversion happens in your browser using the Canvas API — no server involved."
  },
  {
    question: "Will converting to JPG affect transparency?",
    answer:
      "Yes — JPG does not support transparency. Any transparent areas will be filled with a white background. Use PNG or WebP if you need to preserve transparency."
  },
  {
    question: "Why is WebP recommended?",
    answer:
      "WebP offers significantly smaller file sizes compared to JPG and PNG at comparable quality, and is supported by all modern browsers, Figma, and most image editors."
  },
  {
    question: "Is there a size or file count limit?",
    answer:
      "No server-side limits — the tool runs entirely in your browser. Very large images may be slow on low-end devices due to canvas rendering."
  }
];

const relatedGuides: { title: string; path: string }[] = [];
const relatedComparisons: { title: string; path: string }[] = [];

type OutputFormat = "jpeg" | "png" | "webp" | "bmp";

const FORMAT_OPTIONS: { value: OutputFormat; label: string; mime: string; ext: string; note: string }[] = [
  { value: "jpeg", label: "JPG",  mime: "image/jpeg", ext: "jpg",  note: "Best for photos, no transparency" },
  { value: "png",  label: "PNG",  mime: "image/png",  ext: "png",  note: "Lossless, supports transparency" },
  { value: "webp", label: "WebP", mime: "image/webp", ext: "webp", note: "Smallest size, modern browsers" },
  { value: "bmp",  label: "BMP",  mime: "image/bmp",  ext: "bmp",  note: "Uncompressed, maximum compat." },
];

interface ConvertedFile {
  name: string;
  url: string;
  originalSize: number;
  newSize: number;
  width: number;
  height: number;
}

function convertImage(
  file: File,
  format: OutputFormat,
  quality: number
): Promise<ConvertedFile> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const srcUrl = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      // Fill white background for formats without alpha
      if (format === "jpeg" || format === "bmp") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(srcUrl);
      const opt = FORMAT_OPTIONS.find((f) => f.value === format)!;
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Conversion failed")); return; }
          const url = URL.createObjectURL(blob);
          const stem = file.name.replace(/\.[^.]+$/, "");
          resolve({
            name: `${stem}.${opt.ext}`,
            url,
            originalSize: file.size,
            newSize: blob.size,
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        },
        opt.mime,
        format === "png" || format === "bmp" ? undefined : quality / 100
      );
    };
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = srcUrl;
  });
}

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

export function ImageConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<OutputFormat>("webp");
  const [quality, setQuality] = useState(85);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ConvertedFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const images = Array.from(incoming).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      return [...prev, ...images.filter((f) => !existing.has(f.name + f.size))];
    });
    setResults([]);
    setErrors([]);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setResults([]);
  };

  const handleConvert = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    setResults([]);
    setErrors([]);
    const converted: ConvertedFile[] = [];
    const errs: string[] = [];
    for (const file of files) {
      try {
        converted.push(await convertImage(file, format, quality));
      } catch (e) {
        errs.push(`${file.name}: ${(e as Error).message}`);
      }
    }
    setResults(converted);
    setErrors(errs);
    setIsProcessing(false);
  };

  const handleReset = () => {
    setFiles([]);
    setResults([]);
    setErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const noQuality = format === "png" || format === "bmp";

  return (
    <ToolLayout
      title="Image Converter"
      description="Convert images between JPG, PNG, WebP, BMP and more — bulk conversion, all in your browser."
      icon={<ArrowRightLeft className="h-7 w-7" />}
      faqItems={faqItems}
      relatedGuides={relatedGuides}
      relatedComparisons={relatedComparisons}
    >
      <SEOHead
        title="Free Image Converter — Convert JPG, PNG, WebP & More"
        description="Convert images between JPEG, PNG, WebP, and other formats free. Batch conversion supported."
        canonical="/tools/image-converter"
        schema="WebApplication"
        appName="Image Converter"
      />
      <div className="space-y-8">
        {/* Drop zone */}
        <div
          className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-10 text-center cursor-pointer hover:border-white/30 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 mb-6">
            <UploadCloud className="h-7 w-7" />
          </div>
          <p className="text-white font-medium mb-2">Drop images here or click to browse</p>
          <p className="text-white/40 text-sm font-light">JPG · PNG · WebP · GIF · BMP · AVIF · SVG — multiple files OK</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-4 glass-panel rounded-xl px-4 py-3">
                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 text-xs font-bold uppercase shrink-0">
                  {f.name.split(".").pop()}
                </div>
                <span className="flex-1 text-white text-sm truncate">{f.name}</span>
                <span className="text-white/30 text-xs shrink-0">{formatSize(f.size)}</span>
                {results[i] && (
                  <span className="text-green-400 text-xs shrink-0">✓ {formatSize(results[i].newSize)}</span>
                )}
                {!results.length && (
                  <button onClick={() => removeFile(i)} className="text-white/20 hover:text-white/60 transition-colors shrink-0 text-lg leading-none">×</button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Format selector */}
        {files.length > 0 && !results.length && (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-white/40 mb-4 uppercase tracking-widest">Convert to</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {FORMAT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFormat(opt.value)}
                    className={`rounded-2xl p-4 text-left transition-all border ${
                      format === opt.value
                        ? "border-white/40 bg-white/10 text-white"
                        : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70"
                    }`}
                  >
                    <p className="font-semibold text-sm mb-1">{opt.label}</p>
                    <p className="text-xs font-light opacity-60 leading-snug">{opt.note}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality — hidden for lossless formats */}
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
                  <span>Smallest file</span><span>Best quality</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 space-y-1">
            {errors.map((e, i) => <p key={i} className="text-sm text-red-400">{e}</p>)}
          </div>
        )}

        {/* Results download list */}
        {results.length > 0 && (
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <p className="text-white font-medium">Converted {results.length} image{results.length !== 1 ? "s" : ""}</p>
            </div>
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 rounded-xl px-4 py-3">
                <span className="flex-1 text-white text-sm truncate">{r.name}</span>
                <span className="text-white/40 text-xs shrink-0">{r.width}×{r.height}</span>
                <span className="text-white/40 text-xs shrink-0">{formatSize(r.newSize)}</span>
                <a href={r.url} download={r.name}>
                  <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white">
                    <Download className="h-4 w-4" />
                  </button>
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {!results.length ? (
              <Button onClick={handleConvert} disabled={isProcessing} className="rounded-full px-8 h-12">
                {isProcessing ? "Converting…" : `Convert ${files.length > 1 ? `${files.length} Images` : "Image"} → ${FORMAT_OPTIONS.find(f => f.value === format)!.label}`}
              </Button>
            ) : null}
            <Button variant="outline" onClick={handleReset} className="rounded-full px-8 h-12 border-white/20 text-white hover:bg-white/10">
              <RefreshCw className="h-4 w-4 mr-2" /> Start Over
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
