# @tanchu/browserslist-config

Поддерживаемые браузеры проектов: минимум **Tailwind CSS v4** — Chrome/Edge 111,
Safari 16.4 — с мобильными версиями (iOS Safari, Chrome и Firefox на Android, Samsung
Internet), Opera 98. Firefox — от 115 (ESR, последняя версия для Windows 7/8.1).

На этих версиях работает всё, без чего ломаются стили: cascade layers, `color-mix()`,
цвета в OKLCH, синтаксис диапазонов в `@media`. Тест пакета сверяет это с данными caniuse.
`@property` есть с Firefox 128; на 115–127 Tailwind v4.1+ использует запасной вариант.

```bash
pnpm add -D @tanchu/browserslist-config
```

`package.json`:

```json
{ "browserslist": ["extends @tanchu/browserslist-config"] }
```

Список читают Next.js/SWC (до какой версии JavaScript переписывать код),
`eslint-plugin-compat` (`@tanchu/eslint-config`) и Lightning CSS.
