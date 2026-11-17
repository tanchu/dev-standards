# @tanchu/agent-rules

Общие правила разработки для агентов (Claude Code) и людей в проектах на Next.js.
Правила проекта (данные компании, деплой, свои компоненты) остаются в его `AGENTS.md`;
здесь — то, что одинаково для всех проектов.

```bash
pnpm add -D @tanchu/agent-rules
```

`CLAUDE.md` проекта:

```md
@node_modules/@tanchu/agent-rules/next.md
@AGENTS.md
```

Claude Code подставляет файлы по `@путь`, поэтому новая версия правил приходит в проект
вместе с обновлением пакета (PR от Dependabot).

Правила ссылаются на официальные источники вендоров — документацию Next.js в пакете,
Modern Web Guidance (Google Chrome), Vercel agent-skills — и говорят, когда ими
пользоваться. Сам их текст сюда не копируется: он обновляется у вендоров.
