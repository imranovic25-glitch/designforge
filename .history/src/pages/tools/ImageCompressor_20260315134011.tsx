import { useState, useRef } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { UploadCloud, Download, RefreshCw, CheckCircle2, ImageDown } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const faqItems = [
  {
    question: "How does image compression work?",
    answer:
      "The tool draws your image onto an HTML Canvas element and re-encodes it as a JPEG or WebP at the quality level you choose. This removes hidden metadata and reduces file size while keeping the image dimensions identical."
  },
  {
    question: "Which formats are supported?",
    answer:
      "You can upload JPG, PNG, GIF, BMP, and WebP images. The output can be saved as JPEG or WebP — both produce significantly smaller files than PNG for photographs."
  },
  {
    question: "Will my images be uploaded to a server?",
    answer:
      "No. All processing happens entirely in your browser using the Canvas API. Your images never leave your device."
  },
  {
    question: "What quality level should I use?",
    answer:
      "80% is a great default — it produces files roughly 60–70% smaller than the original with virtually no visible difference. Go lower for even smaller sizes, or higher if you need to preserve fine detail."
  }
];

const relatedGuides = [
  { title: "How to Remove Image Backgrounds", path: "/guides/how-to-remove-image-background" },
];
const relatedComparisons = [
  { title: "Best Image Resizer Tools", path: "/comparisons/best-image-resizer-tools" },
  { title: "Best AI Background Remover Tools", path: "/comparisons/best-ai-background-remover-tools" },
];

type OutputFormat = "jpeg" | "webp";

export function ImageCompressor() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<OutputFormat>("jpeg");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; originalSize: number; newSize: number; width: number; height: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setResult(null);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setResult(null);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCompress = () => {
    if (!imageFile || !previewUrl) return;
    setIsProcessing(true);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const mimeType = format === "webp" ? "image/webp" : "image/jpeg";
      canvas.toBlob(
        (blob) => {
          if (!blob) { setIsProcessing(false); return; }
          const url = URL.createObjectURL(blob);
          setResult({ url, originalSize: imageFile.size, newSize: blob.size, width: img.naturalWidth, height: img.naturalHeight });
          setIsProcessing(false);
        },
        mimeType,
        quality / 100
      );
    };
    img.src = previewUrl;
  };

  const handleReset = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setResult(null);
    setQuality(80);
    setFormat("jpeg");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const ext = format === "webp" ? "webp" : "jpg";
  const stem = imageFile ? imageFile.name.replace(/\.[^.]+$/, "") : "image";

  return (
    <ToolLayout
      title="Image Compressor"
      description="Reduce image file sizes without visible quality loss. Runs entirely in your browser — nothing is uploaded."
      icon={<ImageDown className="h-7 w-7" />}
      toolSlug="image-compressor"
      faqItems={faqItems}
      relatedGuides={relatedGuides}
      relatedComparisons={relatedComparisons}
    >
      <SEOHead
        title="Free Image Compressor — Reduce Image File Size Online"
        description="Compress JPEG, PNG, and WebP images without losing quality. Fast, browser-based, no uploads."
        canonical="/tools/image-compressor"
        schema="WebApplication"
        appName="Image Compressor"
      />
      {!imageFile ? (
        <div
          className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-16 text-center cursor-pointer hover:border-white/30 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 mb-8">
            <UploadCloud className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-medium text-white mb-4">Upload an Image</h3>
          <p className="text-white/40 font-light mb-8">Supports JPG, PNG, WebP, GIF — drag & drop or click to select</p>
          <Button className="rounded-full px-8">Choose File</Button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl overflow-hidden">
              <p className="text-xs font-medium text-white/40 uppercase tracking-widest px-4 pt-4 pb-2">Original · {formatSize(imageFile.size)}</p>
              <img src={previewUrl!} alt="Original" className="w-full h-48 object-contain bg-white/5" />
            </div>
            {result && (
              <div className="glass-panel rounded-2xl overflow-hidden">
                <p className="text-xs font-medium text-white/40 uppercase tracking-widest px-4 pt-4 pb-2">Compressed · {formatSize(result.newSize)}</p>
                <img src={result.url} alt="Compressed" className="w-full h-48 object-contain bg-white/5" />
              </div>
            )}
          </div>

          {/* Settings */}
          {!result && (
            <div className="space-y-6">
              {/* Format */}
              <div>
                <p className="text-sm font-medium text-white/40 mb-4 uppercase tracking-widest">Output Format</p>
                <div className="flex gap-4">
                  {(["jpeg", "webp"] as OutputFormat[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={`flex-1 rounded-2xl p-4 text-sm font-medium transition-all border ${
                        format === f ? "border-white/40 bg-white/10 text-white" : "border-white/10 bg-white/5 text-white/50 hover:border-white/20"
                      }`}
                    >
                      {f.toUpperCase()}
                      <span className="block text-xs font-light opacity-60 mt-1">{f === "webp" ? "Best compression" : "Widest support"}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality slider */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm font-medium text-white/40 uppercase tracking-widest">Quality</p>
                  <span className="text-white font-semibold tabular-nums">{quality}%</span>
                </div>
                <input
                  type="range" min={10} max={100} step={5}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-white h-1 rounded-full appearance-none bg-white/10 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-white/30 mt-2">
                  <span>Smallest</span><span>Best quality</span>
                </div>
              </div>
            </div>
          )}

          {/* Result stats */}
          {result && (
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <p className="text-white font-medium">Compression complete — {result.width} × {result.height}px</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-white/40 mb-1 uppercase tracking-widest">Original</p>
                  <p className="text-white font-medium">{formatSize(result.originalSize)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-white/40 mb-1 uppercase tracking-widest">Compressed</p>
                  <p className="text-white font-medium">{formatSize(result.newSize)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-white/40 mb-1 uppercase tracking-widest">Saved</p>
                  <p className="text-green-400 font-medium">
                    {result.originalSize > result.newSize
                      ? `${(((result.originalSize - result.newSize) / result.originalSize) * 100).toFixed(1)}%`
                      : "0%"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            {!result ? (
              <Button onClick={handleCompress} disabled={isProcessing} className="rounded-full px-8 h-12">
                {isProcessing ? "Compressing…" : "Compress Image"}
              </Button>
            ) : (
              <a href={result.url} download={`${stem}_compressed.${ext}`}>
                <Button className="rounded-full px-8 h-12">
                  <Download className="h-4 w-4 mr-2" /> Download {format.toUpperCase()}
                </Button>
              </a>
            )}
            <Button variant="outline" onClick={handleReset} className="rounded-full px-8 h-12 border-white/20 text-white hover:bg-white/10">
              <RefreshCw className="h-4 w-4 mr-2" /> Start Over
            </Button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
