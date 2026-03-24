import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, X, Users, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/src/lib/auth";
import { supabase } from "@/src/lib/supabase";
import { OnlineIndicator } from "./OnlineIndicator";

const IDLE_TIMEOUT = 60 * 60 * 1000; // 1 hour

interface OnlineUser {
  id: string;
  name: string;
  avatar: string | null;
}

export function FloatingChat() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isIdleRef = useRef(false);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    // If was idle, re-track presence
    if (isIdleRef.current && channelRef.current) {
      isIdleRef.current = false;
      channelRef.current.track({
        online_at: new Date().toISOString(),
        user_name: user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Anonymous",
        user_avatar: user?.user_metadata?.avatar_url ?? null,
      });
    }

    idleTimerRef.current = setTimeout(() => {
      isIdleRef.current = true;
      channelRef.current?.untrack();
    }, IDLE_TIMEOUT);
  }, [user]);

  useEffect(() => {
    const channel = supabase.channel("community-chat-widget", {
      config: { presence: { key: user?.id ?? `anon-${Math.random().toString(36).slice(2)}` } },
    });
    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users: OnlineUser[] = [];
        for (const [key, presences] of Object.entries(state)) {
          const p = (presences as any[])[0];
          users.push({
            id: key,
            name: p?.user_name ?? "Anonymous",
            avatar: p?.user_avatar ?? null,
          });
        }
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            online_at: new Date().toISOString(),
            user_name: user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Anonymous",
            user_avatar: user?.user_metadata?.avatar_url ?? null,
          });
        }
      });

    // Idle detection — after 1 hour of no activity, untrack from presence
    const events = ["mousemove", "keydown", "scroll", "touchstart", "click"] as const;
    events.forEach((e) => window.addEventListener(e, resetIdleTimer, { passive: true }));
    resetIdleTimer();

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
      events.forEach((e) => window.removeEventListener(e, resetIdleTimer));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [user?.id, resetIdleTimer]);

  const onlineCount = onlineUsers.length;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-3 w-72 rounded-2xl border border-white/[0.08] bg-[#111]/95 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <OnlineIndicator />
                <span className="text-sm font-medium text-white/70">Community Chat</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-md text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-white/40" />
                <span className="text-xs text-white/40">
                  <span className="text-emerald-400 font-semibold">{onlineCount}</span> active now
                </span>
              </div>

              {onlineUsers.length > 0 && (
                <div data-lenis-prevent className="max-h-48 overflow-y-auto space-y-1.5 community-scroll">
                  {onlineUsers.slice(0, 20).map((u) => (
                    <div key={u.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
                      <div className="relative shrink-0">
                        {u.avatar ? (
                          <img src={u.avatar} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                            <User size={12} className="text-white/40" />
                          </div>
                        )}
                        <span className="absolute -bottom-0.5 -right-0.5">
                          <OnlineIndicator size="sm" />
                        </span>
                      </div>
                      <span className="text-xs text-white/50 truncate">{u.name}</span>
                    </div>
                  ))}
                  {onlineUsers.length > 20 && (
                    <p className="text-[10px] text-white/25 text-center py-1">+{onlineUsers.length - 20} more</p>
                  )}
                </div>
              )}

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
