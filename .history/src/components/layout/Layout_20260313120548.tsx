import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { isFinanceRoute, getTransitionMode, type TransitionMode } from "@/src/lib/route-utils";
import {
  TransitionOverlay,
  AnimatedPage,
  FinanceAtmosphere,
} from "@/src/components/transitions/PageTransition";

export function Layout() {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const isFinance = isFinanceRoute(location.pathname);

  /* ── Transition state ─────────────────────────────────────────────── */
  const [transition, setTransition] = useState<{
    mode: TransitionMode;
    key: number;
    active: boolean;
  }>({ mode: "normal-to-normal", key: 0, active: false });

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      const mode = getTransitionMode(prevPathRef.current, location.pathname);
      setTransition((prev) => ({ mode, key: prev.key + 1, active: true }));
      prevPathRef.current = location.pathname;

      // Scroll to top after a brief delay so the overlay masks the jump
      const timer = setTimeout(() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }), 60);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col text-white selection:bg-white/30 selection:text-white relative overflow-x-hidden">
      {/* Fixed black base */}
      <div className="fixed inset-0 bg-black -z-20" />

      {/* Finance atmosphere (fades via CSS, no framer overhead) */}
      <FinanceAtmosphere active={isFinance} />

      {/* Liquid page-transition overlay */}
      {transition.active && (
        <TransitionOverlay
          key={transition.key}
          mode={transition.mode}
          onComplete={() => setTransition((t) => ({ ...t, active: false }))}
        />
      )}

      <Navbar />

      <main className="flex-1">
        <AnimatedPage key={location.pathname}>
          <Outlet />
        </AnimatedPage>
      </main>

      <Footer />
    </div>
  );
}
