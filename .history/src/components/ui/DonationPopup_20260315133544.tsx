import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Heart, Coffee } from "lucide-react";

const STORAGE = {
  supported: "df360_supported_at",
  dismissed: "df360_dismissed_at",
  toolVisits: "df360_tool_visits",
  shownAfterFirst: "df360_shown_first",
};

const SUPPORTED_COOLDOWN = 60 * 24 * 60 * 60 * 1000; // 60 days
const DISMISSED_COOLDOWN = 7 * 24 * 60 * 60 * 1000;  // 7 days

function getNum(key: string): number {
  try {
    const v = localStorage.getItem(key);
    return v ? parseInt(v, 10) : 0;
  } catch {
    return 0;
  }
}

function setVal(key: string, val: string) {
  try { localStorage.setItem(key, val); } catch {}
}

function isInCooldown(): boolean {
  const now = Date.now();
  const supported = getNum(STORAGE.supported);
  if (supported && now - supported < SUPPORTED_COOLDOWN) return true;
  const dismissed = getNum(STORAGE.dismissed);
  if (dismissed && now - dismissed < DISMISSED_COOLDOWN) return true;
  return false;
}

/** Track a tool visit and return new count */
function trackToolVisit(slug: string): number {
  try {
    const raw = localStorage.getItem(STORAGE.toolVisits);
    const set: string[] = raw ? JSON.parse(raw) : [];
    if (!set.includes(slug)) {
      set.push(slug);
      localStorage.setItem(STORAGE.toolVisits, JSON.stringify(set));
    }
    return set.length;
  } catch {
    return 0;
  }
}

export function DonationPopup() {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  const tryShow = useCallback(() => {
    if (isInCooldown()) return;
    // Small delay so the page loads first
    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only trigger on tool pages
    const match = location.pathname.match(/^\/tools\/([a-z0-9-]+)$/);
    if (!match) return;

    const slug = match[1];
    const count = trackToolVisit(slug);

    // Trigger 1: after first tool visit (one-time)
    if (count === 1 && !getNum(STORAGE.shownAfterFirst)) {
      setVal(STORAGE.shownAfterFirst, "1");
      return tryShow();
    }

    // Trigger 2: every 5th unique tool
    if (count > 0 && count % 5 === 0) {
      return tryShow();
    }
  }, [location.pathname, tryShow]);

  const dismiss = () => {
    setVisible(false);
    setVal(STORAGE.dismissed, Date.now().toString());
  };

  const support = () => {
    setVal(STORAGE.supported, Date.now().toString());
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={dismiss}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.18 }}
            className="fixed z-[101] inset-0 flex items-center justify-center px-6 pointer-events-none"
          >
            <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-black/90 backdrop-blur-2xl shadow-2xl p-8 pointer-events-auto">
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 text-white/20 hover:text-white/60 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-5">
                  <Heart className="text-pink-400" size={24} />
                </div>

                <h2 className="text-xl font-semibold text-white mb-2 tracking-tight">
                  Enjoying our free tools?
                </h2>
                <p className="text-sm text-white/40 leading-relaxed mb-6">
                  We keep everything free and ad-free. A small contribution helps us build more tools and keep the lights on.
                </p>

                <Link
                  to="/support"
                  onClick={support}
                  className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-[#FF5E5B] hover:bg-[#ff4744] text-white font-medium text-sm transition-colors mb-3"
                >
                  <Coffee size={16} />
                  Buy us a coffee
                </Link>

                <button
                  onClick={dismiss}
                  className="text-xs text-white/25 hover:text-white/50 transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
