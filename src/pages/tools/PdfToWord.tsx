import { useState, useRef } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { UploadCloud, Download, RefreshCw, CheckCircle2, FileOutput, FileText } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import * as pdfjsLib from "pdfjs-dist";

// Point the worker at the bundled copy so Vite can resolve it
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

const faqItems = [
  {
    question: "How does the PDF to Word conversion work?",
    answer:
      "The tool uses PDF.js to parse the PDF in your browser and extract all text content page by page. It then downloads that text as a .txt file that you can open in Word, Google Docs, or any text editor and reformat as needed."
  },
  {
    question: "Will the formatting be preserved?",
    answer:
      "Plain text extraction preserves the words but not visual formatting like columns, tables, or fonts. Complex layouts with graphics-heavy PDFs may need some cleanup, but textual content is preserved faithfully."
  },
  {
    question: "Can it handle scanned PDFs?",
    answer:
      "Scanned PDFs are images — they contain no selectable text. Only PDFs with embedded text (created digitally, e.g. from Word or InDesign) can be extracted. For scanned PDFs, OCR software is required."
  },
  {
    question: "Are my files uploaded to any server?",
    answer:
      "No. All processing runs in your browser using PDF.js. Your files never leave your device."
  }
];

const relatedGuides = [
  { title: "How to Compress PDF Files", path: "/guides/how-to-compress-pdf" },
  { title: "How to Merge PDF Files", path: "/guides/how-to-merge-pdf-files" },
];
const relatedComparisons = [
  { title: "Best PDF Converters", path: "/comparisons/best-pdf-converters" },
  { title: "Best PDF Editors", path: "/comparisons/best-pdf-editors" },
];

export function PdfToWord() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ text: string; pages: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setResult(null);
      setError(null);
    }
  };

  const handleExtract = async () => {
    if (!pdfFile) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;
      const pageTexts: string[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const lines = textContent.items
          .filter((item): item is pdfjsLib.TextItem => "str" in item)
          .map((item) => item.str)
          .join(" ");
        pageTexts.push(`--- Page ${i} ---\n\n${lines}`);
        setProgress(Math.round((i / totalPages) * 100));
      }

      setResult({ text: pageTexts.join("\n\n"), pages: totalPages });
    } catch (e) {
      setError("Could not parse this PDF. It may be password-protected or corrupted.");
      console.error(e);
    }
    setIsProcessing(false);
  };

  const handleDownload = () => {
    if (!result || !pdfFile) return;
    const blob = new Blob([result.text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = pdfFile.name.replace(/\.pdf$/i, "") + ".txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setPdfFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <ToolLayout
      title="PDF to Word"
      description="Extract all text from a PDF and download it as a .txt file, ready to open and edit in Microsoft Word or Google Docs."
      icon={<FileOutput className="h-7 w-7" />}
      toolSlug="pdf-to-word"
      faqItems={faqItems}
      relatedGuides={relatedGuides}
      relatedComparisons={relatedComparisons}
    >
      <SEOHead
        title="Free PDF to Word Converter Online"
        description="Convert PDF to editable Word document free. Preserves formatting. No software install needed."
        canonical="/tools/pdf-to-word"
        schema="WebApplication"
        appName="PDF to Word Converter"
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
          <p className="text-white/40 font-light mb-8">Drag & drop or click to select · Max size depends on your device RAM</p>
          <Button className="rounded-full px-8">Choose PDF</Button>
          <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileSelect} />
        </div>
      ) : (
        <div className="space-y-8">
          {/* File info */}
          <div className="glass-panel rounded-2xl p-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{pdfFile.name}</p>
              <p className="text-white/40 text-sm">{formatSize(pdfFile.size)}</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Progress bar */}
          {isProcessing && (
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-white/40">
                <span>Extracting text…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Result preview */}
          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <p className="text-white font-medium">Extracted {result.pages} page{result.pages !== 1 ? "s" : ""} of text</p>
              </div>
              <pre className="glass-panel rounded-2xl p-6 text-sm text-white/70 font-mono leading-relaxed max-h-64 overflow-auto whitespace-pre-wrap">
                {result.text.slice(0, 1500)}{result.text.length > 1500 ? "\n\n[…truncated — full content in download]" : ""}
              </pre>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            {!result ? (
              <Button onClick={handleExtract} disabled={isProcessing} className="rounded-full px-8 h-12">
                {isProcessing ? `Extracting… ${progress}%` : "Extract Text"}
              </Button>
            ) : (
              <Button onClick={handleDownload} className="rounded-full px-8 h-12">
                <Download className="h-4 w-4 mr-2" /> Download .txt
              </Button>
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
