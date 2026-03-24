import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, ArrowUp, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { motion } from "motion/react";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { PlatformBadge } from "@/src/components/community/PlatformBadge";
import { useAuth } from "@/src/lib/auth";
import { getUserSubmissions, updateSubmissionStatus, deleteSubmission } from "@/src/lib/community-store";
import type { AppSubmission } from "@/src/lib/community-types";

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

export function MyApps() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState<AppSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin");
      return;
    }
    if (user) {
      getUserSubmissions(user.id).then((data) => {
        setApps(data);
        setLoading(false);
      });
    }
  }, [user, authLoading, navigate]);

  const handleToggleStatus = async (id: string, current: string) => {
    const newStatus = current === "active" ? "closed" : "active";
    const ok = await updateSubmissionStatus(id, newStatus as "active" | "closed");
    if (ok) {
      setApps((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus as "active" | "closed" } : a))
      );
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteSubmission(id);
    if (ok) {
      setApps((prev) => prev.filter((a) => a.id !== id));
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <div className="w-6 h-6 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="My Apps — Community"
        description="Manage your app submissions."
        canonical="/community/my-apps"
        robots="noindex, nofollow"
      />

      <div className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-6 lg:px-12 max-w-3xl">

          <Link to="/community" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 mb-8 transition-colors">
            <ArrowLeft size={16} />
            Community
          </Link>

          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">My Apps</h1>
            <Link
              to="/community/submit"
              className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/90 transition-all"
            >
              Share New App
            </Link>
          </div>

          {apps.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/30 text-lg mb-2">You haven't shared any apps yet</p>
              <p className="text-white/20 text-sm mb-6">Share your first app and start getting feedback!</p>
              <Link
                to="/community/submit"
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-white/90 transition-all"
              >
                Share Your App
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {apps.map((app, i) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/community/app/${app.id}`}
                        className="text-[15px] font-medium text-white/90 hover:text-white line-clamp-1 transition-colors"
                      >
                        {app.title}
                      </Link>

                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <PlatformBadge platform={app.platform} />
                        <span className="flex items-center gap-1 text-xs text-white/30">
                          <ArrowUp size={12} /> {app.upvotes}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-white/30">
                          <MessageSquare size={12} /> {app.feedback_count}
                        </span>
                        <span className="text-xs text-white/20">{timeAgo(app.created_at)}</span>
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${
                          app.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-white/[0.04] text-white/30"
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleToggleStatus(app.id, app.status)}
                        className="p-2 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.04] transition-all"
                        title={app.status === "active" ? "Close submissions" : "Reopen"}
                      >
                        {app.status === "active" ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="p-2 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MyApps;
