import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Heart, Coffee } from "lucide-react";

const STORAGE_KEYS = {
  supported: "df360_supported_at",
  dismissed: "df360_dismissed_at",
};

const SUPPORTED_COOLDOWN = 60 * 24 * 60 * 60 * 1000; // 60 days
const DISMISSED_COOLDOWN = 7 * 24 * 60 * 60 * 1000;  // 7 days
const SHOW_DELAY = 45_000; // 45 seconds after mount

function getTimestamp(key: string): number {
  try {
    const v = localStorage.getItem(key);
    return v ? parseInt(v, 10) : 0;
  } catch {
    return 0;
  }
}

function shouldShow(): boolean {
  const now = Date.now();
  const supported = getTimestamp(STORAGE_KEYS.supported);
  if (supported && now - supported < SUPPORTED_COOLDOWN) return false;
  const dismissed = getTimestamp(STORAGE_KEYS.dismissed);
  if (dismissed && now - dismissed < DISMISSED_COOLDOWN) return false;
  return true;
}

export function DonationPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!shouldShow()) return;
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(STORAGE_KEYS.dismissed, Date.now().toString()); } catch {}
  };

  const support = () => {
    try { localStorage.setItem(STORAGE_KEYS.supported, Date.now().toString()); } catch {}
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={dismiss}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.18 }}
            className="fixed z-[101] inset-0 flex items-center justify-center px-6 pointer-events-none"
          >
            <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-black/90 backdrop-blur-2xl shadow-2xl p-8 pointer-events-auto">
              {/* Close */}
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 text-white/20 hover:text-white/60 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {/* Content */}
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

                {/* CTA */}
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
