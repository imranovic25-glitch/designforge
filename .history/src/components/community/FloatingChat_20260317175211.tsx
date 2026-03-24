import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, X, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { subscribeToCommunityPresence } from "@/src/lib/community-store";
import { useAuth } from "@/src/lib/auth";

export function FloatingChat() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const unsub = subscribeToCommunityPresence(user?.id ?? null, setOnlineCount);
    return unsub;
  }, [user?.id]);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-3 w-64 rounded-2xl border border-white/[0.08] bg-[#111]/95 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-sm font-medium text-white/70">Community Chat</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-md text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2.5">
                <Users size={16} className="text-white/40" />
                <span className="text-sm text-white/50">
                  <span className="text-emerald-400 font-semibold">{onlineCount}</span> online now
                </span>
              </div>

              <p className="text-xs text-white/30 leading-relaxed">
                Chat with other members, get feedback, and share ideas in real time.
              </p>

              <Link
                to="/community/chat"
                className="flex items-center justify-center gap-2 w-full bg-white text-black px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/90 transition-all"
              >
                <MessageCircle size={15} />
                Open Messages
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative w-12 h-12 rounded-full bg-white/[0.08] border border-white/[0.12] backdrop-blur-sm text-white/60 hover:text-white hover:bg-white/[0.12] transition-all shadow-lg flex items-center justify-center"
      >
        <MessageCircle size={20} />
        {onlineCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white px-1">
            {onlineCount}
          </span>
        )}
      </button>
    </div>
  );
}
