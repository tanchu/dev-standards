import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import stylelint from 'stylelint';
import bem from '../bem.js';
import tailwind from '../tailwind.js';

const fixture = (name) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));

async function lint(config, name) {
  const { results } = await stylelint.lint({ config, files: [fixture(name)] });
  return results[0].warnings.map((w) => w.rule);
}

test('Tailwind v4: директивы и функции Tailwind разрешены', async () => {
  assert.deepEqual(await lint(tailwind, 'tailwind-good.css'), []);
});

test('BEM: блок, элемент, модификатор и :global проходят', async () => {
  assert.deepEqual(await lint(bem, 'bem-good.module.css'), []);
});

test('BEM: camelCase и одиночное подчёркивание, именованный цвет и !important — ошибки', async () => {
  const rules = await lint(bem, 'bem-bad.module.css');
  assert.equal(rules.filter((r) => r === 'selector-class-pattern').length, 2);
  assert.ok(rules.includes('color-named'));
  assert.ok(rules.includes('declaration-no-important'));
});

test('единицы и цвета: rem для шрифта, отступов и брейкпоинтов, только OKLCH', async () => {
  const rules = await lint(tailwind, 'units-colors-bad.css');
  for (const rule of [
    'declaration-property-unit-disallowed-list', // margin-top: 24px
    'declaration-property-unit-allowed-list', // font-size/line-height/letter-spacing
    'media-feature-name-unit-allowed-list', // (width >= 960px)
    'color-no-hex',
    'function-disallowed-list', // rgb(), hsl()
  ]) {
    assert.ok(rules.includes(rule), rule);
  }
  assert.equal(rules.filter((r) => r === 'declaration-property-unit-allowed-list').length, 3);
  assert.equal(rules.filter((r) => r === 'function-disallowed-list').length, 2);
});
