import { useState } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { Type, Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const faqItems = [
  {
    question: "What does the Word Counter count?",
    answer:
      "It counts words (space-separated tokens), characters (with and without spaces), sentences (split by . ! ?), paragraphs (consecutive non-empty lines), and estimates reading time at 200 words per minute."
  },
  {
    question: "Is there a text length limit?",
    answer:
      "No. The tool runs entirely in your browser and has no hard limit. Very large texts (millions of characters) may slow down slightly on low-end devices."
  },
  {
    question: "How is reading time calculated?",
    answer:
      "Reading time uses the standard average reading speed of 200 words per minute for adults. Academic or technical content may take longer."
  },
  {
    question: "Are my texts stored anywhere?",
    answer:
      "No. Everything runs locally in your browser. Nothing is sent to any server."
  }
];

const relatedGuides = [
  { title: "How to Choose AI Writing Tools", path: "/guides/how-to-choose-ai-writing-tools" },
  { title: "How to Write Markdown", path: "/guides/how-to-write-markdown" },
];
const relatedComparisons = [
  { title: "Best AI Writing Tools", path: "/comparisons/best-ai-writing-tools" },
];

function countStats(text: string) {
  const trimmed = text.trim();
  const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const sentences = trimmed === "" ? 0 : (trimmed.match(/[^.!?]*[.!?]+/g) ?? []).length;
  const paragraphs = trimmed === "" ? 0 : text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length || (trimmed ? 1 : 0);
  const readingTime = Math.ceil(words / 200);
  return { words, chars, charsNoSpaces, sentences, paragraphs, readingTime };
}

export function WordCounter() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = countStats(text);

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statCards = [
    { label: "Words", value: stats.words.toLocaleString() },
    { label: "Characters", value: stats.chars.toLocaleString() },
    { label: "No Spaces", value: stats.charsNoSpaces.toLocaleString() },
    { label: "Sentences", value: stats.sentences.toLocaleString() },
    { label: "Paragraphs", value: stats.paragraphs.toLocaleString() },
    { label: "Read Time", value: stats.words === 0 ? "0 min" : stats.readingTime === 1 ? "1 min" : `${stats.readingTime} min` },
  ];

  return (
    <ToolLayout
      title="Word Counter"
      description="Count words, characters, sentences, and paragraphs instantly. Estimate reading time for any block of text."
      icon={<Type className="h-7 w-7" />}
      toolSlug="word-counter"
      faqItems={faqItems}
      relatedGuides={relatedGuides}
      relatedComparisons={relatedComparisons}
    >
      <SEOHead
        title="Free Word Counter — Count Words, Characters & Sentences"
        description="Count words, characters, sentences, and paragraphs instantly. Free online word counter tool."
        canonical="/tools/word-counter"
        schema="WebApplication"
        appName="Word Counter"
      />
      <div className="space-y-8">
        {/* Stat grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="bg-white/5 rounded-2xl p-4 text-center">
              <p className="text-2xl font-semibold text-white tabular-nums">{s.value}</p>
              <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text here…"
            rows={12}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder:text-white/20 font-light leading-relaxed resize-y focus:outline-none focus:border-white/25 transition-colors text-base"
          />
          {text && (
            <div className="absolute bottom-4 right-4 text-xs text-white/20 tabular-nums">
              {stats.chars.toLocaleString()} characters
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Button onClick={handleCopy} disabled={!text} variant="outline" className="rounded-full px-8 h-12 border-white/20 text-white hover:bg-white/10">
            {copied ? <><Check className="h-4 w-4 mr-2 text-green-400" /> Copied!</> : <><Copy className="h-4 w-4 mr-2" /> Copy Text</>}
          </Button>
          <Button onClick={() => setText("")} disabled={!text} variant="outline" className="rounded-full px-8 h-12 border-white/20 text-white hover:bg-white/10">
            <RefreshCw className="h-4 w-4 mr-2" /> Clear
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}
