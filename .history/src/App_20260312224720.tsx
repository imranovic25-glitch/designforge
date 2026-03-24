/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Home } from "./pages/Home";
import { ToolsHub } from "./pages/ToolsHub";
import { FinanceHub } from "./pages/FinanceHub";
import { ComparisonsHub } from "./pages/ComparisonsHub";
import { GuidesHub } from "./pages/GuidesHub";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { Terms } from "./pages/Terms";
import { Disclaimer } from "./pages/Disclaimer";

// Tools
import { BackgroundRemover } from "./pages/tools/BackgroundRemover";
import { PdfCompressor } from "./pages/tools/PdfCompressor";
import { PdfMerger } from "./pages/tools/PdfMerger";
import { CurrencyConverter } from "./pages/tools/CurrencyConverter";
import { CompoundInterestCalculator } from "./pages/tools/CompoundInterestCalculator";
import { LoanEmiCalculator } from "./pages/tools/LoanEmiCalculator";

// Comparisons
import { BestCreditCards } from "./pages/comparisons/BestCreditCards";
import { BestBudgetingApps } from "./pages/comparisons/BestBudgetingApps";
import { BestInvestingApps } from "./pages/comparisons/BestInvestingApps";
import { BestSavingsAccounts } from "./pages/comparisons/BestSavingsAccounts";
import { BestResumeBuilders } from "./pages/comparisons/BestResumeBuilders";
import { BestAiWritingTools } from "./pages/comparisons/BestAiWritingTools";
import { BestAiBackgroundRemoverTools } from "./pages/comparisons/BestAiBackgroundRemoverTools";

// Guides
import { HowToRemoveImageBackground } from "./pages/guides/HowToRemoveImageBackground";
import { HowToCompressPdf } from "./pages/guides/HowToCompressPdf";
import { HowToMergePdfFiles } from "./pages/guides/HowToMergePdfFiles";
import { HowCurrencyConversionWorks } from "./pages/guides/HowCurrencyConversionWorks";
import { CompoundInterestExplained } from "./pages/guides/CompoundInterestExplained";
import { HowLoanEmiWorks } from "./pages/guides/HowLoanEmiWorks";
import { HowToCompareCreditCards } from "./pages/guides/HowToCompareCreditCards";
import { HowToChooseAResumeBuilder } from "./pages/guides/HowToChooseAResumeBuilder";
import { HowToChooseAiWritingTools } from "./pages/guides/HowToChooseAiWritingTools";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tools" element={<ToolsHub />} />
          <Route path="finance" element={<FinanceHub />} />
          <Route path="comparisons" element={<ComparisonsHub />} />
          <Route path="guides" element={<GuidesHub />} />
          
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="disclaimer" element={<Disclaimer />} />

          {/* Tools */}
          <Route path="tools/background-remover" element={<BackgroundRemover />} />
          <Route path="tools/pdf-compressor" element={<PdfCompressor />} />
          <Route path="tools/pdf-merger" element={<PdfMerger />} />
          <Route path="tools/currency-converter" element={<CurrencyConverter />} />
          <Route path="tools/compound-interest-calculator" element={<CompoundInterestCalculator />} />
          <Route path="tools/loan-emi-calculator" element={<LoanEmiCalculator />} />

          {/* Comparisons */}
          <Route path="comparisons/best-credit-cards" element={<BestCreditCards />} />
          <Route path="comparisons/best-budgeting-apps" element={<BestBudgetingApps />} />
          <Route path="comparisons/best-investing-apps" element={<BestInvestingApps />} />
          <Route path="comparisons/best-savings-accounts" element={<BestSavingsAccounts />} />
          <Route path="comparisons/best-resume-builders" element={<BestResumeBuilders />} />
          <Route path="comparisons/best-ai-writing-tools" element={<BestAiWritingTools />} />
          <Route path="comparisons/best-ai-background-remover-tools" element={<BestAiBackgroundRemoverTools />} />

          {/* Finance Comparisons (Alias routes) */}
          <Route path="finance/comparisons/best-credit-cards" element={<BestCreditCards />} />
          <Route path="finance/comparisons/best-budgeting-apps" element={<BestBudgetingApps />} />
          <Route path="finance/comparisons/best-investing-apps" element={<BestInvestingApps />} />
          <Route path="finance/comparisons/best-savings-accounts" element={<BestSavingsAccounts />} />

          {/* Guides */}
          <Route path="guides/how-to-remove-image-background" element={<HowToRemoveImageBackground />} />
          <Route path="guides/how-to-compress-pdf" element={<HowToCompressPdf />} />
          <Route path="guides/how-to-merge-pdf-files" element={<HowToMergePdfFiles />} />
          <Route path="guides/how-currency-conversion-works" element={<HowCurrencyConversionWorks />} />
          <Route path="guides/compound-interest-explained" element={<CompoundInterestExplained />} />
          <Route path="guides/how-loan-emi-works" element={<HowLoanEmiWorks />} />
          <Route path="guides/how-to-compare-credit-cards" element={<HowToCompareCreditCards />} />
          <Route path="guides/how-to-choose-a-resume-builder" element={<HowToChooseAResumeBuilder />} />
          <Route path="guides/how-to-choose-ai-writing-tools" element={<HowToChooseAiWritingTools />} />

          {/* Finance Guides (Alias routes) */}
          <Route path="finance/guides/compound-interest-explained" element={<CompoundInterestExplained />} />
          <Route path="finance/guides/how-loan-emi-works" element={<HowLoanEmiWorks />} />
          <Route path="finance/guides/how-currency-conversion-works" element={<HowCurrencyConversionWorks />} />
          <Route path="finance/guides/how-to-compare-credit-cards" element={<HowToCompareCreditCards />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
