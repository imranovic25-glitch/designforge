import { Link } from "react-router-dom";

export function Footer() {
  const footerLinks = [
    {
      title: "Platform",
      links: [
        { name: "Tools", path: "/tools" },
        { name: "Finance", path: "/finance" },
        { name: "Comparisons", path: "/comparisons" },
        { name: "Guides", path: "/guides" },
      ],
    },
    {
      title: "Popular Tools",
      links: [
        { name: "PDF Editor", path: "/tools/pdf-editor" },
        { name: "PDF Compressor", path: "/tools/pdf-compressor" },
        { name: "Image Resizer", path: "/tools/image-resizer" },
        { name: "Background Remover", path: "/tools/background-remover" },
        { name: "Resume Builder", path: "/tools/resume-builder" },
        { name: "Password Generator", path: "/tools/password-generator" },
        { name: "QR Code Generator", path: "/tools/qr-code-generator" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About", path: "/about" },
        { name: "Contact", path: "/contact" },
        { name: "Privacy Policy", path: "/privacy-policy" },
        { name: "Terms of Service", path: "/terms" },
        { name: "Disclaimer", path: "/disclaimer" },
        { name: "Support Us", path: "/support" },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/10 bg-black pt-20 pb-12">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-5 lg:gap-16">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 group mb-6">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center overflow-hidden">
                <div className="w-3 h-3 bg-black rounded-full transform group-hover:scale-50 transition-transform duration-500 ease-out" />
              </div>
              <span className="text-lg font-medium tracking-tight text-white">
                DesignForge360
              </span>
            </Link>
            <p className="text-sm text-white/50 max-w-xs leading-relaxed">
              Free tools, financial calculators, and expert guides for everyone.
            </p>
          </div>
          
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-white tracking-widest uppercase mb-6">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} DesignForge360. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="https://twitter.com/designforge360" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
