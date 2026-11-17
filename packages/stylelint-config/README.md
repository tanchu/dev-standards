# @tanchu/stylelint-config

Общий stylelint-конфиг. Два варианта — по тому, как в проекте пишут стили.

| Вариант | Для чего | Имена классов |
|---|---|---|
| `@tanchu/stylelint-config/tailwind` | проекты на Tailwind CSS v4: `globals.css`, `@theme`, свои утилиты | свободно (классы в разметке проверяет ESLint, `@tanchu/eslint-config`) |
| `@tanchu/stylelint-config/bem` | проекты без Tailwind: обычный CSS или CSS Modules | BEM в kebab-case: `block`, `block__element`, `block--modifier` |

Общее для обоих: `stylelint-config-standard`, без именованных цветов (`red`, `white`) и
`!important`, вложенность не глубже 3, без селекторов по `id`.

- **Tailwind v4**: разрешены `@theme`, `@utility`, `@variant`, `@custom-variant`,
  `@apply`, `@reference`, `@source`, `@plugin`, `@config` и функции `--theme()`,
  `--spacing()`, `--alpha()`; переменные `@theme` — в kebab-case.
- **BEM**: в CSS Modules блок — сам модуль (`fab.module.css`): `.fab`, `.fab__icon`,
  `.fab--open`. Поддерживаются `:global(...)`, `composes`, `@value`.

## Установка

```bash
pnpm add -D @tanchu/stylelint-config stylelint
```

`stylelint.config.mjs`:

```js
export default { extends: ['@tanchu/stylelint-config/tailwind'] };
// или: export default { extends: ['@tanchu/stylelint-config/bem'] };
```

`package.json`:

```json
{ "scripts": { "lint:css": "stylelint \"src/**/*.css\"" } }
```

Форматирование (пустые строки, `#fff` вместо `#ffffff`, `0` без единиц) исправляется
`pnpm exec stylelint "src/**/*.css" --fix`.
