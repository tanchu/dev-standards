# @tanchu/tsconfig

Общие настройки TypeScript для проектов tanchu:

| Пресет | Для чего |
|---|---|
| `next.json` | Next.js: `strict`, `moduleResolution: bundler`, плагин `next` |
| `worker.json` | Cloudflare Worker: `strict` + `noUncheckedIndexedAccess`, без DOM, бандлер wrangler |
| `node.json` | Node.js 22/24: `NodeNext`, запуск `.ts` без сборки (`erasableSyntaxOnly`) |

В `worker.json` и `node.json` сверх `strict` включены `noUncheckedIndexedAccess`
(`arr[i]` и `obj[key]` — возможно `undefined`), `noImplicitOverride`, `noImplicitReturns`,
`verbatimModuleSyntax`.

```bash
pnpm add -D @tanchu/tsconfig
```

`tsconfig.json` проекта:

```json
{
  "extends": "@tanchu/tsconfig/next.json",
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`paths`, `include` и `exclude` остаются в проекте: в `extends` они считались бы
относительно пакета, а не проекта.

## Cloudflare Worker

```json
{
  "extends": "@tanchu/tsconfig/worker.json",
  "compilerOptions": {
    "types": ["./worker-configuration.d.ts"]
  },
  "include": ["src/**/*.ts", "test/**/*.ts", "worker-configuration.d.ts"]
}
```

`worker-configuration.d.ts` генерирует `wrangler types` (типы рантайма по
`compatibility_date` и тип `Env` по биндингам). С флагом `nodejs_compat` добавь `"node"` в
`types` и `@types/node` в зависимости. Общий пакет монорепо, который не Worker, —
`"types": ["@cloudflare/workers-types"]`.

## Node.js

```json
{
  "extends": "@tanchu/tsconfig/node.json",
  "include": ["src/**/*.ts", "test/**/*.ts"]
}
```

```bash
pnpm add -D @tanchu/tsconfig @types/node typescript
node src/index.ts   # Node 22.18+ запускает TypeScript без сборки
```

Импорты относительных файлов — с расширением: `import { x } from './x.ts'`.
