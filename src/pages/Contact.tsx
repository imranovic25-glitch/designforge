import { Mail, MessageSquare, MapPin, HelpCircle, Zap, FileQuestion } from "lucide-react";
import { motion } from "motion/react";
import { RevealOnScroll } from "@/src/components/ui/RevealOnScroll";
import { SEOHead } from "@/src/components/seo/SEOHead";

export function Contact() {
  const faqs = [
    { q: "Are your tools really free?", a: "Yes. All tools on DesignForge360 are completely free to use, with no registration required and no file size limitations imposed on the client side." },
    { q: "Do you store my files?", a: "No. All processing happens directly in your browser using client-side JavaScript. Your files are never uploaded to our servers." },
    { q: "How do you make money?", a: "We may earn referral commissions when you click on certain links in our comparison articles and sign up for third-party products. This never influences our editorial rankings." },
    { q: "Can I request a new tool or guide?", a: "Absolutely. We're always looking for ideas. Send your suggestion to our general inquiries email and we'll consider it for a future update." },
  ];

  return (
    <div className="min-h-screen bg-black pt-32 pb-24 selection:bg-sky-300/30 selection:text-white">
      <SEOHead
        title="Contact DesignForge360"
        description="Get in touch with the DesignForge360 team. We welcome feedback, partnership enquiries, and bug reports."
        canonical="/contact"
        robots="noindex, nofollow"
      />
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">

        {/* Hero */}
        <RevealOnScroll className="max-w-3xl mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-500/20 bg-sky-500/5 text-sky-400 text-xs font-medium uppercase tracking-widest mb-8">
            Get In Touch
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold text-white tracking-tight mb-8 leading-[1.1]">
            We'd love to <span className="text-sky-400">hear from you</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/50 font-light leading-relaxed">
            Have a question, feedback, or a suggestion? While we're a small team, we do our best to respond to every message within 1–3 business days.
          </p>
        </RevealOnScroll>

        {/* Contact cards */}
        <section className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Mail className="h-6 w-6" />, title: "General Inquiries", desc: "For general questions, partnerships, or feedback about the platform.", email: "motionbox96@gmail.com", color: "sky" },
              { icon: <MessageSquare className="h-6 w-6" />, title: "Editorial & Corrections", desc: "Found an error in our content or want to suggest a correction?", email: "motionbox96@gmail.com", color: "violet" },
              { icon: <MapPin className="h-6 w-6" />, title: "Our Location", desc: "DesignForge360 is an online platform based in India. For all enquiries, use email.", email: null, color: "emerald" },
            ].map((card, i) => {
              const colorClasses: Record<string, { icon: string; hover: string; glow: string }> = {
                sky: { icon: "bg-sky-500/10 text-sky-400/70 group-hover:bg-sky-500/20 group-hover:text-sky-400", hover: "hover:bg-sky-500/[0.03] hover:border-sky-500/20", glow: "rgba(56,189,248,0.15)" },
                violet: { icon: "bg-violet-500/10 text-violet-400/70 group-hover:bg-violet-500/20 group-hover:text-violet-400", hover: "hover:bg-violet-500/[0.03] hover:border-violet-500/20", glow: "rgba(139,92,246,0.15)" },
                emerald: { icon: "bg-emerald-500/10 text-emerald-400/70 group-hover:bg-emerald-500/20 group-hover:text-emerald-400", hover: "hover:bg-emerald-500/[0.03] hover:border-emerald-500/20", glow: "rgba(16,185,129,0.15)" },
              };
              const c = colorClasses[card.color];
              return (
                <RevealOnScroll key={card.title} delay={i * 0.08} className="h-full">
                  <div className={`group glass-panel rounded-3xl overflow-hidden flex flex-col h-full transition-all duration-500 hover:-translate-y-2 ${c.hover}`}>
                    {/* Visual top */}
                    <div className="h-32 relative overflow-hidden" style={{ background: "linear-gradient(160deg,#0a0a0a,#0a0a0a)" }}>
                      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none" style={{ background: `radial-gradient(ellipse,${c.glow} 0%,transparent 70%)`, filter: "blur(24px)" }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                          className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${c.icon}`}>
                          {card.icon}
                        </motion.div>
                      </div>
                    </div>
                    {/* Content */}
                    <div className="p-8 flex-1 flex flex-col">
                      <h3 className="text-xl font-medium text-white mb-3">{card.title}</h3>
                      <p className="text-white/50 font-light leading-relaxed mb-6 flex-1">{card.desc}</p>
                      {card.email && (
                        <a href={`mailto:${card.email}`} className="text-sm font-medium text-white hover:text-white/70 transition-colors underline underline-offset-4">
                          {card.email}
                        </a>
                      )}
                      {!card.email && (
                        <span className="text-sm font-medium text-emerald-400/60">India</span>
                      )}
                    </div>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-32">
          <RevealOnScroll className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="h-5 w-5 text-sky-400/60" />
              <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">Frequently Asked Questions</h2>
            </div>
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, i) => (
              <RevealOnScroll key={i} delay={Math.min(i * 0.06, 0.25)} className="h-full">
                <div className="group glass-panel rounded-3xl p-8 flex flex-col h-full transition-all duration-500 hover:-translate-y-1 hover:bg-sky-500/[0.02]">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400/60 shrink-0 mt-0.5">
                      <FileQuestion className="h-4 w-4" />
                    </div>
                    <h3 className="text-lg font-medium text-white">{faq.q}</h3>
                  </div>
                  <p className="text-white/50 font-light leading-relaxed pl-12">{faq.a}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <RevealOnScroll>
          <div className="glass-panel rounded-3xl p-10 md:p-16 text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Zap className="h-5 w-5 text-sky-400" />
              <span className="text-xs font-medium text-sky-400/60 uppercase tracking-widest">Quick Response</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4">Still have questions?</h2>
            <p className="text-lg text-white/50 font-light leading-relaxed mb-8">
              Drop us an email and we'll get back to you as soon as possible.
            </p>
            <a href="mailto:motionbox96@gmail.com"
              className="inline-flex items-center justify-center px-10 py-5 text-base font-medium text-black bg-white rounded-full hover:scale-105 transition-transform">
              <Mail className="mr-2 h-4 w-4" /> Email Us
            </a>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}
