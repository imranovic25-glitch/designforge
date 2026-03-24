import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SEOHead } from "@/src/components/seo/SEOHead";
import {
  AlignCenter, AlignLeft, AlignRight, Bold, ChevronLeft, ChevronRight,
  Circle, Copy, Download, Eraser, EyeOff, FilePenLine,
  Hand, Highlighter, ImagePlus, Italic, LoaderCircle,
  Maximize2, MousePointer2, PenLine, Plus, Redo2,
  RotateCcw, RotateCw, Square, Strikethrough, Trash2, Type,
  Underline, Undo2, UploadCloud, ZoomIn, ZoomOut,
} from "lucide-react";
import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { TextLayer } from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

/* ═══════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════ */

type ToolMode = "hand" | "select" | "editText" | "addText" | "draw" | "eraser" | "shape" | "image" | "highlight" | "redact";
type ShapeKind = "rectangle" | "circle";
type FontFamily = "Helvetica" | "TimesRoman" | "Courier";
type PageNumberPos = "bottom-center" | "top-right";

interface EditorPage {
  id: string; originalIndex: number; thumbUrl: string;
  width: number; height: number; rotation: number;
}

interface TextAnnotation {
  kind: "text"; id: string; pageId: string;
  x: number; y: number; text: string;
  fontSize: number; fontFamily: FontFamily;
  color: string; bold: boolean; italic: boolean;
  underline: boolean; strikethrough: boolean;
  align: "left" | "center" | "right";
  /* PDF-native fields for pixel-perfect export (set when editing existing PDF text) */
  pdfX?: number;        // exact x in PDF coords (bottom-left origin)
  pdfY?: number;        // exact baseline y in PDF coords
  pdfFontSize?: number; // exact font size from PDF transform
  pdfFontName?: string; // original font name from PDF (e.g. "g_d0_f1")
  pdfFontFamily?: string; // CSS font-family from pdfjs styles
  pdfW?: number;        // original text width in PDF units
  pdfH?: number;        // original text height in PDF units
}
interface ImageAnnotation {
  kind: "image"; id: string; pageId: string;
  x: number; y: number; w: number; h: number; src: string;
}
interface ShapeAnnotation {
  kind: "shape"; id: string; pageId: string;
  shape: ShapeKind; x: number; y: number; w: number; h: number;
  stroke: string; fill: string; strokeW: number;
}
interface HighlightAnnotation {
  kind: "highlight"; id: string; pageId: string;
  x: number; y: number; w: number; h: number;
  color: string; opacity: number;
}
interface DrawAnnotation {
  kind: "draw"; id: string; pageId: string;
  x: number; y: number;
  points: { x: number; y: number }[];
  color: string; width: number;
}
interface WhiteoutAnnotation {
  kind: "whiteout"; id: string; pageId: string;
  x: number; y: number; w: number; h: number;
  /* PDF-native fields for pixel-perfect whiteout placement */
  pdfX?: number; pdfY?: number; pdfW?: number; pdfH?: number;
}

type Annotation = TextAnnotation | ImageAnnotation | ShapeAnnotation | HighlightAnnotation | DrawAnnotation | WhiteoutAnnotation;

/* ═══════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════ */

const FONT_MAP: Record<FontFamily, { css: string; label: string }> = {
  Helvetica: { css: "Arial, Helvetica, sans-serif", label: "Helvetica" },
  TimesRoman: { css: '"Times New Roman", Times, serif', label: "Times New Roman" },
  Courier: { css: '"Courier New", Courier, monospace', label: "Courier" },
};
const SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72, 96];
const COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#FFFFFF",
  "#FF0000", "#FF4400", "#FF8800", "#FFCC00", "#FFFF00",
  "#00CC00", "#00AA88", "#0088FF", "#0044CC", "#6633CC",
  "#9900CC", "#CC0066", "#FF0066", "#FF6699", "#FFCCEE",
];
const HIGHLIGHT_COLORS = ["#FFFF00", "#00FF00", "#00CCFF", "#FF9900", "#FF00FF", "#FF3366"];
const ERASER_SIZES = [{ label: "XS", size: 4 }, { label: "S", size: 8 }, { label: "M", size: 16 }, { label: "L", size: 32 }];

/* ═══════════════════════════════════════════════════════════════════════
   UTILS
   ═══════════════════════════════════════════════════════════════════════ */

function fmt(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
function hex2rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
}
function effSize(p: EditorPage) {
  const r = p.rotation === 90 || p.rotation === 270;
  return { w: r ? p.height : p.width, h: r ? p.width : p.height };
}

async function buildThumbs(bytes: Uint8Array): Promise<EditorPage[]> {
  const pdf = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
  const out: EditorPage[] = [];
  for (let i = 0; i < pdf.numPages; i++) {
    const pg = await pdf.getPage(i + 1);
    const bv = pg.getViewport({ scale: 1 });
    const s = Math.min(1, 160 / bv.width);
    const vp = pg.getViewport({ scale: s });
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d")!;
    c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height);
    await pg.render({ canvasContext: ctx, viewport: vp } as any).promise;
    out.push({ id: `${i}-${crypto.randomUUID()}`, originalIndex: i, thumbUrl: c.toDataURL("image/png"), width: bv.width, height: bv.height, rotation: 0 });
  }
  return out;
}

function stampPageNum(page: PDFPage, font: PDFFont, num: number, total: number, pos: PageNumberPos) {
  const w = page.getWidth(), h = page.getHeight();
  const label = `${num} / ${total}`;
  const sz = Math.max(10, Math.min(w, h) * 0.022);
  const tw = font.widthOfTextAtSize(label, sz);
  const xy = pos === "top-right" ? { x: w - tw - 24, y: h - sz - 20 } : { x: (w - tw) / 2, y: 18 };
  page.drawText(label, { ...xy, size: sz, font, color: rgb(0.4, 0.4, 0.45), opacity: 0.85 });
}

function stampWatermark(page: PDFPage, font: PDFFont, text: string, opacity: number) {
  const w = page.getWidth(), h = page.getHeight();
  const sz = Math.max(26, Math.min(w, h) * 0.09);
  const tw = font.widthOfTextAtSize(text, sz);
  page.drawText(text, { x: (w - tw) / 2, y: (h - sz) / 2, size: sz, font, rotate: degrees(35), color: rgb(0.85, 0.55, 0.2), opacity });
}

/* ═══════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export function PdfEditor() {
  /* ─── refs ─── */
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const editTaRef = useRef<HTMLTextAreaElement>(null);

  /* ─── file state ─── */
  const [file, setFile] = useState<File | null>(null);
  const [srcBytes, setSrcBytes] = useState<Uint8Array | null>(null);
  const [pages, setPages] = useState<EditorPage[]>([]);
  const [pgIdx, setPgIdx] = useState(0);

  /* ─── tool state ─── */
  const [tool, setTool] = useState<ToolMode>("select");
  const [shapeKind, setShapeKind] = useState<ShapeKind>("rectangle");
  const [anns, setAnns] = useState<Annotation[]>([]);
  const [selId, setSelId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  /* ─── text-level undo for textarea ─── */
  const textUndoStack = useRef<string[]>([]);
  const textUndoIdx = useRef(-1);

  /* ─── PDF text content for coordinate extraction ─── */
  const textContentRef = useRef<{ items: any[]; styles: Record<string, any> } | null>(null);
  const pageHeightRef = useRef<number>(0);

  /* ─── eraser ─── */
  const [eraserSize, setEraserSize] = useState(8);

  /* ─── draw settings ─── */
  const [drawColor, setDrawColor] = useState("#FF0000");
  const [drawWidth, setDrawWidth] = useState(2);

  /* ─── pdfText for editText mode ─── */
  const [textLayerReady, setTextLayerReady] = useState(false);

  /* ─── undo/redo ─── */
  const [history, setHistory] = useState<Annotation[][]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const pushHistory = useCallback(() => {
    setHistory((h) => {
      const next = [...h.slice(0, histIdx + 1), structuredClone(anns)];
      if (next.length > 50) next.shift();
      return next;
    });
    setHistIdx((i) => Math.min(i + 1, 50));
  }, [anns, histIdx]);
  const undo = useCallback(() => {
    if (histIdx <= 0) return;
    const prev = history[histIdx - 1];
    if (prev) { setAnns(structuredClone(prev)); setHistIdx((i) => i - 1); }
  }, [history, histIdx]);
  const redo = useCallback(() => {
    if (histIdx >= history.length - 1) return;
    const next = history[histIdx + 1];
    if (next) { setAnns(structuredClone(next)); setHistIdx((i) => i + 1); }
  }, [history, histIdx]);

  /* ─── interaction ─── */
  const [drag, setDrag] = useState<{ id: string; ox: number; oy: number } | null>(null);
  const [resize, setResize] = useState<{ id: string; corner: string; sx: number; sy: number; sw: number; sh: number; sax: number; say: number } | null>(null);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCur, setDrawCur] = useState<{ x: number; y: number } | null>(null);
  const [drawPoints, setDrawPoints] = useState<{ x: number; y: number }[]>([]);

  /* ─── text editing state ─── */
  /* (text is stored directly in the annotation, no separate state needed) */

  /* ─── view ─── */
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  /* ─── export settings ─── */
  const [expPageNums, setExpPageNums] = useState(false);
  const [expPageNumPos, setExpPageNumPos] = useState<PageNumberPos>("bottom-center");
  const [expWatermark, setExpWatermark] = useState("");
  const [expWatermarkOp, setExpWatermarkOp] = useState(0.18);
  const [expTitle, setExpTitle] = useState("");
  const [expAuthor, setExpAuthor] = useState("");
  const [dlUrl, setDlUrl] = useState<string | null>(null);
  const [dlSize, setDlSize] = useState<number | null>(null);

  /* ─── derived ─── */
  const pg = pages[pgIdx] ?? null;
  const es = pg ? effSize(pg) : { w: 612, h: 792 };
  const cW = es.w * zoom;
  const cH = es.h * zoom;
  const sel = anns.find((a) => a.id === selId) ?? null;
  const pgAnns = useMemo(() => pg ? anns.filter((a) => a.pageId === pg.id) : [], [anns, pg]);

  /* ─── helpers ─── */
  const clearDl = useCallback(() => {
    if (dlUrl) URL.revokeObjectURL(dlUrl);
    setDlUrl(null); setDlSize(null);
  }, [dlUrl]);

  const gotoPage = (i: number) => {
    if (i >= 0 && i < pages.length) { setPgIdx(i); setSelId(null); setEditId(null); }
  };

  const pos = useCallback((e: React.MouseEvent): { x: number; y: number } | null => {
    const el = overlayRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: (e.clientX - r.left) / zoom, y: (e.clientY - r.top) / zoom };
  }, [zoom]);

  const updateAnn = useCallback((id: string, patch: Partial<Annotation>) => {
    setAnns((a) => a.map((x) => x.id === id ? { ...x, ...patch } as Annotation : x));
    clearDl();
  }, [clearDl]);

  const delAnn = useCallback((id: string) => {
    pushHistory();
    setAnns((a) => a.filter((x) => x.id !== id));
    if (selId === id) { setSelId(null); setEditId(null); }
    clearDl();
  }, [selId, clearDl, pushHistory]);

  /* ═══════════════════════════════════════════════════════════════════
     FILE LOADING
     ═══════════════════════════════════════════════════════════════════ */

  const reset = useCallback(() => {
    setFile(null); setSrcBytes(null); setPages([]); setAnns([]);
    setSelId(null); setEditId(null); setPgIdx(0); setErr(null);
    setTool("select"); setZoom(1); setHistory([]); setHistIdx(-1);
    setExpPageNums(false); setExpWatermark(""); setExpTitle(""); setExpAuthor("");
    setTextLayerReady(false);
    clearDl();
    if (fileRef.current) fileRef.current.value = "";
  }, [clearDl]);

  const load = async (f: File) => {
    if (f.type !== "application/pdf") { setErr("Please choose a valid PDF file."); return; }
    setErr(null); setLoading(true); clearDl();
    try {
      const bytes = new Uint8Array(await f.arrayBuffer());
      const pgs = await buildThumbs(bytes);
      setFile(f); setSrcBytes(new Uint8Array(bytes)); setPages(pgs); setPgIdx(0);
      setAnns([]); setHistory([]); setHistIdx(-1);
      setExpTitle(f.name.replace(/\.pdf$/i, ""));
    } catch {
      setErr("Could not open this PDF. It may be encrypted or corrupted.");
      setFile(null); setSrcBytes(null); setPages([]);
    } finally { setLoading(false); }
  };

  /* ═══════════════════════════════════════════════════════════════════
     CANVAS RENDER
     ═══════════════════════════════════════════════════════════════════ */

  useEffect(() => {
    let dead = false;
    (async () => {
      if (!srcBytes || !canvasRef.current || !pg) return;
      try {
        const copy = srcBytes.slice();
        if (copy.byteLength === 0) return;
        const pdf = await pdfjsLib.getDocument({ data: copy }).promise;
        if (dead) return;
        const page = await pdf.getPage(pg.originalIndex + 1);
        if (dead) return;
        const vp = page.getViewport({ scale: zoom, rotation: pg.rotation });
        const c = canvasRef.current;
        if (!c) return;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height);
        await page.render({ canvasContext: ctx, viewport: vp } as any).promise;
      } catch (e) { if (!dead) console.error(e); }
    })();
    return () => { dead = true; };
  }, [srcBytes, pg?.id, pg?.rotation, pg?.originalIndex, zoom]);

  /* ═══════════════════════════════════════════════════════════════════
     TEXT LAYER RENDERING (pdfjs TextLayer — exact position matching)
     ═══════════════════════════════════════════════════════════════════ */

  useEffect(() => {
    let dead = false;
    const tlDiv = textLayerRef.current;
    if (!srcBytes || !pg || !tlDiv) { setTextLayerReady(false); return; }

    (async () => {
      try {
        // Clear previous text layer content
        while (tlDiv.firstChild) tlDiv.removeChild(tlDiv.firstChild);

        // Set --total-scale-factor CSS variable required by pdfjs TextLayer
        tlDiv.style.setProperty("--total-scale-factor", String(zoom));
        // Also set --scale-round-x / --scale-round-y for rounding (1px grid)
        tlDiv.style.setProperty("--scale-round-x", "1px");
        tlDiv.style.setProperty("--scale-round-y", "1px");

        const copy = srcBytes.slice();
        if (copy.byteLength === 0) return;
        const pdf = await pdfjsLib.getDocument({ data: copy }).promise;
        if (dead) return;
        const page = await pdf.getPage(pg.originalIndex + 1);
        if (dead) return;
        const vp = page.getViewport({ scale: zoom, rotation: pg.rotation });
        const textContent = await page.getTextContent();
        if (dead) return;

        // Store text content for coordinate extraction in handleTextLayerClick
        textContentRef.current = textContent as any;
        // Store the raw page height (in PDF units) for coordinate conversion
        const rawVp = page.getViewport({ scale: 1, rotation: pg.rotation });
        pageHeightRef.current = rawVp.height;

        const tl = new TextLayer({
          textContentSource: textContent,
          container: tlDiv,
          viewport: vp,
        });
        await tl.render();
        if (!dead) setTextLayerReady(true);
      } catch (e) {
        if (!dead) { console.error("TextLayer render error", e); setTextLayerReady(false); }
      }
    })();
    return () => { dead = true; };
  }, [srcBytes, pg?.id, pg?.rotation, pg?.originalIndex, zoom]);

  /* ─── Focus textarea when entering edit mode ─── */
  useEffect(() => {
    if (editId) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (editTaRef.current) {
            editTaRef.current.focus();
            // Place cursor at end
            const len = editTaRef.current.value.length;
            editTaRef.current.setSelectionRange(len, len);
          }
        });
      });
    }
  }, [editId]);

  /* ─── Ctrl+Scroll zoom ─── */
  useEffect(() => {
    const el = overlayRef.current?.parentElement?.parentElement;
    if (!el) return;
    const h = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((z) => Math.min(5, Math.max(0.25, +(z + delta).toFixed(2))));
    };
    el.addEventListener("wheel", h, { passive: false });
    return () => el.removeEventListener("wheel", h);
  }, [file]);

  /* ─── Auto fit zoom on first load ─── */
  useEffect(() => {
    if (!pg || !file) return;
    const container = overlayRef.current?.parentElement?.parentElement?.parentElement;
    if (!container) return;
    const { w } = effSize(pg);
    const available = container.clientWidth - 80; // 40px padding each side
    if (w > 0 && available > 0) {
      const fit = Math.min(2, Math.max(0.5, available / w));
      setZoom(+fit.toFixed(2));
    }
  }, [pg?.id, file]); // only on page change or file load

  /* ═══════════════════════════════════════════════════════════════════
     PAGE MANAGEMENT
     ═══════════════════════════════════════════════════════════════════ */

  const rotatePg = (i: number, d: number) => { setPages((p) => p.map((x, j) => j === i ? { ...x, rotation: (((x.rotation + d) % 360) + 360) % 360 } : x)); clearDl(); };
  const dupPg = (i: number) => { setPages((p) => { const c = { ...p[i], id: `${p[i].originalIndex}-${crypto.randomUUID()}` }; const n = [...p]; n.splice(i + 1, 0, c); return n; }); clearDl(); };
  const delPg = (i: number) => {
    if (pages.length <= 1) return;
    const d = pages[i];
    setPages((p) => p.filter((_, j) => j !== i));
    setAnns((a) => a.filter((x) => x.pageId !== d.id));
    if (pgIdx >= pages.length - 1) setPgIdx(Math.max(0, pages.length - 2));
    else if (i < pgIdx) setPgIdx((c) => c - 1);
    clearDl();
  };

  /* ═══════════════════════════════════════════════════════════════════
     ANNOTATION CREATE
     ═══════════════════════════════════════════════════════════════════ */

  const addText = useCallback((x: number, y: number) => {
    if (!pg) return;
    pushHistory();
    const a: TextAnnotation = {
      kind: "text", id: crypto.randomUUID(), pageId: pg.id,
      x, y, text: "", fontSize: 14, fontFamily: "Helvetica",
      color: "#000000", bold: false, italic: false, underline: false, strikethrough: false, align: "left",
    };
    setAnns((p) => [...p, a]); setSelId(a.id); setEditId(a.id);
    textUndoStack.current = [""]; textUndoIdx.current = 0;
    setTool("select"); clearDl();
  }, [pg, clearDl, pushHistory]);

  /* ─── Edit text using TextLayer span click ─── */
  const handleTextLayerClick = useCallback((e: React.MouseEvent) => {
    if (tool !== "editText" || !pg) return;
    const span = (e.target as HTMLElement).closest("span") as HTMLElement | null;
    if (!span || !textLayerRef.current?.contains(span)) return;
    e.stopPropagation();

    // Read exact position & size from the rendered span (pixel-perfect from pdfjs)
    const parentRect = overlayRef.current?.getBoundingClientRect();
    if (!parentRect) return;
    const spanRect = span.getBoundingClientRect();
    const x = (spanRect.left - parentRect.left) / zoom;
    const y = (spanRect.top - parentRect.top) / zoom;
    const w = spanRect.width / zoom;
    const h = spanRect.height / zoom;
    const text = span.textContent || "";
    if (!text.trim()) return;

    // Read computed styles from the pdfjs-rendered span for accurate matching
    const cs = window.getComputedStyle(span);
    const rawFontSize = parseFloat(cs.fontSize) / zoom;
    const fontSize = Math.max(1, Math.round(rawFontSize * 10) / 10) || 12;
    const fontColor = cs.color && cs.color !== "transparent" ? (() => {
      const m = cs.color.match(/\d+/g);
      if (m && m.length >= 3) return `#${Number(m[0]).toString(16).padStart(2,"0")}${Number(m[1]).toString(16).padStart(2,"0")}${Number(m[2]).toString(16).padStart(2,"0")}`;
      return "#000000";
    })() : "#000000";

    /* ── Find matching TextItem from getTextContent for PDF-native coordinates ── */
    let pdfX: number | undefined;
    let pdfY: number | undefined;
    let pdfFontSize: number | undefined;
    let pdfFontName: string | undefined;
    let pdfFontFamily: string | undefined;
    let pdfW: number | undefined;
    let pdfH: number | undefined;
    let detectedFamily: FontFamily = "Helvetica";

    const tc = textContentRef.current;
    if (tc && tc.items) {
      // Find the text item with the closest matching text content
      type TI = { str: string; transform: number[]; width: number; height: number; fontName: string; dir: string };
      const items = tc.items as TI[];
      const trimmedText = text.trim();
      // Find best match: exact string match preferred, then substring
      let bestItem: TI | null = null;
      let bestDist = Infinity;
      for (const item of items) {
        if (!item.str || !item.transform) continue;
        const itemText = item.str.trim();
        if (itemText === trimmedText || itemText.includes(trimmedText) || trimmedText.includes(itemText)) {
          // Compare position: transform[4]=x, transform[5]=y in PDF coords
          // Convert PDF y (bottom-up) to screen y (top-down) for comparison
          const pH = pageHeightRef.current;
          const itemScreenX = item.transform[4];
          const itemScreenY = pH - item.transform[5];
          // Compare against our unzoomed screen position
          const dist = Math.abs(itemScreenX - x) + Math.abs(itemScreenY - y);
          if (dist < bestDist) {
            bestDist = dist;
            bestItem = item;
          }
        }
      }
      if (bestItem) {
        // Extract exact PDF coordinates from transform matrix
        // transform = [scaleX, skewY, skewX, scaleY, translateX, translateY]
        pdfX = bestItem.transform[4];
        pdfY = bestItem.transform[5];
        pdfFontSize = Math.abs(bestItem.transform[0]) || Math.abs(bestItem.transform[3]) || fontSize;
        pdfFontName = bestItem.fontName;
        pdfW = bestItem.width;
        pdfH = bestItem.height;

        // Detect font family from pdfjs styles
        const styleInfo = tc.styles?.[bestItem.fontName];
        if (styleInfo?.fontFamily) {
          pdfFontFamily = styleInfo.fontFamily;
          const ff = styleInfo.fontFamily.toLowerCase();
          if (ff.includes("courier") || ff.includes("mono")) detectedFamily = "Courier";
          else if (ff.includes("times") || ff.includes("serif")) detectedFamily = "TimesRoman";
          else detectedFamily = "Helvetica";
        }
        // Also check font name itself for clues
        if (pdfFontName) {
          const fn = pdfFontName.toLowerCase();
          if (fn.includes("courier") || fn.includes("mono")) detectedFamily = "Courier";
          else if (fn.includes("times")) detectedFamily = "TimesRoman";
        }
      }
    }

    pushHistory();
    // Whiteout to cover original text precisely
    const pad = 2;
    const wo: WhiteoutAnnotation = {
      kind: "whiteout", id: crypto.randomUUID(), pageId: pg.id,
      x: x - pad, y: y - pad, w: w + pad * 2, h: h + pad * 2,
      // Store PDF-native whiteout coordinates if available
      ...(pdfX != null && pdfY != null && pdfW != null && pdfH != null ? {
        pdfX: pdfX - pad, pdfY: pdfY - pdfH - pad, pdfW: pdfW + pad * 2, pdfH: pdfH + pad * 2,
      } : {}),
    };
    const ta: TextAnnotation = {
      kind: "text", id: crypto.randomUUID(), pageId: pg.id,
      x, y, text,
      fontSize: pdfFontSize || fontSize,
      fontFamily: detectedFamily,
      color: fontColor, bold: false, italic: false,
      underline: false, strikethrough: false, align: "left",
      // Store PDF-native coordinates for pixel-perfect export
      pdfX, pdfY, pdfFontSize, pdfFontName, pdfFontFamily, pdfW, pdfH,
    };
    setAnns((a) => [...a, wo, ta]);
    setSelId(ta.id); setEditId(ta.id);
    textUndoStack.current = [text]; textUndoIdx.current = 0;
    // Hide the clicked span so it doesn't overlap
    span.style.visibility = "hidden";
    setTool("select");
    clearDl();
  }, [tool, pg, zoom, pushHistory, clearDl]);

  const onImgUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !pg) return;
    pushHistory();
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new window.Image();
      img.onload = () => {
        const { w: ew, h: eh } = effSize(pg);
        const sc = Math.min(ew * 0.5 / img.naturalWidth, eh * 0.5 / img.naturalHeight, 1);
        const w = img.naturalWidth * sc, h = img.naturalHeight * sc;
        const a: ImageAnnotation = {
          kind: "image", id: crypto.randomUUID(), pageId: pg.id,
          x: (ew - w) / 2, y: (eh - h) / 2, w, h, src,
        };
        setAnns((p) => [...p, a]); setSelId(a.id); setTool("select"); clearDl();
      };
      img.src = src;
    };
    reader.readAsDataURL(f);
    if (imgRef.current) imgRef.current.value = "";
  }, [pg, clearDl, pushHistory]);

  /* ═══════════════════════════════════════════════════════════════════
     OVERLAY MOUSE HANDLERS
     ═══════════════════════════════════════════════════════════════════ */

  const onOverlayDown = useCallback((e: React.MouseEvent) => {
    const p = pos(e);
    if (!p || !pg) return;

    if (tool === "addText") { addText(p.x, p.y); return; }
    if (tool === "image") { imgRef.current?.click(); return; }
    if (tool === "eraser") { setDrawStart(p); setDrawCur(p); return; }
    if (tool === "shape" || tool === "highlight" || tool === "redact") { setDrawStart(p); setDrawCur(p); return; }
    if (tool === "draw") { setDrawPoints([p]); return; }

    // editText clicks are handled by handleTextLayerClick on the text layer
    if (tool === "editText") return;

    setSelId(null); setEditId(null);
  }, [tool, pg, pos, addText]);

  const onOverlayMove = useCallback((e: React.MouseEvent) => {
    const p = pos(e);
    if (!p) return;

    if (drag) {
      setAnns((a) => a.map((x) => x.id === drag.id ? { ...x, x: p.x - drag.ox, y: p.y - drag.oy } as Annotation : x));
      return;
    }
    if (resize) {
      setAnns((a) => a.map((ann) => {
        if (ann.id !== resize.id || !("w" in ann)) return ann;
        let { sax: nx, say: ny, sw: nw, sh: nh } = resize;
        const c = resize.corner;
        const dx = p.x - resize.sx, dy = p.y - resize.sy;
        if (c.includes("e")) nw = Math.max(20, resize.sw + dx);
        if (c.includes("w")) { nx = resize.sax + dx; nw = Math.max(20, resize.sw - dx); }
        if (c.includes("s")) nh = Math.max(20, resize.sh + dy);
        if (c.includes("n")) { ny = resize.say + dy; nh = Math.max(20, resize.sh - dy); }
        return { ...ann, x: nx, y: ny, w: nw, h: nh } as Annotation;
      }));
      return;
    }
    if (drawStart && (tool === "eraser" || tool === "shape" || tool === "highlight" || tool === "redact")) {
      setDrawCur(p); return;
    }
    if (tool === "draw" && drawPoints.length > 0) {
      setDrawPoints((pts) => [...pts, p]);
    }
  }, [drag, resize, drawStart, drawPoints, tool, pos]);

  const onOverlayUp = useCallback(() => {
    if (drag) { pushHistory(); setDrag(null); clearDl(); return; }
    if (resize) { pushHistory(); setResize(null); clearDl(); return; }

    // finish freehand draw
    if (tool === "draw" && drawPoints.length > 2 && pg) {
      pushHistory();
      const minX = Math.min(...drawPoints.map((p) => p.x));
      const minY = Math.min(...drawPoints.map((p) => p.y));
      const a: DrawAnnotation = {
        kind: "draw", id: crypto.randomUUID(), pageId: pg.id,
        x: minX, y: minY, points: drawPoints, color: drawColor, width: drawWidth,
      };
      setAnns((p) => [...p, a]); setSelId(a.id);
      setDrawPoints([]); clearDl(); return;
    }

    // finish eraser drag → create whiteout
    if (tool === "eraser" && drawStart && drawCur && pg) {
      const x = Math.min(drawStart.x, drawCur.x);
      const y = Math.min(drawStart.y, drawCur.y);
      const w = Math.max(eraserSize, Math.abs(drawCur.x - drawStart.x));
      const h = Math.max(eraserSize, Math.abs(drawCur.y - drawStart.y));
      if (w > 4 || h > 4) {
        pushHistory();
        const wo: WhiteoutAnnotation = {
          kind: "whiteout", id: crypto.randomUUID(), pageId: pg.id, x, y, w, h,
        };
        setAnns((p) => [...p, wo]); clearDl();
      }
      setDrawStart(null); setDrawCur(null); return;
    }

    // finish shape / highlight / redact drag
    if (drawStart && drawCur && pg) {
      const x = Math.min(drawStart.x, drawCur.x);
      const y = Math.min(drawStart.y, drawCur.y);
      const w = Math.abs(drawCur.x - drawStart.x);
      const h = Math.abs(drawCur.y - drawStart.y);

      if (w > 8 && h > 8) {
        pushHistory();
        if (tool === "shape") {
          const a: ShapeAnnotation = {
            kind: "shape", id: crypto.randomUUID(), pageId: pg.id,
            shape: shapeKind, x, y, w, h, stroke: "#FF0000", fill: "transparent", strokeW: 2,
          };
          setAnns((p) => [...p, a]); setSelId(a.id);
        } else if (tool === "highlight") {
          const a: HighlightAnnotation = {
            kind: "highlight", id: crypto.randomUUID(), pageId: pg.id,
            x, y, w, h, color: "#FFFF00", opacity: 0.35,
          };
          setAnns((p) => [...p, a]); setSelId(a.id);
        } else if (tool === "redact") {
          const a: ShapeAnnotation = {
            kind: "shape", id: crypto.randomUUID(), pageId: pg.id,
            shape: "rectangle", x, y, w, h, stroke: "#000000", fill: "#000000", strokeW: 0,
          };
          setAnns((p) => [...p, a]); setSelId(a.id);
        }
        clearDl();
      }
      setDrawStart(null); setDrawCur(null);
    }
    setDrawPoints([]);
  }, [drag, resize, drawStart, drawCur, drawPoints, tool, shapeKind, pg, clearDl, pushHistory, eraserSize, drawColor, drawWidth]);

  const onAnnDown = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Eraser: click to delete
    if (tool === "eraser") { delAnn(id); return; }
    if (tool !== "select" && tool !== "editText" && tool !== "addText") return;
    // If this annotation is being edited, don't start drag
    if (editId === id) return;
    setSelId(id);
    setEditId(null);
    const p = pos(e);
    const a = anns.find((x) => x.id === id);
    if (!p || !a) return;
    setDrag({ id, ox: p.x - a.x, oy: p.y - a.y });
  }, [tool, anns, pos, delAnn, editId]);

  const onResizeDown = useCallback((e: React.MouseEvent, id: string, corner: string) => {
    e.stopPropagation();
    const p = pos(e);
    const a = anns.find((x) => x.id === id);
    if (!p || !a || !("w" in a)) return;
    setResize({ id, corner, sx: p.x, sy: p.y, sw: a.w, sh: a.h, sax: a.x, say: a.y });
  }, [anns, pos]);

  /* ─── keyboard ─── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (editId) return;
      if ((e.key === "Delete" || e.key === "Backspace") && selId) delAnn(selId);
      if (e.key === "Escape") { setSelId(null); setEditId(null); setTool("select"); setDrawStart(null); setDrawCur(null); setDrawPoints([]); }
      if (e.ctrlKey && e.key === "z") { e.preventDefault(); undo(); }
      if (e.ctrlKey && e.key === "y") { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [editId, selId, delAnn, undo, redo]);

  /* ═══════════════════════════════════════════════════════════════════
     EXPORT
     ═══════════════════════════════════════════════════════════════════ */

  const doExport = async () => {
    if (!srcBytes || !file || pages.length === 0) return;
    setExporting(true); setErr(null);
    try {
      const src = await PDFDocument.load(srcBytes, { ignoreEncryption: true });
      const out = await PDFDocument.create();
      const baseFont = await out.embedFont(StandardFonts.Helvetica);
      const wt = expWatermark.trim();

      const fontCache: Record<string, PDFFont> = {};
      async function getFont(fam: FontFamily, b: boolean, it: boolean) {
        const k = `${fam}_${b}_${it}`;
        if (fontCache[k]) return fontCache[k];
        let n = StandardFonts.Helvetica;
        if (fam === "Helvetica") n = b && it ? StandardFonts.HelveticaBoldOblique : b ? StandardFonts.HelveticaBold : it ? StandardFonts.HelveticaOblique : StandardFonts.Helvetica;
        else if (fam === "TimesRoman") n = b && it ? StandardFonts.TimesRomanBoldItalic : b ? StandardFonts.TimesRomanBold : it ? StandardFonts.TimesRomanItalic : StandardFonts.TimesRoman;
        else if (fam === "Courier") n = b && it ? StandardFonts.CourierBoldOblique : b ? StandardFonts.CourierBold : it ? StandardFonts.CourierOblique : StandardFonts.Courier;
        const f = await out.embedFont(n);
        fontCache[k] = f;
        return f;
      }

      for (let i = 0; i < pages.length; i++) {
        const ep = pages[i];
        const [cp] = await out.copyPages(src, [ep.originalIndex]);
        cp.setRotation(degrees((cp.getRotation().angle + ep.rotation) % 360));
        out.addPage(cp);
        const op = out.getPage(out.getPageCount() - 1);
        const pH = op.getHeight();

        if (expPageNums) stampPageNum(op, baseFont, i + 1, pages.length, expPageNumPos);
        if (wt) stampWatermark(op, baseFont, wt, Math.max(0.05, Math.min(0.5, expWatermarkOp)));

        const pa = anns.filter((a) => a.pageId === ep.id);
        for (const ann of pa) {
          if (ann.kind === "whiteout") {
            // Use PDF-native coordinates if available for pixel-perfect placement
            if (ann.pdfX != null && ann.pdfY != null && ann.pdfW != null && ann.pdfH != null) {
              op.drawRectangle({ x: ann.pdfX, y: ann.pdfY, width: ann.pdfW, height: ann.pdfH, color: rgb(1, 1, 1) });
            } else {
              op.drawRectangle({ x: ann.x, y: pH - ann.y - ann.h, width: ann.w, height: ann.h, color: rgb(1, 1, 1) });
            }
          } else if (ann.kind === "text" && ann.text.trim()) {
            const font = await getFont(ann.fontFamily, ann.bold, ann.italic);
            const [r, g, b] = hex2rgb(ann.color);
            // Use PDF-native coordinates for pixel-perfect text placement
            if (ann.pdfX != null && ann.pdfY != null) {
              const sz = ann.pdfFontSize || ann.fontSize;
              op.drawText(ann.text, { x: ann.pdfX, y: ann.pdfY, size: sz, font, color: rgb(r, g, b) });
            } else {
              op.drawText(ann.text, { x: ann.x, y: pH - ann.y - ann.fontSize, size: ann.fontSize, font, color: rgb(r, g, b) });
            }
          } else if (ann.kind === "image") {
            try {
              const isJ = ann.src.startsWith("data:image/jpeg") || ann.src.startsWith("data:image/jpg");
              const b64 = ann.src.split(",")[1];
              const ib = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
              const img = isJ ? await out.embedJpg(ib) : await out.embedPng(ib);
              op.drawImage(img, { x: ann.x, y: pH - ann.y - ann.h, width: ann.w, height: ann.h });
            } catch { /* skip broken images */ }
          } else if (ann.kind === "shape") {
            const [sr, sg, sb] = hex2rgb(ann.stroke);
            const hasFill = ann.fill !== "transparent";
            const [fr, fg, fb] = hasFill ? hex2rgb(ann.fill) : [0, 0, 0];
            if (ann.shape === "rectangle") {
              op.drawRectangle({
                x: ann.x, y: pH - ann.y - ann.h, width: ann.w, height: ann.h,
                borderColor: ann.strokeW > 0 ? rgb(sr, sg, sb) : undefined, borderWidth: ann.strokeW,
                color: hasFill ? rgb(fr, fg, fb) : undefined,
              });
            } else {
              op.drawEllipse({
                x: ann.x + ann.w / 2, y: pH - ann.y - ann.h / 2,
                xScale: ann.w / 2, yScale: ann.h / 2,
                borderColor: rgb(sr, sg, sb), borderWidth: ann.strokeW,
              });
            }
          } else if (ann.kind === "highlight") {
            const [hr, hg, hb] = hex2rgb(ann.color);
            op.drawRectangle({ x: ann.x, y: pH - ann.y - ann.h, width: ann.w, height: ann.h, color: rgb(hr, hg, hb), opacity: ann.opacity });
          } else if (ann.kind === "draw" && ann.points.length > 1) {
            const [dr, dg, db] = hex2rgb(ann.color);
            for (let pi = 1; pi < ann.points.length; pi++) {
              const a = ann.points[pi - 1], bp = ann.points[pi];
              op.drawLine({ start: { x: a.x, y: pH - a.y }, end: { x: bp.x, y: pH - bp.y }, thickness: ann.width, color: rgb(dr, dg, db) });
            }
          }
        }
      }

      if (expTitle.trim()) out.setTitle(expTitle.trim());
      if (expAuthor.trim()) out.setAuthor(expAuthor.trim());
      out.setProducer("DesignForge360 PDF Editor");
      out.setCreator("DesignForge360 PDF Editor");
      out.setModificationDate(new Date());

      const bytes = await out.save({ useObjectStreams: true, addDefaultPage: false });
      const blob = new Blob([bytes], { type: "application/pdf" });
      if (dlUrl) URL.revokeObjectURL(dlUrl);
      setDlUrl(URL.createObjectURL(blob));
      setDlSize(bytes.byteLength);
    } catch (e) {
      console.error(e);
      setErr("Export failed. Try removing unsupported annotations or reducing pages.");
    } finally { setExporting(false); }
  };

  /* ═══════════════════════════════════════════════════════════════════
     RENDER HELPERS
     ═══════════════════════════════════════════════════════════════════ */

  const Handles = ({ id }: { id: string }) => (
    <>
      {(["nw", "ne", "sw", "se"] as const).map((c) => (
        <div key={c} className="absolute z-30 rounded-full border border-[#4285F4] bg-white"
          style={{
            width: 6, height: 6,
            top: c.includes("n") ? -3 : undefined, bottom: c.includes("s") ? -3 : undefined,
            left: c.includes("w") ? -3 : undefined, right: c.includes("e") ? -3 : undefined,
            cursor: `${c}-resize`,
          }}
          onMouseDown={(e) => onResizeDown(e, id, c)}
        />
      ))}
    </>
  );

  const renderAnn = (ann: Annotation) => {
    const isSel = selId === ann.id;
    const base: React.CSSProperties = { position: "absolute", left: ann.x * zoom, top: ann.y * zoom };

    /* ── Whiteout ── */
    if (ann.kind === "whiteout") {
      return (
        <div key={ann.id}
          style={{
            ...base, width: ann.w * zoom, height: ann.h * zoom,
            backgroundColor: "#FFFFFF",
            outline: isSel ? "1px solid #4285F4" : "none", outlineOffset: 0,
            cursor: tool === "eraser" ? "pointer" : "move", zIndex: 4,
          }}
          onMouseDown={(e) => onAnnDown(e, ann.id)}
        >
          {isSel && <Handles id={ann.id} />}
        </div>
      );
    }

    /* ── Text ── */
    if (ann.kind === "text") {
      const isEd = editId === ann.id;
      const hasContent = !!ann.text;
      const scaledFontSize = ann.fontSize * zoom;
      const textStyles: React.CSSProperties = {
        fontSize: scaledFontSize,
        fontFamily: FONT_MAP[ann.fontFamily].css,
        color: ann.color,
        fontWeight: ann.bold ? 700 : 400,
        fontStyle: ann.italic ? "italic" : "normal",
        textDecoration: [ann.underline ? "underline" : "", ann.strikethrough ? "line-through" : ""].filter(Boolean).join(" ") || "none",
        textAlign: ann.align,
        lineHeight: 1.15,
        letterSpacing: "0px",
      };

      // Hide empty text annotations that aren't being edited
      if (!hasContent && !isEd) return null;

      // Container height: match the text exactly
      const lineH = scaledFontSize * 1.15;
      const lines = ann.text ? ann.text.split("\n").length : 1;
      const contentH = Math.max(lineH * lines, lineH);
      // Min width for empty addText box so it's visible and clickable
      const emptyMinW = Math.max(scaledFontSize * 8, 60);

      return (
        <div key={ann.id}
          style={{
            ...base,
            padding: 0,
            outline: isEd ? "1px solid #4285F4" : isSel ? "1px dashed #4285F4" : "none",
            outlineOffset: 0,
            background: isEd ? "#FFFFFF" : "transparent",
            cursor: tool === "eraser" ? "pointer" : isEd ? "text" : "move",
            zIndex: isEd ? 30 : isSel ? 20 : 10,
            userSelect: isEd ? "text" : "none",
            WebkitUserSelect: isEd ? "text" : "none",
          } as React.CSSProperties}
          onMouseDown={(e) => {
            if (isEd) { e.stopPropagation(); return; }
            onAnnDown(e, ann.id);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setSelId(ann.id);
            setEditId(ann.id);
            textUndoStack.current = [ann.text]; textUndoIdx.current = 0;
          }}
        >
          {isEd ? (
            <textarea
              ref={editTaRef}
              autoFocus
              value={ann.text}
              placeholder="Type..."
              onChange={(e) => {
                const val = e.target.value;
                updateAnn(ann.id, { text: val });
                // Push to text undo stack (trim future if we undid)
                const stack = textUndoStack.current;
                const idx = textUndoIdx.current;
                textUndoStack.current = [...stack.slice(0, idx + 1), val];
                if (textUndoStack.current.length > 100) textUndoStack.current.shift();
                textUndoIdx.current = textUndoStack.current.length - 1;
              }}
              onBlur={() => {
                pushHistory();
                const current = anns.find((a) => a.id === ann.id);
                const txt = current?.kind === "text" ? current.text.trim() : "";
                setEditId(null);
                if (!txt) {
                  setAnns((prev) => prev.filter((a) => a.id !== ann.id));
                  setSelId(null);
                }
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
                // Custom Ctrl+Z / Ctrl+Y for text undo inside textarea
                if (e.ctrlKey && e.key === "z") {
                  e.preventDefault();
                  const idx = textUndoIdx.current;
                  if (idx > 0) {
                    textUndoIdx.current = idx - 1;
                    updateAnn(ann.id, { text: textUndoStack.current[idx - 1] });
                  }
                  return;
                }
                if (e.ctrlKey && e.key === "y") {
                  e.preventDefault();
                  const idx = textUndoIdx.current;
                  if (idx < textUndoStack.current.length - 1) {
                    textUndoIdx.current = idx + 1;
                    updateAnn(ann.id, { text: textUndoStack.current[idx + 1] });
                  }
                  return;
                }
                if (e.key === "Escape") {
                  pushHistory();
                  const current = anns.find((a) => a.id === ann.id);
                  const txt = current?.kind === "text" ? current.text.trim() : "";
                  setEditId(null);
                  if (!txt) {
                    setAnns((prev) => prev.filter((a) => a.id !== ann.id));
                    setSelId(null);
                  }
                }
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="block border-none bg-transparent outline-none"
              style={{
                ...textStyles,
                whiteSpace: "pre",
                wordBreak: "keep-all",
                height: contentH,
                minWidth: hasContent ? undefined : emptyMinW,
                caretColor: ann.color || "#000",
                userSelect: "text",
                WebkitUserSelect: "text",
                cursor: "text",
                padding: 0,
                margin: 0,
                overflow: "hidden",
                resize: "none",
              } as React.CSSProperties}
            />
          ) : (
            <span style={{
              ...textStyles,
              pointerEvents: "none",
              display: "block",
              whiteSpace: "pre",
              height: contentH,
            }}>{ann.text}</span>
          )}
          {isSel && !isEd && <Handles id={ann.id} />}
        </div>
      );
    }

    /* ── Image ── */
    if (ann.kind === "image") {
      return (
        <div key={ann.id} style={{ ...base, width: ann.w * zoom, height: ann.h * zoom, outline: isSel ? "2px solid #4285F4" : "none", outlineOffset: 2, cursor: tool === "eraser" ? "pointer" : "move", zIndex: isSel ? 20 : 10 }}
          onMouseDown={(e) => onAnnDown(e, ann.id)}>
          <img src={ann.src} alt="" className="pointer-events-none h-full w-full object-fill" draggable={false} />
          {isSel && <Handles id={ann.id} />}
        </div>
      );
    }

    /* ── Shape ── */
    if (ann.kind === "shape") {
      return (
        <div key={ann.id} style={{
          ...base, width: ann.w * zoom, height: ann.h * zoom,
          border: ann.strokeW > 0 ? `${ann.strokeW}px solid ${ann.stroke}` : "none",
          borderRadius: ann.shape === "circle" ? "50%" : 0,
          backgroundColor: ann.fill === "transparent" ? "transparent" : ann.fill,
          outline: isSel ? "2px solid #4285F4" : "none", outlineOffset: 2,
          boxSizing: "border-box", cursor: tool === "eraser" ? "pointer" : "move", zIndex: isSel ? 20 : 10,
        }} onMouseDown={(e) => onAnnDown(e, ann.id)}>
          {isSel && <Handles id={ann.id} />}
        </div>
      );
    }

    /* ── Highlight ── */
    if (ann.kind === "highlight") {
      return (
        <div key={ann.id} style={{
          ...base, width: ann.w * zoom, height: ann.h * zoom,
          backgroundColor: ann.color, opacity: ann.opacity,
          outline: isSel ? "2px solid #4285F4" : "none", outlineOffset: 2,
          cursor: tool === "eraser" ? "pointer" : "move", zIndex: isSel ? 20 : 5,
        }} onMouseDown={(e) => onAnnDown(e, ann.id)}>
          {isSel && <Handles id={ann.id} />}
        </div>
      );
    }

    /* ── Draw ── */
    if (ann.kind === "draw" && ann.points.length > 1) {
      const pts = ann.points;
      const minX = Math.min(...pts.map((p) => p.x));
      const minY = Math.min(...pts.map((p) => p.y));
      const maxX = Math.max(...pts.map((p) => p.x));
      const maxY = Math.max(...pts.map((p) => p.y));
      const sw = maxX - minX + ann.width * 2;
      const sh = maxY - minY + ann.width * 2;
      const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${(p.x - minX + ann.width) * zoom} ${(p.y - minY + ann.width) * zoom}`).join(" ");
      return (
        <svg key={ann.id} style={{ position: "absolute", left: (minX - ann.width) * zoom, top: (minY - ann.width) * zoom, width: sw * zoom, height: sh * zoom, cursor: tool === "eraser" ? "pointer" : "move", zIndex: isSel ? 20 : 10, outline: isSel ? "2px solid #4285F4" : "none", outlineOffset: 2, pointerEvents: "all" }}
          onMouseDown={(e) => onAnnDown(e, ann.id)}>
          <path d={d} fill="none" stroke={ann.color} strokeWidth={ann.width * zoom} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }

    return null;
  };

  /* ─── zoom ─── */
  const zIn = () => setZoom((z) => Math.min(5, +(z + 0.25).toFixed(2)));
  const zOut = () => setZoom((z) => Math.max(0.25, +(z - 0.25).toFixed(2)));
  const zSet = (v: number) => setZoom(Math.min(5, Math.max(0.25, v)));
  const ZOOM_PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];

  /* ─── cursor for overlay ─── */
  const overlayCursor = useMemo(() => {
    switch (tool) {
      case "addText": return "text";
      case "draw": return "crosshair";
      case "eraser": return "crosshair";
      case "shape": case "highlight": case "redact": return "crosshair";
      case "editText": return "text";
      case "hand": return "grab";
      case "image": return "copy";
      default: return "default";
    }
  }, [tool]);

  /* ─── Toolbar button ─── */
  const TBtn = ({ active, onClick, icon, label, className: cn }: { active?: boolean; onClick: () => void; icon: React.ReactNode; label?: string; className?: string }) => (
    <button onClick={onClick} title={label}
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all select-none
        ${active ? "bg-[#4285F4] text-white shadow-md shadow-blue-500/25" : "text-[#444] hover:bg-[#f0f0f0]"} ${cn ?? ""}`}>
      {icon}
      {label && <span className="hidden xl:inline">{label}</span>}
    </button>
  );

  const Divider = () => <div className="mx-1 h-7 w-px bg-[#ddd]" />;

  /* ═══════════════════════════════════════════════════════════════════
     JSX
     ═══════════════════════════════════════════════════════════════════ */

  return (
    <>
      <SEOHead
        title="Free PDF Editor Online — Add Text, Images, Shapes and Export"
        description="Edit PDFs in your browser. Add text, images, shapes, highlights. Reorder pages, watermark, add page numbers. Fully private — files never leave your device."
        canonical="/tools/pdf-editor"
        schema="WebApplication"
        appName="PDF Editor"
      />

      <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void load(f); }} />
      <input ref={imgRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={onImgUpload} />

      {!file ? (
        /* ══════════════ UPLOAD SCREEN ══════════════ */
        <div className="min-h-screen bg-gradient-to-br from-[#f8f9fb] to-[#eef1f6] flex items-center justify-center p-6">
          <div className="w-full max-w-2xl">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#4285F4] text-white shadow-xl shadow-blue-500/20">
                <FilePenLine className="h-10 w-10" />
              </div>
              <h1 className="text-3xl font-bold text-[#1a1a2e]">PDF Editor</h1>
              <p className="mt-2 text-[#666]">Add text, images, shapes, annotations — all in your browser</p>
            </div>
            <div
              className="cursor-pointer rounded-2xl border-2 border-dashed border-[#4285F4]/30 bg-white p-16 text-center shadow-lg transition-all hover:border-[#4285F4]/60 hover:shadow-xl"
              onClick={() => fileRef.current?.click()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) void load(f); }}
              onDragOver={(e) => e.preventDefault()}
            >
              <UploadCloud className="mx-auto mb-6 h-12 w-12 text-[#4285F4]" />
              <p className="mb-2 text-lg font-semibold text-[#1a1a2e]">Drop your PDF here or click to browse</p>
              <p className="mb-6 text-sm text-[#888]">Your file stays on your device. Nothing is uploaded to any server.</p>
              <button className="rounded-xl bg-[#4285F4] px-8 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-[#3367d6] hover:shadow-lg">
                Choose PDF File
              </button>
              {loading && <p className="mt-4 text-sm text-[#888]"><LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" />Loading…</p>}
              {err && <p className="mt-4 text-sm text-red-500">{err}</p>}
            </div>
          </div>
        </div>
      ) : (
        /* ══════════════ EDITOR WORKSPACE ══════════════ */
        <div className="flex h-screen flex-col bg-[#f5f5f5] overflow-hidden">

          {/* ───── TOP HEADER BAR ───── */}
          <div className="flex items-center justify-between border-b border-[#e0e0e0] bg-white px-4 py-2 shadow-sm select-none">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4285F4] text-white">
                <FilePenLine className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-[#1a1a2e]">PDF Editor</h1>
                <p className="text-[11px] text-[#888]">{file.name} • {fmt(file.size)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {dlUrl && (
                <a href={dlUrl} download={file.name.replace(/\.pdf$/i, "") + "_edited.pdf"}>
                  <button className="flex items-center gap-2 rounded-xl bg-[#34A853] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-green-500/20 transition-all hover:bg-[#2d9249]">
                    <Download className="h-4 w-4" /> Download {dlSize ? `(${fmt(dlSize)})` : ""}
                  </button>
                </a>
              )}
              <button onClick={() => void doExport()} disabled={exporting}
                className="flex items-center gap-2 rounded-xl bg-[#4285F4] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-[#3367d6] disabled:opacity-50">
                {exporting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {exporting ? "Exporting…" : "Export PDF"}
              </button>
              <button onClick={reset} className="flex items-center gap-2 rounded-xl border border-[#ddd] bg-white px-4 py-2.5 text-sm font-medium text-[#555] transition-all hover:bg-[#f5f5f5]">
                New File
              </button>
            </div>
          </div>

          {/* ───── MAIN TOOLBAR ───── */}
          <div className="flex items-center gap-1 border-b border-[#e0e0e0] bg-white px-3 py-1.5 select-none">
            <TBtn active={tool === "hand"} onClick={() => setTool("hand")} icon={<Hand className="h-4 w-4" />} label="Hand" />
            <TBtn active={tool === "select"} onClick={() => setTool("select")} icon={<MousePointer2 className="h-4 w-4" />} label="Select" />
            <Divider />
            <TBtn active={tool === "editText"} onClick={() => setTool("editText")} icon={<Type className="h-[18px] w-[18px]" />} label="Edit Text" />
            <TBtn active={tool === "addText"} onClick={() => setTool("addText")} icon={<span className="text-[15px] font-bold leading-none">T+</span>} label="Add Text" />
            <Divider />
            <TBtn active={tool === "draw"} onClick={() => setTool("draw")} icon={<PenLine className="h-4 w-4" />} label="Draw" />
            <TBtn active={tool === "eraser"} onClick={() => setTool("eraser")} icon={<Eraser className="h-4 w-4" />} label="Eraser" />
            <Divider />
            <TBtn active={tool === "highlight"} onClick={() => setTool("highlight")} icon={<Highlighter className="h-4 w-4" />} label="Highlight" />
            <TBtn active={tool === "redact"} onClick={() => setTool("redact")} icon={<EyeOff className="h-4 w-4" />} label="Redact" />
            <Divider />
            <TBtn active={tool === "shape" && shapeKind === "rectangle"} onClick={() => { setTool("shape"); setShapeKind("rectangle"); }} icon={<Square className="h-4 w-4" />} label="Rectangle" />
            <TBtn active={tool === "shape" && shapeKind === "circle"} onClick={() => { setTool("shape"); setShapeKind("circle"); }} icon={<Circle className="h-4 w-4" />} label="Circle" />
            <TBtn active={tool === "image"} onClick={() => { setTool("image"); imgRef.current?.click(); }} icon={<ImagePlus className="h-4 w-4" />} label="Image" />
            <Divider />
            <TBtn onClick={() => rotatePg(pgIdx, -90)} icon={<RotateCcw className="h-4 w-4" />} />
            <TBtn onClick={() => rotatePg(pgIdx, 90)} icon={<RotateCw className="h-4 w-4" />} />
            <Divider />
            <TBtn onClick={undo} icon={<Undo2 className="h-4 w-4" />} />
            <TBtn onClick={redo} icon={<Redo2 className="h-4 w-4" />} />
            <Divider />
            <TBtn onClick={zOut} icon={<ZoomOut className="h-4 w-4" />} label="Zoom Out" />
            <div className="flex items-center">
              <select value={zoom} onChange={(e) => zSet(Number(e.target.value))}
                className="rounded-lg border border-[#ddd] bg-white px-2 py-1.5 text-xs font-semibold text-[#444] outline-none cursor-pointer hover:bg-[#f5f5f5]">
                {ZOOM_PRESETS.map((z) => <option key={z} value={z}>{Math.round(z * 100)}%</option>)}
              </select>
            </div>
            <TBtn onClick={zIn} icon={<ZoomIn className="h-4 w-4" />} label="Zoom In" />
            {err && <span className="ml-4 text-xs text-red-500">{err}</span>}
          </div>

          {/* ───── SECONDARY TOOLBAR: context-sensitive ───── */}

          {/* Text formatting bar */}
          {(tool === "editText" || tool === "addText" || tool === "select") && sel?.kind === "text" && (() => {
            const t = sel as TextAnnotation;
            return (
              <div className="flex items-center gap-2 border-b border-[#e0e0e0] bg-[#fafbfc] px-4 py-1.5 select-none">
                <select value={t.fontFamily} onChange={(e) => updateAnn(t.id, { fontFamily: e.target.value as FontFamily })}
                  className="rounded-lg border border-[#ddd] bg-white px-2.5 py-1.5 text-xs font-medium text-[#333] outline-none">
                  {Object.entries(FONT_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <input type="number" min={1} max={200} step={0.5} value={t.fontSize}
                  onChange={(e) => { const v = parseFloat(e.target.value); if (v >= 1 && v <= 200) updateAnn(t.id, { fontSize: v }); }}
                  className="w-16 rounded-lg border border-[#ddd] bg-white px-2 py-1.5 text-xs font-medium text-[#333] outline-none" />
                <Divider />
                <TBtn active={t.bold} onClick={() => updateAnn(t.id, { bold: !t.bold })} icon={<Bold className="h-4 w-4" />} />
                <TBtn active={t.italic} onClick={() => updateAnn(t.id, { italic: !t.italic })} icon={<Italic className="h-4 w-4" />} />
                <TBtn active={t.underline} onClick={() => updateAnn(t.id, { underline: !t.underline })} icon={<Underline className="h-4 w-4" />} />
                <TBtn active={t.strikethrough} onClick={() => updateAnn(t.id, { strikethrough: !t.strikethrough })} icon={<Strikethrough className="h-4 w-4" />} />
                <Divider />
                <TBtn active={t.align === "left"} onClick={() => updateAnn(t.id, { align: "left" })} icon={<AlignLeft className="h-4 w-4" />} />
                <TBtn active={t.align === "center"} onClick={() => updateAnn(t.id, { align: "center" })} icon={<AlignCenter className="h-4 w-4" />} />
                <TBtn active={t.align === "right"} onClick={() => updateAnn(t.id, { align: "right" })} icon={<AlignRight className="h-4 w-4" />} />
                <Divider />
                <div className="flex items-center gap-1.5">
                  {COLORS.slice(0, 10).map((c) => (
                    <button key={c} onClick={() => updateAnn(t.id, { color: c })} title={c}
                      className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${t.color === c ? "border-[#4285F4] shadow-lg scale-110" : "border-[#ddd]"}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Eraser options bar */}
          {tool === "eraser" && (
            <div className="flex items-center gap-3 border-b border-[#e0e0e0] bg-[#fafbfc] px-4 py-1.5 select-none">
              <span className="text-[11px] font-bold uppercase tracking-wide text-[#999]">Eraser Size</span>
              {ERASER_SIZES.map(({ label, size }) => (
                <button key={size} onClick={() => setEraserSize(size)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${eraserSize === size ? "bg-[#4285F4] text-white shadow-md" : "bg-[#eee] text-[#555] hover:bg-[#ddd]"}`}>
                  {label}
                </button>
              ))}
              <Divider />
              <span className="text-[11px] text-[#888]">Click annotations to remove — Drag to white-out areas</span>
            </div>
          )}

          {/* Draw options bar */}
          {tool === "draw" && (
            <div className="flex items-center gap-3 border-b border-[#e0e0e0] bg-[#fafbfc] px-4 py-1.5 select-none">
              <span className="text-[11px] font-bold uppercase tracking-wide text-[#999]">Pen</span>
              <div className="flex items-center gap-1.5">
                {COLORS.slice(0, 10).map((c) => (
                  <button key={c} onClick={() => setDrawColor(c)} title={c}
                    className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${drawColor === c ? "border-[#4285F4] shadow-lg scale-110" : "border-[#ddd]"}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
              <Divider />
              <span className="text-[11px] font-bold uppercase tracking-wide text-[#999]">Width</span>
              {[1, 2, 4, 6, 8].map((w) => (
                <button key={w} onClick={() => setDrawWidth(w)}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${drawWidth === w ? "bg-[#4285F4] text-white shadow-md" : "bg-[#eee] text-[#555] hover:bg-[#ddd]"}`}>
                  <div className="rounded-full bg-current" style={{ width: w + 2, height: w + 2 }} />
                </button>
              ))}
            </div>
          )}

          {/* Edit Text info bar */}
          {tool === "editText" && !sel && (
            <div className="flex items-center gap-3 border-b border-[#e0e0e0] bg-[#e8f0fe] px-4 py-2 select-none">
              <Type className="h-4 w-4 text-[#4285F4]" />
              <span className="text-xs font-medium text-[#4285F4]">Click on any highlighted text to edit it. Your changes overlay the original text.</span>
            </div>
          )}

          {/* ───── BODY: LEFT + CANVAS + RIGHT ───── */}
          <div className="flex flex-1 overflow-hidden">

            {/* ── LEFT: PAGE THUMBNAILS ── */}
            <div className="hidden w-[160px] shrink-0 flex-col overflow-y-auto border-r border-[#e0e0e0] bg-[#f8f8fa] py-3 md:flex select-none">
              {pages.map((p, i) => (
                <div key={p.id} className="px-3 mb-1">
                  <button onClick={() => gotoPage(i)}
                    className={`group relative w-full rounded-lg border-2 p-1.5 transition-all
                      ${i === pgIdx ? "border-[#4285F4] bg-white shadow-md shadow-blue-500/10" : "border-transparent bg-white hover:border-[#ccc] hover:shadow-sm"}`}>
                    <img src={p.thumbUrl} alt={`Page ${i + 1}`} draggable={false}
                      className="mx-auto block rounded"
                      style={{ maxHeight: 160, transform: `rotate(${p.rotation}deg)`, transition: "transform 0.2s" }} />
                  </button>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <button onClick={() => dupPg(i)} className="rounded p-1 text-[#999] transition-colors hover:bg-[#eee] hover:text-[#555]" title="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
                    <button onClick={() => rotatePg(i, 90)} className="rounded p-1 text-[#999] transition-colors hover:bg-[#eee] hover:text-[#555]" title="Rotate"><RotateCw className="h-3.5 w-3.5" /></button>
                    <button onClick={() => delPg(i)} disabled={pages.length <= 1} className="rounded p-1 text-[#999] transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-30" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <p className={`mt-0.5 text-center text-[11px] font-medium ${i === pgIdx ? "text-[#4285F4]" : "text-[#999]"}`}>{i + 1}</p>
                  {i < pages.length - 1 && <div className="flex justify-center py-1"><div className="h-px w-8 bg-[#e0e0e0]" /></div>}
                </div>
              ))}
              <div className="px-3 mt-2">
                <div className="flex h-16 items-center justify-center rounded-lg border-2 border-dashed border-[#ddd] text-[#bbb]"><Plus className="h-5 w-5" /></div>
              </div>
            </div>

            {/* ── CENTER: CANVAS ── */}
            <div className="relative flex-1 bg-[#e8e8ec]" style={{ overflow: "auto" }}>
              {loading && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                  <LoaderCircle className="h-10 w-10 animate-spin text-[#4285F4]" />
                </div>
              )}
              <div style={{ minWidth: cW + 64, minHeight: cH + 64, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 32 }}>
                <div className="relative inline-block shadow-2xl" style={{ width: cW, height: cH, flexShrink: 0 }}>
                  {/* Layer 1: PDF Canvas */}
                  <canvas ref={canvasRef} className="block rounded-sm bg-white" style={{ width: cW, height: cH }} />

                  {/* Layer 2: pdfjs TextLayer (invisible text positioned exactly over canvas) */}
                  <div ref={textLayerRef}
                    className={`textLayer${tool === "editText" ? " editMode" : ""}`}
                    onClick={handleTextLayerClick}
                    style={{
                      position: "absolute", top: 0, left: 0,
                      // In editText mode: show text layer with hover highlight
                      // Otherwise: transparent+no pointer events so overlay can work
                      opacity: tool === "editText" ? 1 : 0,
                      pointerEvents: tool === "editText" ? "auto" : "none",
                      zIndex: tool === "editText" ? 15 : 1,
                      overflow: "hidden",
                    }}
                  />

                  {/* Layer 3: annotation + interaction overlay */}
                  <div ref={overlayRef}
                    className="absolute inset-0"
                    style={{ width: cW, height: cH, cursor: overlayCursor, zIndex: tool === "editText" ? 5 : 10 }}
                    onMouseDown={onOverlayDown}
                    onMouseMove={onOverlayMove}
                    onMouseUp={onOverlayUp}
                    onMouseLeave={() => {
                      if (drag) setDrag(null);
                      if (resize) setResize(null);
                      if (tool === "draw" && drawPoints.length > 2) onOverlayUp();
                    }}
                  >
                    {/* Render annotations */}
                    {pgAnns.map(renderAnn)}

                    {/* Live freehand draw preview */}
                    {tool === "draw" && drawPoints.length > 1 && (
                      <svg className="pointer-events-none absolute inset-0" width={cW} height={cH}>
                        <path
                          d={drawPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x * zoom} ${p.y * zoom}`).join(" ")}
                          fill="none" stroke={drawColor} strokeWidth={drawWidth * zoom} strokeLinecap="round" strokeLinejoin="round"
                        />
                      </svg>
                    )}

                    {/* Shape/highlight/redact drag preview */}
                    {drawStart && drawCur && tool !== "eraser" && tool !== "draw" && (
                      <div className="pointer-events-none absolute border-2 border-dashed"
                        style={{
                          left: Math.min(drawStart.x, drawCur.x) * zoom,
                          top: Math.min(drawStart.y, drawCur.y) * zoom,
                          width: Math.abs(drawCur.x - drawStart.x) * zoom,
                          height: Math.abs(drawCur.y - drawStart.y) * zoom,
                          borderColor: tool === "highlight" ? "#FFCC00" : tool === "redact" ? "#000" : "#FF0000",
                          backgroundColor: tool === "highlight" ? "rgba(255,204,0,0.2)" : tool === "redact" ? "rgba(0,0,0,0.5)" : "transparent",
                          borderRadius: tool === "shape" && shapeKind === "circle" ? "50%" : 0,
                        }}
                      />
                    )}

                    {/* Eraser drag preview */}
                    {drawStart && drawCur && tool === "eraser" && (
                      <div className="pointer-events-none absolute border-2 border-dashed border-gray-400"
                        style={{
                          left: Math.min(drawStart.x, drawCur.x) * zoom,
                          top: Math.min(drawStart.y, drawCur.y) * zoom,
                          width: Math.max(eraserSize, Math.abs(drawCur.x - drawStart.x)) * zoom,
                          height: Math.max(eraserSize, Math.abs(drawCur.y - drawStart.y)) * zoom,
                          backgroundColor: "rgba(255,255,255,0.7)",
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT: PROPERTIES PANEL ── */}
            <div className="hidden w-[260px] shrink-0 flex-col overflow-y-auto border-l border-[#e0e0e0] bg-white lg:flex select-none">
              <div className="border-b border-[#eee] px-4 py-3">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#999]">Properties</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-5">

                {/* ── Selected text ── */}
                {sel?.kind === "text" && (() => {
                  const t = sel as TextAnnotation;
                  return (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#999]">Text Styles</label>
                        <select value={t.fontFamily} onChange={(e) => updateAnn(t.id, { fontFamily: e.target.value as FontFamily })}
                          className="mb-2 w-full rounded-lg border border-[#ddd] bg-white px-3 py-2 text-sm text-[#333] outline-none focus:border-[#4285F4]">
                          {Object.entries(FONT_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <input type="number" min={1} max={200} step={0.5} value={t.fontSize}
                          onChange={(e) => { const v = parseFloat(e.target.value); if (v >= 1 && v <= 200) updateAnn(t.id, { fontSize: v }); }}
                          className="w-full rounded-lg border border-[#ddd] bg-white px-3 py-2 text-sm text-[#333] outline-none focus:border-[#4285F4]"
                          placeholder="Font size" />
                      </div>
                      <div className="flex gap-1.5">
                        {[
                          { key: "bold", Icon: Bold, val: t.bold },
                          { key: "italic", Icon: Italic, val: t.italic },
                          { key: "underline", Icon: Underline, val: t.underline },
                          { key: "strikethrough", Icon: Strikethrough, val: t.strikethrough },
                        ].map(({ key, Icon, val }) => (
                          <button key={key} onClick={() => updateAnn(t.id, { [key]: !val })}
                            className={`flex-1 rounded-lg border p-2 transition-all ${val ? "border-[#4285F4] bg-[#4285F4]/10 text-[#4285F4]" : "border-[#ddd] text-[#666] hover:bg-[#f5f5f5]"}`}>
                            <Icon className="mx-auto h-4 w-4" />
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-1.5">
                        {(["left", "center", "right"] as const).map((a) => (
                          <button key={a} onClick={() => updateAnn(t.id, { align: a })}
                            className={`flex-1 rounded-lg border p-2 transition-all ${t.align === a ? "border-[#4285F4] bg-[#4285F4]/10 text-[#4285F4]" : "border-[#ddd] text-[#666] hover:bg-[#f5f5f5]"}`}>
                            {a === "left" ? <AlignLeft className="mx-auto h-4 w-4" /> : a === "center" ? <AlignCenter className="mx-auto h-4 w-4" /> : <AlignRight className="mx-auto h-4 w-4" />}
                          </button>
                        ))}
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#999]">Color</label>
                        <div className="flex flex-wrap gap-2">
                          {COLORS.map((c) => (
                            <button key={c} onClick={() => updateAnn(t.id, { color: c })} title={c}
                              className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${t.color === c ? "border-[#4285F4] scale-110 shadow-md" : "border-[#ddd]"}`}
                              style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                      <button onClick={() => delAnn(t.id)}
                        className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-500 transition-all hover:bg-red-100">
                        <Trash2 className="mr-2 inline h-4 w-4" /> Delete
                      </button>
                    </div>
                  );
                })()}

                {/* ── Selected shape ── */}
                {sel?.kind === "shape" && (() => {
                  const s = sel as ShapeAnnotation;
                  return (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#999]">Stroke Color</label>
                        <div className="flex flex-wrap gap-2">
                          {COLORS.slice(0, 10).map((c) => (
                            <button key={c} onClick={() => updateAnn(s.id, { stroke: c })}
                              className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${s.stroke === c ? "border-[#4285F4] scale-110" : "border-[#ddd]"}`}
                              style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#999]">Fill Color</label>
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => updateAnn(s.id, { fill: "transparent" })}
                            className={`h-6 w-6 rounded-full border-2 ${s.fill === "transparent" ? "border-[#4285F4]" : "border-[#ddd]"}`}
                            style={{ background: "repeating-conic-gradient(#ddd 0% 25%, white 0% 50%) 50% / 12px 12px" }}
                            title="Transparent" />
                          {COLORS.slice(0, 10).map((c) => (
                            <button key={c} onClick={() => updateAnn(s.id, { fill: c })}
                              className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${s.fill === c ? "border-[#4285F4] scale-110" : "border-[#ddd]"}`}
                              style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#999]">Stroke Width</label>
                        <input type="range" min="0" max="10" step="1" value={s.strokeW} onChange={(e) => updateAnn(s.id, { strokeW: Number(e.target.value) })}
                          className="w-full accent-[#4285F4]" />
                        <div className="text-right text-[11px] text-[#999]">{s.strokeW}px</div>
                      </div>
                      <button onClick={() => delAnn(s.id)}
                        className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-500 transition-all hover:bg-red-100">
                        <Trash2 className="mr-2 inline h-4 w-4" /> Delete
                      </button>
                    </div>
                  );
                })()}

                {/* ── Selected highlight ── */}
                {sel?.kind === "highlight" && (() => {
                  const h = sel as HighlightAnnotation;
                  return (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#999]">Highlight Color</label>
                        <div className="flex flex-wrap gap-2">
                          {HIGHLIGHT_COLORS.map((c) => (
                            <button key={c} onClick={() => updateAnn(h.id, { color: c })}
                              className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${h.color === c ? "border-[#4285F4] scale-110" : "border-[#ddd]"}`}
                              style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#999]">Opacity</label>
                        <input type="range" min="0.1" max="0.8" step="0.05" value={h.opacity} onChange={(e) => updateAnn(h.id, { opacity: Number(e.target.value) })}
                          className="w-full accent-yellow-400" />
                        <div className="text-right text-[11px] text-[#999]">{Math.round(h.opacity * 100)}%</div>
                      </div>
                      <button onClick={() => delAnn(h.id)}
                        className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-500 transition-all hover:bg-red-100">
                        <Trash2 className="mr-2 inline h-4 w-4" /> Delete
                      </button>
                    </div>
                  );
                })()}

                {/* ── Selected image ── */}
                {sel?.kind === "image" && (() => {
                  const im = sel as ImageAnnotation;
                  return (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#999]">Image</label>
                        <p className="text-sm text-[#666]">{Math.round(im.w)} x {Math.round(im.h)} pt</p>
                        <p className="text-xs text-[#999]">Drag corners to resize</p>
                      </div>
                      <button onClick={() => delAnn(im.id)}
                        className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-500 transition-all hover:bg-red-100">
                        <Trash2 className="mr-2 inline h-4 w-4" /> Delete
                      </button>
                    </div>
                  );
                })()}

                {/* ── Selected draw ── */}
                {sel?.kind === "draw" && (() => {
                  const d = sel as DrawAnnotation;
                  return (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#999]">Drawing Color</label>
                        <div className="flex flex-wrap gap-2">
                          {COLORS.slice(0, 10).map((c) => (
                            <button key={c} onClick={() => updateAnn(d.id, { color: c })}
                              className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${d.color === c ? "border-[#4285F4] scale-110" : "border-[#ddd]"}`}
                              style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#999]">Width</label>
                        <input type="range" min="1" max="10" step="1" value={d.width} onChange={(e) => updateAnn(d.id, { width: Number(e.target.value) })}
                          className="w-full accent-[#4285F4]" />
                        <div className="text-right text-[11px] text-[#999]">{d.width}px</div>
                      </div>
                      <button onClick={() => delAnn(d.id)}
                        className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-500 transition-all hover:bg-red-100">
                        <Trash2 className="mr-2 inline h-4 w-4" /> Delete
                      </button>
                    </div>
                  );
                })()}

                {/* ── Selected whiteout ── */}
                {sel?.kind === "whiteout" && (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#999]">White-out</label>
                      <p className="text-xs text-[#666]">Covers content beneath with white</p>
                    </div>
                    <button onClick={() => delAnn(sel.id)}
                      className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-500 transition-all hover:bg-red-100">
                      <Trash2 className="mr-2 inline h-4 w-4" /> Delete
                    </button>
                  </div>
                )}

                {/* ── No selection → instructions + export settings ── */}
                {!sel && (
                  <>
                    <div className="rounded-xl bg-[#f8f8fa] p-4">
                      <p className="text-xs font-semibold text-[#666] mb-2">How to use</p>
                      <ul className="space-y-1.5 text-[11px] text-[#888] leading-relaxed">
                        <li><strong>Edit Text:</strong> Click any text in the PDF to modify it</li>
                        <li><strong>Add Text:</strong> Click anywhere to place new text</li>
                        <li><strong>Draw:</strong> Freehand draw with color/width options</li>
                        <li><strong>Eraser:</strong> Click to remove — drag to white-out</li>
                        <li><strong>Shapes:</strong> Drag to create rectangles or circles</li>
                        <li><strong>Images:</strong> Upload and place images</li>
                        <li><strong>Highlight:</strong> Drag to highlight areas</li>
                        <li><strong>Redact:</strong> Drag to black-out sensitive areas</li>
                        <li><strong>Ctrl+Z / Ctrl+Y:</strong> Undo / Redo</li>
                        <li><strong>Delete:</strong> Remove selected element</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[11px] font-bold uppercase tracking-wide text-[#999]">Export Options</label>
                      <label className="flex items-center justify-between rounded-lg border border-[#eee] bg-[#fafafa] px-3 py-2 text-xs text-[#555]">
                        <span>Page numbers</span>
                        <input type="checkbox" checked={expPageNums} onChange={(e) => setExpPageNums(e.target.checked)} className="h-3.5 w-3.5 accent-[#4285F4]" />
                      </label>
                      {expPageNums && (
                        <select value={expPageNumPos} onChange={(e) => setExpPageNumPos(e.target.value as PageNumberPos)}
                          className="w-full rounded-lg border border-[#ddd] bg-white px-3 py-2 text-xs text-[#333] outline-none">
                          <option value="bottom-center">Bottom center</option>
                          <option value="top-right">Top right</option>
                        </select>
                      )}
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-[#999]">Watermark</label>
                        <input value={expWatermark} onChange={(e) => setExpWatermark(e.target.value)}
                          placeholder="e.g. Confidential"
                          className="w-full rounded-lg border border-[#ddd] bg-white px-3 py-2 text-xs text-[#333] placeholder:text-[#ccc] outline-none focus:border-[#4285F4]" />
                      </div>
                      {expWatermark && (
                        <div>
                          <input type="range" min="0.05" max="0.5" step="0.01" value={expWatermarkOp} onChange={(e) => setExpWatermarkOp(Number(e.target.value))}
                            className="w-full accent-amber-400" />
                          <div className="text-right text-[11px] text-[#999]">{Math.round(expWatermarkOp * 100)}% opacity</div>
                        </div>
                      )}
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-[#999]">Title</label>
                        <input value={expTitle} onChange={(e) => setExpTitle(e.target.value)} placeholder="Document title"
                          className="w-full rounded-lg border border-[#ddd] bg-white px-3 py-2 text-xs text-[#333] placeholder:text-[#ccc] outline-none focus:border-[#4285F4]" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-[#999]">Author</label>
                        <input value={expAuthor} onChange={(e) => setExpAuthor(e.target.value)} placeholder="Author name"
                          className="w-full rounded-lg border border-[#ddd] bg-white px-3 py-2 text-xs text-[#333] placeholder:text-[#ccc] outline-none focus:border-[#4285F4]" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ───── BOTTOM BAR: PAGE NAV + ZOOM ───── */}
          <div className="flex items-center justify-between border-t border-[#e0e0e0] bg-white px-4 py-2 select-none">
            <div className="flex items-center gap-1 rounded-full bg-[#2c2c3a] px-3 py-1.5" style={{ minWidth: 160 }}>
              <button onClick={() => gotoPage(pgIdx - 1)} disabled={pgIdx <= 0}
                className="rounded p-1 text-white/60 transition-colors hover:text-white disabled:opacity-30">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <input type="number" min={1} max={pages.length} value={pgIdx + 1}
                onChange={(e) => { const v = parseInt(e.target.value, 10); if (v >= 1 && v <= pages.length) gotoPage(v - 1); }}
                className="w-8 rounded bg-white/10 px-1 py-0.5 text-center text-xs font-bold text-white outline-none" />
              <span className="text-xs text-white/50">/ {pages.length}</span>
              <button onClick={() => gotoPage(pgIdx + 1)} disabled={pgIdx >= pages.length - 1}
                className="rounded p-1 text-white/60 transition-colors hover:text-white disabled:opacity-30">
                <ChevronRight className="h-4 w-4" />
              </button>
              <Divider />
              <button onClick={() => setZoom(1)} className="rounded p-1 text-white/60 transition-colors hover:text-white" title="Fit to width">
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="md:hidden">
              <select value={pgIdx} onChange={(e) => gotoPage(Number(e.target.value))}
                className="rounded border border-[#ddd] bg-white px-2 py-1 text-xs outline-none">
                {pages.map((_, i) => <option key={i} value={i}>Page {i + 1}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={zOut} className="rounded-lg p-1.5 text-[#666] transition-colors hover:bg-[#f0f0f0]"><ZoomOut className="h-4 w-4" /></button>
              <button onClick={() => setZoom(1)} className="min-w-[48px] rounded-lg px-2 py-1 text-center text-xs font-semibold text-[#555] transition-colors hover:bg-[#f0f0f0]">
                {Math.round(zoom * 100)}%
              </button>
              <button onClick={zIn} className="rounded-lg p-1.5 text-[#666] transition-colors hover:bg-[#f0f0f0]"><ZoomIn className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PdfEditor;
