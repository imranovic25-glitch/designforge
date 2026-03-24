import { useParams, Link } from "react-router-dom";
import { useCallback, useState } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { KeyRound, ArrowRight, Copy, Check, RefreshCw, Shield } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { findProgrammaticPage, getRelatedPages } from "@/src/lib/programmatic-seo";

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
    charset = charset.split("").filter((c) => !AMBIGUOUS.includes(c)).join("");
  }
  if (!charset) return "";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (n) => charset[n % charset.length]).join("");
}

export function PasswordPreset() {
  const { slug } = useParams<{ slug: string }>();
  const page = findProgrammaticPage(slug ?? "");

  if (!page || page.cluster !== "password-generator") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/50">Page not found</p>
      </div>
    );
  }

  const related = getRelatedPages(page);
  const presetLength = page.preset.length as number;
  const useUpper = page.preset.useUpper as boolean;
  const useLower = page.preset.useLower as boolean;
  const useNumbers = page.preset.useNumbers as boolean;
  const useSymbols = page.preset.useSymbols as boolean;
  const excludeAmbiguous = page.preset.excludeAmbiguous as boolean;

  const [password, setPassword] = useState(() =>
    generatePassword(presetLength, useUpper, useLower, useNumbers, useSymbols, excludeAmbiguous)
  );
  const [copied, setCopied] = useState(false);

  const regenerate = useCallback(() => {
    setPassword(generatePassword(presetLength, useUpper, useLower, useNumbers, useSymbols, excludeAmbiguous));
    setCopied(false);
  }, [presetLength, useUpper, useLower, useNumbers, useSymbols, excludeAmbiguous]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [password]);

  // Describe which character types are included
  const types: string[] = [];
  if (useUpper) types.push("uppercase");
  if (useLower) types.push("lowercase");
  if (useNumbers) types.push("numbers");
  if (useSymbols) types.push("symbols");

  return (
    <ToolLayout
      title={page.h1}
      description={page.description}
      icon={<KeyRound className="h-7 w-7" />}
      toolSlug={page.slug}
      faqItems={page.faq}
      relatedGuides={[]}
      relatedComparisons={[]}
    >
      <SEOHead
        title={page.title}
        description={page.description}
        canonical={`/tools/${page.slug}`}
        schema="WebApplication"
        appName="Password Generator"
        faqItems={page.faq}
      />

      <div className="space-y-10">
        {/* Intro */}
        <div className="prose prose-invert max-w-none">
          <p className="text-white/70 text-base leading-relaxed">{page.intro}</p>
        </div>

        {/* Live generated password */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h2 className="text-white text-lg font-semibold">Your Generated Password</h2>
          <div className="bg-black/30 rounded-xl p-4 font-mono text-lg text-white break-all tracking-wider text-center select-all">
            {password}
          </div>
          <div className="flex justify-center gap-3">
            <Button onClick={copyToClipboard} className="rounded-full px-6 h-10 gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button variant="outline" onClick={regenerate} className="rounded-full px-6 h-10 gap-2 border-white/20 text-white hover:bg-white/10">
              <RefreshCw className="h-4 w-4" /> Regenerate
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-white/30">
            <Shield className="h-3 w-3" />
            <span>{presetLength} characters · {types.join(" + ")} · cryptographically random</span>
          </div>
        </div>

        {/* Strength info */}
        <div className="glass-panel rounded-2xl p-6 space-y-3">
          <h2 className="text-white text-lg font-semibold">Password Specs</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{presetLength}</div>
              <div className="text-xs text-white/40 mt-1">Characters</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{types.length}</div>
              <div className="text-xs text-white/40 mt-1">Character Types</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">Strong</div>
              <div className="text-xs text-white/40 mt-1">Strength Rating</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">Billions+</div>
              <div className="text-xs text-white/40 mt-1">Years to Crack</div>
            </div>
          </div>
        </div>

        {/* CTA to full tool */}
        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          <Link to="/tools/password-generator">
            <Button variant="outline" className="rounded-full px-8 h-12 gap-3 border-white/20 text-white hover:bg-white/10">
              <KeyRound className="h-5 w-5" />
              Customize in Full Generator
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="text-white/30 text-sm">Adjust length, character types, and more</p>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-white text-lg font-semibold">Related Password Tools</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/tools/${r.slug}`}
                  className="glass-panel rounded-xl px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors group"
                >
                  <KeyRound className="h-4 w-4 text-white/30 group-hover:text-white/60 transition-colors shrink-0" />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">{r.h1}</span>
                  <ArrowRight className="h-3 w-3 ml-auto text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="text-center pt-4">
          <Link to="/tools/password-generator" className="text-sm text-white/40 hover:text-white/70 transition-colors underline underline-offset-4">
            Open full Password Generator →
          </Link>
        </div>
      </div>
    </ToolLayout>
  );
}
