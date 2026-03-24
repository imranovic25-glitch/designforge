import { LegalPage } from "@/src/components/layout/LegalPage";

export function About() {
  return (
    <LegalPage title="About DesignForge360">
      <h2>Our Mission</h2>
      <p>
        DesignForge360 was built on a single belief: that professional-grade tools and financial clarity should be accessible to everyone, not just those who can afford expensive software subscriptions or financial advisors.
      </p>
      <p>
        We are a small team of designers, developers, and financial enthusiasts who got tired of the bloated, ad-filled, and privacy-invasive tools available online. So we built better ones.
      </p>

      <h2>What We Offer</h2>
      <p>
        Our platform brings together three categories of resources:
      </p>
      <ul>
        <li>
          <strong>Practical Tools:</strong> A focused suite of image processing and PDF utilities that work entirely in your browser. No file uploads to our servers. No privacy concerns.
        </li>
        <li>
          <strong>Financial Calculators:</strong> Built for clarity and accuracy, our finance tools help you understand compound growth, loan repayment structures, and real-time currency conversions.
        </li>
        <li>
          <strong>Editorial Content:</strong> Independent comparisons and guides written to educate, not to blindly promote. We explain how products work before we tell you which ones are good.
        </li>
      </ul>

      <h2>Our Approach to Privacy</h2>
      <p>
        We take privacy seriously. Our browser-based tools process files locally on your device. We never store your documents, images, or financial inputs on our servers. What happens in your browser, stays in your browser.
      </p>

      <h2>Editorial Independence</h2>
      <p>
        Our comparison and guide content is written for informational purposes. While some links on our site may generate referral commissions, our editorial rankings and recommendations are not influenced by these arrangements. We always prioritize what genuinely serves our readers.
      </p>

      <h2>Contact Us</h2>
      <p>
        Have a question, suggestion, or want to report an issue? We'd love to hear from you. Visit our <a href="/contact">Contact page</a> to get in touch.
      </p>
    </LegalPage>
  );
}
