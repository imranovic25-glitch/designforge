import { ArticleLayout } from "@/src/components/layout/ArticleLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";

export function HowMortgageCalculatorsWork() {
  return (
    <ArticleLayout
      title="How Mortgage Calculators Work"
      description="Understand the maths behind mortgage payments — principal, interest, amortisation schedules, and how to use a calculator to plan your home purchase."
      category="Finance"
      author="DesignForge360 Editorial"
      date="April 5, 2026"
      readTime="6 min read"
      breadcrumbs={[
        { label: "Guides", href: "/guides" },
        { label: "How Mortgage Calculators Work" },
      ]}
    >
      <SEOHead
        title="How Mortgage Calculators Work — Finance Guide (2026)"
        description="Learn how mortgage calculators compute monthly payments, interest costs, and amortisation schedules. Understand the formulas behind home loan calculations."
        canonical="/guides/how-mortgage-calculators-work"
        schema="Article"
        ogType="article"
        articlePublishedTime="2026-04-05"
        articleSection="Guides"
      />

      <p>
        A mortgage calculator turns three inputs — loan amount, interest rate, and term — into a monthly payment figure. Understanding how it works helps you make better decisions about down payments, loan terms, and refinancing.
      </p>

      <h2>The Core Formula</h2>
      <p>
        Most mortgages use fixed equal monthly payments calculated with the annuity formula:
      </p>
      <p className="bg-white/5 rounded-lg p-4 font-mono text-sm">
        M = P × [r(1+r)^n] / [(1+r)^n – 1]
      </p>
      <p>
        Where <strong>M</strong> is the monthly payment, <strong>P</strong> is the loan principal, <strong>r</strong> is the monthly interest rate (annual rate ÷ 12), and <strong>n</strong> is the total number of monthly payments (years × 12).
      </p>

      <h2>Breaking Down a Payment</h2>
      <p>
        Each monthly payment is split between interest and principal repayment. In early years, most of the payment goes to interest. Over time, the balance shifts — more goes toward principal. This is called amortisation.
      </p>

      <h2>How Down Payment Affects Costs</h2>
      <p>
        A larger down payment reduces the loan principal, which lowers both the monthly payment and total interest paid over the life of the loan. Putting down 20% or more also typically eliminates the need for private mortgage insurance (PMI).
      </p>

      <h2>15-Year vs 30-Year Mortgages</h2>
      <ul>
        <li><strong>30-year:</strong> Lower monthly payments but significantly more total interest. Better for cash flow flexibility</li>
        <li><strong>15-year:</strong> Higher monthly payments but builds equity faster and costs far less in total interest</li>
      </ul>
      <p>
        On a $300,000 loan at 6.5%, a 30-year mortgage costs about $1,896/month with ~$382,600 in total interest. A 15-year mortgage costs $2,613/month but only ~$170,400 in total interest — a savings of over $212,000.
      </p>

      <h2>Fixed vs Variable Rates</h2>
      <p>
        Fixed-rate mortgages lock your interest rate for the entire term — predictable payments, no surprises. Adjustable-rate mortgages (ARMs) offer a lower initial rate that resets periodically. ARMs can save money if you plan to sell or refinance within the initial fixed period.
      </p>

      <h2>What Calculators Don't Include</h2>
      <p>
        Most basic calculators show principal and interest only. Your actual monthly housing cost also includes:
      </p>
      <ul>
        <li>Property taxes (varies widely by location)</li>
        <li>Homeowner's insurance</li>
        <li>Private mortgage insurance (PMI) if down payment is below 20%</li>
        <li>HOA fees for condos or planned communities</li>
      </ul>

      <h2>Try It Yourself</h2>
      <p>
        Use our <a href="/tools/mortgage-calculator">Mortgage Calculator</a> to model different scenarios — adjust loan amount, rate, and term to see how each factor impacts your monthly payment and total cost.
      </p>

      <p className="text-white/40 text-sm italic">
        Plan your home purchase with our free <a href="/tools/mortgage-calculator">Mortgage Calculator</a> — no signup required.
      </p>
    </ArticleLayout>
  );
}
