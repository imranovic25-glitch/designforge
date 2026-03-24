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
  const usesContainedCommunityScroll = location.pathname === "/community";

  // Community disables Lenis, but only the main feed route uses a locked body with contained columns.
  useEffect(() => {
    if (isCommunity) {
      stopLenis();
      document.body.style.overflow = usesContainedCommunityScroll ? "hidden" : "";
    } else {
      startLenis();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCommunity, usesContainedCommunityScroll]);

  const [transition, setTransition] = useState<{
    key: number;
    active: boolean;
  }>({ key: 0, active: false });

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      setTransition((prev) => ({ key: prev.key + 1, active: true }));
      prevPathRef.current = location.pathname;
      if (usesContainedCommunityScroll) return;
      if (isCommunity) {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      } else {
        scrollToTopInstant();
      }
    }
  }, [isCommunity, location.pathname, usesContainedCommunityScroll]);

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
