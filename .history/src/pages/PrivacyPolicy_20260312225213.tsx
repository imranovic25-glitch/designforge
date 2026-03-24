import { LegalPage } from "@/src/components/layout/LegalPage";

export function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="March 1, 2026">
      <p className="lead">
        At DesignForge360, we take your privacy seriously. This policy explains what data we collect, how we use it, and what rights you have.
      </p>

      <h2>1. Information We Collect</h2>
      <p>
        We collect minimal information necessary to provide our services:
      </p>
      <ul>
        <li><strong>Usage Data:</strong> Pages visited, time spent, browser type, and device information collected via anonymous analytics.</li>
        <li><strong>Contact Data:</strong> If you contact us by email, we retain your email address and message content.</li>
        <li><strong>Cookies:</strong> We use essential cookies for site functionality and analytics cookies to understand how our site is used. You can opt out of analytics cookies at any time.</li>
      </ul>

      <h2>2. How Your Files Are Processed</h2>
      <p>
        All file processing tools (Background Remover, PDF Compressor, PDF Merger) operate entirely in your browser using client-side JavaScript and WebAssembly. Your files are <strong>never uploaded to our servers</strong>. We have no access to your documents or images.
      </p>

      <h2>3. Financial Data</h2>
      <p>
        All financial calculations (compound interest, loan EMI, currency conversion inputs) are performed locally in your browser. We do not store any financial data you enter into our tools.
      </p>
      <p>
        Currency exchange rates are fetched from a third-party API (ExchangeRate-API). While your converter inputs are not logged, your IP address may appear in that API's access logs.
      </p>

      <h2>4. Third-Party Services</h2>
      <p>
        We use the following third-party services which may have access to limited data:
      </p>
      <ul>
        <li><strong>Analytics:</strong> Anonymous usage statistics to understand site performance.</li>
        <li><strong>ExchangeRate-API:</strong> Provides live currency exchange rates.</li>
        <li><strong>Affiliate Networks:</strong> When you click on affiliate links in our comparison content, the destination site may track your interaction per their own privacy policy.</li>
      </ul>

      <h2>5. Your Rights</h2>
      <p>
        Depending on your location, you may have the right to access, correct, or delete personal data we hold about you. Since we collect very limited data, most users have no personal data stored on our systems. To exercise any rights, contact us at privacy@designforge360.com.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this policy from time to time. Any significant changes will be reflected in the "Last Updated" date at the top of this page. Continued use of the site after changes constitutes acceptance of the updated policy.
      </p>
    </LegalPage>
  );
}
