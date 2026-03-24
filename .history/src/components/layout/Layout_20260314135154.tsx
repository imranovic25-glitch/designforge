import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { isFinanceRoute } from "@/src/lib/route-utils";
import {
  TransitionOverlay,
  FinanceAtmosphere,
} from "@/src/components/transitions/PageTransition";
import { useLenis, scrollToTopInstant } from "@/src/lib/useLenis";

export function Layout() {
  // Initialise global Lenis smooth scroll — runs for the lifetime of the app
  useLenis();
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const isFinance = isFinanceRoute(location.pathname);

  const [transition, setTransition] = useState<{
    key: number;
    active: boolean;
  }>({ key: 0, active: false });

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      setTransition((prev) => ({ key: prev.key + 1, active: true }));
      prevPathRef.current = location.pathname;
      // Reset Lenis' internal position — window.scrollTo() alone is ignored by Lenis
      scrollToTopInstant();
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col text-white selection:bg-white/30 selection:text-white relative overflow-x-hidden">
      {/* Fixed black base */}
      <div className="fixed inset-0 bg-black -z-20" />

      {/* Finance atmosphere (fades via CSS, no framer overhead) */}
      <FinanceAtmosphere active={isFinance} />

      {/* Premium transition — grid tiles or liquid blob per route */}
      {transition.active && (
        <TransitionOverlay
          key={transition.key}
          onComplete={() => setTransition((t) => ({ ...t, active: false }))}
          variant={isFinance ? "blob" : "grid"}
        />
      )}

      <Navbar />

      <main className="flex-1">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Outlet />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
