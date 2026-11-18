# @tanchu/agent-rules

Общие правила разработки для агентов (Claude Code, Codex) и людей:

- `next.md` — проекты на Next.js;
- `backend.md` — Cloudflare Workers и сервисы на Node.js.

Правила проекта (данные компании, деплой, свои компоненты) остаются в его `AGENTS.md`;
здесь — то, что одинаково для всех проектов.

```bash
pnpm add -D @tanchu/agent-rules
```

`CLAUDE.md` проекта (для бэкенда — `backend.md` вместо `next.md`):

```md
@node_modules/@tanchu/agent-rules/next.md
@AGENTS.md
```

Claude Code подставляет файлы по `@путь`, поэтому новая версия правил приходит в проект
вместе с обновлением пакета (PR от Dependabot).

### Codex и другие агенты

Codex читает только `AGENTS.md` и `@путь` не подставляет: общие правила он не увидит, если
не сказать о них явно. Первые строки `AGENTS.md` проекта:

```md
# AGENTS.md

Перед любой работой прочитай целиком `node_modules/@tanchu/agent-rules/backend.md` — это
общие правила; ниже — правила этого проекта, при расхождении правы они.
```

Если `node_modules` ещё нет — сначала `pnpm install`.

Правила ссылаются на официальные источники вендоров — документацию Next.js в пакете,
Modern Web Guidance (Google Chrome), Vercel agent-skills — и говорят, когда ими
пользоваться. Сам их текст сюда не копируется: он обновляется у вендоров.
