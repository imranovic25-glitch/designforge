import { Link } from "react-router-dom";
import { ArrowUpRight, Image as ImageIcon, ImageDown, FileDown, FilePlus2, FileOutput, ArrowLeftRight, TrendingUp, Landmark, FileUser, Type, Braces } from "lucide-react";

export function ToolsHub() {
  const tools = [
    {
      id: "background-remover",
      name: "Background Remover",
      description: "Instantly remove backgrounds from images with precision.",
      category: "Image",
      icon: <ImageIcon className="h-6 w-6" />,
      path: "/tools/background-remover"
    },
    {
      id: "pdf-compressor",
      name: "PDF Compressor",
      description: "Reduce PDF file sizes without losing quality.",
      category: "PDF",
      icon: <FileDown className="h-6 w-6" />,
      path: "/tools/pdf-compressor"
    },
    {
      id: "pdf-merger",
      name: "PDF Merger",
      description: "Combine multiple PDF documents into a single file.",
      category: "PDF",
      icon: <FilePlus2 className="h-6 w-6" />,
      path: "/tools/pdf-merger"
    },
    {
      id: "currency-converter",
      name: "Currency Converter",
      description: "Convert between global currencies with up-to-date exchange rates.",
      category: "Finance",
      icon: <ArrowLeftRight className="h-6 w-6" />,
      path: "/tools/currency-converter"
    },
    {
      id: "compound-interest-calculator",
      name: "Compound Interest Calculator",
      description: "Calculate the future value of your investments with regular contributions.",
      category: "Finance",
      icon: <TrendingUp className="h-6 w-6" />,
      path: "/tools/compound-interest-calculator"
    },
    {
      id: "loan-emi-calculator",
      name: "Loan / EMI Calculator",
      description: "Plan your borrowing by calculating monthly payments and total interest.",
      category: "Finance",
      icon: <Landmark className="h-6 w-6" />,
      path: "/tools/loan-emi-calculator"
    },
    {
      id: "resume-builder",
      name: "Resume Builder",
      description: "Create a premium, ATS-friendly resume and download a polished template.",
      category: "Career",
      icon: <FileUser className="h-6 w-6" />,
      path: "/tools/resume-builder"
    },
    {
      id: "image-compressor",
      name: "Image Compressor",
      description: "Reduce image file sizes with adjustable quality — JPG, PNG, WebP supported.",
      category: "Image",
      icon: <ImageDown className="h-6 w-6" />,
      path: "/tools/image-compressor"
    },
    {
      id: "pdf-to-word",
      name: "PDF to Word",
      description: "Extract text from any PDF and download it as an editable document.",
      category: "PDF",
      icon: <FileOutput className="h-6 w-6" />,
      path: "/tools/pdf-to-word"
    },
    {
      id: "word-counter",
      name: "Word Counter",
      description: "Count words, characters, sentences, paragraphs and estimate reading time.",
      category: "Text",
      icon: <Type className="h-6 w-6" />,
      path: "/tools/word-counter"
    },
    {
      id: "json-formatter",
      name: "JSON Formatter",
      description: "Pretty-print or minify any JSON string. Validates syntax instantly.",
      category: "Dev",
      icon: <Braces className="h-6 w-6" />,
      path: "/tools/json-formatter"
    }
  ];

  return (
    <div className="min-h-screen bg-black pt-32 pb-24 selection:bg-white/30 selection:text-white">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        <div className="max-w-3xl mb-24">
          <h1 className="text-5xl md:text-7xl font-semibold text-white tracking-tight mb-8 leading-[1.1]">Tools Hub</h1>
          <p className="text-xl md:text-2xl text-white/50 font-light leading-relaxed">
            A curated collection of professional utilities designed to solve specific problems efficiently. 
            No clutter, just tools that work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <Link key={tool.id} to={tool.path} className="group glass-panel rounded-3xl p-8 flex flex-col transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.04]">
              <div className="flex items-center justify-between mb-8">
                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/70 group-hover:text-white group-hover:bg-white/10 transition-colors">
                  {tool.icon}
                </div>
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/50 uppercase tracking-widest">
                  {tool.category}
                </span>
              </div>
              <h3 className="text-2xl font-medium text-white mb-4">{tool.name}</h3>
              <p className="text-white/50 mb-10 flex-1 font-light leading-relaxed">{tool.description}</p>
              <div className="flex items-center text-sm font-medium text-white/40 group-hover:text-white transition-colors uppercase tracking-widest mt-auto">
                Launch Tool <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
