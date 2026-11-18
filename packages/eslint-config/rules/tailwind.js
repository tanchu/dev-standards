import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import { getDefaultSelectors } from 'eslint-plugin-better-tailwindcss/defaults';

/**
 * Где искать классы, кроме `className`, `cn(…)` и т. п.: константы с именами
 * `*_CLASS`, `*_CLASSES`, `*_SIZE`, `*_COLOR`, `*_STYLE(S)` — строки и значения
 * объектов-словарей (`const KICKER_SIZE = { hero: 'text-[12px] …' }`).
 */
const CLASS_CONSTANT_SELECTOR = {
  kind: 'variable',
  name: '^[A-Z][A-Z0-9_]*_(CLASS|CLASSES|SIZE|COLOR|STYLES?)$',
  match: [{ type: 'strings' }, { type: 'objectValues' }],
};

/**
 * Настройки плагина для `settings['better-tailwindcss']`.
 *
 * @param {{ entryPoint: string; rootFontSize?: number }} options
 */
export function tailwindSettings({ entryPoint, rootFontSize = 16 }) {
  return {
    entryPoint,
    // Без базового размера шрифта `enforce-canonical-classes` не переведёт пиксели
    // в шаг шкалы (`gap-y-[60px]` → `gap-y-15`, `max-w-[1200px]` → `max-w-300`).
    rootFontSize,
    selectors: [...getDefaultSelectors(), CLASS_CONSTANT_SELECTOR],
  };
}

/**
 * @param {{ ignoreUnknown?: string[]; restrict?: { pattern: string; message: string }[] }} options
 */
export function tailwindRules({ ignoreUnknown = [], restrict = [] } = {}) {
  return {
    ...betterTailwindcss.configs.recommended.rules,
    // Переносы — только в атрибутах и вызовах (className, cn(…)): в константах строки в
    // одинарных кавычках перенос сломал бы синтаксис.
    'better-tailwindcss/enforce-consistent-line-wrapping': ['error', { selectors: getDefaultSelectors() }],
    // Произвольное значение, у которого есть класс шкалы, — ошибка: `gap-y-[60px]`
    // пишем как `gap-y-15`. Исправляется автоматически (`eslint --fix`).
    'better-tailwindcss/enforce-canonical-classes': 'error',
    // Собственные классы проекта из CSS (например, `mm-reveal`) — через `ignoreUnknown`.
    'better-tailwindcss/no-unknown-classes': ['error', { ignore: ignoreUnknown }],
    'better-tailwindcss/no-restricted-classes': ['error', {
      restrict: [
        {
          // Tailwind сортирует брейкпоинты в px и rem не по значению: `sm:` (40rem)
          // встаёт в CSS после `min-[960px]:` и перебивает его (tailwindlabs/tailwindcss#20032).
          pattern: '^(?:.*:)?(?:min|max)-\\[[\\d.]+px\\]:',
          message: 'Брейкпоинт в px: используй именованный из @theme (в rem) или min-[NNrem]: — см. README @tanchu/eslint-config.',
        },
        {
          // Размер текста — только токен темы проекта (`text-body`, `text-(--lead-size)`), не
          // произвольное значение: у каждого проекта свой набор размеров в `@theme`, новые
          // размеры заводит владелец. С межстрочным интервалом тоже: `text-[15px]/[22px]`.
          pattern: '^(?:.*:)?text-\\[(?:length:)?(?:[\\d.]|(?:clamp|min|max|calc)\\()',
          message: 'Размер текста не из токенов: используй размер из @theme проекта (text-body, text-lead…); новый токен — только с согласия владельца — см. README @tanchu/eslint-config.',
        },
        {
          // Размеры в произвольных значениях — в rem: вёрстка масштабируется вместе с
          // размером шрифта в браузере. px — только для тени, скругления, рамки и линий
          // тоньше 2px. Брейкпоинты в px ловит правило выше.
          pattern: '^(?:.*:)?(?!-?(?:shadow|inset-shadow|drop-shadow|rounded|border|outline|ring|translate)\\b)'
            + '-?[a-z][a-z0-9-]*-\\[[^\\]]*(?<![\\d.])(?:[2-9]|[1-9]\\d+)(?:\\.\\d+)?px[^\\]]*\\](?:/.+)?$',
          message: 'Размер в px: пиши в rem (16px = 1rem); px — только для тени, скругления, рамки и линий тоньше 2px — см. README @tanchu/eslint-config.',
        },
        {
          // Цвет прямо в классе (`bg-[#384c3c]`, `text-[rgb(0_0_0)]`): только токены `@theme` в OKLCH.
          pattern: '\\[(?:color:)?(?:#[0-9a-fA-F]{3,8}|(?:rgba?|hsla?|hwb|lab|lch|oklab)\\()',
          message: 'Цвет прямо в классе: заведи токен в @theme (OKLCH) и используй его — см. README @tanchu/eslint-config.',
        },
        ...restrict,
      ],
    }],
  };
}

export { betterTailwindcss };
