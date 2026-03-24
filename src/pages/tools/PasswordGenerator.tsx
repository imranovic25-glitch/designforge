import { useState, useCallback } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { KeyRound, Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const faqItems = [
  {
    question: "How are passwords generated?",
    answer:
      "Passwords are generated using the browser's built-in crypto.getRandomValues() API, which provides cryptographically secure random numbers. No external servers are involved."
  },
  {
    question: "What makes a strong password?",
    answer:
      "A strong password is at least 16 characters long and combines uppercase letters, lowercase letters, numbers, and special symbols. The strength meter reflects these factors."
  },
  {
    question: "Are my passwords stored anywhere?",
    answer:
      "No. Passwords are generated entirely in your browser and never sent to any server. Close the tab and the password is gone."
  },
  {
    question: "Can I exclude ambiguous characters?",
    answer:
      "Yes. Toggle the 'Exclude ambiguous' option to remove characters like 0, O, l, 1, I that look similar in certain fonts."
  }
];

const relatedGuides = [
  { title: "How to Create Strong Passwords", path: "/guides/how-to-create-strong-passwords" },
];
const relatedComparisons = [
  { title: "Best Password Managers", path: "/comparisons/best-password-managers" },
];

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const AMBIGUOUS = "0OoIl1";

function generatePassword(
  length: number,
  useUpper: boolean,
  useLower: boolean,
  useNumbers: boolean,
  useSymbols: boolean,
  excludeAmbiguous: boolean
): string {
  let charset = "";
  if (useUpper) charset += UPPERCASE;
  if (useLower) charset += LOWERCASE;
  if (useNumbers) charset += NUMBERS;
  if (useSymbols) charset += SYMBOLS;

  if (excludeAmbiguous) {
    charset = charset
      .split("")
      .filter((c) => !AMBIGUOUS.includes(c))
      .join("");
  }

  if (!charset) return "";

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (n) => charset[n % charset.length]).join("");
}

function getStrength(password: string): { label: string; color: string; percent: number } {
  if (!password) return { label: "—", color: "bg-white/10", percent: 0 };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { label: "Weak", color: "bg-red-500", percent: 25 };
  if (score <= 3) return { label: "Fair", color: "bg-orange-500", percent: 50 };
  if (score <= 4) return { label: "Good", color: "bg-yellow-500", percent: 75 };
  return { label: "Strong", color: "bg-green-500", percent: 100 };
}

export function PasswordGenerator() {
  const [length, setLength] = useState(20);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [copied, setCopied] = useState(false);

  const [password, setPassword] = useState(() =>
    generatePassword(20, true, true, true, true, false)
  );

  const regenerate = useCallback(() => {
    setPassword(
      generatePassword(length, useUpper, useLower, useNumbers, useSymbols, excludeAmbiguous)
    );
    setCopied(false);
  }, [length, useUpper, useLower, useNumbers, useSymbols, excludeAmbiguous]);

  const handleCopy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const strength = getStrength(password);

  const toggles = [
    { label: "Uppercase (A-Z)", checked: useUpper, set: setUseUpper },
    { label: "Lowercase (a-z)", checked: useLower, set: setUseLower },
    { label: "Numbers (0-9)", checked: useNumbers, set: setUseNumbers },
    { label: "Symbols (!@#$…)", checked: useSymbols, set: setUseSymbols },
    { label: "Exclude ambiguous (0, O, l, 1…)", checked: excludeAmbiguous, set: setExcludeAmbiguous },
  ];

  return (
    <ToolLayout
      title="Password Generator"
      description="Generate cryptographically secure passwords with custom length and character sets. Nothing is stored — everything runs in your browser."
      icon={<KeyRound className="h-7 w-7" />}
      toolSlug="password-generator"
      faqItems={faqItems}
      relatedGuides={relatedGuides}
      relatedComparisons={relatedComparisons}
    >
      <SEOHead
        title="Free Password Generator — Secure Random Passwords"
        description="Generate strong, cryptographically secure passwords instantly. Customise length, characters, and symbols. Free, no sign-up, runs in your browser."
        canonical="/tools/password-generator"
        schema="WebApplication"
        appName="Password Generator"
      />

      <div className="space-y-8">
        {/* Password display */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 font-mono text-xl md:text-2xl text-white tracking-wide break-all leading-relaxed select-all">
              {password || <span className="text-white/20">Select at least one character set</span>}
            </div>
            <Button
              onClick={handleCopy}
              disabled={!password}
              variant="outline"
              className="shrink-0 rounded-full h-12 w-12 p-0 border-white/20 text-white hover:bg-white/10"
            >
              {copied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
            </Button>
          </div>

          {/* Strength meter */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                style={{ width: `${strength.percent}%` }}
              />
            </div>
            <span className="text-xs text-white/40 uppercase tracking-widest w-14 text-right">
              {strength.label}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Length slider */}
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-3">
              Length: <span className="text-white font-bold">{length}</span>
            </label>
            <input
              type="range"
              min={4}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-white/20 mt-1">
              <span>4</span>
              <span>64</span>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            {toggles.map((t) => (
              <label key={t.label} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={t.checked}
                  onChange={(e) => t.set(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 accent-amber-500"
                />
                <span className="text-sm text-white/60">{t.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={regenerate}
            className="rounded-full px-8 h-12 bg-amber-500 hover:bg-amber-400 text-black font-medium"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Generate New
          </Button>
          <Button
            onClick={handleCopy}
            disabled={!password}
            variant="outline"
            className="rounded-full px-8 h-12 border-white/20 text-white hover:bg-white/10"
          >
            {copied ? (
              <><Check className="h-4 w-4 mr-2 text-green-400" /> Copied!</>
            ) : (
              <><Copy className="h-4 w-4 mr-2" /> Copy Password</>
            )}
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}
