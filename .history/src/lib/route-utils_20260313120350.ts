/**
 * Route classification utilities for page transition theming.
 *
 * Finance routes get the emerald atmosphere; everything else stays
 * on the default dark theme. The transition overlay adapts its
 * gradient palette based on the from → to classification.
 */

const FINANCE_SEGMENTS = [
  "/finance",
  "credit-cards",
  "budgeting-apps",
  "investing-apps",
  "savings-accounts",
  "compound-interest",
  "loan-emi",
  "currency-converter",
];

export function isFinanceRoute(pathname: string): boolean {
  return FINANCE_SEGMENTS.some(
    (seg) => pathname === seg || pathname.startsWith(seg + "/") || pathname.includes(seg),
  );
}

export type TransitionMode =
  | "normal-to-finance"
  | "finance-to-normal"
  | "normal-to-normal"
  | "finance-to-finance";

export function getTransitionMode(from: string, to: string): TransitionMode {
  const f = isFinanceRoute(from);
  const t = isFinanceRoute(to);
  if (!f && t) return "normal-to-finance";
  if (f && !t) return "finance-to-normal";
  if (f && t) return "finance-to-finance";
  return "normal-to-normal";
}
