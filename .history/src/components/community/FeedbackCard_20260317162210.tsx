import { useState } from "react";
import { Trash2, MessageCircle, Send, ChevronDown, ChevronUp, Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { AppFeedback, FeedbackReply } from "@/src/lib/community-types";

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

interface FeedbackCardProps {
  feedback: AppFeedback;
  currentUserId?: string;
  onDelete?: (id: string) => void | Promise<void>;
  replies?: FeedbackReply[];
  onReply?: (feedbackId: string, text: string) => Promise<void>;
  onDeleteReply?: (replyId: string) => Promise<void>;
  loveCount?: number;
  hasLoved?: boolean;
  onLove?: (feedbackId: string) => void;
}

export function FeedbackCard({ feedback, currentUserId, onDelete, replies = [], onReply, onDeleteReply, loveCount = 0, hasLoved = false, onLove }: FeedbackCardProps) {
  const isOwner = currentUserId === feedback.user_id;
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !onReply) return;
    setSending(true);
    await onReply(feedback.id, replyText.trim());
    setReplyText("");
    setShowReplyForm(false);
    setShowReplies(true);
    setSending(false);
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {feedback.user_avatar ? (
            <img src={feedback.user_avatar} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-white/10" />
          )}
          <span className="text-sm text-white/60 font-medium">{feedback.user_name || "Anonymous"}</span>
          <span className="text-[11px] text-white/35">{timeAgo(feedback.created_at)}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Stars */}
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={13}
                className={s <= feedback.rating ? "fill-amber-400 text-amber-400" : "text-white/10"}
              />
            ))}
          </div>

          {isOwner && onDelete && (
            <button
              onClick={() => onDelete(feedback.id)}
              className="p-1 rounded-md text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete your feedback"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Area tags */}
      {feedback.areas.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {feedback.areas.map((area) => (
            <span
              key={area}
              className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.06] text-white/40 font-medium"
            >
              {area}
            </span>
          ))}
        </div>
      )}

      {/* Text */}
      <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
        {feedback.feedback_text}
      </p>

      {/* Device */}
      {feedback.device_info && (
        <p className="text-[11px] text-white/30">
          Tested on: {feedback.device_info}
        </p>
      )}

      {/* Reply actions bar */}
      <div className="flex items-center gap-3 pt-1">
        {currentUserId && onReply && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-1.5 text-[12px] text-white/35 hover:text-white/60 transition-colors"
          >
            <MessageCircle size={13} />
            Reply
          </button>
        )}
        {replies.length > 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1 text-[12px] text-white/35 hover:text-white/60 transition-colors"
          >
            {showReplies ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </button>
        )}
      </div>

      {/* Reply form */}
      <AnimatePresence>
        {showReplyForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 pt-1">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply…"
                rows={2}
                maxLength={1000}
                className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-white/20 resize-none"
              />
              <button
                onClick={handleSubmitReply}
                disabled={!replyText.trim() || sending}
                className="self-end p-2.5 rounded-lg bg-white/[0.06] text-white/50 hover:text-white hover:bg-white/[0.1] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Replies list */}
      <AnimatePresence>
        {showReplies && replies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="ml-4 pl-4 border-l border-white/[0.06] space-y-3 pt-1">
              {replies.map((reply) => (
                <div key={reply.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    {reply.user_avatar ? (
                      <img src={reply.user_avatar} alt="" className="w-4 h-4 rounded-full" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-white/10" />
                    )}
                    <span className="text-[12px] text-white/50 font-medium">{reply.user_name || "Anonymous"}</span>
                    <span className="text-[10px] text-white/25">{timeAgo(reply.created_at)}</span>
                    {currentUserId === reply.user_id && onDeleteReply && (
                      <button
                        onClick={() => onDeleteReply(reply.id)}
                        className="ml-auto p-0.5 rounded text-white/15 hover:text-red-400 transition-colors"
                        title="Delete your reply"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                  <p className="text-[13px] text-white/60 leading-relaxed whitespace-pre-wrap">
                    {reply.reply_text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
