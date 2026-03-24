import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Send, MessageSquare, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { useAuth } from "@/src/lib/auth";
import {
  getMyThreads,
  getThreadMessages,
  sendMessage,
  subscribeToThread,
  getOrCreateThread,
} from "@/src/lib/community-store";
import type { ChatThread, ChatMessage } from "@/src/lib/community-types";

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function CommunityChat() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const openWithUser = searchParams.get("with");

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  // Load threads
  const loadThreads = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const t = await getMyThreads();
    setThreads(t);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadThreads(); }, [loadThreads]);

  // If ?with=userId, open/create that thread
  useEffect(() => {
    if (!openWithUser || !user) return;
    if (openWithUser === user.id) return; // can't chat with self
    (async () => {
      const thread = await getOrCreateThread(openWithUser);
      if (thread) {
        setActiveThread(thread);
        // Ensure it shows in the thread list
        setThreads((prev) => {
          if (prev.some((t) => t.id === thread.id)) return prev;
          return [thread, ...prev];
        });
      }
    })();
  }, [openWithUser, user]);

  // Load messages when active thread changes
  useEffect(() => {
    if (!activeThread) return;
    (async () => {
      const msgs = await getThreadMessages(activeThread.id);
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    })();

    // Subscribe to real-time
    unsubRef.current?.();
    unsubRef.current = subscribeToThread(activeThread.id, (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });

    return () => { unsubRef.current?.(); };
  }, [activeThread?.id]);

  const handleSend = async () => {
    if (!input.trim() || !activeThread || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    const msg = await sendMessage(activeThread.id, text);
    if (msg) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      // Update thread preview
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThread.id
            ? { ...t, last_message_text: text, last_message_at: new Date().toISOString() }
            : t
        )
      );
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
    setSending(false);
  };

  const getOtherName = (thread: ChatThread) => {
    if (thread.other_user_name) return thread.other_user_name;
    // Fallback — we don't have the name enriched yet
    return "Member";
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl text-center">
          <MessageSquare className="mx-auto mb-4 text-white/20" size={40} />
          <p className="text-white/40 text-lg mb-4">Sign in to access messages</p>
          <Link to="/signin" className="text-sm text-white/50 hover:text-white underline">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead title="Messages — Community" description="Direct messages with community members." canonical="/community/chat" />
      <div className="min-h-screen pt-28 pb-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/community" className="text-white/40 hover:text-white/70 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
              <MessageSquare size={20} className="text-white/40" />
              Messages
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 h-[calc(100vh-200px)] min-h-[400px]">
            {/* Thread list */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-5 h-5 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
                </div>
              ) : threads.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <p className="text-white/30 text-sm">No conversations yet</p>
                  <p className="text-white/20 text-xs mt-2">Click "Message" on someone's profile to start chatting.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {threads.map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => setActiveThread(thread)}
                      className={`w-full text-left px-4 py-3 transition-colors ${
                        activeThread?.id === thread.id
                          ? "bg-white/[0.06]"
                          : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {thread.other_user_avatar ? (
                          <img src={thread.other_user_avatar} alt="" className="w-8 h-8 rounded-full shrink-0" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/10 shrink-0 flex items-center justify-center">
                            <User size={14} className="text-white/30" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-white/70 truncate">{getOtherName(thread)}</span>
                            {thread.last_message_at && (
                              <span className="text-[10px] text-white/25 shrink-0">{timeAgo(thread.last_message_at)}</span>
                            )}
                          </div>
                          {thread.last_message_text && (
                            <p className="text-xs text-white/35 truncate mt-0.5">{thread.last_message_text}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chat area */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] flex flex-col overflow-hidden">
              {!activeThread ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-white/25 text-sm">Select a conversation</p>
                </div>
              ) : (
                <>
                  {/* Chat header */}
                  <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2.5">
                    {activeThread.other_user_avatar ? (
                      <img src={activeThread.other_user_avatar} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                        <User size={13} className="text-white/30" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-white/70">{getOtherName(activeThread)}</span>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {messages.length === 0 && (
                      <p className="text-center text-white/20 text-sm py-8">No messages yet. Say hello!</p>
                    )}
                    {messages.map((msg) => {
                      const isMine = msg.sender_id === user.id;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[75%] ${isMine ? "order-2" : "order-1"}`}>
                            {!isMine && (
                              <div className="flex items-center gap-1.5 mb-1">
                                {msg.sender_avatar ? (
                                  <img src={msg.sender_avatar} alt="" className="w-4 h-4 rounded-full" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full bg-white/10" />
                                )}
                                <span className="text-[11px] text-white/35">{msg.sender_name}</span>
                              </div>
                            )}
                            <div
                              className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                                isMine
                                  ? "bg-white/[0.12] text-white/90 rounded-br-md"
                                  : "bg-white/[0.04] text-white/70 border border-white/[0.06] rounded-bl-md"
                              }`}
                            >
                              {msg.message_text}
                            </div>
                            <span className={`text-[10px] text-white/20 mt-0.5 block ${isMine ? "text-right" : "text-left"}`}>
                              {timeAgo(msg.created_at)}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="px-4 py-3 border-t border-white/[0.06]">
                    <div className="flex gap-2">
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder="Type a message…"
                        rows={1}
                        maxLength={2000}
                        className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-white/20 resize-none"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!input.trim() || sending}
                        className="self-end p-2.5 rounded-xl bg-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.14] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
