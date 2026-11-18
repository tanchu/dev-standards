#!/usr/bin/env node
// Фиксирует текущие ошибки tsc и ESLint как исходный долг перехода на строгий режим:
// над каждой строкой с ошибкой ставит `// @ts-expect-error TODO(strict)` или
// `// eslint-disable-next-line <правила> -- TODO(strict)`. После этого CI зелёный и ловит
// только новые ошибки, а долг гасится по модулю на PR (порядок — backend.md, «Переход на
// строгий режим»).
//
//   pnpm exec tanchu-strict-baseline [папка пакета]   (по умолчанию — текущая)
//
// Нужны `typescript` и `eslint` в зависимостях проекта. Запускай на чистом рабочем дереве и
// смотри diff: строки внутри шаблонных строк и JSX, а также строки, где пометку пришлось бы
// дописать после уже имеющегося комментария, скрипт пропускает и выводит списком.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const root = resolve(process.argv[2] ?? '.');
const ts = createRequire(resolve(root, 'package.json'))('typescript');

/** Номера строк (с 1), которые начинаются внутри шаблонной строки или JSX-текста. */
function linesInsideText(file, text) {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const inside = new Set();
  const markSpan = (start, end) => {
    const from = sf.getLineAndCharacterOfPosition(start).line + 2;
    const to = sf.getLineAndCharacterOfPosition(end).line + 1;
    for (let l = from; l <= to; l += 1) inside.add(l);
  };
  const visit = (node) => {
    if (ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateHead(node)
      || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)
      // Внутри JSX `// …` на отдельной строке становится текстом, а не комментарием.
      || ts.isJsxElement(node) || ts.isJsxFragment(node) || ts.isJsxSelfClosingElement(node)) {
      markSpan(node.getStart(sf), node.getEnd());
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return inside;
}
/**
 * Запускает команду и возвращает stdout. `foundErrors` — коды выхода, которыми команда
 * сообщает «нашла ошибки в коде» (нам нужен её вывод). Любой другой код — сбой запуска
 * (команды нет, сломан конфиг): тогда останавливаемся, а не размечаем пустой вывод.
 */
const run = (args, foundErrors) => {
  try {
    return execFileSync('pnpm', ['exec', ...args], {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    if (foundErrors.includes(error.status) && typeof error.stdout === 'string') return error.stdout;
    console.error(`Не удалось запустить «${args.join(' ')}» в ${root} (код ${error.status}):`);
    console.error(String(error.stderr || error.stdout || error.message).trim());
    process.exit(1);
  }
};

/** @type {Map<string, Map<number, { ts: Set<string>, eslint: Set<string> }>>} */
const byFile = new Map();
const mark = (file, line, kind, id) => {
  const lines = byFile.get(file) ?? new Map();
  const entry = lines.get(line) ?? { ts: new Set(), eslint: new Set() };
  entry[kind].add(id);
  lines.set(line, entry);
  byFile.set(file, lines);
};

// 1. tsc: «src/a.ts(12,5): error TS2345: …»
// tsc с --noEmit выходит с кодом 2, когда нашёл ошибки (1 — в старых версиях).
const tscOut = run(['tsc', '--noEmit', '--pretty', 'false'], [1, 2]);
for (const m of tscOut.matchAll(/^(.+?)\((\d+),\d+\): error (TS\d+):/gm)) {
  mark(resolve(root, m[1]), Number(m[2]), 'ts', m[3]);
}

// 2. ESLint (только ошибки; на строки с ошибкой tsc тоже — у них разные комментарии).
// ESLint: 1 — нашёл ошибки, 2 — сбой конфига или запуска.
const eslintOut = run(['eslint', '.', '--format', 'json', '--quiet'], [1]);
for (const file of JSON.parse(eslintOut)) {
  for (const msg of file.messages) {
    if (msg.ruleId) mark(file.filePath, msg.line, 'eslint', msg.ruleId);
  }
}

let total = 0;
const skipped = [];
for (const [file, lines] of byFile) {
  const text = readFileSync(file, 'utf8');
  const src = text.split('\n');
  const inText = linesInsideText(file, text);
  // Снизу вверх, чтобы вставки не сдвигали ещё не обработанные строки.
  for (const line of [...lines.keys()].sort((a, b) => b - a)) {
    const { ts: tsCodes, eslint } = lines.get(line);
    const target = src[line - 1] ?? '';
    // Внутри многострочной шаблонной строки или JSX-текста комментарий станет текстом.
    // При обоих видах ошибок ESLint-пометка дописывается в конец строки; если там уже есть
    // `//`, она окажется внутри чужого комментария и не сработает.
    const needsTrailing = eslint.size > 0 && tsCodes.size > 0;
    if (inText.has(line) || (needsTrailing && target.includes('//'))) {
      skipped.push(`${file}:${line} ${[...tsCodes, ...eslint].join(', ')}`);
      continue;
    }
    const indent = target.match(/^\s*/)[0];
    const insert = [];
    if (eslint.size > 0) {
      insert.push(`${indent}// eslint-disable-next-line ${[...eslint].sort().join(', ')} -- TODO(strict)`);
    }
    if (tsCodes.size > 0) {
      insert.push(`${indent}// @ts-expect-error TODO(strict): ${[...tsCodes].sort().join(', ')}`);
    }
    // Оба комментария должны стоять прямо над строкой — так не получится. Поэтому при обоих
    // видах ошибок @ts-expect-error идёт над строкой, а ESLint — в её конце (eslint-disable-line).
    if (needsTrailing) {
      insert.splice(0, 1);
      src[line - 1] = `${target} // eslint-disable-line ${[...eslint].sort().join(', ')} -- TODO(strict)`;
    }
    src.splice(line - 1, 0, ...insert);
    total += tsCodes.size + eslint.size;
  }
  writeFileSync(file, src.join('\n'));
}

console.info(`TODO(strict): помечено ${total} ошибок в ${byFile.size} файлах.`);
if (skipped.length > 0) {
  console.info(`Не помечено — внутри шаблонных строк и JSX или после комментария в строке; исправь руками (${skipped.length}):`);
  for (const item of skipped) console.info(`  ${item}`);
}
console.info('Проверь: pnpm typecheck && pnpm lint; затем git diff и коммит отдельным PR.');
