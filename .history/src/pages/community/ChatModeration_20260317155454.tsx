import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, ShieldAlert, Check, X, Trash2, Ban, Eye, Clock, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { useAuth } from "@/src/lib/auth";
import {
  isCommunityAdmin,
  getFlaggedMessages,
  moderateChatMessage,
  banChatUser,
  unbanChatUser,
  getModerationLog,
} from "@/src/lib/community-store";
import type { FlaggedMessage, ModerationLogEntry } from "@/src/lib/community-types";

type Tab = "flagged" | "log";

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ChatModeration() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("flagged");
  const [flagged, setFlagged] = useState<FlaggedMessage[]>([]);
  const [log, setLog] = useState<ModerationLogEntry[]>([]);
  const [banUserId, setBanUserId] = useState("");
  const [banReason, setBanReason] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const admin = await isCommunityAdmin();
      setIsAdmin(admin);
      if (!admin) {
        navigate("/community");
        return;
      }
      const [f, l] = await Promise.all([getFlaggedMessages(), getModerationLog()]);
      setFlagged(f);
      setLog(l);
      setLoading(false);
    })();
  }, [user]);

  const handleModerate = async (messageId: string, action: "approve" | "hide" | "delete") => {
    const ok = await moderateChatMessage(messageId, action);
    if (ok) {
      if (action === "delete") {
        setFlagged((prev) => prev.filter((m) => m.id !== messageId));
      } else {
        setFlagged((prev) => prev.map((m) => m.id === messageId ? { ...m, status: action === "approve" ? "approved" : "hidden" } : m));
      }
      // Refresh log
      const l = await getModerationLog();
      setLog(l);
    }
  };

  const handleBan = async () => {
    if (!banUserId.trim()) return;
    const ok = await banChatUser(banUserId.trim(), banReason.trim() || undefined);
    if (ok) {
      setBanUserId("");
      setBanReason("");
      const l = await getModerationLog();
      setLog(l);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <>
      <SEOHead
        title="Chat Moderation — Admin"
        description="Admin dashboard for chat moderation."
        canonical="/community/moderation"
        robots="noindex, nofollow"
      />

      <div className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
          <Link to="/community" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 mb-8 transition-colors">
            <ArrowLeft size={16} /> Community
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <Shield size={22} className="text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Chat Moderation</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-white/[0.03] rounded-xl p-1 w-fit border border-white/[0.06]">
            <button
              onClick={() => setTab("flagged")}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${tab === "flagged" ? "bg-white/[0.08] text-white" : "text-white/40 hover:text-white/70"}`}
            >
              <span className="flex items-center gap-2">
                <AlertTriangle size={14} />
                Flagged ({flagged.filter(m => m.status !== "approved").length})
              </span>
            </button>
            <button
              onClick={() => setTab("log")}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${tab === "log" ? "bg-white/[0.08] text-white" : "text-white/40 hover:text-white/70"}`}
            >
              <span className="flex items-center gap-2">
                <Clock size={14} />
                Log ({log.length})
              </span>
            </button>
          </div>

          {tab === "flagged" ? (
            <div className="space-y-3">
              {flagged.length === 0 ? (
                <div className="text-center py-16">
                  <Check size={28} className="mx-auto text-emerald-400/30 mb-3" />
                  <p className="text-white/30 text-sm">No flagged messages. All clear!</p>
                </div>
              ) : (
                flagged.map((msg) => (
                  <motion.div
                    key={msg.id}
                    layout
                    className={`rounded-xl border p-4 ${
                      msg.status === "hidden"
                        ? "border-red-500/20 bg-red-500/[0.04]"
                        : msg.status === "approved"
                        ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                        : "border-yellow-500/20 bg-yellow-500/[0.04]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {msg.sender_avatar ? (
                            <img src={msg.sender_avatar} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-white/10" />
                          )}
                          <span className="text-sm font-medium text-white/70">{msg.sender_name}</span>
                          <span className="text-[10px] text-white/25">{timeAgo(msg.created_at)}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            msg.status === "hidden" ? "bg-red-500/20 text-red-400"
                            : msg.status === "approved" ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-yellow-500/20 text-yellow-400"
                          }`}>
                            {msg.status}
                          </span>
                        </div>
                        <p className="text-sm text-white/60 mb-3 whitespace-pre-wrap break-words">{msg.message_text}</p>

                        {/* Reports */}
                        {msg.reports?.length > 0 && (
                          <div className="mb-3">
                            <p className="text-[11px] text-white/30 mb-1">Reports ({msg.reports.length}):</p>
                            <div className="space-y-1">
                              {msg.reports.map((r, i) => (
                                <div key={i} className="text-[11px] text-white/40 bg-white/[0.03] rounded-lg px-2.5 py-1.5">
                                  "{r.reason}" — {timeAgo(r.created_at)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1.5 shrink-0">
                        {msg.status !== "approved" && (
                          <button
                            onClick={() => handleModerate(msg.id, "approve")}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          >
                            <Check size={12} /> Approve
                          </button>
                        )}
                        {msg.status !== "hidden" && (
                          <button
                            onClick={() => handleModerate(msg.id, "hide")}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors"
                          >
                            <Eye size={12} /> Hide
                          </button>
                        )}
                        <button
                          onClick={() => handleModerate(msg.id, "delete")}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                        <button
                          onClick={() => { setBanUserId(msg.sender_id); setTab("flagged"); }}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors"
                        >
                          <Ban size={12} /> Ban User
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}

              {/* Quick Ban */}
              <div className="mt-8 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2 mb-4">
                  <Ban size={14} className="text-red-400" />
                  Ban a User
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    value={banUserId}
                    onChange={(e) => setBanUserId(e.target.value)}
                    placeholder="User ID (UUID)"
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/70 placeholder:text-white/25 focus:outline-none focus:border-white/20"
                  />
                  <input
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="Reason (optional)"
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/70 placeholder:text-white/25 focus:outline-none focus:border-white/20"
                  />
                  <button
                    onClick={handleBan}
                    disabled={!banUserId.trim()}
                    className="px-5 py-2 text-sm rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-30"
                  >
                    Ban
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ─── Moderation Log ─── */
            <div className="space-y-2">
              {log.length === 0 ? (
                <div className="text-center py-16">
                  <Clock size={28} className="mx-auto text-white/10 mb-3" />
                  <p className="text-white/30 text-sm">No moderation actions yet.</p>
                </div>
              ) : (
                log.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/[0.05] px-4 py-3"
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      entry.action === "approve" ? "bg-emerald-400" :
                      entry.action === "ban" ? "bg-red-400" :
                      entry.action === "delete" ? "bg-red-400" :
                      entry.action === "unban" ? "bg-blue-400" :
                      "bg-yellow-400"
                    }`} />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm text-white/60">
                        <span className="font-medium text-white/80">{entry.action}</span>
                        {entry.message_id && <span className="text-white/30"> · msg:{entry.message_id.slice(0, 8)}…</span>}
                        {entry.target_user && <span className="text-white/30"> · user:{entry.target_user.slice(0, 8)}…</span>}
                        {entry.reason && <span className="text-white/30"> — {entry.reason}</span>}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/25 shrink-0">{timeAgo(entry.created_at)}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
