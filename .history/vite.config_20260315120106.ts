import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import sitemap from 'vite-plugin-sitemap';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      sitemap({
        hostname: 'https://www.designforge360.com',
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
        ],
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date(),
      }),
    ],
    define: {
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
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
