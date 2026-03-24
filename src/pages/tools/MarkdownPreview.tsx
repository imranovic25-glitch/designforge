import { useState } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { Eye, Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const faqItems = [
  {
    question: "What Markdown features are supported?",
    answer:
      "Headings, bold, italic, links, inline code, code blocks, blockquotes, ordered and unordered lists, horizontal rules, and images via URL."
  },
  {
    question: "Can I export the preview to PDF?",
    answer:
      "Yes — click the 'Print / PDF' button to open the rendered preview in a new tab and use your browser's print dialog to save it as a PDF."
  },
  {
    question: "Is my content stored anywhere?",
    answer:
      "No. Everything runs in your browser. Nothing is sent to any server."
  },
  {
    question: "Does it support GitHub Flavored Markdown?",
    answer:
      "It supports the most common GFM features: headings, bold, italic, code, blockquotes, lists, and links. Strikethrough and tables are rendered as-is in plain text."
  }
];

const relatedGuides = [
  { title: "How to Write Markdown", path: "/guides/how-to-write-markdown" },
  { title: "How to Choose AI Writing Tools", path: "/guides/how-to-choose-ai-writing-tools" },
];
const relatedComparisons: { title: string; path: string }[] = [
  { title: "Best AI Writing Tools", path: "/comparisons/best-ai-writing-tools" }
];

const defaultMarkdown = `# Welcome to Markdown Preview

Write or paste your **Markdown** here and see the live preview on the right.

## Features
- **Bold**, *italic*, and \`inline code\`
- [Links](https://example.com)
- Ordered and unordered lists
- Blockquotes and code blocks

> This is a blockquote. It supports multiple lines.

\`\`\`
const greeting = "Hello, Markdown!";
console.log(greeting);
\`\`\`

---

Happy writing!
`;

function parseMarkdown(md: string): string {
  let html = md
    // Escape HTML entities first
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks (``` ... ```)
  html = html.replace(/```([\s\S]*?)```/g, (_m, code) =>
    `<pre style="background:rgba(255,255,255,0.05);padding:16px;border-radius:8px;overflow-x:auto;font-size:13px;line-height:1.6"><code>${code.trim()}</code></pre>`
  );

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:4px;font-size:0.9em">$1</code>');

  // Headings
  html = html.replace(/^#### (.+)$/gm, '<h4 style="font-size:1.1em;font-weight:600;margin:1em 0 0.3em">$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3 style="font-size:1.25em;font-weight:600;margin:1.2em 0 0.4em">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 style="font-size:1.5em;font-weight:600;margin:1.4em 0 0.5em">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 style="font-size:2em;font-weight:700;margin:0 0 0.6em">$1</h1>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:1.5em 0"/>');

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote style="border-left:3px solid rgba(245,158,11,0.4);padding-left:16px;color:rgba(255,255,255,0.6);margin:0.8em 0">$1</blockquote>');

  // Bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:rgb(245,158,11);text-decoration:underline;text-underline-offset:3px">$1</a>'
  );

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li style="margin-left:1.5em;list-style:disc">$1</li>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li style="margin-left:1.5em;list-style:decimal">$1</li>');

  // Paragraphs: wrap remaining standalone lines
  html = html
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (
        !trimmed ||
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<pre") ||
        trimmed.startsWith("<hr") ||
        trimmed.startsWith("<blockquote") ||
        trimmed.startsWith("<li") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("</")
      )
        return line;
      return `<p style="margin:0.5em 0;line-height:1.7">${trimmed}</p>`;
    })
    .join("\n");

  return html;
}

export function MarkdownPreview() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [copied, setCopied] = useState(false);

  const renderedHtml = parseMarkdown(markdown);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html><html><head><title>Markdown Preview</title>
      <style>body{font-family:'Segoe UI',Arial,sans-serif;padding:40px;line-height:1.8;color:#222;max-width:800px;margin:0 auto}
      pre{background:#f5f5f5;padding:16px;border-radius:8px;overflow-x:auto}code{font-family:'Fira Code',monospace}
      blockquote{border-left:3px solid #ccc;padding-left:16px;color:#555}</style></head>
      <body>${parseMarkdown(markdown).replace(/rgba\(255,255,255,[^)]+\)/g, "#333")}</body></html>
    `);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <ToolLayout
      title="Markdown Preview"
      description="Write Markdown on the left, see a live-rendered preview on the right. Export to PDF with one click."
      icon={<Eye className="h-7 w-7" />}
      toolSlug="markdown-preview"
      faqItems={faqItems}
      relatedGuides={relatedGuides}
      relatedComparisons={relatedComparisons}
    >
      <SEOHead
        title="Free Markdown Preview — Live Editor & PDF Export"
        description="Write Markdown and see a live rendered preview instantly. Copy or export to PDF — free, runs entirely in your browser."
        canonical="/tools/markdown-preview"
        schema="WebApplication"
        appName="Markdown Preview"
      />

      <div className="space-y-6">
        {/* Editor + Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[480px]">
          {/* Editor */}
          <div className="flex flex-col">
            <div className="text-xs text-white/30 uppercase tracking-widest mb-2 px-1">Editor</div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Type your Markdown here…"
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder:text-white/20 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:border-white/25 transition-colors"
              spellCheck={false}
            />
          </div>

          {/* Preview */}
          <div className="flex flex-col">
            <div className="text-xs text-white/30 uppercase tracking-widest mb-2 px-1">Preview</div>
            <div
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 overflow-y-auto text-white/80 text-sm prose-invert"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={handleCopy}
            disabled={!markdown}
            variant="outline"
            className="rounded-full px-8 h-12 border-white/20 text-white hover:bg-white/10"
          >
            {copied ? (
              <><Check className="h-4 w-4 mr-2 text-green-400" /> Copied!</>
            ) : (
              <><Copy className="h-4 w-4 mr-2" /> Copy Markdown</>
            )}
          </Button>
          <Button
            onClick={handlePrint}
            disabled={!markdown}
            className="rounded-full px-8 h-12 bg-amber-500 hover:bg-amber-400 text-black font-medium"
          >
            Print / PDF
          </Button>
          <Button
            onClick={() => setMarkdown("")}
            disabled={!markdown}
            variant="outline"
            className="rounded-full px-8 h-12 border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Clear
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}
