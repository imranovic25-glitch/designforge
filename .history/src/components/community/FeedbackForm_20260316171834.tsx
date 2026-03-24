import { useState } from "react";
import { Star } from "lucide-react";
import { FEEDBACK_AREAS, type FeedbackArea } from "@/src/lib/community-types";

interface FeedbackFormProps {
  onSubmit: (data: { rating: number; feedback_text: string; areas: string[]; device_info: string }) => Promise<void>;
  loading?: boolean;
  initial?: { rating: number; feedback_text: string; areas: string[]; device_info: string };
  submitLabel?: string;
}

const MIN_FEEDBACK_CHARS = 40;

export function FeedbackForm({ onSubmit, loading, initial, submitLabel }: FeedbackFormProps) {
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState(initial?.feedback_text ?? "");
  const [areas, setAreas] = useState<Set<string>>(new Set(initial?.areas ?? []));
  const [device, setDevice] = useState(initial?.device_info ?? "");

  const toggleArea = (area: string) => {
    setAreas((prev) => {
      const next = new Set(prev);
      if (next.has(area)) next.delete(area);
      else next.add(area);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!rating) return;
    const trimmed = text.trim();
    if (trimmed.length < MIN_FEEDBACK_CHARS) return;
    await onSubmit({
      rating,
      feedback_text: trimmed,
      areas: Array.from(areas),
      device_info: device.trim(),
    });
    setRating(0);
    setText("");
    setAreas(new Set());
    setDevice("");
  };

  return (
    <div className="space-y-5">
      {/* Rating */}
      <div>
        <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
          Overall Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                size={24}
                className={`transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-white/15"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Areas */}
      <div>
        <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
          What did you focus on? <span className="text-white/20">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {FEEDBACK_AREAS.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => toggleArea(area)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                areas.has(area)
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-white/[0.08] text-white/40 hover:border-white/20 hover:text-white/60"
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Text */}
      <div>
        <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
          Your Feedback
        </label>
        <div className="text-xs text-white/25 mb-2">
          Aim for: what you tried, what worked, what didn’t, and 1 suggestion. <span className="text-white/20">(min {MIN_FEEDBACK_CHARS} chars)</span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Share your honest thoughts — what worked, what didn't, and any suggestions..."
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 resize-none transition-colors"
        />
        <div className="text-right text-[11px] text-white/20 mt-1">{text.length}/2000</div>
      </div>

      {/* Device */}
      <div>
        <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
          Device / Browser <span className="text-white/20">(optional)</span>
        </label>
        <input
          type="text"
          value={device}
          onChange={(e) => setDevice(e.target.value)}
          maxLength={100}
          placeholder='e.g. iPhone 15 / Chrome on Windows'
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!rating || text.trim().length < MIN_FEEDBACK_CHARS || loading}
        className="w-full py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white text-black hover:bg-white/90"
      >
        {loading ? "Submitting…" : submitLabel ?? "Submit Feedback"}
      </button>
    </div>
  );
}
