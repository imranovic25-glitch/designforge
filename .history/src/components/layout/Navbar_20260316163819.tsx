import { Link, useLocation } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { Menu, X, ArrowRight, LogOut, User, Sun, Moon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/src/lib/auth";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const saved = window.localStorage.getItem("df_theme");
    const initial = saved === "light" ? "light" : "dark";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("df_theme", next);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    { name: "Community", path: "/community" },
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
          <div data-logo-mark className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
            <div className="w-4 h-4 bg-black rounded-full transform group-hover:scale-50 transition-transform duration-500 ease-out" />
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

          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Day mode" : "Night mode"}
          >
            {theme === "dark" ? (
              <Sun size={18} className="text-white/70" />
            ) : (
              <Moon size={18} className="text-white/70" />
            )}
          </button>

          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((p) => !p)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10 transition-colors"
              >
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <User size={16} className="text-white/60" />
                )}
                <span className="text-sm text-white/80 max-w-[100px] truncate">
                  {user.user_metadata?.full_name ?? user.email?.split("@")[0]}
                </span>
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-44 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50"
                  >
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <User size={14} /> My Profile
                    </Link>
                    <div className="border-t border-white/5" />
                    <button
                      onClick={() => { signOut(); setUserMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/signin"
              className="group flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-white/90 transition-all"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
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
                <button
                  onClick={() => { toggleTheme(); }}
                  className="flex items-center justify-center space-x-2 bg-white/10 text-white px-4 py-3 rounded-full text-base font-medium"
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                  <span>{theme === "dark" ? "Day Mode" : "Night Mode"}</span>
                </button>
                <Link to="/about" onClick={() => setIsOpen(false)} className="text-lg font-medium text-white/60 hover:text-white">
                  About
                </Link>
                {user ? (
                  <button
                    onClick={() => { signOut(); setIsOpen(false); }}
                    className="flex items-center justify-center space-x-2 bg-white/10 text-white px-4 py-3 rounded-full text-base font-medium"
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <Link
                    to="/signin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center space-x-2 bg-white text-black px-4 py-3 rounded-full text-base font-medium"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
