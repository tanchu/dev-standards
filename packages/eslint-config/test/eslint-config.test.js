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

test('без Tailwind правила Tailwind не подключаются', () => {
  const config = defineNextConfig({ tsconfigRootDir: cwd });
  assert.ok(config.every((block) => !block.plugins?.['better-tailwindcss']));
});

test('требует tsconfigRootDir', () => {
  assert.throws(() => defineNextConfig({}), /tsconfigRootDir/);
});
