import { LegalPage } from "@/src/components/layout/LegalPage";

export function Disclaimer() {
  return (
    <LegalPage title="Disclaimer" lastUpdated="March 1, 2026">
      <p className="lead">
        The information provided on DesignForge360 is for general informational and educational purposes only. By using this site, you acknowledge and agree to the following disclaimers.
      </p>

      <h2>1. No Financial Advice</h2>
      <p>
        The financial tools, calculators, guides, and comparison articles on this site are provided for informational and educational purposes only. They do not constitute financial advice, investment advice, tax advice, or any other form of professional financial consultation.
      </p>
      <p>
        Always consult with a qualified and licensed financial advisor, accountant, or tax professional before making any financial decisions. Results shown by our calculators are estimates based on the inputs provided and should not be considered guarantees.
      </p>

      <h2>2. Accuracy of Information</h2>
      <p>
        While we strive to provide accurate, up-to-date information, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of any information, products, services, or related graphics contained on the website.
      </p>
      <p>
        Financial products, interest rates, credit cards, apps, and other services change frequently. Comparison articles may not reflect the current offerings, rates, or availability of the products described. Always verify details directly with the provider before making a decision.
      </p>

      <h2>3. Affiliate Disclosure</h2>
      <p>
        Some links on DesignForge360 are affiliate links. This means that if you click on a link and sign up for or purchase a product or service, we may receive a commission at no extra cost to you. This helps us fund the development and maintenance of our free tools and content.
      </p>
      <p>
        Our editorial content and rankings are not influenced by affiliate relationships. We only recommend products and services we believe provide genuine value to our readers.
      </p>

      <h2>4. External Links</h2>
      <p>
        Our site may contain links to external websites. These links are provided for your convenience. We have no control over the content of external sites and accept no responsibility for them or for any loss or damage that may arise from your use of them.
      </p>

      <h2>5. Tool Results</h2>
      <p>
        The output of our tools — including compressed PDFs, merged documents, background-removed images, and financial calculations — is provided without warranty. We recommend verifying critical results independently and keeping backups of original files before processing.
      </p>
    </LegalPage>
  );
}
