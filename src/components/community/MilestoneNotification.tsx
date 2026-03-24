import { useEffect, useState } from "react";
import { Trophy, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const MILESTONES = [50, 100, 250, 500, 1000, 2500, 5000, 10000];
const LS_KEY = "df_milestones_acked";

function getAcknowledged(submissionId: string): number[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const map = JSON.parse(raw) as Record<string, number[]>;
    return map[submissionId] ?? [];
  } catch {
    return [];
  }
}

function acknowledge(submissionId: string, milestone: number) {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const map: Record<string, number[]> = raw ? JSON.parse(raw) : {};
    const list = map[submissionId] ?? [];
    if (!list.includes(milestone)) list.push(milestone);
    map[submissionId] = list;
    localStorage.setItem(LS_KEY, JSON.stringify(map));
  } catch {
    // silently fail
  }
}

export function MilestoneNotification({
  submissionId,
  views,
  upvotes,
  comments,
}: {
  submissionId: string;
  views: number;
  upvotes: number;
  comments: number;
}) {
  const [notification, setNotification] = useState<{ type: string; count: number; milestone: number } | null>(null);

  useEffect(() => {
    if (!submissionId) return;
    const acked = getAcknowledged(submissionId);

    // Check views milestones
    for (const m of MILESTONES) {
      if (views >= m && !acked.includes(m)) {
        setNotification({ type: "views", count: views, milestone: m });
        return;
      }
    }

    // Check upvotes milestones (at 10, 25, 50, 100, 250, 500)
    const upvoteMilestones = [10, 25, 50, 100, 250, 500];
    for (const m of upvoteMilestones) {
      const key = m + 100000; // offset to avoid collision with view milestones
      if (upvotes >= m && !acked.includes(key)) {
        setNotification({ type: "upvotes", count: upvotes, milestone: key });
        return;
      }
    }

    // Check comment milestones
    const commentMilestones = [5, 10, 25, 50, 100];
    for (const m of commentMilestones) {
      const key = m + 200000;
      if (comments >= m && !acked.includes(key)) {
        setNotification({ type: "comments", count: comments, milestone: key });
        return;
      }
    }
  }, [submissionId, views, upvotes, comments]);

  const dismiss = () => {
    if (notification) {
      acknowledge(submissionId, notification.milestone);
      setNotification(null);
    }
  };

  const label =
    notification?.type === "views"
      ? `Your app just hit ${notification.milestone} views!`
      : notification?.type === "upvotes"
      ? `Your app reached ${notification.milestone > 100000 ? notification.milestone - 100000 : notification.milestone} upvotes!`
      : notification?.type === "comments"
      ? `Your app got ${notification.milestone > 200000 ? notification.milestone - 200000 : notification.milestone} comments!`
      : "";

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="mb-6 flex items-center gap-3 px-5 py-4 rounded-xl border border-amber-500/20 bg-amber-500/10"
        >
          <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <Trophy size={18} className="text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-300">Milestone Reached!</p>
            <p className="text-xs text-amber-400/70 mt-0.5">{label}</p>
          </div>
          <button
            onClick={dismiss}
            className="p-1 rounded-md text-amber-400/50 hover:text-amber-400 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
