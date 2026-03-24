import { ArticleLayout } from "@/src/components/layout/ArticleLayout";

export function HowToCompressPdf() {
  return (
    <ArticleLayout
      title="How to Compress PDF Files"
      description="Practical techniques to reduce PDF file size without sacrificing document quality."
      category="Productivity"
      author="DesignForge360 Editorial"
      date="March 1, 2026"
      readTime="6 min read"
      breadcrumbs={[
        { label: "Guides", href: "/guides" },
        { label: "How to Compress PDF Files" }
      ]}
    >
      <p>
        Oversized PDF files cause problems — email attachment limits, slow uploads, storage costs, and frustrating download times. Compression can reduce file sizes by 50–90% in many cases. Here's how to do it.
      </p>

      <h2>Why PDFs Get Large</h2>
      <p>
        PDF file size is primarily driven by embedded images (especially high-resolution photos), embedded fonts, metadata, and the number of pages. A scanned document is typically much larger than a text-only PDF of the same length because every page is essentially a high-resolution image.
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
        Our tool processes files entirely in your browser using pdf-lib. Files are never uploaded to a server.
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

      <h2>Tips for Maximum Size Reduction</h2>
      <ul>
        <li><strong>Optimize before creating:</strong> In Word or InDesign, use "Save as PDF" with optimized image settings rather than printing to PDF</li>
        <li><strong>Downsample images:</strong> For screen-only PDFs, 150 DPI is sufficient. Print requires 300 DPI</li>
        <li><strong>Remove hidden layers:</strong> Technical PDFs sometimes have hidden layers that add significant file size</li>
        <li><strong>Subset fonts:</strong> Embed only the characters you actually use rather than full font files</li>
        <li><strong>Remove metadata:</strong> Document properties, author info, and revision history can add bytes without value</li>
      </ul>
    </ArticleLayout>
  );
}
