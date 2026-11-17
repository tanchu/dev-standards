/**
 * Поддерживаемые браузеры — минимум Tailwind CSS v4 (https://tailwindcss.com/docs/compatibility):
 * Chrome/Edge 111, Safari 16.4 — и их мобильные версии. Firefox — от 115: это ESR, последняя
 * версия для Windows 7/8.1 (~0,6% посетителей в Сербии). В нём есть всё, без чего стили
 * ломаются (cascade layers, color-mix(), OKLCH, диапазоны в @media); `@property` (Firefox 128)
 * у Tailwind v4.1+ с запасным вариантом. Samsung Internet 22 и Opera 98 — на Chromium 111+.
 *
 * Подключение в package.json проекта:
 *   "browserslist": ["extends @tanchu/browserslist-config"]
 */
module.exports = [
  'chrome >= 111',
  'edge >= 111',
  'firefox >= 115',
  'safari >= 16.4',
  'ios_saf >= 16.4',
  'and_chr >= 111',
  'and_ff >= 128',
  'samsung >= 22',
  'opera >= 98',
];
