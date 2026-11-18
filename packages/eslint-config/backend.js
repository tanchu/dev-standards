import { builtinModules } from 'node:module';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import importX from 'eslint-plugin-import-x';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { stylisticRules } from './rules/stylistic.js';

const RUNTIMES = ['worker', 'node'];

const mergeRules = (configs) => configs.reduce((acc, config) => ({ ...acc, ...(config.rules ?? {}) }), {});

const tsStrictRules = mergeRules(tseslint.configs.strictTypeChecked);

const importRules = {
  ...importX.configs['flat/recommended'].rules,
  ...importX.configs['flat/typescript'].rules,
  // TypeScript сам проверяет, что импорт существует; правило import-x с алиасами и
  // `.ts`-расширениями даёт ложные срабатывания.
  'import-x/no-unresolved': 'off',
  'import-x/no-duplicates': 'error',
  'import-x/order': [
    'error',
    {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'never',
    },
  ],
  'import-x/no-cycle': ['error', { maxDepth: 4 }],
};

/**
 * Типобезопасность без лазеек. Это то, что агент чаще всего «чинит» затычками: `any`,
 * `as`, `!`, `@ts-ignore`, пустой `catch`, забытый `await`.
 */
const safetyRules = {
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-non-null-assertion': 'error',
  // `as X` запрещён: тип сужаем проверкой или схемой (zod/valibot). `as const` разрешён.
  '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
  '@typescript-eslint/ban-ts-comment': ['error', {
    'ts-ignore': true,
    'ts-nocheck': true,
    'ts-check': false,
    'ts-expect-error': 'allow-with-description',
    minimumDescriptionLength: 10,
  }],
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-misused-promises': 'error',
  '@typescript-eslint/return-await': ['error', 'always'],
  '@typescript-eslint/only-throw-error': 'error',
  '@typescript-eslint/prefer-promise-reject-errors': 'error',
  '@typescript-eslint/use-unknown-in-catch-callback-variable': 'error',
  '@typescript-eslint/switch-exhaustiveness-check': ['error', { considerDefaultExhaustiveForUnions: false }],
  '@typescript-eslint/strict-boolean-expressions': ['error', {
    allowString: false,
    allowNumber: false,
    allowNullableObject: true,
  }],
  '@typescript-eslint/explicit-module-boundary-types': 'error',
  '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
  '@typescript-eslint/no-unused-vars': ['error', {
    argsIgnorePattern: '^_',
    varsIgnorePattern: '^_',
    caughtErrors: 'all',
    caughtErrorsIgnorePattern: '^_',
    destructuredArrayIgnorePattern: '^_',
  }],
  'no-empty': ['error', { allowEmptyCatch: false }],
  'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
  eqeqeq: ['error', 'always'],
  curly: 'error',
};

const BARE_BUILTINS = builtinModules
  .filter((name) => !name.startsWith('_') && !name.includes(':'))
  .map((name) => ({ name, message: `Импортируй встроенный модуль как 'node:${name}'.` }));

const WORKER_RESTRICTED = [
  {
    object: 'process',
    property: 'env',
    message: 'В Worker нет process.env: переменные и секреты — из `env` (биндинги), тип `Env` — из `wrangler types`.',
  },
];

const NODE_RESTRICTED = [
  {
    object: 'process',
    property: 'env',
    message: 'Читай process.env только в модуле конфигурации (config/env.ts) через схему; дальше передавай типизированный config.',
  },
];

/**
 * Общий ESLint-конфиг для бэкенда на TypeScript: Cloudflare Worker или сервис на Node.js.
 *
 * @param {object} options
 * @param {string} options.tsconfigRootDir Папка с tsconfig.json — передай `import.meta.dirname`.
 * @param {'worker' | 'node'} options.runtime Среда выполнения.
 * @param {string} [options.srcDir] Папка исходников (по умолчанию `src`).
 * @param {string[]} [options.envFiles] Файлы, где можно читать `process.env` (только `node`).
 * @param {string[]} [options.ignores] Дополнительные глобальные исключения.
 * @param {import('eslint').Linter.Config[]} [options.extend] Свои блоки конфига проекта — в конце.
 * @returns {import('eslint').Linter.Config[]}
 */
export function defineBackendConfig({
  tsconfigRootDir,
  runtime,
  srcDir = 'src',
  envFiles = [`${srcDir}/config/env.ts`],
  ignores = [],
  extend = [],
}) {
  if (!tsconfigRootDir) {
    throw new Error('@tanchu/eslint-config: передай tsconfigRootDir: import.meta.dirname');
  }
  if (!RUNTIMES.includes(runtime)) {
    throw new Error(`@tanchu/eslint-config: runtime должен быть ${RUNTIMES.map((r) => `'${r}'`).join(' или ')}`);
  }

  const isWorker = runtime === 'worker';
  const runtimeGlobals = isWorker ? globals.serviceworker : globals.node;
  const plugins = {
    '@stylistic': stylistic,
    '@typescript-eslint': tseslint.plugin,
    'import-x': importX,
  };
  const settings = { ...importX.configs['flat/typescript'].settings };

  return defineConfig([
    { linterOptions: { reportUnusedDisableDirectives: 'error' } },
    // JS/MJS (конфиги в корне) — без правил с типами.
    {
      files: ['**/*.{js,mjs,cjs}'],
      plugins,
      settings,
      languageOptions: { globals: globals.node },
      rules: { ...js.configs.recommended.rules, ...stylisticRules, ...importRules, curly: 'error' },
    },
    {
      files: ['**/*.{ts,mts,cts}'],
      plugins,
      settings,
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: { projectService: true, tsconfigRootDir },
        globals: runtimeGlobals,
      },
      rules: {
        ...js.configs.recommended.rules,
        ...tsStrictRules,
        ...safetyRules,
        ...stylisticRules,
        // Директивы ESLint с перечнем правил бывают длинными — их не переносим.
        '@stylistic/max-len': ['error', {
          ...stylisticRules['@stylistic/max-len'][1],
          ignorePattern: 'eslint-disable(-next)?-line',
        }],
        ...importRules,
        'no-restricted-properties': ['error', ...(isWorker ? WORKER_RESTRICTED : NODE_RESTRICTED)],
        // Встроенные модули — только с `node:` (так их видит и Workers с nodejs_compat).
        'no-restricted-imports': ['error', { paths: BARE_BUILTINS }],
      },
    },
    // Node: process.env читаем только в модуле конфигурации.
    ...(!isWorker && envFiles.length > 0
      ? [{ files: envFiles, rules: { 'no-restricted-properties': 'off' } }]
      : []),
    // Тесты: можно собирать заглушки через `as` и не типизировать каждый мок.
    {
      files: ['**/*.{test,spec}.ts', 'test/**/*.ts', 'tests/**/*.ts'],
      rules: {
        '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' }],
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
      },
    },
    globalIgnores([
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.wrangler/**',
      'worker-configuration.d.ts',
      ...ignores,
    ]),
    ...extend,
  ]);
}
