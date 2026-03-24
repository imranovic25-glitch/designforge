import { Heart, Coffee, ExternalLink, Star, Zap, Shield } from "lucide-react";
import { motion } from "motion/react";
import { SEOHead } from "@/src/components/seo/SEOHead";

const reasons = [
  { icon: Zap, title: "Keep Tools Free", description: "Your support helps us maintain and improve all tools at zero cost for everyone." },
  { icon: Shield, title: "No Ads, No Tracking", description: "We believe in a clean experience — your support makes that sustainable." },
  { icon: Star, title: "New Features", description: "Funding allows us to develop new tools and features the community requests." },
];

export default function Support() {
  return (
    <>
      <SEOHead
        title="Support Us | DesignForge360"
        description="Love our free tools? Support DesignForge360 to help us keep building and improving browser-based tools for everyone."
        url="https://designforge360.com/support"
      />

      <div className="min-h-screen pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mx-auto mb-6">
              <Heart className="text-pink-400" size={28} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
              Support DesignForge360
            </h1>
            <p className="text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
              Our tools are free for everyone. If they've saved you time or helped your work, consider supporting us.
            </p>
          </motion.div>

          {/* Ko-fi Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel rounded-2xl p-8 text-center mb-12"
          >
            <Coffee className="mx-auto mb-4 text-amber-400" size={32} />
            <h2 className="text-xl font-semibold text-white mb-2">Buy us a coffee</h2>
            <p className="text-white/40 text-sm mb-6">
              Support via Ko-fi — no account needed, starting at $3.
            </p>
            <a
              href="https://ko-fi.com/designforge360"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#FF5E5B] text-white font-semibold rounded-xl hover:bg-[#ff4744] transition-colors text-sm"
            >
              <Coffee size={18} />
              Support on Ko-fi
              <ExternalLink size={14} />
            </a>
          </motion.div>

          {/* Why support */}
          <div className="grid gap-4 sm:grid-cols-3 mb-16">
            {reasons.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                className="glass-panel rounded-2xl p-6 text-center"
              >
                <r.icon className="mx-auto mb-3 text-white/50" size={22} />
                <h3 className="text-sm font-medium text-white mb-1">{r.title}</h3>
                <p className="text-xs text-white/35 leading-relaxed">{r.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Thank you */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <p className="text-white/25 text-sm">
              Every bit of support counts. Thank you for being part of our journey. <Heart className="inline w-3.5 h-3.5 text-pink-400/60" />
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
