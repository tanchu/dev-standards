import base from './index.js';

/** Директивы Tailwind CSS v4 (https://tailwindcss.com/docs/functions-and-directives). */
const TAILWIND_AT_RULES = [
  'theme', 'utility', 'variant', 'custom-variant', 'apply', 'reference', 'source', 'plugin', 'config',
];

/**
 * Для проектов на Tailwind CSS v4. Классы в разметке проверяет ESLint
 * (`@tanchu/eslint-config`, better-tailwindcss); здесь — сам CSS: `globals.css`,
 * `@theme`, собственные утилиты.
 */
export default {
  ...base,
  rules: {
    ...base.rules,
    'at-rule-no-unknown': [true, { ignoreAtRules: TAILWIND_AT_RULES }],
    'at-rule-no-deprecated': [true, { ignoreAtRules: ['apply'] }],
    // `--theme()` / `theme()` / `--spacing()` — функции Tailwind внутри значений.
    'function-no-unknown': [true, { ignoreFunctions: ['theme', '--theme', '--spacing', '--alpha'] }],
    // Значение с функцией Tailwind (`margin-top: --spacing(4)`) — валидно после сборки.
    'declaration-property-value-no-unknown': [true, {
      ignoreProperties: { '/.+/': ['/(?:^|\\s)(?:--theme|--spacing|--alpha|theme)\\(/'] },
    }],
    // Вложенность внутри `@utility` (`&:hover`, `@media`) — синтаксис Tailwind v4.
    'nesting-selector-no-missing-scoping-root': [true, { ignoreAtRules: ['utility', 'variant', 'custom-variant'] }],
    'no-invalid-position-declaration': [true, { ignoreAtRules: ['utility', 'variant', 'custom-variant'] }],
    // `@import "tailwindcss"` пишется строкой — так в документации Tailwind.
    'import-notation': 'string',
    // Переменные `@theme` (`--color-accent`, `--breakpoint-laptop`) — в kebab-case.
    'custom-property-pattern': ['^[a-z][a-z0-9]*(-[a-z0-9]+)*$', {
      message: 'CSS-переменная в kebab-case: --color-accent, --breakpoint-laptop',
    }],
  },
};
