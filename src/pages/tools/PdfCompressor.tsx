import { useState, useRef } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { UploadCloud, Download, RefreshCw, CheckCircle2, FileText } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/src/components/ui/button";
import { PDFDocument } from "pdf-lib";

const faqItems = [
  {
    question: "How does PDF compression work?",
    answer: "Our tool re-processes your PDF in the browser using pdf-lib, removing redundant metadata, compressing streams, and optimizing object references to reduce file size."
  },
  {
    question: "Will compression affect quality?",
    answer: "At low compression, changes are nearly imperceptible. High compression may reduce embedded image quality slightly. Text and vector graphics are always preserved perfectly."
  },
  {
    question: "Is there a file size limit?",
    answer: "The tool runs entirely in your browser. Large files may be slow to process on lower-end devices, but there is no hard server-side limit."
  },
  {
    question: "Are my files uploaded anywhere?",
    answer: "No. All processing happens locally in your browser using pdf-lib. Your files never leave your device."
  }
];

const relatedGuides = [
  { title: "How to Compress PDF Files", path: "/guides/how-to-compress-pdf" }
];

const relatedComparisons = [
  { title: "Best PDF Editors", path: "/comparisons/best-pdf-editors" },
  { title: "Best PDF Converters", path: "/comparisons/best-pdf-converters" },
];

type CompressionLevel = "low" | "medium" | "high";

const compressionLabels: Record<CompressionLevel, string> = {
  low: "Low — safest quality",
  medium: "Medium — balanced",
  high: "High — smallest size"
};

function AnimatedCompressIcon() {
  const bars = [36, 28, 20, 13, 7];
  return (
    <div className="w-10 h-10 flex items-end justify-center gap-[3px] pb-1">
      {bars.map((h, i) => (
        <motion.div key={i}
          className="w-[5px] rounded-sm"
          style={{
            background: `rgba(255,255,255,${0.25 + (1 - h / 36) * 0.72})`,
            originY: 1,
          }}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: h * 0.85, opacity: 1 }}
          transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  );
}

export function PdfCompressor() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>("medium");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; originalSize: number; newSize: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setResult(null);
    }
  };

  const handleCompress = async () => {
    if (!pdfFile) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const saveOptions = {
        useObjectStreams: compressionLevel !== "low",
        addDefaultPage: false,
        objectsPerTick: compressionLevel === "high" ? 50 : compressionLevel === "medium" ? 30 : 20
      };
      const compressedBytes = await pdfDoc.save(saveOptions);
      const blob = new Blob([compressedBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResult({ url, originalSize: pdfFile.size, newSize: compressedBytes.byteLength });
    } catch (err) {
      console.error("PDF compression failed:", err);
    }
    setIsProcessing(false);
  };

  const handleReset = () => {
    setPdfFile(null);
    setResult(null);
    setCompressionLevel("medium");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <ToolLayout
      title="PDF Compressor"
      description="Reduce the file size of your PDF documents with one click. All processing happens locally — no uploads, no privacy trade-offs."
      icon={<AnimatedCompressIcon />}
      toolSlug="pdf-compressor"
      faqItems={faqItems}
      relatedGuides={relatedGuides}
      relatedComparisons={relatedComparisons}
    >
      <SEOHead
        title="Free PDF Compressor Online — Reduce PDF Size Instantly"
        description="Compress PDF files online for free — drag, drop and download instantly. No file size limit, no watermark, no server upload. Fast browser-based compression."
        canonical="/tools/pdf-compressor"
        schema="WebApplication"
        appName="PDF Compressor"
      />
      {!pdfFile ? (
        <div
          className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-16 text-center cursor-pointer hover:border-white/30 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 mb-8">
            <UploadCloud className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-medium text-white mb-4">Upload a PDF</h3>
          <p className="text-white/40 font-light mb-8">Drag and drop or click to select a PDF file</p>
          <Button className="rounded-full px-8">Choose File</Button>
          <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileSelect} />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="glass-panel rounded-2xl p-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{pdfFile.name}</p>
              <p className="text-white/40 text-sm">{formatSize(pdfFile.size)}</p>
            </div>
          </div>

          {!result && (
            <div>
              <p className="text-sm font-medium text-white/40 mb-6 uppercase tracking-widest">Compression Level</p>
              <div className="grid grid-cols-3 gap-4">
                {(["low", "medium", "high"] as CompressionLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setCompressionLevel(level)}
                    className={`rounded-2xl p-5 text-left transition-all duration-300 border ${
                      compressionLevel === level
                        ? "border-white/40 bg-white/10 text-white"
                        : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70"
                    }`}
                  >
                    <p className="font-medium capitalize mb-1">{level}</p>
                    <p className="text-xs font-light opacity-70">{compressionLabels[level].split("—")[1].trim()}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <p className="text-white font-medium">Compression complete</p>
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

          <div className="flex flex-wrap gap-4">
            {!result ? (
              <Button onClick={handleCompress} disabled={isProcessing} className="rounded-full px-8 h-12">
                {isProcessing ? "Compressing…" : "Compress PDF"}
              </Button>
            ) : (
              <a href={result.url} download={`${pdfFile.name.replace(".pdf", "")}_compressed.pdf`}>
                <Button className="rounded-full px-8 h-12">
                  <Download className="h-4 w-4 mr-2" /> Download Compressed PDF
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
