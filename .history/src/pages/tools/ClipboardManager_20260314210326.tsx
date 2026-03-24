import { useState, useEffect, useRef, useCallback } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { Pin, PinOff, Copy, Trash2, ChevronUp, ChevronDown, Check, Search, RefreshCw, MonitorPlay, MonitorOff, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/src/components/ui/button";

/* ─── Types ──────────────────────────────────────────────────────── */
type ClipType = "url" | "email" | "code" | "text";
type Transform = "upper" | "lower" | "title" | "trim" | "noBreaks";

interface ClipItem {
  id: string;
  text: string;
  type: ClipType;
  time: number;
  pinned: boolean;
  pinOrder: number;
}

/* ─── Helpers ────────────────────────────────────────────────────── */
function detectType(text: string): ClipType {
  const t = text.trim();
  if (/^https?:\/\//i.test(t)) return "url";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return "email";
  if (/[{}\[\];]|^\s*(function |const |import |export |def |class |#include)/.test(t)) return "code";
  return "text";
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function applyTransform(text: string, t: Transform): string {
  switch (t) {
    case "upper": return text.toUpperCase();
    case "lower": return text.toLowerCase();
    case "title": return text.replace(/\b\w/g, c => c.toUpperCase());
    case "trim": return text.trim().replace(/\s+/g, " ");
    case "noBreaks": return text.replace(/[\r\n]+/g, " ").trim();
  }
}

const STORAGE_KEY = "df360_clipboard_v1";
const MAX_HISTORY = 200;

function loadClips(): ClipItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveClips(clips: ClipItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clips));
  } catch { /* quota exceeded — ignore */ }
}

/* ─── FAQ ────────────────────────────────────────────────────────── */
const faqItems = [
  {
    question: "How is clipboard history captured?",
    answer:
      "Click 'Capture Now' to read your current clipboard once, or enable 'Auto-Monitor' to automatically detect new items every 2 seconds. Your browser will ask for clipboard-read permission on the first capture."
  },
  {
    question: "Why do pinned items stay at the top here but not in Win+V?",
    answer:
      "Windows' built-in clipboard (Win+V) moves pinned items to the bottom of the list — forcing you to scroll past all recent copies to find them. This tool always renders pinned items first, in the priority order you set. You can reorder pinned items instantly with the ↑↓ buttons."
  },
  {
    question: "Is my clipboard data sent to a server?",
    answer:
      "No. Everything is stored exclusively in your browser's localStorage. Nothing ever leaves your device. You can verify this by checking the Network tab in DevTools — no requests are made."
  },
  {
    question: "How many items are stored?",
    answer:
      "Up to 200 history items are kept. Pinned items are never auto-removed. The history persists across browser sessions until you manually clear it."
  },
  {
    question: "What are text transforms?",
    answer:
      "Hover any item and click 'Aa' to instantly copy a transformed version: UPPERCASE, lowercase, Title Case, trimmed whitespace, or line breaks removed — the stored item is unchanged."
  },
  {
    question: "What do the type badges mean?",
    answer:
      "The tool auto-detects whether a clip is a URL, Email address, Code snippet, or plain Text and labels it accordingly for quick identification."
  }
];

/* ─── Tool icon ──────────────────────────────────────────────────── */
function ClipboardIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="8" y="5" width="16" height="23" rx="2" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" />
      <rect x="12" y="2" width="8" height="5" rx="1.5" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" />
      <line x1="11.5" y1="12" x2="20.5" y2="12" stroke="white" strokeWidth="1.5" strokeOpacity="0.45" strokeLinecap="round" />
      <line x1="11.5" y1="16" x2="17.5" y2="16" stroke="white" strokeWidth="1.5" strokeOpacity="0.45" strokeLinecap="round" />
      <line x1="11.5" y1="20" x2="19.5" y2="20" stroke="white" strokeWidth="1.5" strokeOpacity="0.45" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Type badge styles ──────────────────────────────────────────── */
const typeConfig: Record<ClipType, { label: string; cls: string }> = {
  url:   { label: "URL",   cls: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  email: { label: "Email", cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  code:  { label: "Code",  cls: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  text:  { label: "Text",  cls: "text-white/35 bg-white/5 border-white/10" },
};

const TRANSFORMS: [Transform, string][] = [
  ["upper",    "UPPERCASE"],
  ["lower",    "lowercase"],
  ["title",    "Title Case"],
  ["trim",     "Trim Whitespace"],
  ["noBreaks", "Remove Line Breaks"],
];

/* ─── Main Component ─────────────────────────────────────────────── */
export function ClipboardManager() {
  const [clips, setClips]           = useState<ClipItem[]>(loadClips);
  const [search, setSearch]         = useState("");
  const [copiedId, setCopiedId]     = useState<string | null>(null);
  const [transformId, setTransformId] = useState<string | null>(null);
  const [monitoring, setMonitoring] = useState(false);
  const [permDenied, setPermDenied] = useState(false);
  const [captureFlash, setCaptureFlash] = useState(false);
  const pollRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTextRef = useRef<string>("");

  // Persist on change
  useEffect(() => { saveClips(clips); }, [clips]);

  // Close transform dropdown on outside click
  useEffect(() => {
    if (!transformId) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-transform-menu]")) setTransformId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [transformId]);

  // Add a captured text to history
  const addClip = useCallback((text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;
    setClips(prev => {
      if (prev[0]?.text === trimmedText) return prev; // deduplicate
      const item: ClipItem = {
        id: crypto.randomUUID(),
        text: trimmedText,
        type: detectType(trimmedText),
        time: Date.now(),
        pinned: false,
        pinOrder: 0,
      };
      return [item, ...prev].slice(0, MAX_HISTORY);
    });
  }, []);

  // Polling for auto-monitor
  const doPoll = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text !== lastTextRef.current) {
        lastTextRef.current = text;
        addClip(text);
      }
    } catch { /* permission not granted */ }
  }, [addClip]);

  useEffect(() => {
    if (monitoring) {
      doPoll();
      pollRef.current = setInterval(doPoll, 2000);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [monitoring, doPoll]);

  // Capture once
  const captureOnce = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) return;
      lastTextRef.current = text.trim();
      addClip(text);
      setCaptureFlash(true);
      setTimeout(() => setCaptureFlash(false), 800);
      setPermDenied(false);
    } catch {
      setPermDenied(true);
    }
  };

  // Toggle auto-monitor
  const toggleMonitor = async () => {
    if (monitoring) { setMonitoring(false); return; }
    try {
      const text = await navigator.clipboard.readText();
      lastTextRef.current = text.trim();
      setPermDenied(false);
      setMonitoring(true);
    } catch {
      setPermDenied(true);
    }
  };

  // Copy item back to clipboard
  const copyItem = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(id => (id === id ? null : id)), 2000);
  };

  // Toggle pin — pins go to top, unpins go back to history
  const togglePin = (id: string) => {
    setClips(prev => {
      const pinnedCount = prev.filter(c => c.pinned).length;
      return prev.map(c =>
        c.id === id
          ? { ...c, pinned: !c.pinned, pinOrder: !c.pinned ? pinnedCount : 0 }
          : c
      );
    });
  };

  // Move pinned item up/down in priority
  const movePinOrder = (id: string, dir: "up" | "down") => {
    setClips(prev => {
      const sorted = prev
        .filter(c => c.pinned)
        .sort((a, b) => a.pinOrder - b.pinOrder);
      const idx = sorted.findIndex(c => c.id === id);
      if (dir === "up" && idx === 0) return prev;
      if (dir === "down" && idx === sorted.length - 1) return prev;
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      const myOrder   = sorted[idx].pinOrder;
      const swapOrder = sorted[swapIdx].pinOrder;
      return prev.map(c => {
        if (c.id === sorted[idx].id)    return { ...c, pinOrder: swapOrder };
        if (c.id === sorted[swapIdx].id) return { ...c, pinOrder: myOrder };
        return c;
      });
    });
  };

  // Delete item
  const deleteItem = (id: string) => setClips(prev => prev.filter(c => c.id !== id));

  // Clear history (keep pinned)
  const clearHistory = () => setClips(prev => prev.filter(c => c.pinned));

  // Apply transform and copy to clipboard
  const applyAndCopy = async (text: string, t: Transform) => {
    await navigator.clipboard.writeText(applyTransform(text, t));
    setTransformId(null);
  };

  // Filtered lists
  const q = search.toLowerCase();
  const pinnedClips  = clips
    .filter(c => c.pinned  && (q === "" || c.text.toLowerCase().includes(q)))
    .sort((a, b) => a.pinOrder - b.pinOrder);
  const historyClips = clips
    .filter(c => !c.pinned && (q === "" || c.text.toLowerCase().includes(q)));

  const totalVisible = pinnedClips.length + historyClips.length;

  /* ── Clip item renderer ── */
  const renderItem = (item: ClipItem, isPinned: boolean, idx: number, total: number) => (
    <motion.div
      key={item.id}
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className={`group relative flex gap-3 p-4 rounded-2xl border transition-all duration-200 ${
        isPinned
          ? "bg-amber-500/[0.04] border-amber-500/15 hover:bg-amber-500/[0.07]"
          : "bg-transparent border-white/[0.06] hover:bg-white/[0.025]"
      }`}
    >
      {/* Reorder arrows — only for pinned */}
      {isPinned && (
        <div className="flex flex-col gap-0.5 justify-center shrink-0">
          <button
            onClick={() => movePinOrder(item.id, "up")}
            disabled={idx === 0}
            title="Move up"
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 disabled:opacity-20 transition-colors text-white/40 hover:text-white"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            onClick={() => movePinOrder(item.id, "down")}
            disabled={idx === total - 1}
            title="Move down"
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 disabled:opacity-20 transition-colors text-white/40 hover:text-white"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Text content */}
      <div className="flex-1 min-w-0 cursor-default">
        <p className="text-sm text-white/75 leading-relaxed line-clamp-2 font-mono break-all">{item.text}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wider ${typeConfig[item.type].cls}`}>
            {typeConfig[item.type].label}
          </span>
          <span className="text-[11px] text-white/25">{timeAgo(item.time)}</span>
          {isPinned && <span className="text-[10px] text-amber-500/60 font-medium">#{idx + 1} pinned</span>}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-start gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
        {/* Copy */}
        <button
          onClick={() => copyItem(item.id, item.text)}
          title="Copy to clipboard"
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-white/40 hover:text-white"
        >
          {copiedId === item.id
            ? <Check className="h-3.5 w-3.5 text-emerald-400" />
            : <Copy className="h-3.5 w-3.5" />
          }
        </button>

        {/* Transform */}
        <div className="relative" data-transform-menu>
          <button
            onClick={() => setTransformId(transformId === item.id ? null : item.id)}
            title="Transform & copy"
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-white/40 hover:text-white text-[11px] font-bold"
          >
            Aa
          </button>
          <AnimatePresence>
            {transformId === item.id && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-8 z-30 w-48 bg-[#0f0f0f] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
              >
                <p className="px-3 py-2 text-[10px] text-white/30 uppercase tracking-wider border-b border-white/5">Transform & Copy</p>
                {TRANSFORMS.map(([t, label]) => (
                  <button
                    key={t}
                    onClick={() => applyAndCopy(item.text, t)}
                    className="w-full text-left px-3 py-2 text-sm text-white/55 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pin / Unpin */}
        <button
          onClick={() => togglePin(item.id)}
          title={item.pinned ? "Unpin" : "Pin to top"}
          className={`w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors ${
            item.pinned ? "text-amber-400 hover:text-amber-300" : "text-white/40 hover:text-amber-400"
          }`}
        >
          {item.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
        </button>

        {/* Delete */}
        <button
          onClick={() => deleteItem(item.id)}
          title="Delete"
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-white/40 hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <ToolLayout
      title="Clipboard Manager"
      description="Persistent clipboard history with pinned items always at the top, priority reordering, full-text search, and text transforms — entirely in your browser."
      icon={<ClipboardIcon />}
      faqItems={faqItems}
      relatedGuides={[]}
      relatedComparisons={[]}
    >
      <SEOHead
        title="Free Clipboard Manager Online — History, Pins & Text Transforms"
        description="Browser-based clipboard manager with persistent history, pinned items that stay at the top (unlike Win+V), reordering, full-text search, and text transformations."
        canonical="/tools/clipboard-manager"
        schema="WebApplication"
        appName="Clipboard Manager"
      />

      {/* ── Controls bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
          <input
            type="text"
            placeholder="Search clipboard history…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Capture once */}
        <Button
          onClick={captureOnce}
          variant="outline"
          className={`gap-2 shrink-0 border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all ${captureFlash ? "border-emerald-500/50 bg-emerald-500/10" : ""}`}
        >
          <RefreshCw className={`h-4 w-4 ${captureFlash ? "text-emerald-400" : ""}`} />
          Capture Now
        </Button>

        {/* Auto-monitor toggle */}
        <Button
          onClick={toggleMonitor}
          variant="outline"
          className={`gap-2 shrink-0 border-white/10 text-white transition-all ${
            monitoring
              ? "bg-violet-500/15 border-violet-500/40 hover:bg-violet-500/20"
              : "bg-white/5 hover:bg-white/10"
          }`}
        >
          {monitoring ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400" />
              </span>
              <MonitorOff className="h-4 w-4" />
              Monitoring
            </>
          ) : (
            <>
              <MonitorPlay className="h-4 w-4" />
              Auto-Monitor
            </>
          )}
        </Button>
      </div>

      {/* ── Permission denied banner ── */}
      <AnimatePresence>
        {permDenied && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400"
          >
            <span className="mt-0.5 shrink-0">⚠️</span>
            <span>
              Clipboard access was denied. In Chrome/Edge: click the lock icon in the address bar → Clipboard → Allow.
              In Firefox: grant the permission when prompted.
            </span>
            <button onClick={() => setPermDenied(false)} className="ml-auto shrink-0 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats bar ── */}
      {clips.length > 0 && (
        <div className="flex items-center justify-between mb-6 text-xs text-white/25">
          <span>
            {clips.length} item{clips.length !== 1 ? "s" : ""} stored
            {pinnedClips.length > 0 && ` · ${pinnedClips.length} pinned`}
            {search && ` · ${totalVisible} match${totalVisible !== 1 ? "es" : ""}`}
          </span>
          {historyClips.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-white/25 hover:text-red-400 transition-colors"
            >
              Clear history
            </button>
          )}
        </div>
      )}

      {/* ── Pinned section ── */}
      <AnimatePresence>
        {pinnedClips.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Pin className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-amber-400/80 uppercase tracking-widest">
                Pinned — Priority Order
              </span>
              <span className="text-xs text-white/20 ml-1">Use ↑↓ to reorder</span>
            </div>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {pinnedClips.map((item, idx) =>
                  renderItem(item, true, idx, pinnedClips.length)
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── History section ── */}
      {historyClips.length > 0 && (
        <div>
          {pinnedClips.length > 0 && (
            <div className="flex items-center gap-2 mb-3 mt-6">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-xs text-white/20 uppercase tracking-widest">History</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>
          )}
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {historyClips.map((item, idx) =>
                renderItem(item, false, idx, historyClips.length)
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {clips.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
            <ClipboardIcon />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No clipboard history yet</h3>
          <p className="text-sm text-white/40 max-w-xs leading-relaxed mb-6">
            Click <strong className="text-white/60">Capture Now</strong> to save your current clipboard, or enable{" "}
            <strong className="text-white/60">Auto-Monitor</strong> to capture automatically as you copy.
          </p>
          <Button onClick={captureOnce} className="gap-2 bg-white text-black hover:bg-white/90">
            <RefreshCw className="h-4 w-4" />
            Capture Now
          </Button>
        </div>
      )}

      {/* ── No results state ── */}
      {clips.length > 0 && totalVisible === 0 && search && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-white/30">No clips match "<span className="text-white/50">{search}</span>"</p>
          <button onClick={() => setSearch("")} className="mt-3 text-sm text-white/40 hover:text-white transition-colors underline underline-offset-2">
            Clear search
          </button>
        </div>
      )}
    </ToolLayout>
  );
}
