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
        ],
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString().split('T')[0],
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
