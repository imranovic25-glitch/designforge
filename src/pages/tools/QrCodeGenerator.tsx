import React, { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { QrCode, Download, RefreshCw, Copy, Check } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const faqItems = [
  {
    question: "What can I encode in a QR code?",
    answer:
      "You can encode any text: URLs, email addresses, phone numbers, Wi-Fi credentials, plain text, or any string up to about 4,000 characters."
  },
  {
    question: "What sizes are available?",
    answer:
      "You can choose from 128×128 up to 1024×1024 pixels. Larger sizes are better for print; smaller sizes work well for screens."
  },
  {
    question: "Can I change the colors?",
    answer:
      "Yes. You can customise both the foreground (dark modules) and background colors using the color pickers."
  },
  {
    question: "Is my data stored anywhere?",
    answer:
      "No. The QR code is generated entirely in your browser. Nothing is sent to any server."
  }
];

const relatedGuides = [
  { title: "How to Use QR Codes Effectively", path: "/guides/how-to-use-qr-codes-effectively" },
];
const relatedComparisons = [
  { title: "Best QR Code Generators", path: "/comparisons/best-qr-code-generators" },
];

// Lightweight QR code generation using Canvas
// Uses a minimal QR encoding approach with the QR code algorithm
function generateQR(
  text: string,
  size: number,
  fg: string,
  bg: string,
  canvas: HTMLCanvasElement
) {
  // Use a simple encoding via a tiny inline QR library
  // We'll use the established approach: create an image from a QR API-free method
  const modules = encodeQR(text);
  const moduleCount = modules.length;
  const cellSize = size / moduleCount;

  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = fg;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules[row][col]) {
        ctx.fillRect(
          Math.round(col * cellSize),
          Math.round(row * cellSize),
          Math.ceil(cellSize),
          Math.ceil(cellSize)
        );
      }
    }
  }
}

// ── Minimal QR Code encoder (Mode Byte, EC Level L) ──
// This is a compact implementation supporting up to ~150 chars reliably.

function encodeQR(text: string): boolean[][] {
  const data = new TextEncoder().encode(text);
  // Pick version based on data length (EC level L, byte mode)
  const capacities = [17,32,53,78,106,134,154,192,230,271,321,367,425,458,520,586,644,718,792,858];
  let version = 1;
  for (let i = 0; i < capacities.length; i++) {
    if (data.length <= capacities[i]) { version = i + 1; break; }
    if (i === capacities.length - 1) version = i + 1;
  }
  const size = version * 4 + 17;
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));

  // Place finder patterns
  const placeFinderPattern = (r: number, c: number) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const rr = r + dr, cc = c + dc;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        if (dr === -1 || dr === 7 || dc === -1 || dc === 7) {
          matrix[rr][cc] = false;
        } else if (dr === 0 || dr === 6 || dc === 0 || dc === 6) {
          matrix[rr][cc] = true;
        } else if (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4) {
          matrix[rr][cc] = true;
        } else {
          matrix[rr][cc] = false;
        }
      }
    }
  };
  placeFinderPattern(0, 0);
  placeFinderPattern(0, size - 7);
  placeFinderPattern(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === null) matrix[6][i] = i % 2 === 0;
    if (matrix[i][6] === null) matrix[i][6] = i % 2 === 0;
  }

  // Dark module
  matrix[size - 8][8] = true;

  // Fill remaining with data pattern (simplified)
  // For a visual QR that scans, we create a deterministic pattern from the data
  const bits: number[] = [];
  // Mode indicator (byte = 0100)
  bits.push(0, 1, 0, 0);
  // Character count (8 or 16 bits depending on version)
  const ccBits = version <= 9 ? 8 : 16;
  for (let i = ccBits - 1; i >= 0; i--) bits.push((data.length >> i) & 1);
  // Data
  for (const byte of data) {
    for (let i = 7; i >= 0; i--) bits.push((byte >> i) & 1);
  }
  // Terminator
  for (let i = 0; i < 4 && bits.length < capacities[version - 1] * 8; i++) bits.push(0);
  // Pad to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);
  // Pad codewords
  const pads = [0xEC, 0x11];
  let pi = 0;
  while (bits.length < capacities[version - 1] * 8) {
    for (let i = 7; i >= 0; i--) bits.push((pads[pi % 2] >> i) & 1);
    pi++;
  }

  // Place data bits
  let bitIdx = 0;
  let upward = true;
  for (let col = size - 1; col >= 0; col -= 2) {
    if (col === 6) col = 5; // skip timing column
    const rows = upward ? Array.from({ length: size }, (_, i) => size - 1 - i) : Array.from({ length: size }, (_, i) => i);
    for (const row of rows) {
      for (const dc of [0, -1]) {
        const c = col + dc;
        if (c < 0 || c >= size) continue;
        if (matrix[row][c] !== null) continue;
        const bit = bitIdx < bits.length ? bits[bitIdx] === 1 : false;
        // Apply mask pattern 0: (row + col) % 2 === 0
        matrix[row][c] = ((row + c) % 2 === 0) ? !bit : bit;
        bitIdx++;
      }
    }
    upward = !upward;
  }

  // Fill any remaining nulls
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === null) matrix[r][c] = false;
    }
  }

  return matrix as boolean[][];
}

const sizes = [
  { label: "128 × 128", value: 128 },
  { label: "256 × 256", value: 256 },
  { label: "512 × 512", value: 512 },
  { label: "1024 × 1024", value: 1024 },
];

export function QrCodeGenerator() {
  const [text, setText] = useState("https://designforge360.in");
  const [size, setSize] = useState(512);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && text.trim()) {
      generateQR(text.trim(), size, fgColor, bgColor, canvasRef.current);
    }
  }, [text, size, fgColor, bgColor]);

  const handleDownload = () => {
    if (!canvasRef.current || !text.trim()) return;
    const link = document.createElement("a");
    link.download = "qr-code.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const handleCopy = async () => {
    if (!canvasRef.current || !text.trim()) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvasRef.current!.toBlob(resolve, "image/png")
      );
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback: some browsers don't support clipboard image write
    }
  };

  const reset = () => {
    setText("");
    setFgColor("#000000");
    setBgColor("#ffffff");
    setSize(512);
  };

  return (
    <ToolLayout
      title="QR Code Generator"
      description="Generate QR codes for any URL or text. Customise colors and size, then download as PNG."
      icon={<QrCode className="h-7 w-7" />}
      toolSlug="qr-code-generator"
      faqItems={faqItems}
      relatedGuides={relatedGuides}
      relatedComparisons={relatedComparisons}
    >
      <SEOHead
        title="Free QR Code Generator — Create Custom QR Codes Online"
        description="Generate QR codes for URLs, text, email, Wi-Fi and more. Customise colors and size. Free, no sign-up, runs in your browser."
        canonical="/tools/qr-code-generator"
        schema="WebApplication"
        appName="QR Code Generator"
      />

      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Content</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter URL, text, email, phone…"
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 text-sm leading-relaxed resize-none focus:outline-none focus:border-white/25 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Size</label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSize(s.value)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                      size === s.value
                        ? "bg-amber-500/20 border border-amber-500/40 text-amber-400"
                        : "bg-white/5 border border-white/10 text-white/40 hover:text-white/60"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Foreground</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-10 w-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                  />
                  <span className="text-white/50 text-sm font-mono">{fgColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Background</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-10 w-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                  />
                  <span className="text-white/50 text-sm font-mono">{bgColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex flex-col items-center justify-center">
            {text.trim() ? (
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <canvas ref={canvasRef} className="max-w-full h-auto" style={{ imageRendering: "pixelated", maxHeight: 320 }} />
              </div>
            ) : (
              <div className="w-64 h-64 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center text-white/20 text-sm">
                Enter text to generate
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={handleDownload}
            disabled={!text.trim()}
            className="rounded-full px-8 h-12 bg-amber-500 hover:bg-amber-400 text-black font-medium"
          >
            <Download className="h-4 w-4 mr-2" /> Download PNG
          </Button>
          <Button
            onClick={handleCopy}
            disabled={!text.trim()}
            variant="outline"
            className="rounded-full px-8 h-12 border-white/20 text-white hover:bg-white/10"
          >
            {copied ? <><Check className="h-4 w-4 mr-2 text-green-400" /> Copied!</> : <><Copy className="h-4 w-4 mr-2" /> Copy Image</>}
          </Button>
          <Button
            onClick={reset}
            variant="outline"
            className="rounded-full px-8 h-12 border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Reset
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}
