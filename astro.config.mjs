import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { copyFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// SITE_TARGET=dev baut eine Vorschau unter /dev/ (noindex, ohne Sitemap,
// eigene .htaccess ohne die Weiterleitungen der alten WordPress-Seite).
const isPreview = process.env.SITE_TARGET === 'dev';

const previewHtaccess = {
  name: 'preview-htaccess',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      await copyFile(new URL('./deploy/htaccess-dev', import.meta.url), new URL('.htaccess', dir));
      await rm(fileURLToPath(new URL('robots.txt', dir)), { force: true });
    },
  },
};

export default defineConfig({
  site: 'https://www.alpenexpress.at',
  base: isPreview ? '/dev' : undefined,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: isPreview ? [previewHtaccess] : [sitemap({ filter: (page) => !page.includes('/danke/') })],
});
