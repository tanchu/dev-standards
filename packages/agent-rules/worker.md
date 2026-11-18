# Правила Cloudflare Worker (@tanchu/agent-rules)

Дополняют `backend.md` — сначала прочитай его. Здесь — то, что отличает Worker.

## Конфиги

- `tsconfig.json` — `"extends": "@tanchu/tsconfig/worker.json"`, `types` —
  `["./worker-configuration.d.ts"]`.
- `eslint.config.mjs` — `defineBackendConfig({ tsconfigRootDir: import.meta.dirname, runtime: 'worker' })`.
- Настройки — `wrangler.jsonc`. В `typecheck` входит `wrangler types --check`: устаревшие
  типы `Env` — ошибка CI.

## Официальные скиллы Cloudflare

Не копируем сюда — подключаем как живой источник: `npx skills add https://github.com/cloudflare/skills`,
в Claude Code — плагин `cloudflare@cloudflare`. Перед кодом Worker — `workers-best-practices`;
деплой, биндинги, KV/R2/D1/Queues — `wrangler`; Durable Objects — `durable-objects`. Скиллы
берут ответы из текущей документации Cloudflare — доверяй ей, а не памяти: API меняются
быстро. Если наши правила с ними расходятся, правы наши.

## Среда

- **Нет глобального изменяемого состояния**: изолят переиспользуется между запросами и
  пользователями. Состояние — в KV/D1/R2/Durable Objects.
- Переменные и секреты — из `env` (биндинги), не `process.env` (ESLint это ловит). Тип `Env`
  генерирует `wrangler types` (`worker-configuration.d.ts`, руками не правится; свои типы —
  отдельным файлом через `Cloudflare.Env`). После правки `wrangler.jsonc` — перегенерируй.
- Секреты — `wrangler secret put <ИМЯ>`, не в `wrangler.jsonc` и не в `vars`. Для
  разработки — `.dev.vars` (в `.gitignore`) и `.dev.vars.example` без значений.
- Фоновая работа после ответа — `ctx.waitUntil(promise)`, с обработкой ошибки внутри
  промиса. Без `waitUntil` работа обрывается вместе с запросом.
- Тело запроса и ответа читается один раз; большие ответы — потоком, без буферизации.
- Node-API — только с флагом `nodejs_compat` и импортом `node:*`.
- Помни о лимитах (CPU-время, число подзапросов, размер тела): тяжёлое — в Queues/Workflows.

## Тесты и запуск

- Тесты — `@cloudflare/vitest-pool-workers` (настоящий рантайм workerd), не Node.
- Локально — `wrangler dev`.
- `wrangler deploy` — только из workflow выпуска, не с локальной машины.
