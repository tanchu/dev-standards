import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import { defineNextConfig } from '../index.js';

const cwd = fileURLToPath(new URL('./fixture/', import.meta.url));

async function lint(file) {
  const eslint = new ESLint({
    cwd,
    overrideConfigFile: true,
    overrideConfig: defineNextConfig({
      tsconfigRootDir: cwd,
      tailwind: { entryPoint: 'src/app/globals.css', ignoreUnknown: ['^fx-'] },
    }),
  });
  const [result] = await eslint.lintFiles([file]);
  return result.messages.map((m) => `${m.ruleId}: ${m.message}`);
}

test('ловит нарушения правил стека', async () => {
  const messages = await lint('src/bad.tsx');
  const has = (ruleId, text) => messages.some((m) => m.startsWith(ruleId) && (!text || m.includes(text)));

  assert.ok(has('better-tailwindcss/enforce-canonical-classes', 'gap-y-15'), 'gap-y-[60px] → gap-y-15 в константе');
  assert.ok(has('better-tailwindcss/enforce-canonical-classes', 'max-w-300'), 'max-w-[1200px] → max-w-300');
  const oddFonts = messages.filter((m) => m.includes('Нечётный размер шрифта'));
  assert.equal(oddFonts.length, 2, 'text-[13px] и sm:text-[15px]/[22px] (с межстрочным интервалом)');
  assert.ok(has('better-tailwindcss/no-restricted-classes', 'Брейкпоинт в px'), 'max-[959px]:');
  assert.ok(has('better-tailwindcss/no-restricted-classes', 'Цвет прямо в классе'), 'bg-[#384c3c]');
  assert.ok(has('no-restricted-syntax', 'React.X'), 'React.ReactNode');
  assert.ok(has('jsx-a11y/alt-text'), '<img> без alt');
  assert.ok(!has('better-tailwindcss/no-unknown-classes'), 'fx-reveal разрешён через ignoreUnknown');
});

test('чистый файл проходит без замечаний', async () => {
  assert.deepEqual(await lint('src/good.tsx'), []);
});

test('модули одного маршрута app/ не импортируются из другого', async () => {
  const crossRoute = (await lint('src/app/about/page.tsx'))
    .filter((m) => m.startsWith('@tanchu/no-cross-route-imports'));
  // Чужая страница (`../shop/_components/card`, в том числе через `@/` и реэкспорт) и
  // `_components` родительского маршрута — ошибка; свои `_components` и `src/components` — нет.
  assert.equal(crossRoute.length, 3, crossRoute.join('\n'));
  assert.ok(crossRoute.some((m) => m.includes('«../shop/_components/card»') && m.includes('src/components')));
  assert.ok(crossRoute.some((m) => m.includes('«@/app/shop/_components/card»')));
  assert.ok(crossRoute.some((m) => m.includes('«../_components/shared-note»')));
  assert.deepEqual(await lint('src/app/about/_components/hero.tsx'), []);
});

test('слои зависят сверху вниз, импорты только через @/', async () => {
  const components = await lint('src/components/layer-violation.tsx');
  const lib = await lint('src/lib/format.ts');
  const has = (messages, ruleId, text) => messages.some((m) => m.startsWith(ruleId) && (!text || m.includes(text)));

  assert.ok(has(components, 'boundaries/dependencies', '`components` не импортирует `app`'), components.join('\n'));
  assert.ok(has(lib, 'boundaries/dependencies', '`lib` не импортирует `components`'), lib.join('\n'));
  assert.ok(has(components, 'no-restricted-syntax', 'только через `@/`'), 'реэкспорт ../');
  assert.ok(has(lib, 'no-restricted-syntax', 'только через `@/`'), 'import(../)');
  const page = await lint('src/app/about/page.tsx');
  assert.equal(page.filter((m) => m.startsWith('no-relative-import-paths')).length, 4, page.join('\n'));
});

test('eslint --fix переписывает относительный импорт на @/', async () => {
  const eslint = new ESLint({
    cwd,
    fix: true,
    overrideConfigFile: true,
    overrideConfig: defineNextConfig({ tsconfigRootDir: cwd }),
  });
  const [result] = await eslint.lintFiles(['src/app/about/page.tsx']);
  assert.match(result.output, /from '@\/app\/about\/_components\/hero'/);
  assert.match(result.output, /from '@\/app\/shop\/_components\/card'/);
});

test('без Tailwind правила Tailwind не подключаются', () => {
  const config = defineNextConfig({ tsconfigRootDir: cwd });
  assert.ok(config.every((block) => !block.plugins?.['better-tailwindcss']));
});

test('требует tsconfigRootDir', () => {
  assert.throws(() => defineNextConfig({}), /tsconfigRootDir/);
});
