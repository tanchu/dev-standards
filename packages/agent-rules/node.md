# Правила сервиса на Node.js (@tanchu/agent-rules)

Дополняют `backend.md` — сначала прочитай его. Здесь — то, что отличает сервис на Node.

## Конфиги

- `tsconfig.json` — `"extends": "@tanchu/tsconfig/node.json"`.
- `eslint.config.mjs` — `defineBackendConfig({ tsconfigRootDir: import.meta.dirname, runtime: 'node' })`.
- Node — актуальная LTS (22/24), версия в `engines` и `.nvmrc`/`packageManager` проекта.

## Документация Node.js

Документация установленной версии (`node -v`, затем nodejs.org/docs/vX/api/), а не память.
API с пометкой Experimental — только с записью в `AGENTS.md` проекта.

## TypeScript без сборки

- Node запускает `.ts` напрямую (type stripping): `node src/index.ts`.
- Только стираемый синтаксис (`erasableSyntaxOnly`): без `enum`, `namespace`,
  параметров-свойств конструктора; вместо `enum` — объединение строк или `as const`-объект.
- Импорты относительных файлов — с расширением: `import { x } from './x.ts'`.
- ESM; встроенные модули — только как `node:fs`, `node:path` (ESLint это ловит).

## Настройки и секреты

- `process.env` читается в одном модуле — `src/config/env.ts` — через схему (ESLint
  запрещает его в остальных файлах). Остальной код получает типизированный config.
- Без нужной переменной сервис падает при старте, а не в середине работы.
- Секреты — переменные окружения на сервере. Их список — схема в `src/config/env.ts`;
  для разработки — `.env` (в `.gitignore`) и `.env.example` без значений.

## Среда

- Фоновая работа — очередь или планировщик с обработкой ошибок; промис без `await` и
  без `.catch` теряет ошибку.
- Корректная остановка: на `SIGTERM`/`SIGINT` перестать принимать запросы, дождаться
  текущих, закрыть соединения.
- В обработчиках — без синхронного I/O (`readFileSync` и т. п.).
- Логи — структурированные (JSON-строка с `level`, `msg`, контекстом), `console.info/warn/error`
  или логгер проекта; `console.log` — нет.

## Тесты

`node --test` или vitest — что уже есть в проекте. Внешние API в тестах — заглушки.
