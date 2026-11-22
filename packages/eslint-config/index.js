import eslintReact from '@eslint-react/eslint-plugin';
import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import stylistic from '@stylistic/eslint-plugin';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import compat from 'eslint-plugin-compat';
import importX from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { relativeReexportSelectors, structureConfigs } from './rules/structure.js';
import { stylisticRules } from './rules/stylistic.js';
import { betterTailwindcss, tailwindRules, tailwindSettings } from './rules/tailwind.js';

const tsRecommendedRules = tseslint.configs.recommended.reduce(
  (acc, config) => ({ ...acc, ...(config.rules ?? {}) }),
  {},
);

const importRules = {
  ...importX.configs['flat/recommended'].rules,
  ...importX.configs['flat/typescript'].rules,
  'import-x/no-duplicates': 'error',
  'import-x/no-named-as-default': 'error',
  'import-x/no-named-as-default-member': 'error',
  'import-x/order': [
    'error',
    {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      pathGroups: [{ pattern: '@/**', group: 'internal' }],
      pathGroupsExcludedImportTypes: ['builtin'],
      'newlines-between': 'never',
    },
  ],
  // Без maxDepth: с лимитом 4 цикл из 6+ файлов проходил незамеченным, а полный обход
  // стоит ~4% времени lint. Циклы только через `import type` правило не считает.
  'import-x/no-cycle': 'error',
};

const nextRules = {
  ...nextPlugin.configs.recommended.rules,
  ...nextPlugin.configs['core-web-vitals'].rules,
};

const browserAndNodeGlobals = { ...globals.browser, ...globals.node };

const REACT_NAMESPACE_SELECTOR = {
  selector: "TSQualifiedName[left.name='React']",
  message: 'Импортируй тип напрямую (`import type { X } from \'react\'`), не используй `React.X`.',
};

/**
 * Общий ESLint-конфиг для проекта на Next.js + React + TypeScript.
 *
 * @param {object} options
 * @param {string} options.tsconfigRootDir Папка с tsconfig.json — передай `import.meta.dirname`.
 * @param {false | { entryPoint: string; rootFontSize?: number; ignoreUnknown?: string[];
 *   restrict?: { pattern: string; message: string }[] }} [options.tailwind]
 *   Tailwind CSS v4: путь к CSS с `@import "tailwindcss"`, собственные классы проекта
 *   (`ignoreUnknown`, регулярки) и дополнительные запреты. `false` — проект без Tailwind.
 * @param {boolean} [options.payload] Проект с Payload CMS: не проверять сгенерированные файлы.
 * @param {string} [options.srcDir] Папка исходников с алиасом `@/*` (по умолчанию `src`).
 * @param {string[]} [options.ignores] Дополнительные глобальные исключения.
 * @param {import('eslint').Linter.Config[]} [options.extend] Свои блоки конфига проекта — в конце.
 * @returns {import('eslint').Linter.Config[]}
 */
export function defineNextConfig({
  tsconfigRootDir,
  tailwind = false,
  payload = false,
  srcDir = 'src',
  ignores = [],
  extend = [],
}) {
  if (!tsconfigRootDir) {
    throw new Error('@tanchu/eslint-config: передай tsconfigRootDir: import.meta.dirname');
  }

  const plugins = {
    '@stylistic': stylistic,
    '@typescript-eslint': tseslint.plugin,
    '@next/next': nextPlugin,
    'import-x': importX,
    ...(tailwind ? { 'better-tailwindcss': betterTailwindcss } : {}),
  };
  const settings = {
    ...importX.configs['flat/typescript'].settings,
    ...(tailwind ? { 'better-tailwindcss': tailwindSettings(tailwind) } : {}),
    react: { version: 'detect' },
  };
  const twRules = tailwind ? tailwindRules(tailwind) : {};

  return defineConfig([
    // JS/MJS — без парсера TypeScript и правил с типами.
    {
      files: ['**/*.{js,mjs,cjs}'],
      plugins,
      settings,
      languageOptions: { globals: browserAndNodeGlobals },
      rules: {
        ...js.configs.recommended.rules,
        ...stylisticRules,
        curly: 'error',
        ...importRules,
        ...nextRules,
        ...twRules,
      },
    },
    // TypeScript — полный набор, включая правила с типами.
    {
      files: ['**/*.{ts,tsx}'],
      plugins,
      extends: [eslintReact.configs.strict],
      settings,
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: { project: true, tsconfigRootDir },
        globals: browserAndNodeGlobals,
      },
      rules: {
        ...js.configs.recommended.rules,
        ...tsRecommendedRules,
        '@typescript-eslint/no-unused-vars': ['error', {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        }],
        '@typescript-eslint/naming-convention': ['error', { selector: 'enumMember', format: ['PascalCase'] }],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
        '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
        ...stylisticRules,
        curly: 'error',
        ...importRules,
        ...nextRules,
        ...twRules,
        '@eslint-react/use-state': 'error',
        // В strict-пресете это warn; пропущенная зависимость эффекта — реальный баг
        // (устаревшее замыкание), поэтому ошибка.
        '@eslint-react/exhaustive-deps': 'error',
        '@eslint-react/dom-no-missing-button-type': 'off',
        // React-типы импортируем напрямую (`import type { ReactNode } from 'react'`),
        // не через `React.ReactNode`.
        'no-restricted-syntax': ['error', REACT_NAMESPACE_SELECTOR],
      },
    },
    // Доступность разметки (WCAG 2.2 AA): строгий набор jsx-a11y.
    { ...jsxA11y.flatConfigs.strict, files: ['**/*.{jsx,tsx}'] },
    // Совместимость с браузерами из `browserslist` проекта. API за проверкой поддержки
    // или с полифиллом помечаем `settings.polyfills`, а не отключением правила.
    { ...compat.configs['flat/recommended'], files: [`${srcDir}/**/*.{ts,tsx}`] },
    // Компонент длиннее 300 строк — сигнал разбить (warn: решает человек).
    {
      files: ['**/*.tsx'],
      rules: { 'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }] },
    },
    // Алиас `@/*` разрешаем только в исходниках: на конфигах в корне type-aware
    // разрешение импортов ложно срабатывает на двойные CJS/ESM-пакеты.
    {
      files: [`${srcDir}/**/*.{js,mjs,cjs,ts,tsx}`],
      settings: {
        'import-x/resolver-next': [
          // Путь от tsconfigRootDir, а не от папки, где запущен eslint.
          createTypeScriptImportResolver({ alwaysTryTypes: true, project: `${tsconfigRootDir}/tsconfig.json` }),
        ],
      },
    },
    // Структура: слои, модули страниц только для своей страницы, импорты только через `@/`
    // (rules/structure.js). `no-restricted-syntax` собираем целиком: ESLint не складывает
    // настройки правила из разных блоков.
    ...structureConfigs({ rootDir: tsconfigRootDir, srcDir }),
    {
      files: [`${srcDir}/**/*.{js,jsx,mjs,cjs,ts,tsx}`],
      rules: { 'no-restricted-syntax': ['error', REACT_NAMESPACE_SELECTOR, ...relativeReexportSelectors] },
    },
    // Конфиги экосистемы ESLint намеренно реэкспортируют default — это не ошибка.
    {
      files: ['eslint.config.mjs'],
      rules: {
        'import-x/no-named-as-default': 'off',
        'import-x/no-named-as-default-member': 'off',
      },
    },
    globalIgnores([
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'node_modules/**',
      ...(payload ? [`${srcDir}/app/(payload)/**`, `${srcDir}/payload-types.ts`, `${srcDir}/migrations/**`] : []),
      ...ignores,
    ]),
    ...extend,
  ]);
}
