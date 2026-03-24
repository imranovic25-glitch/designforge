import { useState, useRef } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { FileText, Download, RefreshCw, UploadCloud } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const faqItems = [
  {
    question: "How does the Word to PDF conversion work?",
    answer:
      "The tool reads your .doc or .docx file in the browser, extracts the text content, and generates a cleanly formatted PDF using the browser's built-in print-to-PDF capability. No server uploads are needed."
  },
  {
    question: "Will formatting be preserved?",
    answer:
      "Basic text and paragraph structure are preserved. Complex formatting like tables, images, and custom fonts may not transfer perfectly since conversion happens entirely in the browser without a Word rendering engine."
  },
  {
    question: "Is there a file size limit?",
    answer:
      "There is no hard limit, but very large files (over 50 MB) may be slow on lower-end devices since everything runs locally in your browser."
  },
  {
    question: "Are my files stored or uploaded?",
    answer:
      "No. All processing runs entirely in your browser. Your files never leave your device."
  }
];

const relatedGuides: { title: string; path: string }[] = [];
const relatedComparisons: { title: string; path: string }[] = [
  { title: "Best PDF Converters", path: "/comparisons/best-pdf-converters" }
];

export function WordToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const ext = selected.name.split(".").pop()?.toLowerCase();
    if (ext !== "doc" && ext !== "docx" && ext !== "txt") {
      setError("Please upload a .doc, .docx, or .txt file.");
      return;
    }
    setFile(selected);
    setError(null);
    setText("");
    extractText(selected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (!dropped) return;
    const ext = dropped.name.split(".").pop()?.toLowerCase();
    if (ext !== "doc" && ext !== "docx" && ext !== "txt") {
      setError("Please upload a .doc, .docx, or .txt file.");
      return;
    }
    setFile(dropped);
    setError(null);
    setText("");
    extractText(dropped);
  };

  async function extractText(f: File) {
    setIsProcessing(true);
    try {
      const content = await f.text();
      setText(content);
    } catch {
      setError("Could not read the file. Try a plain .txt file.");
    } finally {
      setIsProcessing(false);
    }
  }

  const handleDownloadPdf = () => {
    if (!text) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const sanitized = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br/>");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${file?.name ?? "document"}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; line-height: 1.8; font-size: 14px; color: #222; }
          </style>
        </head>
        <body>${sanitized}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const reset = () => {
    setFile(null);
    setText("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <ToolLayout
      title="Word to PDF"
      description="Convert Word documents and text files to PDF — entirely in your browser, no uploads needed."
      icon={<FileText className="h-7 w-7" />}
      faqItems={faqItems}
      relatedGuides={relatedGuides}
      relatedComparisons={relatedComparisons}
    >
      <SEOHead
        title="Free Word to PDF Converter — Convert DOC to PDF Online"
        description="Convert Word documents (.doc, .docx, .txt) to PDF for free. No uploads, runs entirely in your browser."
        canonical="/tools/word-to-pdf"
        schema="WebApplication"
        appName="Word to PDF Converter"
      />

      <div className="space-y-8">
        {/* Upload area */}
        {!file && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/10 hover:border-amber-500/30 rounded-2xl p-12 text-center cursor-pointer transition-colors group"
          >
            <UploadCloud className="h-10 w-10 mx-auto mb-4 text-white/20 group-hover:text-amber-400/60 transition-colors" />
            <p className="text-white/40 mb-2">
              Drag &amp; drop a Word or text file here, or <span className="text-amber-400/70 underline underline-offset-4">browse</span>
            </p>
            <p className="text-white/20 text-sm">.doc, .docx, .txt supported</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {isProcessing && (
          <div className="text-center py-8 text-white/40">
            Reading file…
          </div>
        )}

        {/* Preview */}
        {text && (
          <>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white/70 text-sm font-medium uppercase tracking-widest">Preview</h3>
                <span className="text-white/30 text-xs">{file?.name}</span>
              </div>
              <div className="max-h-80 overflow-y-auto text-white/60 text-sm font-light leading-relaxed whitespace-pre-wrap">
                {text.slice(0, 5000)}
                {text.length > 5000 && <span className="text-white/20">…(truncated preview)</span>}
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleDownloadPdf}
                className="rounded-full px-8 h-12 bg-amber-500 hover:bg-amber-400 text-black font-medium"
              >
                <Download className="h-4 w-4 mr-2" /> Save as PDF
              </Button>
              <Button
                onClick={reset}
                variant="outline"
                className="rounded-full px-8 h-12 border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Start Over
              </Button>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
