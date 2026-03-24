import { ArticleLayout } from "@/src/components/layout/ArticleLayout";
import { ComparisonCard } from "@/src/components/ui/ComparisonCard";

const tools = [
  {
    name: "Adobe Acrobat Online",
    tagline: "Best for All-in-One PDF Conversion",
    pricing: "Free (limited); Acrobat Standard from $12.99/month",
    logo: "https://logo.clearbit.com/adobe.com",
    url: "https://www.adobe.com/acrobat/online/pdf-to-word.html",
    pros: [
      "Convert PDF to Word, Excel, PowerPoint, JPEG, and more",
      "Industry-leading OCR for scanned document conversion",
      "Trusted by enterprises worldwide",
      "Cloud storage syncs with Adobe Document Cloud",
      "Mobile app available on iOS and Android"
    ]
  },
  {
    name: "Smallpdf",
    tagline: "Best for Everyday PDF Conversion Online",
    pricing: "Free (2 tasks/day); Pro at $12/month",
    logo: "https://logo.clearbit.com/smallpdf.com",
    url: "https://smallpdf.com/",
    pros: [
      "25+ PDF tools in one platform",
      "Convert PDF to Word, Excel, PPT, JPG, and HTML",
      "SSL encrypted file transfers",
      "Works on Windows, Mac, and mobile",
      "Chrome extension for in-browser conversion"
    ]
  },
  {
    name: "ILovePDF",
    tagline: "Best Free Online Batch PDF Converter",
    pricing: "Free; Premium at $6/month",
    logo: "https://logo.clearbit.com/ilovepdf.com",
    url: "https://www.ilovepdf.com/",
    pros: [
      "Convert, merge, split, compress, and edit PDFs",
      "Batch processing — upload multiple files at once",
      "No watermarks on free plan for most tools",
      "REST API for developers",
      "Available as installable desktop app"
    ]
  },
  {
    name: "Soda PDF",
    tagline: "Best Desktop + Cloud Hybrid PDF Converter",
    pricing: "Free tier; Essentials at $9.99/month",
    logo: "https://logo.clearbit.com/sodapdf.com",
    url: "https://www.sodapdf.com/",
    pros: [
      "Desktop and online versions available",
      "PDF to Word, Excel, PowerPoint, HTML, and image formats",
      "E-signature tools included",
      "Batch conversion supported",
      "Optical character recognition (OCR) included"
    ]
  },
  {
    name: "PDF2Doc",
    tagline: "Best for Free PDF to Word Conversion",
    pricing: "Completely free",
    logo: "https://logo.clearbit.com/pdf2doc.com",
    url: "https://pdf2doc.com/",
    pros: [
      "Up to 20 PDF to Word or Excel conversions at once",
      "No registration required",
      "Simple drag-and-drop or file URL upload",
      "Preserves formatting for most standard PDFs",
      "Quick turnaround for batch files"
    ]
  },
  {
    name: "Sejda PDF",
    tagline: "Best for Privacy-Focused PDF Conversion",
    pricing: "Free (3 tasks/day); Weekly at $7.50",
    logo: "https://logo.clearbit.com/sejda.com",
    url: "https://www.sejda.com/",
    pros: [
      "Files automatically deleted after 2 hours",
      "PDF to Word, Excel, JPEG, HTML, and more",
      "Desktop app available — no internet needed",
      "Works with protected PDFs",
      "Minimal and distraction-free interface"
    ]
  },
  {
    name: "PDF Candy",
    tagline: "Best for Comprehensive Free PDF Toolkit",
    pricing: "Free with limits; Unlimited at $6/month",
    logo: "https://logo.clearbit.com/pdfcandy.com",
    url: "https://pdfcandy.com/",
    pros: [
      "40+ free PDF tools under one roof",
      "Convert PDF to and from 20+ formats",
      "OCR text recognition available",
      "Batch mode for multiple files",
      "Desktop app for offline processing"
    ]
  },
  {
    name: "Nitro PDF",
    tagline: "Best Business-Grade PDF Converter",
    pricing: "Nitro PDF Pro from $14.99/month",
    logo: "https://logo.clearbit.com/gonitro.com",
    url: "https://www.gonitro.com/",
    pros: [
      "Microsoft Office-grade PDF to Word/Excel accuracy",
      "Batch conversion for enterprise document workflows",
      "eSign and fillable form features",
      "Google Drive, Dropbox, and OneDrive integrations",
      "GDPR and SOC 2 compliant"
    ]
  },
  {
    name: "CleverPDF",
    tagline: "Best for Desktop-Based PDF Conversion",
    pricing: "Free online; Desktop app from $29 (one-time)",
    logo: "https://logo.clearbit.com/cleverpdf.com",
    url: "https://www.cleverpdf.com/",
    pros: [
      "40+ PDF tools for desktop and web",
      "Convert PDF to Word, PPT, Excel, images, and more",
      "Offline desktop app — no internet upload needed",
      "OCR for scanned PDFs",
      "One-time license — no subscription required"
    ]
  },
  {
    name: "PDF.co",
    tagline: "Best Developer API for PDF Conversion",
    pricing: "Free tier; API plans from $29/month",
    logo: "https://logo.clearbit.com/pdf.co",
    url: "https://pdf.co/",
    pros: [
      "Powerful REST API for automated PDF workflows",
      "Convert, parse, generate, and OCR PDFs via API",
      "Integrates with Zapier, Make, and 1,500+ apps",
      "Extracts structured data from invoices and forms",
      "SOC2 and GDPR compliant cloud infrastructure"
    ]
  }
];

export function BestPdfConverters() {
  return (
    <ArticleLayout
      title="Best PDF Converters of 2026"
      description="A hands-on comparison of the top online and desktop tools for converting PDFs to Word, Excel, images, and other formats."
      category="Comparisons"
      categoryLink="/comparisons"
      author="DesignForge360 Editorial"
      date="April 1, 2026"
      readTime="10 min read"
    >
      <p>
        Converting a PDF to Word used to be painful — garbled text, broken layouts, and lost formatting. Today's best tools preserve tables, fonts, and structure with impressive accuracy. Here's our breakdown of the top 10 PDF converters for 2026, from free online tools to professional-grade desktop software.
      </p>

      <h2>Our Top 10 Picks</h2>

      <div className="not-prose space-y-8 my-10">
        {tools.map((tool, index) => (
          <ComparisonCard
            key={tool.name}
            index={index}
            brandName={tool.name}
            logoUrl={tool.logo}
            title={tool.name}
            tagline={tool.tagline}
            accent="sky"
            pros={tool.pros}
            meta={[{ label: "Pricing", value: tool.pricing }]}
            primaryAction={{ label: "Try It", href: tool.url }}
            secondaryAction={{ label: "Learn More", href: tool.url }}
          />
        ))}
      </div>

      <h2>How to Choose</h2>
      <p>
        For occasional personal conversions, Smallpdf, ILovePDF, or the free tier of Sejda are all excellent free choices. For businesses converting large volumes of contracts or invoices, a tool like Adobe Acrobat or Nitro PDF with OCR and batch processing is worth the subscription. Developers building automated document pipelines should look at PDF.co's API.
      </p>

      <p className="text-white/40 text-sm italic">
        Disclaimer: This article contains affiliate links. We may earn a commission if you sign up through our links. This does not influence our editorial recommendations.
      </p>
    </ArticleLayout>
  );
}
