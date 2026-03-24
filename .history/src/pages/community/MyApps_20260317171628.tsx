import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, ArrowUp, Trash2, ToggleLeft, ToggleRight, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { PlatformBadge } from "@/src/components/community/PlatformBadge";
import { CommunitySidebar } from "@/src/components/community/CommunitySidebar";
import { useAuth } from "@/src/lib/auth";
import { getUserSubmissions, updateSubmissionStatus, deleteSubmission, updateSubmission } from "@/src/lib/community-store";
import type { AppSubmission } from "@/src/lib/community-types";
import { PLATFORM_LABELS, CATEGORY_LABELS, LISTING_TYPE_LABELS } from "@/src/lib/community-types";
import type { Platform, AppCategory, ListingType } from "@/src/lib/community-types";

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

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingApp, setEditingApp] = useState<AppSubmission | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const handleDelete = async (id: string) => {
    const ok = await deleteSubmission(id);
    if (ok) {
      setApps((prev) => prev.filter((a) => a.id !== id));
    }
    setDeleteConfirmId(null);
  };

  const openEdit = (app: AppSubmission) => {
    setEditingApp(app);
    setEditTitle(app.title);
    setEditDesc(app.description);
    setEditUrl(app.app_url);
  };

  const handleEditSave = async () => {
    if (!editingApp) return;
    setEditSaving(true);
    const ok = await updateSubmission(editingApp.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      app_url: editUrl.trim(),
    });
    setEditSaving(false);
    if (ok) {
      setApps((prev) =>
        prev.map((a) =>
          a.id === editingApp.id
            ? { ...a, title: editTitle.trim(), description: editDesc.trim(), app_url: editUrl.trim() }
            : a
        )
      );
      setEditingApp(null);
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
        title="My Apps — Manage Submissions"
        description="Manage your app submissions on the DesignForge360 community."
        canonical="/community/my-apps"
        robots="noindex, nofollow"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Community", url: "/community" },
          { name: "My Apps", url: "/community/my-apps" },
        ]}
      />

      <div className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-6 max-w-[1200px]">
          <div className="flex gap-6">
            <CommunitySidebar />
            <main className="flex-1 min-w-0">

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
                        onClick={() => openEdit(app)}
                        className="p-2 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.04] transition-all"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(app.id, app.status)}
                        className="p-2 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.04] transition-all"
                        title={app.status === "active" ? "Close submissions" : "Reopen"}
                      >
                        {app.status === "active" ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(app.id)}
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
          {/* Delete confirmation dialog */}
          <AnimatePresence>
            {deleteConfirmId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                onClick={() => setDeleteConfirmId(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-[#111] border border-white/10 rounded-2xl p-6 max-w-sm mx-4 space-y-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-semibold text-white">Delete this listing?</h3>
                  <p className="text-sm text-white/40">This action cannot be undone. All feedback on this listing will also be removed.</p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-4 py-2 text-sm text-white/50 hover:text-white/80 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(deleteConfirmId)}
                      className="px-4 py-2 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit submission dialog */}
          <AnimatePresence>
            {editingApp && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                onClick={() => setEditingApp(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-[#111] border border-white/10 rounded-2xl p-6 max-w-lg w-full mx-4 space-y-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-semibold text-white">Edit Listing</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-white/30 mb-1">Name</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        maxLength={120}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-white/20 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/30 mb-1">URL</label>
                      <input
                        type="url"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-white/20 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/30 mb-1">Description</label>
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={4}
                        maxLength={2000}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/80 focus:outline-none focus:border-white/20 resize-none transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setEditingApp(null)}
                      className="px-4 py-2 text-sm text-white/50 hover:text-white/80 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEditSave}
                      disabled={editSaving || editTitle.trim().length < 3}
                      className="px-4 py-2 text-sm bg-white text-black rounded-xl hover:bg-white/90 transition-colors disabled:opacity-30"
                    >
                      {editSaving ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export default MyApps;
