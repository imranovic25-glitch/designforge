import { useState, useRef } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { UploadCloud, Download, RefreshCw, CheckCircle2, FileText, ChevronUp, ChevronDown, X, FilePlus2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { PDFDocument } from "pdf-lib";

const faqItems = [
  {
    q: "How many PDFs can I merge at once?",
    a: "You can merge as many PDFs as you need. For very large batches, processing time will increase."
  },
  {
    q: "Will the merged PDF preserve all content?",
    a: "Yes. Our tool copies all pages from each PDF exactly as they are, including text, images, and formatting."
  },
  {
    q: "Can I change the order of the PDFs?",
    a: "Absolutely. Use the up and down arrows next to each file to reorder them before merging."
  },
  {
    q: "Are my files uploaded to a server?",
    a: "No. All merging happens locally in your browser using pdf-lib. Your files never leave your device."
  }
];

const relatedGuides = [
  { title: "How to Merge PDF Files", path: "/guides/how-to-merge-pdf-files" }
];

const relatedComparisons = [
  { title: "Best PDF Converters", path: "/comparisons/best-pdf-converters" },
  { title: "Best PDF Editors", path: "/comparisons/best-pdf-editors" },
];

export function PdfMerger() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).filter((f) => f.type === "application/pdf");
    setFiles((prev) => [...prev, ...selected]);
    setResultUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type === "application/pdf");
    setFiles((prev) => [...prev, ...dropped]);
    setResultUrl(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const newFiles = [...prev];
      [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      return newFiles;
    });
  };

  const moveDown = (index: number) => {
    setFiles((prev) => {
      if (index === prev.length - 1) return prev;
      const newFiles = [...prev];
      [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
      return newFiles;
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResultUrl(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("PDF merge failed:", err);
    }
    setIsProcessing(false);
  };

  const handleReset = () => {
    setFiles([]);
    setResultUrl(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <ToolLayout
      title="PDF Merger"
      description="Combine multiple PDF documents into a single file. Drag to reorder pages and merge instantly — no uploads, no limits."
      icon={<FilePlus2 className="h-7 w-7" />}
      toolSlug="pdf-merger"
      faqItems={faqItems}
      relatedGuides={relatedGuides}
      relatedComparisons={relatedComparisons}
    >
      <SEOHead
        title="Free PDF Merger — Combine PDF Files Online"
        description="Merge multiple PDF files into one document instantly. Free, secure, browser-only."
        canonical="/tools/pdf-merger"
        schema="WebApplication"
        appName="PDF Merger"
      />
      <div className="space-y-8">
        <div
          className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-10 text-center cursor-pointer hover:border-white/30 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 mb-4">
            <UploadCloud className="h-6 w-6" />
          </div>
          <p className="text-white font-medium mb-2">Add PDF Files</p>
          <p className="text-white/40 text-sm font-light">Drag and drop or click to select PDFs</p>
          <input ref={fileInputRef} type="file" accept="application/pdf" multiple className="hidden" onChange={handleFileSelect} />
        </div>

        {files.length > 0 && (
          <div className="space-y-3">
            {files.map((file, index) => (
              <div key={index} className="glass-panel rounded-2xl px-6 py-4 flex items-center gap-4">
                <span className="text-white/20 text-sm w-6 text-center font-medium">{index + 1}</span>
                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{file.name}</p>
                  <p className="text-white/40 text-xs">{formatSize(file.size)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveUp(index)} disabled={index === 0} className="h-8 w-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-colors">
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button onClick={() => moveDown(index)} disabled={index === files.length - 1} className="h-8 w-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-colors">
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button onClick={() => removeFile(index)} className="h-8 w-8 flex items-center justify-center rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {resultUrl && (
          <div className="glass-panel rounded-2xl p-6 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
            <p className="text-white/70 flex-1">PDFs merged successfully.</p>
          </div>
        )}

        {files.length >= 2 && (
          <div className="flex flex-wrap gap-4">
            {!resultUrl ? (
              <Button onClick={handleMerge} disabled={isProcessing} className="rounded-full px-8 h-12">
                {isProcessing ? "Merging…" : `Merge ${files.length} PDFs`}
              </Button>
            ) : (
              <a href={resultUrl} download="merged.pdf">
                <Button className="rounded-full px-8 h-12">
                  <Download className="h-4 w-4 mr-2" /> Download Merged PDF
                </Button>
              </a>
            )}
            <Button variant="outline" onClick={handleReset} className="rounded-full px-8 h-12 border-white/20 text-white hover:bg-white/10">
              <RefreshCw className="h-4 w-4 mr-2" /> Start Over
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
