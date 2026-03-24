import { LegalPage } from "@/src/components/layout/LegalPage";

export function Terms() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="March 1, 2026">
      <p className="lead">
        By accessing or using DesignForge360, you agree to be bound by these Terms of Service. Please read them carefully.
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        These Terms of Service ("Terms") govern your access to and use of DesignForge360 ("we," "us," or "our"), including our website, tools, calculators, and editorial content. By using our services, you agree to these Terms.
      </p>

      <h2>2. Use of Our Services</h2>
      <p>You agree to use our services only for lawful purposes and in accordance with these Terms. You agree not to:</p>
      <ul>
        <li>Attempt to gain unauthorized access to any part of our platform or infrastructure</li>
        <li>Use automated scraping tools to extract content from the site at scale</li>
        <li>Reproduce or republish our original editorial content without explicit written permission</li>
        <li>Use our tools for any illegal purpose, including processing materials you do not have rights to</li>
      </ul>

      <h2>3. Intellectual Property</h2>
      <p>
        The website design, code, original editorial content, guides, and comparison articles are the intellectual property of DesignForge360. You may not copy, reproduce, or redistribute this content without express written permission.
      </p>
      <p>
        Files you process using our tools remain your property. We make no claim to any content you upload or process using our utilities.
      </p>

      <h2>4. Disclaimer of Warranties</h2>
      <p>
        Our services are provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that our tools will be error-free, uninterrupted, or produce specific results.
      </p>

      <h2>5. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, DesignForge360 and its contributors shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our services.
      </p>

      <h2>6. Financial Content</h2>
      <p>
        All financial tools, calculators, guides, and comparison articles are provided for informational and educational purposes only. Nothing on this site constitutes financial, investment, tax, or legal advice. Always consult with a qualified professional before making financial decisions.
      </p>

      <h2>7. Changes to Terms</h2>
      <p>
        We reserve the right to modify these Terms at any time. Changes will be effective upon posting to this page. Your continued use of the site after changes constitutes your acceptance of the revised Terms.
      </p>
    </LegalPage>
  );
}
