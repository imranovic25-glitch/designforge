import { useMemo, useRef, useState } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import {
  Download,
  FilePenLine,
  FileText,
  Hash,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
  RotateCw,
  ScanText,
  SquareStack,
  Trash2,
  Type,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

type PageNumberPosition = "bottom-center" | "top-right";

interface EditorPage {
  id: string;
  originalIndex: number;
  previewUrl: string;
  width: number;
  height: number;
  rotation: number;
  selected: boolean;
}

interface ExportSettings {
  exportSelectedOnly: boolean;
  addPageNumbers: boolean;
  pageNumberPosition: PageNumberPosition;
  watermarkText: string;
  watermarkOpacity: number;
  metadataTitle: string;
  metadataAuthor: string;
  metadataSubject: string;
  metadataKeywords: string;
}

const faqItems = [
  {
    question: "What can I edit in this PDF editor?",
    answer: "You can reorder pages, rotate pages, duplicate pages, remove pages, export only selected pages, add watermark text, apply page numbers, and set PDF metadata like title, author, subject, and keywords."
  },
  {
    question: "Does this upload my PDF anywhere?",
    answer: "No. The editor works entirely inside your browser using PDF.js for rendering and pdf-lib for editing. Your files never leave your device."
  },
  {
    question: "Can I edit the text already inside the PDF?",
    answer: "This tool focuses on structural and document-level editing rather than rewriting existing embedded text. It is best for page management, watermarking, numbering, and output control."
  },
  {
    question: "Will large PDFs work?",
    answer: "Yes, but very large PDFs with many pages or heavy images will use more memory and may take longer to render or export depending on your device."
  }
];

const relatedGuides = [
  { title: "How to Compress PDF Files", path: "/guides/how-to-compress-pdf" },
  { title: "How to Merge PDF Files", path: "/guides/how-to-merge-pdf-files" }
];

const relatedComparisons = [
  { title: "Best PDF Editors", path: "/comparisons/best-pdf-editors" },
  { title: "Best PDF Converters", path: "/comparisons/best-pdf-converters" }
];

const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  exportSelectedOnly: false,
  addPageNumbers: true,
  pageNumberPosition: "bottom-center",
  watermarkText: "",
  watermarkOpacity: 0.18,
  metadataTitle: "",
  metadataAuthor: "",
  metadataSubject: "",
  metadataKeywords: "",
};

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function sanitizeOutputName(name: string) {
  return name.replace(/\.pdf$/i, "") + "_edited.pdf";
}

function clampOpacity(value: number) {
  if (Number.isNaN(value)) return 0.18;
  return Math.max(0.05, Math.min(0.5, value));
}

function drawPageNumber(page: PDFPage, font: PDFFont, pageNumber: number, totalPages: number, position: PageNumberPosition) {
  const width = page.getWidth();
  const height = page.getHeight();
  const label = `${pageNumber} / ${totalPages}`;
  const size = Math.max(10, Math.min(width, height) * 0.022);
  const textWidth = font.widthOfTextAtSize(label, size);

  const placement = position === "top-right"
    ? { x: width - textWidth - 24, y: height - size - 20 }
    : { x: (width - textWidth) / 2, y: 18 };

  page.drawText(label, {
    ...placement,
    size,
    font,
    color: rgb(0.78, 0.8, 0.86),
    opacity: 0.78,
  });
}

function drawWatermark(page: PDFPage, font: PDFFont, text: string, opacity: number) {
  const width = page.getWidth();
  const height = page.getHeight();
  const size = Math.max(26, Math.min(width, height) * 0.09);
  const textWidth = font.widthOfTextAtSize(text, size);

  page.drawText(text, {
    x: (width - textWidth) / 2,
    y: (height - size) / 2,
    size,
    font,
    rotate: degrees(35),
    color: rgb(0.98, 0.7, 0.34),
    opacity,
  });
}

async function buildPreviewPages(fileBytes: Uint8Array) {
  const loadingTask = pdfjsLib.getDocument({ data: fileBytes });
  const pdf = await loadingTask.promise;
  const nextPages: EditorPage[] = [];

  for (let index = 0; index < pdf.numPages; index += 1) {
    const page = await pdf.getPage(index + 1);
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(1, 180 / baseViewport.width);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not create preview canvas");
    }

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    await page.render({ canvasContext: context, viewport }).promise;

    nextPages.push({
      id: `${index}-${crypto.randomUUID()}`,
      originalIndex: index,
      previewUrl: canvas.toDataURL("image/png"),
      width: baseViewport.width,
      height: baseViewport.height,
      rotation: 0,
      selected: false,
    });
  }

  return nextPages;
}

export function PdfEditor() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [sourceBytes, setSourceBytes] = useState<Uint8Array | null>(null);
  const [pages, setPages] = useState<EditorPage[]>([]);
  const [settings, setSettings] = useState<ExportSettings>(DEFAULT_EXPORT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadSize, setDownloadSize] = useState<number | null>(null);

  const selectedCount = useMemo(() => pages.filter((page) => page.selected).length, [pages]);
  const exportPages = useMemo(() => {
    if (settings.exportSelectedOnly && selectedCount > 0) {
      return pages.filter((page) => page.selected);
    }
    return pages;
  }, [pages, selectedCount, settings.exportSelectedOnly]);

  const resetEditor = () => {
    setPdfFile(null);
    setSourceBytes(null);
    setPages([]);
    setSettings(DEFAULT_EXPORT_SETTINGS);
    setError(null);
    setDownloadSize(null);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setDownloadUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateDownload = (url: string | null, size: number | null) => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setDownloadUrl(url);
    setDownloadSize(size);
  };

  const loadPdfFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Choose a valid PDF file.");
      return;
    }

    setError(null);
    setIsLoading(true);
    updateDownload(null, null);

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const nextPages = await buildPreviewPages(bytes);
      setPdfFile(file);
      setSourceBytes(bytes);
      setPages(nextPages);
      setSettings((prev) => ({
        ...DEFAULT_EXPORT_SETTINGS,
        metadataTitle: prev.metadataTitle || file.name.replace(/\.pdf$/i, ""),
        metadataAuthor: prev.metadataAuthor,
        metadataSubject: prev.metadataSubject,
        metadataKeywords: prev.metadataKeywords,
      }));
    } catch (loadError) {
      console.error(loadError);
      setError("This PDF could not be opened. It may be corrupted or use unsupported encryption.");
      setPdfFile(null);
      setSourceBytes(null);
      setPages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void loadPdfFile(file);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) void loadPdfFile(file);
  };

  const togglePageSelection = (pageId: string) => {
    setPages((current) => current.map((page) => (
      page.id === pageId ? { ...page, selected: !page.selected } : page
    )));
    updateDownload(null, null);
  };

  const movePage = (pageId: string, direction: -1 | 1) => {
    setPages((current) => {
      const index = current.findIndex((page) => page.id === pageId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
    updateDownload(null, null);
  };

  const rotatePage = (pageId: string, delta: number) => {
    setPages((current) => current.map((page) => (
      page.id === pageId
        ? { ...page, rotation: (((page.rotation + delta) % 360) + 360) % 360 }
        : page
    )));
    updateDownload(null, null);
  };

  const deleteSelectedPages = () => {
    setPages((current) => {
      const remaining = current.filter((page) => !page.selected);
      return remaining.length > 0 ? remaining : current;
    });
    updateDownload(null, null);
  };

  const duplicateSelectedPages = () => {
    setPages((current) => {
      const next: EditorPage[] = [];
      current.forEach((page) => {
        next.push(page);
        if (page.selected) {
          next.push({
            ...page,
            id: `${page.originalIndex}-${crypto.randomUUID()}`,
            selected: false,
          });
        }
      });
      return next;
    });
    updateDownload(null, null);
  };

  const rotateSelectedPages = (delta: number) => {
    setPages((current) => current.map((page) => (
      page.selected
        ? { ...page, rotation: (((page.rotation + delta) % 360) + 360) % 360 }
        : page
    )));
    updateDownload(null, null);
  };

  const reverseOrder = () => {
    setPages((current) => [...current].reverse());
    updateDownload(null, null);
  };

  const setAllSelected = (selected: boolean) => {
    setPages((current) => current.map((page) => ({ ...page, selected })));
    updateDownload(null, null);
  };

  const exportPdf = async () => {
    if (!sourceBytes || !pdfFile || exportPages.length === 0) return;

    setIsExporting(true);
    setError(null);

    try {
      const source = await PDFDocument.load(sourceBytes, { ignoreEncryption: true });
      const output = await PDFDocument.create();
      const baseFont = await output.embedFont(StandardFonts.Helvetica);
      const watermarkText = settings.watermarkText.trim();
      const watermarkOpacity = clampOpacity(settings.watermarkOpacity);

      for (let pageIndex = 0; pageIndex < exportPages.length; pageIndex += 1) {
        const editorPage = exportPages[pageIndex];
        const [copiedPage] = await output.copyPages(source, [editorPage.originalIndex]);
        const currentRotation = copiedPage.getRotation().angle;
        copiedPage.setRotation(degrees((currentRotation + editorPage.rotation) % 360));
        output.addPage(copiedPage);
        const outPage = output.getPage(output.getPageCount() - 1);

        if (settings.addPageNumbers) {
          drawPageNumber(outPage, baseFont, pageIndex + 1, exportPages.length, settings.pageNumberPosition);
        }

        if (watermarkText) {
          drawWatermark(outPage, baseFont, watermarkText, watermarkOpacity);
        }
      }

      if (settings.metadataTitle.trim()) output.setTitle(settings.metadataTitle.trim());
      if (settings.metadataAuthor.trim()) output.setAuthor(settings.metadataAuthor.trim());
      if (settings.metadataSubject.trim()) output.setSubject(settings.metadataSubject.trim());
      if (settings.metadataKeywords.trim()) {
        output.setKeywords(settings.metadataKeywords.split(",").map((item) => item.trim()).filter(Boolean));
      }
      output.setProducer("DesignForge360 PDF Editor");
      output.setCreator("DesignForge360 PDF Editor");
      output.setModificationDate(new Date());

      const bytes = await output.save({ useObjectStreams: true, addDefaultPage: false });
      const blob = new Blob([bytes], { type: "application/pdf" });
      updateDownload(URL.createObjectURL(blob), bytes.byteLength);
    } catch (exportError) {
      console.error(exportError);
      setError("The edited PDF could not be exported. Try reducing the page count or removing unsupported pages.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ToolLayout
      title="PDF Editor"
      description="A full browser-based PDF editor with page thumbnails, reordering, rotation, duplication, deletion, watermarking, numbering, and metadata controls."
      icon={<FilePenLine className="h-7 w-7" />}
      toolSlug="pdf-editor"
      faqItems={faqItems}
      relatedGuides={relatedGuides}
      relatedComparisons={relatedComparisons}
    >
      <SEOHead
        title="Free PDF Editor Online — Reorder, Rotate, Watermark and Export PDFs"
        description="Edit PDFs in your browser with advanced controls. Reorder pages, rotate, duplicate, delete, add watermark text, page numbers, and export securely without uploads."
        canonical="/tools/pdf-editor"
        schema="WebApplication"
        appName="PDF Editor"
      />

      {!pdfFile ? (
        <div
          className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-white/10 px-8 py-20 text-center transition-colors hover:border-white/30"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
        >
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-white/40">
            <UploadCloud className="h-8 w-8" />
          </div>
          <h3 className="mb-4 text-2xl font-medium text-white">Open a PDF to start editing</h3>
          <p className="mb-8 max-w-xl text-white/45">
            Drag and drop a PDF here or choose a file. The editor loads page thumbnails locally and keeps every edit on your device.
          </p>
          <Button className="h-12 rounded-full px-8">Choose PDF</Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
            <div className="space-y-6 rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/45">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{pdfFile.name}</p>
                    <p className="mt-1 text-xs text-white/40">{formatBytes(pdfFile.size)} • {pages.length} pages loaded</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/35">
                  <SquareStack className="h-4 w-4" /> Page Actions
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setAllSelected(true)} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.06]">Select all</button>
                  <button onClick={() => setAllSelected(false)} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.06]">Clear</button>
                  <button onClick={() => rotateSelectedPages(-90)} disabled={selectedCount === 0} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.06] disabled:opacity-30">Rotate left</button>
                  <button onClick={() => rotateSelectedPages(90)} disabled={selectedCount === 0} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.06] disabled:opacity-30">Rotate right</button>
                  <button onClick={duplicateSelectedPages} disabled={selectedCount === 0} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.06] disabled:opacity-30">Duplicate</button>
                  <button onClick={deleteSelectedPages} disabled={selectedCount === 0 || pages.length <= 1} className="rounded-xl border border-red-500/20 bg-red-500/[0.05] px-3 py-2 text-sm text-red-300 transition-colors hover:bg-red-500/[0.1] disabled:opacity-30">Delete</button>
                </div>
                <button onClick={reverseOrder} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.06]">Reverse page order</button>
                <p className="mt-3 text-xs text-white/30">{selectedCount} selected • duplicated pages stay fully editable in the new order.</p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/35">
                  <ScanText className="h-4 w-4" /> Advanced Export
                </div>

                <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white/70">
                  <span>Export only selected pages</span>
                  <input
                    type="checkbox"
                    checked={settings.exportSelectedOnly}
                    onChange={(event) => {
                      setSettings((prev) => ({ ...prev, exportSelectedOnly: event.target.checked }));
                      updateDownload(null, null);
                    }}
                    className="h-4 w-4 accent-white"
                  />
                </label>

                <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white/70">
                  <span>Add page numbers</span>
                  <input
                    type="checkbox"
                    checked={settings.addPageNumbers}
                    onChange={(event) => {
                      setSettings((prev) => ({ ...prev, addPageNumbers: event.target.checked }));
                      updateDownload(null, null);
                    }}
                    className="h-4 w-4 accent-white"
                  />
                </label>

                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-white/35">
                    <Hash className="h-3.5 w-3.5" /> Page number placement
                  </label>
                  <select
                    value={settings.pageNumberPosition}
                    onChange={(event) => {
                      setSettings((prev) => ({ ...prev, pageNumberPosition: event.target.value as PageNumberPosition }));
                      updateDownload(null, null);
                    }}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none"
                  >
                    <option value="bottom-center">Bottom center</option>
                    <option value="top-right">Top right</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-white/35">
                    <Type className="h-3.5 w-3.5" /> Watermark text
                  </label>
                  <input
                    value={settings.watermarkText}
                    onChange={(event) => {
                      setSettings((prev) => ({ ...prev, watermarkText: event.target.value }));
                      updateDownload(null, null);
                    }}
                    placeholder="Confidential, Draft, Internal Use"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.18em] text-white/35">Watermark opacity</label>
                  <input
                    type="range"
                    min="0.05"
                    max="0.5"
                    step="0.01"
                    value={settings.watermarkOpacity}
                    onChange={(event) => {
                      setSettings((prev) => ({ ...prev, watermarkOpacity: Number(event.target.value) }));
                      updateDownload(null, null);
                    }}
                    className="w-full accent-amber-300"
                  />
                  <div className="mt-1 text-right text-xs text-white/35">{Math.round(settings.watermarkOpacity * 100)}%</div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/35">
                  <FilePenLine className="h-4 w-4" /> Metadata
                </div>
                <input value={settings.metadataTitle} onChange={(event) => { setSettings((prev) => ({ ...prev, metadataTitle: event.target.value })); updateDownload(null, null); }} placeholder="Document title" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none" />
                <input value={settings.metadataAuthor} onChange={(event) => { setSettings((prev) => ({ ...prev, metadataAuthor: event.target.value })); updateDownload(null, null); }} placeholder="Author" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none" />
                <input value={settings.metadataSubject} onChange={(event) => { setSettings((prev) => ({ ...prev, metadataSubject: event.target.value })); updateDownload(null, null); }} placeholder="Subject" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none" />
                <input value={settings.metadataKeywords} onChange={(event) => { setSettings((prev) => ({ ...prev, metadataKeywords: event.target.value })); updateDownload(null, null); }} placeholder="Keywords, separated, by commas" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3 rounded-[1.75rem] border border-white/8 bg-white/[0.02] p-4">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.08] px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-300/70">Pages in editor</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{pages.length}</p>
                </div>
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.08] px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-blue-300/70">Selected</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{selectedCount}</p>
                </div>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.08] px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-amber-300/70">Export set</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{exportPages.length}</p>
                </div>
                <div className="ml-auto flex flex-wrap gap-3">
                  <Button variant="outline" onClick={resetEditor} className="h-11 rounded-full border-white/20 px-6 text-white hover:bg-white/10">
                    <RefreshCw className="mr-2 h-4 w-4" /> New file
                  </Button>
                  <Button onClick={() => void exportPdf()} disabled={isExporting || exportPages.length === 0} className="h-11 rounded-full px-6">
                    {isExporting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    {isExporting ? "Exporting…" : "Export edited PDF"}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {downloadUrl && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Edited PDF ready</p>
                      <p className="mt-1 text-xs text-white/45">{downloadSize ? formatBytes(downloadSize) : "Ready to download"}</p>
                    </div>
                    <a href={downloadUrl} download={sanitizeOutputName(pdfFile.name)}>
                      <Button className="h-11 rounded-full px-6">
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                      </Button>
                    </a>
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {pages.map((page, index) => (
                  <div
                    key={page.id}
                    className={`group rounded-[1.6rem] border p-4 transition-all ${page.selected ? "border-white/30 bg-white/[0.07]" : "border-white/8 bg-white/[0.03] hover:bg-white/[0.05]"}`}
                  >
                    <button onClick={() => togglePageSelection(page.id)} className="mb-3 flex w-full items-center justify-between text-left">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">Page {index + 1}</p>
                        <p className="mt-1 text-sm text-white/55">Source #{page.originalIndex + 1} • {Math.round(page.width)} × {Math.round(page.height)}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${page.selected ? "bg-white text-black" : "bg-white/[0.06] text-white/45"}`}>{page.selected ? "Selected" : "Select"}</span>
                    </button>

                    <div className="flex min-h-[230px] items-center justify-center overflow-hidden rounded-[1.2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4">
                      <img
                        src={page.previewUrl}
                        alt={`Preview of page ${index + 1}`}
                        className="max-h-[200px] w-auto rounded-md shadow-[0_14px_50px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-[1.02]"
                        style={{ transform: `rotate(${page.rotation}deg)` }}
                      />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button onClick={() => movePage(page.id, -1)} disabled={index === 0} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.06] disabled:opacity-30">Move up</button>
                      <button onClick={() => movePage(page.id, 1)} disabled={index === pages.length - 1} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.06] disabled:opacity-30">Move down</button>
                      <button onClick={() => rotatePage(page.id, -90)} className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.06]"><RotateCcw className="mr-2 h-4 w-4" />Left</button>
                      <button onClick={() => rotatePage(page.id, 90)} className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.06]"><RotateCw className="mr-2 h-4 w-4" />Right</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/55">
              Loading previews… this can take a moment for larger PDFs.
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
}

export default PdfEditor;