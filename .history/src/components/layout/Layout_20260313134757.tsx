import { Outlet, useLocation } from "react-router-dom";
import { useRef } from "react";
import { AnimatePresence } from "motion/react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { isFinanceRoute, getTransitionMode } from "@/src/lib/route-utils";
import {
  PageTransition,
  FinanceAtmosphere,
} from "@/src/components/transitions/PageTransition";

export function Layout() {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const isFinance = isFinanceRoute(location.pathname);

  /* Compute transition mode before updating the ref */
  const mode = getTransitionMode(prevPathRef.current, location.pathname);
  if (prevPathRef.current !== location.pathname) {
    prevPathRef.current = location.pathname;
  }

  return (
    <div className="flex min-h-screen flex-col text-white selection:bg-white/30 selection:text-white relative overflow-x-hidden">
      {/* Fixed black base */}
      <div className="fixed inset-0 bg-black -z-20" />

      {/* Finance atmosphere (fades via CSS, no framer overhead) */}
      <FinanceAtmosphere active={isFinance} />

      <Navbar />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname} mode={mode}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
