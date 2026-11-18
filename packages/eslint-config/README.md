# @tanchu/eslint-config

Общий ESLint-конфиг проектов на **Next.js + React + TypeScript**, по желанию с **Tailwind CSS v4**.

Что внутри:

- **Форматирование** (`@stylistic`): 2 пробела, одинарные кавычки, `;`, JSX по строкам, 120 символов.
- **TypeScript** (`typescript-eslint`), импорты (`import-x`: порядок, циклы, дубли), Next.js (`core-web-vitals`).
- **React** (`@eslint-react` strict): пропущенные зависимости эффекта — ошибка; React-типы только напрямую (`ReactNode`, не `React.ReactNode`).
- **Доступность**: строгий `jsx-a11y` (WCAG 2.2 AA).
- **Совместимость с браузерами** (`eslint-plugin-compat`): API, которых нет в `browserslist` проекта.
- **Tailwind CSS v4** (`better-tailwindcss`), если включён:
  - классы только из шкалы: `gap-y-15`, а не `gap-y-[60px]` (исправляется `eslint --fix`);
  - брейкпоинты только в rem — именованные из `@theme` или `min-[NNrem]:`. Брейкпоинты в px запрещены: Tailwind сортирует px и rem не по значению, и `sm:grid-cols-2` перебивает соседний `min-[960px]:grid-cols-3` ([tailwindlabs/tailwindcss#20032](https://github.com/tailwindlabs/tailwindcss/issues/20032));
  - размеры в произвольных значениях — в rem: `text-[0.75rem]`, `py-[clamp(1.25rem,2vw,2rem)]`, а не px (вёрстка масштабируется вместе с размером шрифта в браузере); px — только для тени, скругления, рамки и линий тоньше 2px;
  - размер текста — только токен темы проекта (`text-small`, `text-body` из `@theme`), а не произвольное значение `text-[0.875rem]` или `text-[clamp(…)]`: у каждого проекта свой набор размеров, новые заводит владелец (правило для агентов — `@tanchu/agent-rules`);
  - цвета только токенами `@theme` (в OKLCH), не прямо в классе: `bg-accent`, не `bg-[#384c3c]`;
  - проверяются не только `className` и `cn(…)`, но и константы `*_CLASS`, `*_CLASSES`, `*_SIZE`, `*_COLOR`, `*_STYLE(S)`, включая значения объектов-словарей.
- Компонент длиннее 300 строк — предупреждение.
- **Структура проекта** (схема — в `@tanchu/agent-rules`, раздел «Структура»):
  - слои `src/app` → `src/components` → `src/lib` → `src/config`/`src/i18n` зависят только сверху вниз
    (`eslint-plugin-boundaries`);
  - модули страницы (`app/**/_components` и т. п.) импортирует только эта страница: нужен второй —
    переносится в `src/components` (`@tanchu/no-cross-route-imports`, своё правило: `boundaries`
    сравнивает папки только через «родитель/сосед/потомок» и на вложенных маршрутах Next
    пропускает нарушения или ругается зря);
  - импорты внутри `src` только через `@/`, включая соседние файлы, реэкспорт и `import()`
    (`eslint-plugin-no-relative-import-paths`, исправляется `eslint --fix`).

## Установка

```bash
pnpm add -D @tanchu/eslint-config eslint typescript
```

Плагины ESLint — зависимости пакета, отдельно их ставить не нужно.

`eslint.config.mjs`:

```js
import { defineNextConfig } from '@tanchu/eslint-config';

export default defineNextConfig({
  tsconfigRootDir: import.meta.dirname,
  // Проект на Tailwind CSS v4; без Tailwind — не указывай (или false).
  tailwind: {
    entryPoint: 'src/app/globals.css',
    // Собственные классы из CSS, которых нет в Tailwind (регулярки).
    ignoreUnknown: ['^mm-'],
  },
  // Проект с Payload CMS: не проверять сгенерированные файлы.
  payload: true,
  ignores: ['docs/**'],
  // Свои блоки конфига проекта — добавятся в конец.
  extend: [],
});
```

## Обновления

Правила меняются только новой версией пакета (changelog — в GitHub Releases репозитория).
Dependabot в каждом проекте открывает PR с обновлением, CI в нём показывает, что новые
правила нашли. Большая часть исправляется `pnpm exec eslint --fix`.
