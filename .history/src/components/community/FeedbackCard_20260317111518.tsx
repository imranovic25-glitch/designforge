import { Star, Trash2 } from "lucide-react";
import type { AppFeedback } from "@/src/lib/community-types";

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
}

export function FeedbackCard({ feedback, currentUserId, onDelete }: FeedbackCardProps) {
  const isOwner = currentUserId === feedback.user_id;

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
    </div>
  );
}
