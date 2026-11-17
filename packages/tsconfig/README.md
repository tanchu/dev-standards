# @tanchu/tsconfig

Общие настройки TypeScript для проектов на Next.js: `strict`, `noUnusedLocals`,
`noUnusedParameters`, `moduleResolution: bundler`, плагин `next`.

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
