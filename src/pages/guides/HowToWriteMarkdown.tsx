import { ArticleLayout } from "@/src/components/layout/ArticleLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";

export function HowToWriteMarkdown() {
  return (
    <ArticleLayout
      title="How to Write Markdown"
      description="A practical guide to Markdown syntax — from basic formatting to tables, code blocks, and advanced tips for docs and README files."
      category="Productivity"
      author="DesignForge360 Editorial"
      date="April 15, 2026"
      readTime="7 min read"
      breadcrumbs={[
        { label: "Guides", href: "/guides" },
        { label: "How to Write Markdown" },
      ]}
    >
      <SEOHead
        title="How to Write Markdown — Complete Beginner's Guide (2026)"
        description="Learn Markdown syntax from scratch: headings, lists, links, images, tables, code blocks, and best practices for writing clean, portable documents."
        canonical="/guides/how-to-write-markdown"
        schema="Article"
        ogType="article"
        articlePublishedTime="2026-04-15"
        articleSection="Guides"
      />

      <p>
        Markdown is a lightweight markup language that lets you format text using simple, readable syntax. It's the standard for README files, documentation, blog posts, and developer notes. Once you learn the basics, you'll write faster and spend less time fighting formatting tools.
      </p>

      <h2>Why Use Markdown?</h2>
      <p>
        Markdown files are plain text, so they work everywhere — Git, note-taking apps, static site generators, and messaging platforms. Unlike rich text editors, Markdown documents are portable, version-controllable, and future-proof.
      </p>

      <h2>Basic Formatting</h2>
      <ul>
        <li><strong>Headings:</strong> Use <code>#</code> for H1, <code>##</code> for H2, up to <code>######</code> for H6</li>
        <li><strong>Bold:</strong> Wrap text in <code>**double asterisks**</code></li>
        <li><strong>Italic:</strong> Wrap text in <code>*single asterisks*</code></li>
        <li><strong>Strikethrough:</strong> Wrap text in <code>~~double tildes~~</code></li>
        <li><strong>Links:</strong> <code>[link text](https://example.com)</code></li>
        <li><strong>Images:</strong> <code>![alt text](image-url.png)</code></li>
      </ul>

      <h2>Lists</h2>
      <p>
        Unordered lists use <code>-</code>, <code>*</code>, or <code>+</code> before each item. Ordered lists use numbers followed by a period. Indent with two or four spaces to create nested lists.
      </p>

      <h2>Code Blocks</h2>
      <p>
        Inline code uses single backticks: <code>`code`</code>. For multi-line code blocks, use triple backticks with an optional language identifier for syntax highlighting:
      </p>
      <pre className="bg-white/5 rounded-lg p-4 text-sm overflow-x-auto">
{`\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\``}
      </pre>

      <h2>Tables</h2>
      <p>
        Create tables using pipes (<code>|</code>) and hyphens (<code>-</code>) to separate columns and headers:
      </p>
      <pre className="bg-white/5 rounded-lg p-4 text-sm overflow-x-auto">
{`| Feature   | Supported |
|-----------|-----------|
| Bold      | Yes       |
| Tables    | Yes       |
| Footnotes | Varies    |`}
      </pre>

      <h2>Blockquotes and Horizontal Rules</h2>
      <p>
        Prefix lines with <code>&gt;</code> for blockquotes. Use three or more dashes (<code>---</code>), asterisks, or underscores on a line for a horizontal rule.
      </p>

      <h2>Best Practices</h2>
      <ul>
        <li><strong>Keep it simple:</strong> Markdown is meant to be readable as raw text. Don't fight the format</li>
        <li><strong>Use reference-style links:</strong> For long URLs, define links at the bottom of the document to keep text clean</li>
        <li><strong>Preview as you write:</strong> Use our <a href="/tools/markdown-preview">Markdown Preview tool</a> to see rendered output instantly</li>
        <li><strong>Be consistent:</strong> Pick one style for headings, lists, and emphasis and stick with it throughout a document</li>
        <li><strong>Use blank lines:</strong> Separate blocks (paragraphs, lists, code blocks) with blank lines for cleaner rendering</li>
      </ul>

      <h2>Advanced Markdown</h2>
      <p>
        Many platforms support extended syntax: task lists (<code>- [x] Done</code>), footnotes, definition lists, and HTML embedding. GitHub Flavored Markdown (GFM) adds autolinked URLs, task lists, and strikethrough as standard features.
      </p>

      <p className="text-white/40 text-sm italic">
        Ready to try it? Open our <a href="/tools/markdown-preview">Markdown Preview tool</a> and start writing — no signup required.
      </p>
    </ArticleLayout>
  );
}
