import { useState } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { Braces, Copy, Check, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const faqItems = [
  {
    question: "What is JSON formatting / pretty-printing?",
    answer:
      "JSON formatting parses a compact JSON string and re-serialises it with consistent indentation and newlines, making it easy to read and debug."
  },
  {
    question: "Can I minify JSON too?",
    answer:
      "Yes. Use the Minify button to strip all whitespace — useful for reducing payload sizes before sending JSON over an API."
  },
  {
    question: "What happens with invalid JSON?",
    answer:
      "The tool shows a clear error message with the location of the problem (e.g. 'Unexpected token at position 42') so you can fix it quickly."
  },
  {
    question: "Is my JSON sent to a server?",
    answer:
      "No. All processing uses the browser's built-in JSON.parse / JSON.stringify. Nothing leaves your device."
  }
];

const relatedGuides: { title: string; path: string }[] = [];
const relatedComparisons: { title: string; path: string }[] = [];

type IndentSize = 2 | 4;

export function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [indent, setIndent] = useState<IndentSize>(2);
  const [copied, setCopied] = useState(false);

  const format = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  const minify = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
    setError(null);
    setCopied(false);
  };

  const lineCount = output ? output.split("\n").length : 0;

  return (
    <ToolLayout
      title="JSON Formatter"
      description="Paste any JSON string to pretty-print it with proper indentation, or minify it for production use. Validates syntax instantly."
      icon={<Braces className="h-7 w-7" />}
      faqItems={faqItems}
      relatedGuides={relatedGuides}
      relatedComparisons={relatedComparisons}
    >
      <div className="space-y-6">
        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40 uppercase tracking-widest">Indent</span>
            {([2, 4] as IndentSize[]).map((n) => (
              <button
                key={n}
                onClick={() => setIndent(n)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  indent === n ? "border-white/40 bg-white/10 text-white" : "border-white/10 text-white/50 hover:border-white/20"
                }`}
              >
                {n} spaces
              </button>
            ))}
          </div>
          <div className="flex gap-3 ml-auto">
            <Button onClick={format} disabled={!input.trim()} className="rounded-full px-6 h-9 text-sm">
              Format
            </Button>
            <Button onClick={minify} disabled={!input.trim()} variant="outline" className="rounded-full px-6 h-9 text-sm border-white/20 text-white hover:bg-white/10">
              Minify
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
            <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-400 font-mono break-all">{error}</p>
          </div>
        )}

        {/* Two-pane editor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-white/40 uppercase tracking-widest">Input</p>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(null); setOutput(""); }}
              placeholder={'{\n  "paste": "your JSON here"\n}'}
              rows={18}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-white/20 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:border-white/25 transition-colors"
              spellCheck={false}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-white/40 uppercase tracking-widest">Output</p>
              {lineCount > 0 && <span className="text-xs text-white/25">{lineCount} lines</span>}
            </div>
            <div className="relative">
              <pre className="w-full min-h-[18rem] bg-white/5 border border-white/10 rounded-2xl p-5 text-white font-mono text-sm leading-relaxed overflow-auto whitespace-pre">
                {output || <span className="text-white/20">Formatted output will appear here…</span>}
              </pre>
              {output && (
                <button
                  onClick={handleCopy}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          {output && (
            <Button onClick={handleCopy} variant="outline" className="rounded-full px-8 h-12 border-white/20 text-white hover:bg-white/10">
              {copied ? <><Check className="h-4 w-4 mr-2 text-green-400" /> Copied!</> : <><Copy className="h-4 w-4 mr-2" /> Copy Output</>}
            </Button>
          )}
          <Button onClick={handleReset} disabled={!input && !output} variant="outline" className="rounded-full px-8 h-12 border-white/20 text-white hover:bg-white/10">
            <RefreshCw className="h-4 w-4 mr-2" /> Clear
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}
