import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { isFinanceRoute } from "@/src/lib/route-utils";
import {
  TransitionOverlay,
  FinanceAtmosphere,
} from "@/src/components/transitions/PageTransition";
import { useLenis, scrollToTopInstant, stopLenis, startLenis } from "@/src/lib/useLenis";
import { DonationPopup } from "@/src/components/ui/DonationPopup";

export function Layout() {
  // Initialise global Lenis smooth scroll — runs for the lifetime of the app
  useLenis();
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const isFinance = isFinanceRoute(location.pathname);
  const isCommunity = location.pathname.startsWith("/community");

  // Stop Lenis on community pages — they use their own contained scroll columns.
  // Lenis intercepting wheel events causes jitter/jumping on those pages.
  useEffect(() => {
    if (isCommunity) {
      stopLenis();
    } else {
      startLenis();
    }
  }, [isCommunity]);

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

      {/* Premium diagonal grid transition — all routes */}
      {transition.active && (
        <TransitionOverlay
          key={transition.key}
          onComplete={() => setTransition((t) => ({ ...t, active: false }))}
        />
      )}

      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      {!isCommunity && <Footer />}
      <DonationPopup />
    </div>
  );
}
