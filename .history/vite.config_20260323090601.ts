import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import sitemap from 'vite-plugin-sitemap';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const buildId = new Date().toISOString().replace(/[-:.TZ]/g, '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'inject-build-id',
        transformIndexHtml(html) {
          return html.replace(/%BUILD_ID%/g, buildId);
        },
      },
      sitemap({
        hostname: 'https://designforge360.in',
        dynamicRoutes: [
          '/',
          '/tools',
          '/finance',
          '/comparisons',
          '/guides',
          '/about',
          '/contact',
          '/privacy-policy',
          '/terms',
          '/disclaimer',
          '/support',
          // Tools
          '/tools/background-remover',
          '/tools/pdf-compressor',
          '/tools/pdf-merger',
          '/tools/pdf-to-word',
          '/tools/currency-converter',
          '/tools/compound-interest-calculator',
          '/tools/loan-emi-calculator',
          '/tools/resume-builder',
          '/tools/image-compressor',
          '/tools/image-converter',
          '/tools/image-resizer',
          '/tools/word-counter',
          '/tools/json-formatter',
          '/tools/clipboard-manager',
          '/tools/word-to-pdf',
          '/tools/markdown-preview',
          '/tools/qr-code-generator',
          '/tools/color-palette-generator',
          '/tools/svg-to-png',
          '/tools/password-generator',
          '/tools/mortgage-calculator',
          '/tools/seo-audit',
          // Comparisons
          '/comparisons/best-credit-cards',
          '/comparisons/best-budgeting-apps',
          '/comparisons/best-investing-apps',
          '/comparisons/best-savings-accounts',
          '/comparisons/best-resume-builders',
          '/comparisons/best-ai-writing-tools',
          '/comparisons/best-ai-background-remover-tools',
          '/comparisons/best-image-resizer-tools',
          '/comparisons/best-pdf-converters',
          '/comparisons/best-pdf-editors',
          '/comparisons/best-password-managers',
          '/comparisons/best-qr-code-generators',
          '/comparisons/best-color-palette-tools',
          '/comparisons/best-markdown-editors',
          '/comparisons/best-mortgage-calculators',
          '/comparisons/best-seo-audit-tools',
          // Guides
          '/guides/how-to-remove-image-background',
          '/guides/how-to-compress-pdf',
          '/guides/how-to-merge-pdf-files',
          '/guides/how-currency-conversion-works',
          '/guides/compound-interest-explained',
          '/guides/how-loan-emi-works',
          '/guides/how-to-compare-credit-cards',
          '/guides/how-to-choose-a-resume-builder',
          '/guides/how-to-choose-ai-writing-tools',
          '/guides/how-mortgage-calculators-work',
          '/guides/how-to-create-strong-passwords',
          '/guides/how-to-use-qr-codes-effectively',
          '/guides/how-to-choose-a-color-palette',
          '/guides/how-to-write-markdown',
          '/guides/how-to-use-seo-analyzer',
          // Programmatic SEO — Image Resizer
          '/tools/resize-image-to-1080x1080',
          '/tools/resize-image-to-1920x1080',
          '/tools/resize-image-to-1200x628',
          '/tools/resize-image-for-instagram-post',
          '/tools/resize-image-for-instagram-story',
          '/tools/resize-image-for-youtube-thumbnail',
          '/tools/resize-image-for-facebook-cover',
          '/tools/resize-image-for-linkedin-banner',
          '/tools/resize-image-to-800x800',
          '/tools/resize-image-to-500x500',
          // Programmatic SEO — PDF Compressor
          '/tools/compress-pdf-to-1mb',
          '/tools/compress-pdf-to-500kb',
          '/tools/compress-pdf-to-200kb',
          '/tools/compress-pdf-for-email',
          '/tools/compress-pdf-for-whatsapp',
          '/tools/compress-pdf-for-college-application',
          '/tools/compress-pdf-for-job-application',
          // Programmatic SEO — EMI Calculator
          '/tools/emi-for-5-lakh-loan',
          '/tools/emi-for-10-lakh-loan',
          '/tools/emi-for-20-lakh-loan',
          '/tools/emi-for-50-lakh-loan',
          '/tools/emi-for-3-lakh-loan',
          // Programmatic SEO — Compound Interest / SIP
          '/tools/compound-interest-on-1000-monthly',
          '/tools/compound-interest-on-5000-monthly',
          '/tools/compound-interest-on-10000-monthly',
          '/tools/sip-calculator-5000-per-month',
          '/tools/sip-calculator-10000-per-month',
          // Programmatic SEO — Image Converter
          '/tools/convert-png-to-jpg',
          '/tools/convert-jpg-to-png',
          '/tools/convert-png-to-webp',
          '/tools/convert-webp-to-jpg',
          '/tools/convert-webp-to-png',
          '/tools/convert-jpg-to-webp',
          // Programmatic SEO — Password Generator
          '/tools/generate-16-character-password',
          '/tools/generate-32-character-password',
          '/tools/generate-wifi-password',
          '/tools/generate-pin-code',
        ],
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date(),
        readable: true,
      }),
    ],
    define: {
      __BUILD_ID__: JSON.stringify(buildId),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.REMOVEBG_API_KEY': JSON.stringify(env.REMOVEBG_API_KEY),
      'process.env.EXCHANGERATE_API_KEY': JSON.stringify(env.EXCHANGERATE_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      strictPort: false,
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
