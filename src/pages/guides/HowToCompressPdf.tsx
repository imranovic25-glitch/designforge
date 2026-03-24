import { ArticleLayout } from "@/src/components/layout/ArticleLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";

export function HowToCompressPdf() {
  return (
    <ArticleLayout
      title="How to Compress PDF Files"
      description="Practical techniques to reduce PDF file size without sacrificing document quality."
      category="Productivity"
      author="DesignForge360 Editorial"
      date="March 1, 2026"
      readTime="12 min read"
      breadcrumbs={[
        { label: "Guides", href: "/guides" },
        { label: "How to Compress PDF Files" }
      ]}
    >
      <SEOHead
        title="How to Compress a PDF File — Free Guide (2026)"
        description="Step-by-step instructions to reduce PDF file size without losing quality. Free online tools, desktop software, and best practices covered."
        canonical="/guides/how-to-compress-pdf"
        schema="Article"
        ogType="article"
        articlePublishedTime="2026-01-01"
        articleSection="Guides"
      />
      <p>
        Oversized PDF files cause problems — email attachment limits, slow uploads, storage costs, and frustrating download times. Compression can reduce file sizes by 50–90% in many cases. This guide covers every practical method for shrinking your PDFs, from free browser tools to professional desktop software.
      </p>

      <h2>Why PDFs Get Large</h2>
      <p>
        PDF file size is primarily driven by embedded images (especially high-resolution photos), embedded fonts, metadata, and the number of pages. A scanned document is typically much larger than a text-only PDF of the same length because every page is essentially a high-resolution image.
      </p>
      <p>
        Other contributors to bloated PDFs include embedded multimedia (audio, video), form fields and JavaScript actions, hidden layers from design applications, and RGB colour profiles intended for screens rather than print. Understanding these contributors helps you target the right areas for compression.
      </p>

      <h2>Method 1: Online PDF Compressor (Easiest)</h2>
      <p>
        The fastest approach for one-off compression tasks is a browser-based tool.
      </p>
      <ul>
        <li>Go to our <a href="/tools/pdf-compressor">PDF Compressor tool</a></li>
        <li>Upload your PDF by dragging and dropping it into the tool</li>
        <li>Select your compression level (Low, Medium, or High)</li>
        <li>Click Compress and download the result</li>
      </ul>
      <p>
        Our tool processes files entirely in your browser using pdf-lib. Files are never uploaded to a server, making this the most privacy-friendly option available.
      </p>

      <h2>Method 2: Adobe Acrobat (Best Quality Control)</h2>
      <p>
        Adobe Acrobat Pro gives you the most control over compression settings, particularly for image quality and resolution.
      </p>
      <ul>
        <li>Open your PDF in Acrobat Pro</li>
        <li>Go to File → Save as Other → Reduced Size PDF</li>
        <li>Or use Tools → Optimize PDF for advanced controls over image resolution, font embedding, and stream compression</li>
      </ul>
      <p>
        The "Optimize PDF" audit feature in Acrobat shows you exactly what's consuming space — images, fonts, form data, metadata — so you can make targeted decisions instead of applying blanket compression that might hurt quality.
      </p>

      <h2>Method 3: Using Preview on Mac</h2>
      <p>
        macOS users have a built-in option that requires no extra software:
      </p>
      <ul>
        <li>Open the PDF in Preview (the default PDF viewer on Mac)</li>
        <li>Go to File → Export</li>
        <li>In the "Quartz Filter" dropdown, select "Reduce File Size"</li>
        <li>Click Save</li>
      </ul>
      <p>
        This method applies aggressive image downsampling, so it works best for documents intended for on-screen reading. For print-quality documents, use Acrobat or our browser tool with a lower compression setting instead.
      </p>

      <h2>Method 4: Command-Line Tools (Best for Automation)</h2>
      <p>
        Developers and system administrators often need to compress PDFs in bulk or as part of automated workflows. Ghostscript is the most widely used command-line tool for PDF compression:
      </p>
      <ul>
        <li><code>gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dBATCH -sOutputFile=output.pdf input.pdf</code></li>
        <li>The <code>-dPDFSETTINGS</code> flag controls compression level: <code>/screen</code> (72 DPI, smallest), <code>/ebook</code> (150 DPI, good balance), <code>/printer</code> (300 DPI), or <code>/prepress</code> (highest quality)</li>
      </ul>
      <p>
        You can wrap this in a shell script or integrate it into a CI/CD pipeline to automatically compress generated reports or documentation before distribution.
      </p>

      <h2>Comparison: Which Method Should You Use?</h2>
      <div className="not-prose my-10 overflow-x-auto">
        <table className="w-full text-sm text-left text-white/70 border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-3 px-4 text-white font-semibold">Method</th>
              <th className="py-3 px-4 text-white font-semibold">Best For</th>
              <th className="py-3 px-4 text-white font-semibold">Cost</th>
              <th className="py-3 px-4 text-white font-semibold">Privacy</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4">DesignForge360 Compressor</td>
              <td className="py-3 px-4">Quick one-off compression</td>
              <td className="py-3 px-4">Free</td>
              <td className="py-3 px-4">100% local</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4">Adobe Acrobat Pro</td>
              <td className="py-3 px-4">Professional / print work</td>
              <td className="py-3 px-4">$22.99/mo</td>
              <td className="py-3 px-4">Local</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4">macOS Preview</td>
              <td className="py-3 px-4">Quick screen-quality compression</td>
              <td className="py-3 px-4">Free (Mac only)</td>
              <td className="py-3 px-4">Local</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4">Ghostscript CLI</td>
              <td className="py-3 px-4">Batch / automated pipelines</td>
              <td className="py-3 px-4">Free (open source)</td>
              <td className="py-3 px-4">Local</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Tips for Maximum Size Reduction</h2>
      <ul>
        <li><strong>Optimize before creating:</strong> In Word or InDesign, use "Save as PDF" with optimized image settings rather than printing to PDF</li>
        <li><strong>Downsample images:</strong> For screen-only PDFs, 150 DPI is sufficient. Print requires 300 DPI</li>
        <li><strong>Remove hidden layers:</strong> Technical PDFs sometimes have hidden layers that add significant file size</li>
        <li><strong>Subset fonts:</strong> Embed only the characters you actually use rather than full font files</li>
        <li><strong>Remove metadata:</strong> Document properties, author info, and revision history can add bytes without value</li>
        <li><strong>Flatten form fields:</strong> If the PDF has filled forms you no longer need to edit, flattening them converts interactive fields to static content and can significantly reduce file size</li>
        <li><strong>Convert to PDF/A:</strong> This archival format strips unnecessary elements while preserving visual fidelity — useful for long-term storage</li>
      </ul>

      <h2>Understanding Compression Levels</h2>
      <p>
        Most PDF compressors offer tiered compression settings. Understanding the trade-offs helps you choose the right level for each use case:
      </p>
      <ul>
        <li><strong>Low compression (high quality):</strong> Reduces file size by 10–30%. Images stay virtually identical. Best for professional documents with photos or diagrams that need to remain sharp</li>
        <li><strong>Medium compression (balanced):</strong> Reduces file size by 40–60%. Slight image softening visible only at high zoom. Best for general purpose — email sharing, web uploads, cloud storage</li>
        <li><strong>High compression (smallest size):</strong> Reduces file size by 70–90%. Noticeable image degradation. Best for text-heavy documents, internal drafts, or archival copies where visual quality is secondary</li>
      </ul>

      <h2>Common Mistakes to Avoid</h2>
      <ul>
        <li><strong>Compressing already-compressed PDFs:</strong> Running a PDF through compression multiple times rarely helps and can degrade quality. Compress once from the original source</li>
        <li><strong>Using screenshot/print-to-PDF:</strong> Printing a web page or document to PDF creates an image-based file that's larger and uncompressible compared to a properly exported PDF</li>
        <li><strong>Ignoring image resolution before embedding:</strong> A 4000×3000 photo pasted into a PDF that displays at 400×300 still carries all 12 megapixels. Resize images to their display dimensions before inserting them</li>
        <li><strong>Forgetting to check quality after compression:</strong> Always open the compressed PDF and verify text is legible, images are acceptable, and no content was lost — especially charts, diagrams, and small text</li>
      </ul>

      <h2>Frequently Asked Questions</h2>
      <h3>Does compressing a PDF reduce quality?</h3>
      <p>
        Low and medium compression levels preserve quality for most use cases. Text, vector graphics, and layout are unaffected by compression — only raster images (photos, scans) are degraded. If your PDF is mostly text, compression will reduce size with virtually zero visible impact.
      </p>
      <h3>What's the email attachment size limit?</h3>
      <p>
        Gmail and most providers cap attachments at 25 MB. Outlook caps at 20 MB for personal accounts. If your PDF is near these limits, medium compression will typically bring it well within range.
      </p>
      <h3>Can I compress a password-protected PDF?</h3>
      <p>
        You need the document's password to open it for compression. Owner-restricted PDFs (copy/print disabled) can often still be compressed by tools that respect the restriction flags. If the PDF requires a password to open, you must supply it first.
      </p>
    </ArticleLayout>
  );
}
