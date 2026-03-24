import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function Layout() {
  const { pathname } = useLocation();
  const [isFinance, setIsFinance] = useState(false);

  useEffect(() => {
    const finance = pathname.startsWith("/finance") ||
      pathname.includes("credit-cards") ||
      pathname.includes("budgeting-apps") ||
      pathname.includes("investing-apps") ||
      pathname.includes("savings-accounts") ||
      pathname.includes("compound-interest") ||
      pathname.includes("loan-emi") ||
      pathname.includes("currency-converter");
    setIsFinance(finance);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col text-white selection:bg-white/30 selection:text-white relative overflow-x-hidden">
      {/* Base black background */}
      <div className="fixed inset-0 bg-black transition-colors duration-700 -z-20" />

      {/* Green finance glow layer — animates in/out */}
      <div
        className={`fixed inset-0 -z-10 transition-opacity duration-700 ease-in-out ${isFinance ? "opacity-100" : "opacity-0"}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-black to-emerald-950/40" />
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full bg-emerald-600/10 blur-[160px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-teal-600/8 blur-[140px] animate-pulse-slow delay-1000" />
      </div>

      {/* Flowing wave overlay that fades during finance route transition */}
      <div
        className={`fixed inset-0 -z-10 pointer-events-none transition-opacity duration-1000 ease-in-out ${isFinance ? "opacity-100" : "opacity-0"}`}
        style={{
          background: "linear-gradient(160deg, transparent 30%, rgba(16,185,129,0.04) 50%, transparent 70%)",
          backgroundSize: "200% 200%",
          animation: isFinance ? "flowGradient 8s ease-in-out infinite" : "none",
        }}
      />

      <Navbar />
      <main className="flex-1 animate-page-in">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
