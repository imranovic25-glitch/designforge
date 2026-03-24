import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { SEOHead } from "@/src/components/seo/SEOHead";

export function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <SEOHead
        title="Page Not Found — DesignForge360"
        description="The page you're looking for doesn't exist or has been moved."
        robots="noindex, nofollow"
      />
      <div className="text-center max-w-lg">
        <div className="text-[120px] md:text-[160px] font-bold leading-none tracking-tight bg-gradient-to-b from-white/20 to-white/5 bg-clip-text text-transparent select-none">
          404
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-white mt-4 mb-4">
          Page not found
        </h1>
        <p className="text-white/50 mb-10 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors"
          >
            <Home className="h-4 w-4" /> Back to Home
          </Link>
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Browse Tools
          </Link>
        </div>
      </div>
    </div>
  );
}
