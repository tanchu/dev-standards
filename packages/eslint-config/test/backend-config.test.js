import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import { defineBackendConfig } from '../backend.js';

async function lint(runtime, file) {
  const cwd = fileURLToPath(new URL(`./backend-fixture/${runtime}/`, import.meta.url));
  const eslint = new ESLint({
    cwd,
    overrideConfigFile: true,
    overrideConfig: defineBackendConfig({ tsconfigRootDir: cwd, runtime }),
  });
  const [result] = await eslint.lintFiles([file]);
  return result.messages.map((m) => `${m.ruleId}: ${m.message}`);
}

const has = (messages, ruleId, text) => messages.some((m) => m.startsWith(`${ruleId}:`) && (!text || m.includes(text)));

test('worker: ловит затычки и ошибки среды', async () => {
  const messages = await lint('worker', 'src/bad.ts');
  const all = messages.join('\n');
  assert.ok(has(messages, '@typescript-eslint/no-explicit-any'), all);
  assert.ok(has(messages, '@typescript-eslint/consistent-type-assertions'), all);
  assert.ok(has(messages, '@typescript-eslint/no-non-null-assertion'), all);
  assert.ok(has(messages, '@typescript-eslint/no-floating-promises'), all);
  assert.ok(has(messages, 'no-restricted-properties', 'wrangler types'), all);
  assert.ok(has(messages, 'no-empty'), all);
  assert.ok(has(messages, '@typescript-eslint/ban-ts-comment'), all);
});

test('worker: чистый handler проходит без замечаний', async () => {
  assert.deepEqual(await lint('worker', 'src/good.ts'), []);
});

test('node: ловит забытый await, throw не-Error, неполный switch, импорт без node:', async () => {
  const messages = await lint('node', 'src/bad.ts');
  const all = messages.join('\n');
  assert.ok(has(messages, '@typescript-eslint/no-floating-promises'), all);
  assert.ok(has(messages, '@typescript-eslint/only-throw-error'), all);
  assert.ok(has(messages, '@typescript-eslint/switch-exhaustiveness-check'), all);
  assert.ok(has(messages, '@typescript-eslint/explicit-module-boundary-types'), all);
  assert.ok(has(messages, 'no-restricted-imports', "'node:fs/promises'"), all);
  assert.ok(has(messages, 'no-restricted-properties', 'config/env.ts'), all);
});

test('node: process.env можно читать в модуле конфигурации', async () => {
  assert.deepEqual(await lint('node', 'src/config/env.ts'), []);
  assert.deepEqual(await lint('node', 'src/good.ts'), []);
});

test('без runtime конфиг не собирается', () => {
  assert.throws(() => defineBackendConfig({ tsconfigRootDir: '.' }), /runtime/);
});
