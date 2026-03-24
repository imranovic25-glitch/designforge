import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import {
  Bold,
  ChevronLeft,
  ChevronRight,
  Circle,
  Copy,
  Download,
  FilePenLine,
  FileText,
  Highlighter,
  Image,
  Italic,
  LoaderCircle,
  Minus,
  MousePointer2,
  Plus,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Settings,
  Square,
  Trash2,
  Type,
  Underline,
  UploadCloud,
  ZoomIn,
  ZoomOut,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Droplets,
  Hash,
  ScanText,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════

type ToolMode = "select" | "text" | "image" | "shape" | "highlight";
type ShapeType = "rectangle" | "circle";
type FontFamily = "Helvetica" | "TimesRoman" | "Courier";
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

interface TextAnnotation {
  type: "text"; id: string; pageId: string;
  x: number; y: number; content: string;
  fontSize: number; fontFamily: FontFamily;
  color: string; bold: boolean; italic: boolean;
  underline: boolean; alignment: "left" | "center" | "right";
}

interface ImageAnnotation {
  type: "image"; id: string; pageId: string;
  x: number; y: number; width: number; height: number; src: string;
}

interface ShapeAnnotation {
  type: "shape"; id: string; pageId: string;
  shapeType: ShapeType; x: number; y: number;
  width: number; height: number;
  strokeColor: string; fillColor: string; strokeWidth: number;
}

interface HighlightAnnotation {
  type: "highlight"; id: string; pageId: string;
  x: number; y: number; width: number; height: number;
  color: string; opacity: number;
}

type Annotation = TextAnnotation | ImageAnnotation | ShapeAnnotation | HighlightAnnotation;

interface ExportSettings {
  addPageNumbers: boolean;
  pageNumberPosition: PageNumberPosition;
  watermarkText: string;
  watermarkOpacity: number;
  metadataTitle: string;
  metadataAuthor: string;
}

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════

const FONT_MAP: Record<FontFamily, { css: string; label: string }> = {
  Helvetica: { css: "Arial, Helvetica, sans-serif", label: "Helvetica" },
  TimesRoman: { css: '"Times New Roman", Times, serif', label: "Times Roman" },
  Courier: { css: '"Courier New", Courier, monospace', label: "Courier" },
};

const SIZE_OPTIONS = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];

const COLOR_PRESETS = [
  "#000000", "#333333", "#FFFFFF", "#FF0000", "#FF6600",
  "#FFCC00", "#00CC00", "#0066FF", "#9933FF", "#FF00FF",
];

const DEFAULT_EXPORT: ExportSettings = {
  addPageNumbers: false,
  pageNumberPosition: "bottom-center",
  watermarkText: "",
  watermarkOpacity: 0.18,
  metadataTitle: "",
  metadataAuthor: "",
};

const faqItems = [
  { question: "What can I edit in this PDF editor?", answer: "Add text, images, shapes, and highlights on any page. Reorder, rotate, duplicate, or delete pages. Add watermarks, page numbers, and set metadata before exporting." },
  { question: "Does this upload my PDF?", answer: "No. Everything runs in your browser. Files never leave your device." },
  { question: "Can I edit existing text in the PDF?", answer: "This editor adds overlay annotations. It does not modify the original text inside the PDF." },
  { question: "Will large PDFs work?", answer: "Yes, but very large PDFs may take longer to load and render depending on your device." },
];

const relatedGuides = [
  { title: "How to Compress PDF Files", path: "/guides/how-to-compress-pdf" },
  { title: "How to Merge PDF Files", path: "/guides/how-to-merge-pdf-files" },
];

const relatedComparisons = [
  { title: "Best PDF Editors", path: "/comparisons/best-pdf-editors" },
  { title: "Best PDF Converters", path: "/comparisons/best-pdf-converters" },
];

// ═══════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
}

function getEffectiveSize(page: EditorPage) {
  const rotated = page.rotation === 90 || page.rotation === 270;
  return { width: rotated ? page.height : page.width, height: rotated ? page.width : page.height };
}

function clampOpacity(value: number) {
  if (Number.isNaN(value)) return 0.18;
  return Math.max(0.05, Math.min(0.5, value));
}

async function buildPreviewPages(fileBytes: Uint8Array): Promise<EditorPage[]> {
  const pdf = await pdfjsLib.getDocument({ data: fileBytes }).promise;
  const result: EditorPage[] = [];
  for (let i = 0; i < pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const bv = page.getViewport({ scale: 1 });
    const scale = Math.min(1, 180 / bv.width);
    const vp = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = Math.ceil(vp.width);
    canvas.height = Math.ceil(vp.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    result.push({
      id: `${i}-${crypto.randomUUID()}`,
      originalIndex: i,
      previewUrl: canvas.toDataURL("image/png"),
      width: bv.width,
      height: bv.height,
      rotation: 0,
      selected: false,
    });
  }
  return result;
}

function drawPageNumber(page: PDFPage, font: PDFFont, num: number, total: number, pos: PageNumberPosition) {
  const w = page.getWidth(), h = page.getHeight();
  const label = `${num} / ${total}`;
  const size = Math.max(10, Math.min(w, h) * 0.022);
  const tw = font.widthOfTextAtSize(label, size);
  const p = pos === "top-right" ? { x: w - tw - 24, y: h - size - 20 } : { x: (w - tw) / 2, y: 18 };
  page.drawText(label, { ...p, size, font, color: rgb(0.78, 0.8, 0.86), opacity: 0.78 });
}

function drawWatermark(page: PDFPage, font: PDFFont, text: string, opacity: number) {
  const w = page.getWidth(), h = page.getHeight();
  const size = Math.max(26, Math.min(w, h) * 0.09);
  const tw = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (w - tw) / 2, y: (h - size) / 2, size, font, rotate: degrees(35), color: rgb(0.98, 0.7, 0.34), opacity });
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export function PdfEditor() {
  // --- Refs ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // --- File state ---
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [sourceBytes, setSourceBytes] = useState<Uint8Array | null>(null);
  const [pages, setPages] = useState<EditorPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // --- Tool state ---
  const [activeTool, setActiveTool] = useState<ToolMode>("select");
  const [activeShape, setActiveShape] = useState<ShapeType>("rectangle");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnId, setSelectedAnnId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // --- Interaction state ---
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null);
  const [resizing, setResizing] = useState<{ id: string; corner: string; sx: number; sy: number; sw: number; sh: number; sax: number; say: number } | null>(null);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [shapeCurrent, setShapeCurrent] = useState<{ x: number; y: number } | null>(null);

  // --- View state ---
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExportPanel, setShowExportPanel] = useState(false);

  // --- Export state ---
  const [exportSettings, setExportSettings] = useState<ExportSettings>(DEFAULT_EXPORT);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadSize, setDownloadSize] = useState<number | null>(null);

  // --- Derived state ---
  const currentPage = pages[currentPageIndex] ?? null;
  const effectiveSize = currentPage ? getEffectiveSize(currentPage) : { width: 612, height: 792 };
  const canvasW = effectiveSize.width * zoom;
  const canvasH = effectiveSize.height * zoom;
  const selectedAnn = annotations.find((a) => a.id === selectedAnnId) ?? null;

  const currentAnnotations = useMemo(
    () => (currentPage ? annotations.filter((a) => a.pageId === currentPage.id) : []),
    [annotations, currentPage]
  );

  // ═════════════════════════════════════════════════════════════════════
  // FILE HANDLERS
  // ═════════════════════════════════════════════════════════════════════

  const clearDownload = useCallback(() => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setDownloadSize(null);
  }, [downloadUrl]);

  const resetEditor = useCallback(() => {
    setPdfFile(null);
    setSourceBytes(null);
    setPages([]);
    setAnnotations([]);
    setSelectedAnnId(null);
    setEditingTextId(null);
    setCurrentPageIndex(0);
    setExportSettings(DEFAULT_EXPORT);
    setError(null);
    setActiveTool("select");
    setZoom(1);
    clearDownload();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [clearDownload]);

  const loadFile = async (file: File) => {
    if (file.type !== "application/pdf") { setError("Choose a valid PDF."); return; }
    setError(null);
    setIsLoading(true);
    clearDownload();
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const nextPages = await buildPreviewPages(bytes);
      setPdfFile(file);
      setSourceBytes(bytes);
      setPages(nextPages);
      setCurrentPageIndex(0);
      setAnnotations([]);
      setExportSettings((prev) => ({ ...prev, metadataTitle: file.name.replace(/\.pdf$/i, "") }));
    } catch {
      setError("This PDF could not be opened.");
      setPdfFile(null);
      setSourceBytes(null);
      setPages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) void loadFile(f);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) void loadFile(f);
  };

  // ═════════════════════════════════════════════════════════════════════
  // PAGE MANAGEMENT
  // ═════════════════════════════════════════════════════════════════════

  const goToPage = (idx: number) => {
    if (idx >= 0 && idx < pages.length) { setCurrentPageIndex(idx); setSelectedAnnId(null); setEditingTextId(null); }
  };

  const rotatePage = (idx: number, delta: number) => {
    setPages((p) => p.map((pg, i) => i === idx ? { ...pg, rotation: (((pg.rotation + delta) % 360) + 360) % 360 } : pg));
    clearDownload();
  };

  const duplicatePage = (idx: number) => {
    setPages((p) => {
      const copy = { ...p[idx], id: `${p[idx].originalIndex}-${crypto.randomUUID()}`, selected: false };
      const next = [...p]; next.splice(idx + 1, 0, copy); return next;
    });
    clearDownload();
  };

  const deletePage = (idx: number) => {
    if (pages.length <= 1) return;
    const deleted = pages[idx];
    setPages((p) => p.filter((_, i) => i !== idx));
    setAnnotations((a) => a.filter((ann) => ann.pageId !== deleted.id));
    if (currentPageIndex >= pages.length - 1) setCurrentPageIndex(Math.max(0, pages.length - 2));
    else if (idx < currentPageIndex) setCurrentPageIndex((c) => c - 1);
    clearDownload();
  };

  const movePageUp = (idx: number) => {
    if (idx <= 0) return;
    setPages((p) => { const n = [...p]; [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]]; return n; });
    if (currentPageIndex === idx) setCurrentPageIndex(idx - 1);
    else if (currentPageIndex === idx - 1) setCurrentPageIndex(idx);
    clearDownload();
  };

  const movePageDown = (idx: number) => {
    if (idx >= pages.length - 1) return;
    setPages((p) => { const n = [...p]; [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]]; return n; });
    if (currentPageIndex === idx) setCurrentPageIndex(idx + 1);
    else if (currentPageIndex === idx + 1) setCurrentPageIndex(idx);
    clearDownload();
  };

  // ═════════════════════════════════════════════════════════════════════
  // CANVAS RENDERING
  // ═════════════════════════════════════════════════════════════════════

  useEffect(() => {
    let cancelled = false;
    async function render() {
      if (!sourceBytes || !canvasRef.current || !currentPage) return;
      try {
        const pdf = await pdfjsLib.getDocument({ data: sourceBytes.slice() }).promise;
        if (cancelled) return;
        const page = await pdf.getPage(currentPage.originalIndex + 1);
        if (cancelled) return;
        const vp = page.getViewport({ scale: zoom, rotation: currentPage.rotation });
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = Math.ceil(vp.width);
        canvas.height = Math.ceil(vp.height);
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
      } catch (err) {
        if (!cancelled) console.error("Render error:", err);
      }
    }
    void render();
    return () => { cancelled = true; };
  }, [sourceBytes, currentPage?.id, currentPage?.rotation, currentPage?.originalIndex, zoom]);

  // ═════════════════════════════════════════════════════════════════════
  // ANNOTATION HANDLERS
  // ═════════════════════════════════════════════════════════════════════

  const updateAnnotation = useCallback((id: string, patch: Partial<Annotation>) => {
    setAnnotations((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } as Annotation : a));
    clearDownload();
  }, [clearDownload]);

  const deleteAnnotation = useCallback((id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    if (selectedAnnId === id) { setSelectedAnnId(null); setEditingTextId(null); }
    clearDownload();
  }, [selectedAnnId, clearDownload]);

  const getCanvasPos = useCallback((e: React.MouseEvent): { x: number; y: number } | null => {
    const el = overlayRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / zoom, y: (e.clientY - rect.top) / zoom };
  }, [zoom]);

  // Create text annotation
  const createText = useCallback((x: number, y: number) => {
    if (!currentPage) return;
    const ann: TextAnnotation = {
      type: "text", id: crypto.randomUUID(), pageId: currentPage.id,
      x, y, content: "Type here", fontSize: 16, fontFamily: "Helvetica",
      color: "#000000", bold: false, italic: false, underline: false, alignment: "left",
    };
    setAnnotations((prev) => [...prev, ann]);
    setSelectedAnnId(ann.id);
    setEditingTextId(ann.id);
    setActiveTool("select");
    clearDownload();
  }, [currentPage, clearDownload]);

  // Image upload handler
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentPage) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new window.Image();
      img.onload = () => {
        const es = getEffectiveSize(currentPage);
        const maxW = es.width * 0.5, maxH = es.height * 0.5;
        const s = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
        const w = img.naturalWidth * s, h = img.naturalHeight * s;
        const ann: ImageAnnotation = {
          type: "image", id: crypto.randomUUID(), pageId: currentPage.id,
          x: (es.width - w) / 2, y: (es.height - h) / 2, width: w, height: h, src,
        };
        setAnnotations((prev) => [...prev, ann]);
        setSelectedAnnId(ann.id);
        setActiveTool("select");
        clearDownload();
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }, [currentPage, clearDownload]);

  // Overlay mouse handlers
  const handleOverlayMouseDown = useCallback((e: React.MouseEvent) => {
    const pos = getCanvasPos(e);
    if (!pos) return;

    if (activeTool === "text") { createText(pos.x, pos.y); return; }
    if (activeTool === "image") { imageInputRef.current?.click(); return; }
    if (activeTool === "shape" || activeTool === "highlight") {
      setShapeStart(pos);
      setShapeCurrent(pos);
      return;
    }
    // select tool — deselect
    setSelectedAnnId(null);
    setEditingTextId(null);
  }, [activeTool, createText, getCanvasPos]);

  const handleOverlayMouseMove = useCallback((e: React.MouseEvent) => {
    const pos = getCanvasPos(e);
    if (!pos) return;

    if (dragging) {
      setAnnotations((prev) =>
        prev.map((a) => a.id === dragging.id ? { ...a, x: pos.x - dragging.ox, y: pos.y - dragging.oy } as Annotation : a)
      );
      return;
    }

    if (resizing) {
      const dx = pos.x - resizing.sx, dy = pos.y - resizing.sy;
      setAnnotations((prev) =>
        prev.map((a) => {
          if (a.id !== resizing.id || !("width" in a)) return a;
          let { sax: nx, say: ny, sw: nw, sh: nh } = resizing;
          const c = resizing.corner;
          if (c.includes("e")) nw = Math.max(20, resizing.sw + dx);
          if (c.includes("w")) { nx = resizing.sax + dx; nw = Math.max(20, resizing.sw - dx); }
          if (c.includes("s")) nh = Math.max(20, resizing.sh + dy);
          if (c.includes("n")) { ny = resizing.say + dy; nh = Math.max(20, resizing.sh - dy); }
          return { ...a, x: nx, y: ny, width: nw, height: nh } as Annotation;
        })
      );
      return;
    }

    if (shapeStart) {
      setShapeCurrent(pos);
    }
  }, [dragging, resizing, shapeStart, getCanvasPos]);

  const handleOverlayMouseUp = useCallback(() => {
    if (dragging) { setDragging(null); clearDownload(); return; }
    if (resizing) { setResizing(null); clearDownload(); return; }

    if (shapeStart && shapeCurrent && currentPage) {
      const x = Math.min(shapeStart.x, shapeCurrent.x);
      const y = Math.min(shapeStart.y, shapeCurrent.y);
      const w = Math.abs(shapeCurrent.x - shapeStart.x);
      const h = Math.abs(shapeCurrent.y - shapeStart.y);

      if (w > 8 && h > 8) {
        if (activeTool === "shape") {
          const ann: ShapeAnnotation = {
            type: "shape", id: crypto.randomUUID(), pageId: currentPage.id,
            shapeType: activeShape, x, y, width: w, height: h,
            strokeColor: "#FF0000", fillColor: "transparent", strokeWidth: 2,
          };
          setAnnotations((prev) => [...prev, ann]);
          setSelectedAnnId(ann.id);
        } else if (activeTool === "highlight") {
          const ann: HighlightAnnotation = {
            type: "highlight", id: crypto.randomUUID(), pageId: currentPage.id,
            x, y, width: w, height: h, color: "#FFFF00", opacity: 0.35,
          };
          setAnnotations((prev) => [...prev, ann]);
          setSelectedAnnId(ann.id);
        }
        clearDownload();
      }
      setShapeStart(null);
      setShapeCurrent(null);
    }
  }, [dragging, resizing, shapeStart, shapeCurrent, activeTool, activeShape, currentPage, clearDownload]);

  // Annotation element mouse down (for moving)
  const handleAnnMouseDown = useCallback((e: React.MouseEvent, annId: string) => {
    e.stopPropagation();
    if (activeTool !== "select") return;
    setSelectedAnnId(annId);
    setEditingTextId(null);
    const pos = getCanvasPos(e);
    const ann = annotations.find((a) => a.id === annId);
    if (!pos || !ann) return;
    setDragging({ id: annId, ox: pos.x - ann.x, oy: pos.y - ann.y });
  }, [activeTool, annotations, getCanvasPos]);

  // Resize handle mouse down
  const handleResizeStart = useCallback((e: React.MouseEvent, annId: string, corner: string) => {
    e.stopPropagation();
    const pos = getCanvasPos(e);
    const ann = annotations.find((a) => a.id === annId);
    if (!pos || !ann || !("width" in ann)) return;
    setResizing({
      id: annId, corner, sx: pos.x, sy: pos.y,
      sw: ann.width, sh: ann.height, sax: ann.x, say: ann.y,
    });
  }, [annotations, getCanvasPos]);

  // ═════════════════════════════════════════════════════════════════════
  // KEYBOARD HANDLER
  // ═════════════════════════════════════════════════════════════════════

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (editingTextId) return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedAnnId) {
        deleteAnnotation(selectedAnnId);
      }
      if (e.key === "Escape") {
        setSelectedAnnId(null);
        setEditingTextId(null);
        setActiveTool("select");
        setShapeStart(null);
        setShapeCurrent(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editingTextId, selectedAnnId, deleteAnnotation]);

  // ═════════════════════════════════════════════════════════════════════
  // EXPORT
  // ═════════════════════════════════════════════════════════════════════

  const exportPdf = async () => {
    if (!sourceBytes || !pdfFile || pages.length === 0) return;
    setIsExporting(true);
    setError(null);
    try {
      const source = await PDFDocument.load(sourceBytes, { ignoreEncryption: true });
      const output = await PDFDocument.create();
      const baseFont = await output.embedFont(StandardFonts.Helvetica);
      const wt = exportSettings.watermarkText.trim();

      // Font cache for annotations
      const embeddedFonts: Record<string, PDFFont> = {};
      async function getFont(family: FontFamily, bold: boolean, italic: boolean) {
        const key = `${family}_${bold}_${italic}`;
        if (embeddedFonts[key]) return embeddedFonts[key];
        let name = StandardFonts.Helvetica;
        if (family === "Helvetica") name = bold && italic ? StandardFonts.HelveticaBoldOblique : bold ? StandardFonts.HelveticaBold : italic ? StandardFonts.HelveticaOblique : StandardFonts.Helvetica;
        else if (family === "TimesRoman") name = bold && italic ? StandardFonts.TimesRomanBoldItalic : bold ? StandardFonts.TimesRomanBold : italic ? StandardFonts.TimesRomanItalic : StandardFonts.TimesRoman;
        else if (family === "Courier") name = bold && italic ? StandardFonts.CourierBoldOblique : bold ? StandardFonts.CourierBold : italic ? StandardFonts.CourierOblique : StandardFonts.Courier;
        const f = await output.embedFont(name);
        embeddedFonts[key] = f;
        return f;
      }

      for (let i = 0; i < pages.length; i++) {
        const ep = pages[i];
        const [copiedPage] = await output.copyPages(source, [ep.originalIndex]);
        const curRot = copiedPage.getRotation().angle;
        copiedPage.setRotation(degrees((curRot + ep.rotation) % 360));
        output.addPage(copiedPage);
        const outPage = output.getPage(output.getPageCount() - 1);
        const pH = outPage.getHeight();

        if (exportSettings.addPageNumbers) drawPageNumber(outPage, baseFont, i + 1, pages.length, exportSettings.pageNumberPosition);
        if (wt) drawWatermark(outPage, baseFont, wt, clampOpacity(exportSettings.watermarkOpacity));

        // Stamp annotations for this page
        const pageAnns = annotations.filter((a) => a.pageId === ep.id);
        for (const ann of pageAnns) {
          if (ann.type === "text" && ann.content.trim()) {
            const font = await getFont(ann.fontFamily, ann.bold, ann.italic);
            const [r, g, b] = hexToRgb(ann.color);
            outPage.drawText(ann.content, {
              x: ann.x, y: pH - ann.y - ann.fontSize,
              size: ann.fontSize, font, color: rgb(r, g, b),
            });
          } else if (ann.type === "image") {
            try {
              const isJpeg = ann.src.startsWith("data:image/jpeg") || ann.src.startsWith("data:image/jpg");
              const base64 = ann.src.split(",")[1];
              const imgBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
              const image = isJpeg ? await output.embedJpg(imgBytes) : await output.embedPng(imgBytes);
              outPage.drawImage(image, { x: ann.x, y: pH - ann.y - ann.height, width: ann.width, height: ann.height });
            } catch { /* skip unembeddable images */ }
          } else if (ann.type === "shape") {
            const [sr, sg, sb] = hexToRgb(ann.strokeColor);
            if (ann.shapeType === "rectangle") {
              outPage.drawRectangle({ x: ann.x, y: pH - ann.y - ann.height, width: ann.width, height: ann.height, borderColor: rgb(sr, sg, sb), borderWidth: ann.strokeWidth, color: undefined });
            } else {
              outPage.drawEllipse({ x: ann.x + ann.width / 2, y: pH - ann.y - ann.height / 2, xScale: ann.width / 2, yScale: ann.height / 2, borderColor: rgb(sr, sg, sb), borderWidth: ann.strokeWidth });
            }
          } else if (ann.type === "highlight") {
            const [hr, hg, hb] = hexToRgb(ann.color);
            outPage.drawRectangle({ x: ann.x, y: pH - ann.y - ann.height, width: ann.width, height: ann.height, color: rgb(hr, hg, hb), opacity: ann.opacity });
          }
        }
      }

      if (exportSettings.metadataTitle.trim()) output.setTitle(exportSettings.metadataTitle.trim());
      if (exportSettings.metadataAuthor.trim()) output.setAuthor(exportSettings.metadataAuthor.trim());
      output.setProducer("DesignForge360 PDF Editor");
      output.setCreator("DesignForge360 PDF Editor");
      output.setModificationDate(new Date());

      const bytes = await output.save({ useObjectStreams: true, addDefaultPage: false });
      const blob = new Blob([bytes], { type: "application/pdf" });
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(URL.createObjectURL(blob));
      setDownloadSize(bytes.byteLength);
    } catch (err) {
      console.error(err);
      setError("Export failed. Try reducing page count or removing unsupported items.");
    } finally {
      setIsExporting(false);
    }
  };

  // ═════════════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═════════════════════════════════════════════════════════════════════

  const renderResizeHandles = (annId: string) => {
    const corners = ["nw", "ne", "sw", "se"] as const;
    return corners.map((c) => (
      <div
        key={c}
        className="absolute h-3 w-3 rounded-full border-2 border-blue-500 bg-white"
        style={{
          top: c.includes("n") ? -6 : undefined, bottom: c.includes("s") ? -6 : undefined,
          left: c.includes("w") ? -6 : undefined, right: c.includes("e") ? -6 : undefined,
          cursor: `${c}-resize`,
        }}
        onMouseDown={(e) => handleResizeStart(e, annId, c)}
      />
    ));
  };

  const renderAnnotationElement = (ann: Annotation) => {
    const isSelected = selectedAnnId === ann.id;
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: ann.x * zoom,
      top: ann.y * zoom,
    };

    if (ann.type === "text") {
      const isEditing = editingTextId === ann.id;
      return (
        <div
          key={ann.id}
          style={{
            ...baseStyle,
            fontSize: ann.fontSize * zoom,
            fontFamily: FONT_MAP[ann.fontFamily].css,
            color: ann.color,
            fontWeight: ann.bold ? "bold" : "normal",
            fontStyle: ann.italic ? "italic" : "normal",
            textDecoration: ann.underline ? "underline" : "none",
            textAlign: ann.alignment,
            minWidth: 60 * zoom,
            cursor: activeTool === "select" ? (isEditing ? "text" : "move") : undefined,
            outline: isSelected ? "2px solid #3b82f6" : "1px dashed transparent",
            outlineOffset: 2,
            padding: 2 * zoom,
            borderRadius: 2,
            background: isEditing ? "rgba(255,255,255,0.95)" : isSelected ? "rgba(255,255,255,0.1)" : "transparent",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            lineHeight: 1.4,
            zIndex: isSelected ? 20 : 10,
          }}
          onMouseDown={(e) => {
            if (isEditing) { e.stopPropagation(); return; }
            handleAnnMouseDown(e, ann.id);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (activeTool === "select") { setSelectedAnnId(ann.id); setEditingTextId(ann.id); }
          }}
        >
          {isEditing ? (
            <textarea
              autoFocus
              defaultValue={ann.content}
              onBlur={(e) => { updateAnnotation(ann.id, { content: e.target.value }); setEditingTextId(null); }}
              onKeyDown={(e) => { if (e.key === "Escape") { setEditingTextId(null); } }}
              className="w-full resize-none border-none bg-transparent p-0 outline-none"
              style={{
                fontSize: ann.fontSize * zoom,
                fontFamily: FONT_MAP[ann.fontFamily].css,
                color: ann.color,
                fontWeight: ann.bold ? "bold" : "normal",
                fontStyle: ann.italic ? "italic" : "normal",
                textDecoration: ann.underline ? "underline" : "none",
                textAlign: ann.alignment,
                lineHeight: 1.4,
                minHeight: ann.fontSize * zoom * 2,
                minWidth: 120 * zoom,
              }}
            />
          ) : (
            <span>{ann.content}</span>
          )}
        </div>
      );
    }

    if (ann.type === "image") {
      return (
        <div
          key={ann.id}
          style={{
            ...baseStyle,
            width: ann.width * zoom,
            height: ann.height * zoom,
            cursor: activeTool === "select" ? "move" : undefined,
            outline: isSelected ? "2px solid #3b82f6" : "none",
            outlineOffset: 2,
            zIndex: isSelected ? 20 : 10,
          }}
          onMouseDown={(e) => handleAnnMouseDown(e, ann.id)}
        >
          <img src={ann.src} alt="overlay" className="pointer-events-none h-full w-full object-fill" draggable={false} />
          {isSelected && renderResizeHandles(ann.id)}
        </div>
      );
    }

    if (ann.type === "shape") {
      return (
        <div
          key={ann.id}
          style={{
            ...baseStyle,
            width: ann.width * zoom,
            height: ann.height * zoom,
            border: `${ann.strokeWidth}px solid ${ann.strokeColor}`,
            borderRadius: ann.shapeType === "circle" ? "50%" : 0,
            backgroundColor: ann.fillColor === "transparent" ? "transparent" : ann.fillColor,
            cursor: activeTool === "select" ? "move" : undefined,
            outline: isSelected ? "2px solid #3b82f6" : "none",
            outlineOffset: 2,
            boxSizing: "border-box",
            zIndex: isSelected ? 20 : 10,
          }}
          onMouseDown={(e) => handleAnnMouseDown(e, ann.id)}
        >
          {isSelected && renderResizeHandles(ann.id)}
        </div>
      );
    }

    if (ann.type === "highlight") {
      return (
        <div
          key={ann.id}
          style={{
            ...baseStyle,
            width: ann.width * zoom,
            height: ann.height * zoom,
            backgroundColor: ann.color,
            opacity: ann.opacity,
            cursor: activeTool === "select" ? "move" : undefined,
            outline: isSelected ? "2px solid #3b82f6" : "none",
            outlineOffset: 2,
            zIndex: isSelected ? 20 : 5,
          }}
          onMouseDown={(e) => handleAnnMouseDown(e, ann.id)}
        >
          {isSelected && renderResizeHandles(ann.id)}
        </div>
      );
    }

    return null;
  };

  // ═════════════════════════════════════════════════════════════════════
  // ZOOM HELPERS
  // ═════════════════════════════════════════════════════════════════════

  const zoomIn = () => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(0.25, +(z - 0.25).toFixed(2)));
  const zoomFit = () => setZoom(1);

  // ═════════════════════════════════════════════════════════════════════
  // TOOLBAR BUTTON HELPER
  // ═════════════════════════════════════════════════════════════════════

  const ToolBtn = ({ tool, icon, label }: { tool: ToolMode; icon: React.ReactNode; label: string }) => (
    <button
      onClick={() => { setActiveTool(tool); setSelectedAnnId(null); setEditingTextId(null); }}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${activeTool === tool ? "bg-white text-black shadow" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
      title={label}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );

  // ═════════════════════════════════════════════════════════════════════
  // JSX
  // ═════════════════════════════════════════════════════════════════════

  return (
    <ToolLayout
      title="PDF Editor"
      description="Advanced browser-based PDF editor — add text, images, shapes, and highlights. Reorder, rotate, and export with page numbers, watermarks, and metadata."
      icon={<FilePenLine className="h-7 w-7" />}
      toolSlug="pdf-editor"
      faqItems={faqItems}
      relatedGuides={relatedGuides}
      relatedComparisons={relatedComparisons}
    >
      <SEOHead
        title="Free PDF Editor Online — Add Text, Images, Shapes and Export"
        description="Edit PDFs in your browser. Add text, images, shapes, highlights. Reorder pages, watermark, add page numbers. Fully private — files never leave your device."
        canonical="/tools/pdf-editor"
        schema="WebApplication"
        appName="PDF Editor"
      />

      <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileSelect} />
      <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleImageUpload} />

      {!pdfFile ? (
        /* ───────── UPLOAD SCREEN ───────── */
        <div
          className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-white/10 px-8 py-20 text-center transition-colors hover:border-white/30 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-white/40">
            <UploadCloud className="h-8 w-8" />
          </div>
          <h3 className="mb-4 text-2xl font-medium text-white">Open a PDF to start editing</h3>
          <p className="mb-8 max-w-xl text-white/45">
            Drag and drop a PDF here or choose a file. Add text, images, shapes, and highlights — all processing stays on your device.
          </p>
          <Button className="h-12 rounded-full px-8">Choose PDF</Button>
          {isLoading && <p className="mt-4 text-sm text-white/40"><LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" />Loading…</p>}
          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        </div>
      ) : (
        /* ───────── EDITOR WORKSPACE ───────── */
        <div className="flex flex-col" style={{ minHeight: "75vh" }}>

          {/* ── TOP TOOLBAR ── */}
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2">
            {/* Tool modes */}
            <ToolBtn tool="select" icon={<MousePointer2 className="h-4 w-4" />} label="Select" />
            <ToolBtn tool="text" icon={<Type className="h-4 w-4" />} label="Edit Text" />
            <button
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-white/60 transition-all hover:bg-white/10 hover:text-white"
              title="Insert Image"
            >
              <Image className="h-4 w-4" />
              <span className="hidden md:inline">Insert Image</span>
            </button>

            <div className="mx-1 h-6 w-px bg-white/10" />

            {/* Shapes */}
            <button
              onClick={() => { setActiveTool("shape"); setActiveShape("rectangle"); }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${activeTool === "shape" && activeShape === "rectangle" ? "bg-white text-black shadow" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
              title="Rectangle"
            >
              <Square className="h-4 w-4" />
              <span className="hidden md:inline">Rectangle</span>
            </button>
            <button
              onClick={() => { setActiveTool("shape"); setActiveShape("circle"); }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${activeTool === "shape" && activeShape === "circle" ? "bg-white text-black shadow" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
              title="Circle"
            >
              <Circle className="h-4 w-4" />
              <span className="hidden md:inline">Circle</span>
            </button>
            <ToolBtn tool="highlight" icon={<Highlighter className="h-4 w-4" />} label="Highlight" />

            <div className="mx-1 h-6 w-px bg-white/10" />

            {/* Page actions */}
            <button onClick={() => rotatePage(currentPageIndex, -90)} className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white" title="Rotate Left"><RotateCcw className="h-4 w-4" /></button>
            <button onClick={() => rotatePage(currentPageIndex, 90)} className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white" title="Rotate Right"><RotateCw className="h-4 w-4" /></button>
            <button onClick={() => duplicatePage(currentPageIndex)} className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white" title="Duplicate Page"><Copy className="h-4 w-4" /></button>
            <button onClick={() => deletePage(currentPageIndex)} disabled={pages.length <= 1} className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-red-400 disabled:opacity-30" title="Delete Page"><Trash2 className="h-4 w-4" /></button>

            {/* Right side: export */}
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => setShowExportPanel(!showExportPanel)} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white">
                <Settings className="h-4 w-4" />
                <span className="hidden md:inline">Settings</span>
              </button>
              <Button variant="outline" onClick={resetEditor} className="h-9 rounded-lg border-white/20 px-4 text-sm text-white hover:bg-white/10">
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> New
              </Button>
              <Button onClick={() => void exportPdf()} disabled={isExporting} className="h-9 rounded-lg px-5 text-sm">
                {isExporting ? <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />}
                {isExporting ? "Exporting…" : "Export PDF"}
              </Button>
            </div>
          </div>

          {error && <div className="mb-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-2 text-sm text-red-300">{error}</div>}

          {downloadUrl && (
            <div className="mb-3 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-2">
              <span className="flex-1 text-sm text-white">PDF ready {downloadSize ? `(${formatBytes(downloadSize)})` : ""}</span>
              <a href={downloadUrl} download={pdfFile.name.replace(/\.pdf$/i, "") + "_edited.pdf"}>
                <Button className="h-9 rounded-lg px-5 text-sm"><Download className="mr-1.5 h-3.5 w-3.5" /> Download</Button>
              </a>
            </div>
          )}

          {/* ── MAIN BODY: LEFT + CENTER + RIGHT ── */}
          <div className="flex flex-1 gap-3 overflow-hidden" style={{ minHeight: "60vh" }}>

            {/* ── LEFT SIDEBAR — PAGE THUMBNAILS ── */}
            <div className="hidden w-[130px] shrink-0 flex-col gap-2 overflow-y-auto rounded-2xl border border-white/8 bg-white/[0.02] p-2 md:flex">
              {pages.map((pg, idx) => (
                <button
                  key={pg.id}
                  onClick={() => goToPage(idx)}
                  className={`group relative rounded-xl border p-1.5 transition-all ${idx === currentPageIndex ? "border-white/30 bg-white/10" : "border-transparent hover:border-white/15 hover:bg-white/[0.04]"}`}
                >
                  <img
                    src={pg.previewUrl}
                    alt={`Page ${idx + 1}`}
                    className="mx-auto block rounded-md shadow-md"
                    style={{
                      maxHeight: 140,
                      transform: `rotate(${pg.rotation}deg)`,
                      transition: "transform 0.2s",
                    }}
                    draggable={false}
                  />
                  <div className="mt-1 text-center text-[10px] font-medium text-white/40">{idx + 1}</div>

                  {/* Page management buttons on hover */}
                  <div className="absolute right-0 top-0 hidden flex-col gap-0.5 rounded-lg bg-black/80 p-0.5 group-hover:flex">
                    <button onClick={(e) => { e.stopPropagation(); movePageUp(idx); }} disabled={idx === 0} className="rounded p-0.5 text-white/50 hover:text-white disabled:opacity-20" title="Move Up"><ChevronLeft className="h-3 w-3 rotate-90" /></button>
                    <button onClick={(e) => { e.stopPropagation(); movePageDown(idx); }} disabled={idx === pages.length - 1} className="rounded p-0.5 text-white/50 hover:text-white disabled:opacity-20" title="Move Down"><ChevronRight className="h-3 w-3 rotate-90" /></button>
                  </div>
                </button>
              ))}
            </div>

            {/* ── CENTER — CANVAS PREVIEW ── */}
            <div className="relative flex flex-1 items-start justify-center overflow-auto rounded-2xl border border-white/8 bg-[#12121a] p-6">
              {isLoading && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60">
                  <LoaderCircle className="h-8 w-8 animate-spin text-white/50" />
                </div>
              )}
              <div className="relative inline-block" style={{ width: canvasW, height: canvasH }}>
                <canvas ref={canvasRef} className="block rounded shadow-[0_8px_40px_rgba(0,0,0,0.5)]" style={{ width: canvasW, height: canvasH }} />
                {/* Annotation overlay */}
                <div
                  ref={overlayRef}
                  className={`absolute inset-0 ${activeTool === "text" ? "cursor-text" : activeTool === "shape" || activeTool === "highlight" ? "cursor-crosshair" : "cursor-default"}`}
                  style={{ width: canvasW, height: canvasH }}
                  onMouseDown={handleOverlayMouseDown}
                  onMouseMove={handleOverlayMouseMove}
                  onMouseUp={handleOverlayMouseUp}
                  onMouseLeave={() => { if (dragging) setDragging(null); if (resizing) setResizing(null); }}
                >
                  {currentAnnotations.map(renderAnnotationElement)}

                  {/* Shape/highlight drag preview */}
                  {shapeStart && shapeCurrent && (
                    <div
                      className="pointer-events-none absolute border-2 border-dashed"
                      style={{
                        left: Math.min(shapeStart.x, shapeCurrent.x) * zoom,
                        top: Math.min(shapeStart.y, shapeCurrent.y) * zoom,
                        width: Math.abs(shapeCurrent.x - shapeStart.x) * zoom,
                        height: Math.abs(shapeCurrent.y - shapeStart.y) * zoom,
                        borderColor: activeTool === "highlight" ? "#FFFF00" : "#FF0000",
                        backgroundColor: activeTool === "highlight" ? "rgba(255,255,0,0.2)" : "transparent",
                        borderRadius: activeTool === "shape" && activeShape === "circle" ? "50%" : 0,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* ── RIGHT SIDEBAR — PROPERTIES / SETTINGS ── */}
            <div className="hidden w-[240px] shrink-0 flex-col gap-3 overflow-y-auto rounded-2xl border border-white/8 bg-white/[0.02] p-3 lg:flex">

              {/* File info */}
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-white/30" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-white">{pdfFile.name}</p>
                    <p className="text-[10px] text-white/35">{formatBytes(pdfFile.size)} • {pages.length} pg</p>
                  </div>
                </div>
              </div>

              {/* Annotation properties */}
              {selectedAnn ? (
                <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3 space-y-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                    {selectedAnn.type === "text" ? "Text Styles" : selectedAnn.type === "image" ? "Image" : selectedAnn.type === "shape" ? "Shape" : "Highlight"}
                  </div>

                  {/* TEXT PROPERTIES */}
                  {selectedAnn.type === "text" && (() => {
                    const ann = selectedAnn as TextAnnotation;
                    return (
                      <>
                        <select
                          value={ann.fontFamily}
                          onChange={(e) => updateAnnotation(ann.id, { fontFamily: e.target.value as FontFamily })}
                          className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-xs text-white outline-none"
                        >
                          {Object.entries(FONT_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <select
                          value={ann.fontSize}
                          onChange={(e) => updateAnnotation(ann.id, { fontSize: Number(e.target.value) })}
                          className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-xs text-white outline-none"
                        >
                          {SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}pt</option>)}
                        </select>
                        <div className="flex gap-1">
                          <button onClick={() => updateAnnotation(ann.id, { bold: !ann.bold })} className={`flex-1 rounded-lg border p-1.5 text-xs ${ann.bold ? "border-white/30 bg-white/15 text-white" : "border-white/10 text-white/50 hover:bg-white/10"}`}><Bold className="mx-auto h-3.5 w-3.5" /></button>
                          <button onClick={() => updateAnnotation(ann.id, { italic: !ann.italic })} className={`flex-1 rounded-lg border p-1.5 text-xs ${ann.italic ? "border-white/30 bg-white/15 text-white" : "border-white/10 text-white/50 hover:bg-white/10"}`}><Italic className="mx-auto h-3.5 w-3.5" /></button>
                          <button onClick={() => updateAnnotation(ann.id, { underline: !ann.underline })} className={`flex-1 rounded-lg border p-1.5 text-xs ${ann.underline ? "border-white/30 bg-white/15 text-white" : "border-white/10 text-white/50 hover:bg-white/10"}`}><Underline className="mx-auto h-3.5 w-3.5" /></button>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => updateAnnotation(ann.id, { alignment: "left" })} className={`flex-1 rounded-lg border p-1.5 ${ann.alignment === "left" ? "border-white/30 bg-white/15" : "border-white/10 hover:bg-white/10"}`}><AlignLeft className="mx-auto h-3.5 w-3.5 text-white/60" /></button>
                          <button onClick={() => updateAnnotation(ann.id, { alignment: "center" })} className={`flex-1 rounded-lg border p-1.5 ${ann.alignment === "center" ? "border-white/30 bg-white/15" : "border-white/10 hover:bg-white/10"}`}><AlignCenter className="mx-auto h-3.5 w-3.5 text-white/60" /></button>
                          <button onClick={() => updateAnnotation(ann.id, { alignment: "right" })} className={`flex-1 rounded-lg border p-1.5 ${ann.alignment === "right" ? "border-white/30 bg-white/15" : "border-white/10 hover:bg-white/10"}`}><AlignRight className="mx-auto h-3.5 w-3.5 text-white/60" /></button>
                        </div>
                        <div>
                          <div className="mb-1.5 text-[10px] font-medium text-white/35">Color</div>
                          <div className="flex flex-wrap gap-1.5">
                            {COLOR_PRESETS.map((c) => (
                              <button
                                key={c}
                                onClick={() => updateAnnotation(ann.id, { color: c })}
                                className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${ann.color === c ? "border-white shadow-lg" : "border-white/20"}`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  {/* SHAPE PROPERTIES */}
                  {selectedAnn.type === "shape" && (() => {
                    const ann = selectedAnn as ShapeAnnotation;
                    return (
                      <>
                        <div>
                          <div className="mb-1.5 text-[10px] font-medium text-white/35">Stroke Color</div>
                          <div className="flex flex-wrap gap-1.5">
                            {COLOR_PRESETS.map((c) => (
                              <button key={c} onClick={() => updateAnnotation(ann.id, { strokeColor: c })} className={`h-5 w-5 rounded-full border-2 ${ann.strokeColor === c ? "border-white" : "border-white/20"}`} style={{ backgroundColor: c }} />
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="mb-1.5 text-[10px] font-medium text-white/35">Stroke Width</div>
                          <input type="range" min="1" max="8" step="1" value={ann.strokeWidth} onChange={(e) => updateAnnotation(ann.id, { strokeWidth: Number(e.target.value) })} className="w-full accent-white" />
                          <div className="text-right text-[10px] text-white/30">{ann.strokeWidth}px</div>
                        </div>
                      </>
                    );
                  })()}

                  {/* HIGHLIGHT PROPERTIES */}
                  {selectedAnn.type === "highlight" && (() => {
                    const ann = selectedAnn as HighlightAnnotation;
                    return (
                      <>
                        <div>
                          <div className="mb-1.5 text-[10px] font-medium text-white/35">Color</div>
                          <div className="flex flex-wrap gap-1.5">
                            {["#FFFF00", "#FF9900", "#00FF00", "#00CCFF", "#FF00FF", "#FF3366"].map((c) => (
                              <button key={c} onClick={() => updateAnnotation(ann.id, { color: c })} className={`h-5 w-5 rounded-full border-2 ${ann.color === c ? "border-white" : "border-white/20"}`} style={{ backgroundColor: c }} />
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="mb-1.5 text-[10px] font-medium text-white/35">Opacity</div>
                          <input type="range" min="0.1" max="0.8" step="0.05" value={ann.opacity} onChange={(e) => updateAnnotation(ann.id, { opacity: Number(e.target.value) })} className="w-full accent-yellow-300" />
                          <div className="text-right text-[10px] text-white/30">{Math.round(ann.opacity * 100)}%</div>
                        </div>
                      </>
                    );
                  })()}

                  {/* IMAGE PROPERTIES */}
                  {selectedAnn.type === "image" && (
                    <div className="text-xs text-white/40">
                      {Math.round((selectedAnn as ImageAnnotation).width)} × {Math.round((selectedAnn as ImageAnnotation).height)} pt<br />
                      Drag corners to resize.
                    </div>
                  )}

                  <button onClick={() => deleteAnnotation(selectedAnn.id)} className="w-full rounded-lg border border-red-500/20 bg-red-500/[0.06] px-3 py-2 text-xs text-red-300 hover:bg-red-500/[0.12]">
                    <Trash2 className="mr-1.5 inline h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35 mb-2">Quick Actions</div>
                  <p className="text-xs text-white/40 leading-relaxed">
                    {activeTool === "select" && "Click on an annotation to select it. Double-click text to edit."}
                    {activeTool === "text" && "Click anywhere on the page to add a text box."}
                    {activeTool === "image" && "Click to upload and place an image on the page."}
                    {activeTool === "shape" && "Click and drag on the page to draw a shape."}
                    {activeTool === "highlight" && "Click and drag to highlight an area."}
                  </p>
                </div>
              )}

              {/* EXPORT SETTINGS (collapsible) */}
              {showExportPanel && (
                <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3 space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                    <ScanText className="h-3.5 w-3.5" /> Export Settings
                  </div>

                  <label className="flex items-center justify-between text-xs text-white/60">
                    <span>Page numbers</span>
                    <input type="checkbox" checked={exportSettings.addPageNumbers} onChange={(e) => setExportSettings((s) => ({ ...s, addPageNumbers: e.target.checked }))} className="h-3.5 w-3.5 accent-white" />
                  </label>

                  {exportSettings.addPageNumbers && (
                    <select
                      value={exportSettings.pageNumberPosition}
                      onChange={(e) => setExportSettings((s) => ({ ...s, pageNumberPosition: e.target.value as PageNumberPosition }))}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-xs text-white outline-none"
                    >
                      <option value="bottom-center">Bottom center</option>
                      <option value="top-right">Top right</option>
                    </select>
                  )}

                  <div>
                    <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-white/35">
                      <Droplets className="h-3 w-3" /> Watermark
                    </div>
                    <input value={exportSettings.watermarkText} onChange={(e) => setExportSettings((s) => ({ ...s, watermarkText: e.target.value }))} placeholder="e.g. Confidential" className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-xs text-white placeholder:text-white/25 outline-none" />
                  </div>

                  {exportSettings.watermarkText && (
                    <div>
                      <input type="range" min="0.05" max="0.5" step="0.01" value={exportSettings.watermarkOpacity} onChange={(e) => setExportSettings((s) => ({ ...s, watermarkOpacity: Number(e.target.value) }))} className="w-full accent-amber-300" />
                      <div className="text-right text-[10px] text-white/30">{Math.round(exportSettings.watermarkOpacity * 100)}%</div>
                    </div>
                  )}

                  <div>
                    <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-white/35">
                      <Hash className="h-3 w-3" /> Metadata
                    </div>
                    <input value={exportSettings.metadataTitle} onChange={(e) => setExportSettings((s) => ({ ...s, metadataTitle: e.target.value }))} placeholder="Title" className="mb-1.5 w-full rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-xs text-white placeholder:text-white/25 outline-none" />
                    <input value={exportSettings.metadataAuthor} onChange={(e) => setExportSettings((s) => ({ ...s, metadataAuthor: e.target.value }))} placeholder="Author" className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-xs text-white placeholder:text-white/25 outline-none" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── BOTTOM BAR — PAGE NAV + ZOOM ── */}
          <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-2">
            {/* Page navigation */}
            <div className="flex items-center gap-2">
              <button onClick={() => goToPage(currentPageIndex - 1)} disabled={currentPageIndex <= 0} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
              <span className="min-w-[80px] text-center text-sm font-medium text-white/70">
                Page {currentPageIndex + 1} / {pages.length}
              </span>
              <button onClick={() => goToPage(currentPageIndex + 1)} disabled={currentPageIndex >= pages.length - 1} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
            </div>

            {/* Mobile page selector */}
            <div className="flex items-center gap-2 md:hidden">
              <select
                value={currentPageIndex}
                onChange={(e) => goToPage(Number(e.target.value))}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-white outline-none"
              >
                {pages.map((_, i) => <option key={i} value={i}>Page {i + 1}</option>)}
              </select>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center gap-2">
              <button onClick={zoomOut} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"><ZoomOut className="h-4 w-4" /></button>
              <button onClick={zoomFit} className="min-w-[52px] rounded-lg px-2 py-1 text-center text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white">
                {Math.round(zoom * 100)}%
              </button>
              <button onClick={zoomIn} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"><ZoomIn className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}

export default PdfEditor;
