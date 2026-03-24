import { Mail, MessageSquare } from "lucide-react";
import { LegalPage } from "@/src/components/layout/LegalPage";

export function Contact() {
  return (
    <LegalPage title="Contact Us">
      <p className="lead">
        Have a question, feedback, or a suggestion? We'd love to hear from you. While we're a small team, we do our best to respond to every message.
      </p>

      <h2>Get in Touch</h2>
      <p>
        The best way to contact us is by email. We typically respond within 1–3 business days.
      </p>

      <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
        <div className="glass-panel rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-medium text-white">General Inquiries</h3>
          </div>
          <p className="text-white/50 mb-4">For general questions, partnerships, or feedback about the platform.</p>
          <a href="mailto:hello@designforge360.com" className="text-white font-medium hover:text-white/70 transition-colors">hello@designforge360.com</a>
        </div>
        <div className="glass-panel rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-medium text-white">Editorial & Corrections</h3>
          </div>
          <p className="text-white/50 mb-4">Found an error in our content or want to suggest a correction?</p>
          <a href="mailto:editorial@designforge360.com" className="text-white font-medium hover:text-white/70 transition-colors">editorial@designforge360.com</a>
        </div>
      </div>

      <h2>Frequently Asked Questions</h2>
      
      <h3>Are your tools really free?</h3>
      <p>
        Yes. All tools on DesignForge360 are completely free to use, with no registration required and no file size limitations imposed on the client side.
      </p>

      <h3>Do you store my files?</h3>
      <p>
        No. All processing happens directly in your browser using client-side JavaScript. Your files are never uploaded to our servers.
      </p>

      <h3>How do you make money?</h3>
      <p>
        We may earn referral commissions when you click on certain links in our comparison articles and sign up for third-party products. This never influences our editorial rankings.
      </p>

      <h3>Can I request a new tool or guide?</h3>
      <p>
        Absolutely. We're always looking for ideas. Send your suggestion to our general inquiries email and we'll consider it for a future update.
      </p>
    </LegalPage>
  );
}
