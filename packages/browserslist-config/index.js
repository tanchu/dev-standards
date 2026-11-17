/**
 * Поддерживаемые браузеры — минимум Tailwind CSS v4 (https://tailwindcss.com/docs/compatibility):
 * Chrome/Edge 111, Safari 16.4, Firefox 128 — и их мобильные версии. На этих версиях
 * работают всё, на чём держится Tailwind v4 (cascade layers, @property, color-mix()),
 * и цвета в OKLCH. Samsung Internet 22 и Opera 97 — на Chromium 111.
 *
 * Подключение в package.json проекта:
 *   "browserslist": ["extends @tanchu/browserslist-config"]
 */
module.exports = [
  'chrome >= 111',
  'edge >= 111',
  'firefox >= 128',
  'safari >= 16.4',
  'ios_saf >= 16.4',
  'and_chr >= 111',
  'and_ff >= 128',
  'samsung >= 22',
  'opera >= 98',
];
