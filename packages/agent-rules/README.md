# @tanchu/agent-rules

Общие правила разработки для агентов (Claude Code, Codex) и людей:

| Файл | Для чего |
|---|---|
| `next.md` | проекты на Next.js |
| `backend.md` | общая часть бэкенда: типы, внешние данные, ошибки, структура, переход на строгий режим |
| `worker.md` | Cloudflare Worker — вместе с `backend.md` |
| `node.md` | сервис на Node.js — вместе с `backend.md` |

Правила проекта (что он делает, внешние API, данные, деплой) остаются в его `AGENTS.md`;
здесь — то, что одинаково для всех проектов.

```bash
pnpm add -D @tanchu/agent-rules
```

## Claude Code

`CLAUDE.md` проекта — список подключаемых правил:

```md
<!-- Next.js -->
@node_modules/@tanchu/agent-rules/next.md
@AGENTS.md
```

```md
<!-- Cloudflare Worker; для Node — node.md; монорепо с обеими средами — обе строки -->
@node_modules/@tanchu/agent-rules/backend.md
@node_modules/@tanchu/agent-rules/worker.md
@AGENTS.md
```

Claude Code подставляет файлы по `@путь`, поэтому новая версия правил приходит в проект
вместе с обновлением пакета (PR от Dependabot).

## Codex и другие агенты

Codex читает только `AGENTS.md` и `@путь` не подставляет: общие правила он не увидит, если
не сказать о них явно. Поэтому `AGENTS.md` начинается со ссылки на них.

### Шаблон `AGENTS.md` бэкенд-проекта

Сюда — только то, что знает один проект. Всё, что верно для любого Worker или Node-сервиса,
уже в `backend.md`, `worker.md`, `node.md` — не повторяй.

````md
# AGENTS.md

Перед любой работой прочитай целиком `node_modules/@tanchu/agent-rules/backend.md` и
`node_modules/@tanchu/agent-rules/worker.md` (Node-сервис — `node.md`) — это общие правила;
ниже — правила этого проекта, при расхождении правы они. Нет `node_modules` — сначала
`pnpm install`.

## Что это

Одна-две фразы: что делает проект и для кого.

## Состав

| Папка | Что | Среда |
|---|---|---|
| `workers/…` | … | Worker |
| `services/…` | … | Node |
| `packages/*` | общий код и схемы | любая |

## Внешние API и данные

- Какие API, каким клиентом; где схемы входящих вебхуков и ответов.
- Что лежит в KV/R2/D1/БД.
- Список секретов (только имена).

## Команды

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## Выпуск

Как выкладывается Node-сервис (Worker — `wrangler deploy` из workflow выпуска по тегу `v*`).
````

## Переход на строгий режим

`backend.md`, раздел «Переход на строгий режим». Исходный долг размечает скрипт из пакета:

```bash
pnpm exec tanchu-strict-baseline            # в папке пакета с tsconfig.json и eslint.config.mjs
pnpm exec tanchu-strict-baseline workers/bot
```

Скрипт запускает `tsc --noEmit` и `eslint .` проекта и над каждой ошибкой ставит
`@ts-expect-error TODO(strict): …` или `eslint-disable-next-line … -- TODO(strict)`.
Строки, где комментарий поставить нельзя (внутри шаблонных строк и JSX, строки с
комментарием в конце), выводит списком для ручной правки. Запускай на чистом рабочем дереве
и смотри diff.

## Источники вендоров

Правила ссылаются на официальные источники — документацию Next.js в пакете, Modern Web
Guidance (Google Chrome), Vercel agent-skills, Cloudflare skills, документацию Node.js — и
говорят, когда ими пользоваться. Сам их текст сюда не копируется: он обновляется у вендоров.
