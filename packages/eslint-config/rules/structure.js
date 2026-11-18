import { createRequire } from 'node:module';
import boundaries from 'eslint-plugin-boundaries';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import { noCrossRouteImports } from './no-cross-route-imports.js';

const require = createRequire(import.meta.url);
// Резолвер — зависимость этого пакета, в проекте его может не быть: подключаем по пути.
const typescriptResolver = require.resolve('eslint-import-resolver-typescript');

const RELATIVE = '/^\\./';
const RELATIVE_MESSAGE = 'Импорт только через `@/`, не относительным путём.';

/**
 * Структура проекта (agent-rules/next.md, «Структура»):
 * - слои `app` → `components` → `lib` → `config`/`i18n` зависят только сверху вниз;
 * - модули страницы (`_components` и т. п.) — только для этой страницы;
 * - импорты только через `@/`.
 *
 * @param {{ rootDir: string; srcDir: string }} options
 * @returns {import('eslint').Linter.Config[]}
 */
export function structureConfigs({ rootDir, srcDir }) {
  const layer = (type) => ({ type, pattern: `${srcDir}/${type}`, partialMatch: false });
  const from = (type) => ({ element: { type } });
  const to = (...types) => ({ to: { element: { types } } });

  return [
    {
      files: [`${srcDir}/**/*.{js,jsx,mjs,cjs,ts,tsx}`],
      plugins: {
        boundaries,
        'no-relative-import-paths': noRelativeImportPaths,
      },
      settings: {
        'import/resolver': {
          [typescriptResolver]: { alwaysTryTypes: true, project: `${rootDir}/tsconfig.json` },
        },
        'boundaries/root-path': rootDir,
        'boundaries/elements': ['app', 'components', 'lib', 'config', 'i18n'].map(layer),
        // Стили и картинки — не слои: `globals.css` подключает layout.
        'boundaries/ignore': ['**/*.{css,scss,svg,png,jpg,jpeg,webp,avif,json}'],
      },
      rules: {
        'boundaries/dependencies': ['error', {
          default: 'allow',
          policies: [
            { from: from('components'), disallow: to('app') },
            { from: from('lib'), disallow: to('app', 'components') },
            { from: from('config'), disallow: to('app', 'components', 'lib') },
            { from: from('i18n'), disallow: to('app', 'components') },
          ],
          message:
            'Слои зависят сверху вниз: app → components → lib → config/i18n. '
            + '`{{ from.element.types.[0] }}` не импортирует `{{ to.element.types.[0] }}`.',
        }],
        // `eslint --fix` переписывает `../x` в `@/…`. Файлы вне `src/` (messages, public) не трогает.
        'no-relative-import-paths/no-relative-import-paths': ['error', {
          allowSameFolder: false,
          rootDir: srcDir,
          prefix: '@',
        }],
      },
    },
    // Модули страницы — только для неё самой (свое правило: boundaries не выражает маршруты
    // произвольной вложенности, см. README пакета).
    {
      files: [`${srcDir}/app/**/*.{js,jsx,mjs,cjs,ts,tsx}`],
      plugins: { '@tanchu': { rules: { 'no-cross-route-imports': noCrossRouteImports } } },
      rules: {
        '@tanchu/no-cross-route-imports': ['error', { rootDir, srcDir }],
      },
    },
  ];
}

/**
 * Селекторы `no-restricted-syntax` для того, что не проверяет `no-relative-import-paths`:
 * реэкспорт и динамический `import()` относительным путём.
 */
export const relativeReexportSelectors = [
  { selector: `ExportAllDeclaration[source.value=${RELATIVE}]`, message: RELATIVE_MESSAGE },
  { selector: `ExportNamedDeclaration[source.value=${RELATIVE}]`, message: RELATIVE_MESSAGE },
  { selector: `ImportExpression[source.value=${RELATIVE}]`, message: RELATIVE_MESSAGE },
];
