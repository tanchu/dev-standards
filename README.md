# dev-standards

Общие стандарты проектов tanchu на **Next.js + React + TypeScript**: конфиги линтеров и
TypeScript, общий CI и правила разработки для агентов. Цель — правило, появившееся в одном
проекте, одной правкой здесь доходит до всех остальных.

| Что | Где | Как подключить |
|---|---|---|
| ESLint (Next, React, TS, Tailwind v4, a11y, browserslist) | [`@tanchu/eslint-config`](packages/eslint-config) | `defineNextConfig({...})` в `eslint.config.mjs` |
| stylelint (Tailwind v4 или BEM) | [`@tanchu/stylelint-config`](packages/stylelint-config) | `extends: ['@tanchu/stylelint-config/tailwind']` |
| TypeScript | [`@tanchu/tsconfig`](packages/tsconfig) | `"extends": "@tanchu/tsconfig/next.json"` |
| Поддерживаемые браузеры | [`@tanchu/browserslist-config`](packages/browserslist-config) | `"browserslist": ["extends @tanchu/browserslist-config"]` |
| Правила для агентов | [`@tanchu/agent-rules`](packages/agent-rules) | `@node_modules/@tanchu/agent-rules/next.md` в `CLAUDE.md` |
| CI проекта на Next | [`next-ci.yml`](.github/workflows/next-ci.yml) | `uses: tanchu/dev-standards/.github/workflows/next-ci.yml@main` |

Сервер, порты, домены и деплой — в приватном репозитории `tanchu/infra`, не здесь: этот
репозиторий публичный.

## Как правило доходит до всех проектов

1. Правило меняется здесь — PR в `dev-standards` с тестом на фикстуре (`packages/*/test`).
2. После merge release-please открывает PR с новой версией и changelog пакета; его merge
   публикует пакет в npm (trusted publishing, после тестов).
3. Dependabot в каждом проекте открывает PR «bump @tanchu/eslint-config». CI в нём
   показывает, что новые правила нашли в этом проекте.
4. Исправляем: большую часть — `pnpm exec eslint --fix` / `stylelint --fix`, остальное руками.

Общий `next-ci.yml` подключается по `@main`, поэтому изменения CI действуют на все проекты
сразу после merge — меняй его только через PR с проверкой на одном проекте.

## CI проекта

```yaml
# .github/workflows/ci.yml проекта
name: CI
on:
  pull_request:
    branches: [main]
  workflow_call:   # вызывается деплоем перед выпуском
jobs:
  ci:
    uses: tanchu/dev-standards/.github/workflows/next-ci.yml@main
    secrets: inherit
    with:
      env: |
        PAYLOAD_SECRET=ci-only-secret
```

Шаги — скрипты из `package.json` проекта (`lint`, `lint:css`, `typecheck`, `knip`,
`test:unit`, `build`, `test:e2e`); если скрипта нет, шаг пропускается. Версия pnpm берётся
из поля `packageManager`.

## Разработка

```bash
pnpm install
pnpm test
```
