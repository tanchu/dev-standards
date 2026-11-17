# @tanchu/browserslist-config

Поддерживаемые браузеры проектов: минимум **Tailwind CSS v4** — Chrome/Edge 111,
Safari 16.4, Firefox 128 — с мобильными версиями (iOS Safari, Chrome и Firefox на Android,
Samsung Internet), Opera 98.

На этих версиях работает всё, на чём держатся стили: cascade layers, `@property`,
`color-mix()`, цвета в OKLCH, синтаксис диапазонов в `@media`. Тест пакета сверяет это
с данными caniuse.

```bash
pnpm add -D @tanchu/browserslist-config
```

`package.json`:

```json
{ "browserslist": ["extends @tanchu/browserslist-config"] }
```

Список читают Next.js/SWC (до какой версии JavaScript переписывать код),
`eslint-plugin-compat` (`@tanchu/eslint-config`) и Lightning CSS.
