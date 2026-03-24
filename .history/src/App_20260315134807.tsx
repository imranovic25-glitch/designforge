/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Home } from "./pages/Home";

const ToolsHub = lazy(() => import("./pages/ToolsHub").then(m => ({ default: m.ToolsHub })));
const FinanceHub = lazy(() => import("./pages/FinanceHub").then(m => ({ default: m.FinanceHub })));
const ComparisonsHub = lazy(() => import("./pages/ComparisonsHub").then(m => ({ default: m.ComparisonsHub })));
const GuidesHub = lazy(() => import("./pages/GuidesHub").then(m => ({ default: m.GuidesHub })));
const About = lazy(() => import("./pages/About").then(m => ({ default: m.About })));
const Contact = lazy(() => import("./pages/Contact").then(m => ({ default: m.Contact })));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy").then(m => ({ default: m.PrivacyPolicy })));
const Terms = lazy(() => import("./pages/Terms").then(m => ({ default: m.Terms })));
const Disclaimer = lazy(() => import("./pages/Disclaimer").then(m => ({ default: m.Disclaimer })));
const NotFound = lazy(() => import("./pages/NotFound").then(m => ({ default: m.NotFound })));
const SignIn = lazy(() => import("./pages/SignIn").then(m => ({ default: m.SignIn })));
const Support = lazy(() => import("./pages/Support"));
const Profile = lazy(() => import("./pages/Profile").then(m => ({ default: m.Profile })));

const BackgroundRemover = lazy(() => import("./pages/tools/BackgroundRemover").then(m => ({ default: m.BackgroundRemover })));
const PdfCompressor = lazy(() => import("./pages/tools/PdfCompressor").then(m => ({ default: m.PdfCompressor })));
const PdfMerger = lazy(() => import("./pages/tools/PdfMerger").then(m => ({ default: m.PdfMerger })));
const PdfToWord = lazy(() => import("./pages/tools/PdfToWord").then(m => ({ default: m.PdfToWord })));
const CurrencyConverter = lazy(() => import("./pages/tools/CurrencyConverter").then(m => ({ default: m.CurrencyConverter })));
const CompoundInterestCalculator = lazy(() => import("./pages/tools/CompoundInterestCalculator").then(m => ({ default: m.CompoundInterestCalculator })));
const LoanEmiCalculator = lazy(() => import("./pages/tools/LoanEmiCalculator").then(m => ({ default: m.LoanEmiCalculator })));
const ResumeBuilder = lazy(() => import("./pages/tools/ResumeBuilder").then(m => ({ default: m.ResumeBuilder })));
const ImageCompressor = lazy(() => import("./pages/tools/ImageCompressor").then(m => ({ default: m.ImageCompressor })));
const ImageConverter = lazy(() => import("./pages/tools/ImageConverter").then(m => ({ default: m.ImageConverter })));
const ImageResizer = lazy(() => import("./pages/tools/ImageResizer").then(m => ({ default: m.ImageResizer })));
const WordCounter = lazy(() => import("./pages/tools/WordCounter").then(m => ({ default: m.WordCounter })));
const JsonFormatter = lazy(() => import("./pages/tools/JsonFormatter").then(m => ({ default: m.JsonFormatter })));
const ClipboardManager = lazy(() => import("./pages/tools/ClipboardManager").then(m => ({ default: m.ClipboardManager })));
const WordToPdf = lazy(() => import("./pages/tools/WordToPdf").then(m => ({ default: m.WordToPdf })));
const MarkdownPreview = lazy(() => import("./pages/tools/MarkdownPreview").then(m => ({ default: m.MarkdownPreview })));
const QrCodeGenerator = lazy(() => import("./pages/tools/QrCodeGenerator").then(m => ({ default: m.QrCodeGenerator })));
const ColorPaletteGenerator = lazy(() => import("./pages/tools/ColorPaletteGenerator").then(m => ({ default: m.ColorPaletteGenerator })));
const SvgToPng = lazy(() => import("./pages/tools/SvgToPng").then(m => ({ default: m.SvgToPng })));
const PasswordGenerator = lazy(() => import("./pages/tools/PasswordGenerator").then(m => ({ default: m.PasswordGenerator })));
const MortgageCalculator = lazy(() => import("./pages/tools/MortgageCalculator").then(m => ({ default: m.MortgageCalculator })));
const SeoAudit = lazy(() => import("./pages/tools/SeoAudit").then(m => ({ default: m.SeoAudit })));

const BestCreditCards = lazy(() => import("./pages/comparisons/BestCreditCards").then(m => ({ default: m.BestCreditCards })));
const BestBudgetingApps = lazy(() => import("./pages/comparisons/BestBudgetingApps").then(m => ({ default: m.BestBudgetingApps })));
const BestInvestingApps = lazy(() => import("./pages/comparisons/BestInvestingApps").then(m => ({ default: m.BestInvestingApps })));
const BestSavingsAccounts = lazy(() => import("./pages/comparisons/BestSavingsAccounts").then(m => ({ default: m.BestSavingsAccounts })));
const BestResumeBuilders = lazy(() => import("./pages/comparisons/BestResumeBuilders").then(m => ({ default: m.BestResumeBuilders })));
const BestAiWritingTools = lazy(() => import("./pages/comparisons/BestAiWritingTools").then(m => ({ default: m.BestAiWritingTools })));
const BestAiBackgroundRemoverTools = lazy(() => import("./pages/comparisons/BestAiBackgroundRemoverTools").then(m => ({ default: m.BestAiBackgroundRemoverTools })));
const BestImageResizerTools = lazy(() => import("./pages/comparisons/BestImageResizerTools").then(m => ({ default: m.BestImageResizerTools })));
const BestPdfConverters = lazy(() => import("./pages/comparisons/BestPdfConverters").then(m => ({ default: m.BestPdfConverters })));
const BestPdfEditors = lazy(() => import("./pages/comparisons/BestPdfEditors").then(m => ({ default: m.BestPdfEditors })));
const BestSeoAuditTools = lazy(() => import("./pages/comparisons/BestSeoAuditTools").then(m => ({ default: m.BestSeoAuditTools })));
const BestPasswordManagers = lazy(() => import("./pages/comparisons/BestPasswordManagers").then(m => ({ default: m.BestPasswordManagers })));
const BestQrCodeGenerators = lazy(() => import("./pages/comparisons/BestQrCodeGenerators").then(m => ({ default: m.BestQrCodeGenerators })));
const BestColorPaletteTools = lazy(() => import("./pages/comparisons/BestColorPaletteTools").then(m => ({ default: m.BestColorPaletteTools })));
const BestMarkdownEditors = lazy(() => import("./pages/comparisons/BestMarkdownEditors").then(m => ({ default: m.BestMarkdownEditors })));
const BestMortgageCalculators = lazy(() => import("./pages/comparisons/BestMortgageCalculators").then(m => ({ default: m.BestMortgageCalculators })));

const HowToRemoveImageBackground = lazy(() => import("./pages/guides/HowToRemoveImageBackground").then(m => ({ default: m.HowToRemoveImageBackground })));
const HowToCompressPdf = lazy(() => import("./pages/guides/HowToCompressPdf").then(m => ({ default: m.HowToCompressPdf })));
const HowToMergePdfFiles = lazy(() => import("./pages/guides/HowToMergePdfFiles").then(m => ({ default: m.HowToMergePdfFiles })));
const HowCurrencyConversionWorks = lazy(() => import("./pages/guides/HowCurrencyConversionWorks").then(m => ({ default: m.HowCurrencyConversionWorks })));
const CompoundInterestExplained = lazy(() => import("./pages/guides/CompoundInterestExplained").then(m => ({ default: m.CompoundInterestExplained })));
const HowLoanEmiWorks = lazy(() => import("./pages/guides/HowLoanEmiWorks").then(m => ({ default: m.HowLoanEmiWorks })));
const HowToCompareCreditCards = lazy(() => import("./pages/guides/HowToCompareCreditCards").then(m => ({ default: m.HowToCompareCreditCards })));
const HowToChooseAResumeBuilder = lazy(() => import("./pages/guides/HowToChooseAResumeBuilder").then(m => ({ default: m.HowToChooseAResumeBuilder })));
const HowToChooseAiWritingTools = lazy(() => import("./pages/guides/HowToChooseAiWritingTools").then(m => ({ default: m.HowToChooseAiWritingTools })));
const HowToUseSeoAnalyzer = lazy(() => import("./pages/guides/HowToUseSeoAnalyzer").then(m => ({ default: m.HowToUseSeoAnalyzer })));
const HowToWriteMarkdown = lazy(() => import("./pages/guides/HowToWriteMarkdown").then(m => ({ default: m.HowToWriteMarkdown })));
const HowToCreateStrongPasswords = lazy(() => import("./pages/guides/HowToCreateStrongPasswords").then(m => ({ default: m.HowToCreateStrongPasswords })));
const HowToUseQrCodesEffectively = lazy(() => import("./pages/guides/HowToUseQrCodesEffectively").then(m => ({ default: m.HowToUseQrCodesEffectively })));
const HowToChooseAColorPalette = lazy(() => import("./pages/guides/HowToChooseAColorPalette").then(m => ({ default: m.HowToChooseAColorPalette })));
const HowMortgageCalculatorsWork = lazy(() => import("./pages/guides/HowMortgageCalculatorsWork").then(m => ({ default: m.HowMortgageCalculatorsWork })));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-black text-white/40 text-sm">Loading…</div>}>
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
          <Route path="signin" element={<SignIn />} />
          <Route path="support" element={<Support />} />
          <Route path="profile" element={<Profile />} />

          {/* Tools */}
          <Route path="tools/background-remover" element={<BackgroundRemover />} />
          <Route path="tools/pdf-compressor" element={<PdfCompressor />} />
          <Route path="tools/pdf-merger" element={<PdfMerger />} />
          <Route path="tools/pdf-to-word" element={<PdfToWord />} />
          <Route path="tools/currency-converter" element={<CurrencyConverter />} />
          <Route path="tools/compound-interest-calculator" element={<CompoundInterestCalculator />} />
          <Route path="tools/loan-emi-calculator" element={<LoanEmiCalculator />} />
          <Route path="tools/resume-builder" element={<ResumeBuilder />} />
          <Route path="tools/image-compressor" element={<ImageCompressor />} />
          <Route path="tools/image-converter" element={<ImageConverter />} />
          <Route path="tools/image-resizer" element={<ImageResizer />} />
          <Route path="tools/word-counter" element={<WordCounter />} />
          <Route path="tools/json-formatter" element={<JsonFormatter />} />
          <Route path="tools/clipboard-manager" element={<ClipboardManager />} />
          <Route path="tools/word-to-pdf" element={<WordToPdf />} />
          <Route path="tools/markdown-preview" element={<MarkdownPreview />} />
          <Route path="tools/qr-code-generator" element={<QrCodeGenerator />} />
          <Route path="tools/color-palette-generator" element={<ColorPaletteGenerator />} />
          <Route path="tools/svg-to-png" element={<SvgToPng />} />
          <Route path="tools/password-generator" element={<PasswordGenerator />} />
          <Route path="tools/mortgage-calculator" element={<MortgageCalculator />} />
          <Route path="tools/seo-audit" element={<SeoAudit />} />

          {/* Comparisons */}
          <Route path="comparisons/best-credit-cards" element={<BestCreditCards />} />
          <Route path="comparisons/best-budgeting-apps" element={<BestBudgetingApps />} />
          <Route path="comparisons/best-investing-apps" element={<BestInvestingApps />} />
          <Route path="comparisons/best-savings-accounts" element={<BestSavingsAccounts />} />
          <Route path="comparisons/best-resume-builders" element={<BestResumeBuilders />} />
          <Route path="comparisons/best-ai-writing-tools" element={<BestAiWritingTools />} />
          <Route path="comparisons/best-ai-background-remover-tools" element={<BestAiBackgroundRemoverTools />} />
          <Route path="comparisons/best-image-resizer-tools" element={<BestImageResizerTools />} />
          <Route path="comparisons/best-pdf-converters" element={<BestPdfConverters />} />
          <Route path="comparisons/best-pdf-editors" element={<BestPdfEditors />} />
          <Route path="comparisons/best-seo-audit-tools" element={<BestSeoAuditTools />} />
          <Route path="comparisons/best-password-managers" element={<BestPasswordManagers />} />
          <Route path="comparisons/best-qr-code-generators" element={<BestQrCodeGenerators />} />
          <Route path="comparisons/best-color-palette-tools" element={<BestColorPaletteTools />} />
          <Route path="comparisons/best-markdown-editors" element={<BestMarkdownEditors />} />
          <Route path="comparisons/best-mortgage-calculators" element={<BestMortgageCalculators />} />

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
          <Route path="guides/how-to-use-seo-analyzer" element={<HowToUseSeoAnalyzer />} />
          <Route path="guides/how-to-write-markdown" element={<HowToWriteMarkdown />} />
          <Route path="guides/how-to-create-strong-passwords" element={<HowToCreateStrongPasswords />} />
          <Route path="guides/how-to-use-qr-codes-effectively" element={<HowToUseQrCodesEffectively />} />
          <Route path="guides/how-to-choose-a-color-palette" element={<HowToChooseAColorPalette />} />
          <Route path="guides/how-mortgage-calculators-work" element={<HowMortgageCalculatorsWork />} />

          {/* Finance Guides (Alias routes) */}
          <Route path="finance/guides/compound-interest-explained" element={<CompoundInterestExplained />} />
          <Route path="finance/guides/how-loan-emi-works" element={<HowLoanEmiWorks />} />
          <Route path="finance/guides/how-currency-conversion-works" element={<HowCurrencyConversionWorks />} />
          <Route path="finance/guides/how-to-compare-credit-cards" element={<HowToCompareCreditCards />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
