import { Link, useLocation } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { Menu, X, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Tools", path: "/tools" },
    { name: "Finance", path: "/finance" },
    { name: "Comparisons", path: "/comparisons" },
    { name: "Guides", path: "/guides" },
  ];

  return (
    <header 
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300 ease-in-out",
        scrolled 
          ? "bg-black/50 backdrop-blur-xl border-b border-white/5 py-3" 
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-6 lg:px-12">
        <Link to="/" className="flex items-center space-x-2 group">
          <div data-logo-mark className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full transform group-hover:scale-0 transition-transform duration-500 ease-out" />
          </div>
          <span className="text-lg font-medium tracking-tight text-white">
            DesignForge360
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-sm font-medium transition-all duration-300 relative",
                  isActive ? "text-white" : "text-white/60 hover:text-white"
                )}
              >
                {item.name}
                {isActive && (
                  <motion.div 
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-white"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Link to="/about" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
            About
          </Link>
          <Link 
            to="/tools" 
            className="group flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-white/90 transition-all"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white/70 hover:text-white transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-full left-0 right-0 border-b border-white/10 bg-black/95 backdrop-blur-xl px-6 py-6"
          >
            <nav className="flex flex-col space-y-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "text-lg font-medium transition-colors",
                    location.pathname.startsWith(item.path)
                      ? "text-white"
                      : "text-white/60 hover:text-white"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-6 border-t border-white/10 flex flex-col space-y-4">
                <Link to="/about" onClick={() => setIsOpen(false)} className="text-lg font-medium text-white/60 hover:text-white">
                  About
                </Link>
                <Link 
                  to="/tools" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center space-x-2 bg-white text-black px-4 py-3 rounded-full text-base font-medium"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
