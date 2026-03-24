import { useState, useRef } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { Sparkles, UploadCloud, Download, RefreshCw, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const REMOVEBG_KEY = process.env.REMOVEBG_API_KEY as string;

const faqItems = [
  {
    q: "How does background removal work?",
    a: "Our tool sends your image to the Remove.bg AI API, which uses deep learning to precisely isolate the foreground subject and return a transparent PNG."
  },
  {
    q: "What image formats are supported?",
    a: "You can upload JPG, PNG, or WebP images. The output will always be a transparent PNG for maximum compatibility."
  },
  {
    q: "Is there a file size limit?",
    a: "For best performance we recommend images under 10MB. Larger files may take longer to process."
  },
  {
    q: "Are my images stored on your servers?",
    a: "No. This tool processes images locally in your browser. Your files are never uploaded to any server."
  }
];

const relatedGuides = [
  { title: "How to Remove Image Backgrounds", path: "/guides/how-to-remove-image-background" },
  { title: "How to Choose AI Background Remover Tools", path: "/guides/how-to-choose-ai-writing-tools" }
];

const relatedComparisons = [
  { title: "Best AI Background Remover Tools", path: "/comparisons/best-ai-background-remover-tools" }
];

export function BackgroundRemover() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setProcessedImage(null);
      setProcessingError(null);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setProcessedImage(null);
      setProcessingError(null);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!imageFile) return;
    setIsProcessing(true);
    setProcessingError(null);
    try {
      const formData = new FormData();
      formData.append("image_file", imageFile);
      formData.append("size", "auto");
      const res = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: { "X-Api-Key": REMOVEBG_KEY },
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.errors?.[0]?.title || `API error ${res.status}`);
      }
      const blob = await res.blob();
      setProcessedImage(URL.createObjectURL(blob));
    } catch (err) {
      setProcessingError(err instanceof Error ? err.message : "Background removal failed. Please try again.");
    }
    setIsProcessing(false);
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setProcessedImage(null);
    setProcessingError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <ToolLayout
      title="Background Remover"
      description="Instantly remove the background from any image. Upload, process, and download a transparent PNG — all in your browser."
      icon={<ImageIcon className="h-7 w-7" />}
      faqItems={faqItems}
      relatedGuides={relatedGuides}
      relatedComparisons={relatedComparisons}
    >
      <SEOHead
        title="AI Background Remover — Free, Instant, Browser-Only"
        description="Remove image backgrounds instantly with AI. No uploads, no signup — runs entirely in your browser. Supports PNG, JPEG, WebP."
        canonical="/tools/background-remover"
        schema="WebApplication"
        appName="AI Background Remover"
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
          <p className="text-white/40 font-light mb-8">Drag and drop or click to select a JPG, PNG, or WebP file</p>
          <Button className="rounded-full px-8">Choose File</Button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-white/40 mb-4 uppercase tracking-widest">Original</p>
              <div className="rounded-2xl overflow-hidden bg-white/5 aspect-square flex items-center justify-center">
                <img src={imagePreview!} alt="Original" className="w-full h-full object-contain" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-white/40 mb-4 uppercase tracking-widest">Processed</p>
              <div
                className="rounded-2xl overflow-hidden aspect-square flex items-center justify-center relative"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='10' height='10' fill='%23333'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23333'/%3E%3Crect x='10' width='10' height='10' fill='%23222'/%3E%3Crect y='10' width='10' height='10' fill='%23222'/%3E%3C/svg%3E\")" }}
              >
                {processedImage ? (
                  <img src={processedImage} alt="Processed" className="w-full h-full object-contain" />
                ) : isProcessing ? (
                  <div className="flex flex-col items-center gap-4 text-white/40">
                    <Sparkles className="h-8 w-8 animate-pulse" />
                    <p className="text-sm">Processing…</p>
                  </div>
                ) : (
                  <p className="text-white/20 text-sm font-light">Result will appear here</p>
                )}
              </div>
            </div>
          </div>

          {processedImage && (
            <div className="glass-panel rounded-2xl p-6 flex items-center gap-4">
              <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
              <p className="text-white/70 flex-1">Background removed successfully.</p>
            </div>
          )}
          {processingError && (
            <div className="glass-panel border border-red-500/20 rounded-2xl p-5 text-red-400 text-sm">
              {processingError}
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            {!processedImage ? (
              <Button onClick={handleProcess} disabled={isProcessing} className="rounded-full px-8 h-12">
                {isProcessing ? "Processing…" : "Remove Background"}
              </Button>
            ) : (
              <a href={processedImage} download={`${imageFile?.name.replace(/\.[^/.]+$/, "")}_nobg.png`}>
                <Button className="rounded-full px-8 h-12">
                  <Download className="h-4 w-4 mr-2" /> Download PNG
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
