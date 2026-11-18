import path from 'node:path';

/**
 * Папка маршрута, которому принадлежит файл в `app/`: путь до первой приватной папки
 * (`_components`, `_lib`…), а если её нет — папка самого файла.
 *
 * `app/[locale]/about/page.tsx`                 → `app/[locale]/about`
 * `app/[locale]/about/_components/hero.tsx`     → `app/[locale]/about`
 * `app/[locale]/_components/home/reveal.tsx`    → `app/[locale]`
 */
function routeDirOf(appDir, file) {
  const segments = path.relative(appDir, file).split(path.sep);
  const privateIndex = segments.findIndex((segment) => segment.startsWith('_'));
  const routeSegments = privateIndex === -1 ? segments.slice(0, -1) : segments.slice(0, privateIndex);
  return path.join(appDir, ...routeSegments);
}

// Стили, картинки, JSON — не модули маршрута: `globals.css` подключают все раскладки.
// Не по списку расширений кода: `./content.en` — модуль, хотя `extname` даёт `.en`.
const NOT_CODE = /\.(css|scss|sass|less|json|svg|png|jpe?g|gif|webp|avif|ico|woff2?)$/i;

function isInside(dir, file) {
  const relative = path.relative(dir, file);
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

/**
 * Модуль маршрута (страница, её `_components`, `_lib`, контент) импортируется только внутри
 * этого же маршрута. Нужен на двух страницах — переносится в общие компоненты
 * (`src/components`, `src/lib`), и обе страницы берут его оттуда.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
export const noCrossRouteImports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Запрещает импортировать модули одного маршрута `app/` из другого маршрута.',
    },
    schema: [{
      type: 'object',
      properties: {
        rootDir: { type: 'string' },
        srcDir: { type: 'string' },
        sharedDir: { type: 'string' },
      },
      required: ['rootDir'],
      additionalProperties: false,
    }],
    messages: {
      crossRoute:
        '«{{source}}» — модуль маршрута `{{target}}`, а этот файл из `{{own}}`. Компонент страницы '
        + 'используется только своей страницей: нужен на нескольких — перенеси его в `{{shared}}` '
        + 'и импортируй оттуда.',
    },
  },
  create(context) {
    const { rootDir, srcDir = 'src', sharedDir = `${srcDir}/components` } = context.options[0];
    const appDir = path.resolve(rootDir, srcDir, 'app');
    const filename = context.physicalFilename;
    if (!isInside(appDir, filename)) {
      return {};
    }
    const ownRoute = routeDirOf(appDir, filename);

    function check(node) {
      const source = node.source;
      if (source?.type !== 'Literal' || typeof source.value !== 'string') {
        return;
      }
      const spec = source.value;
      let target;
      if (spec.startsWith('.')) {
        target = path.resolve(path.dirname(filename), spec);
      } else if (spec.startsWith('@/')) {
        target = path.resolve(rootDir, srcDir, spec.slice(2));
      } else {
        return;
      }
      if (!isInside(appDir, target) || NOT_CODE.test(target)) {
        return;
      }
      const targetRoute = routeDirOf(appDir, target);
      if (targetRoute === ownRoute) {
        return;
      }
      const shown = (dir) => path.relative(rootDir, dir).split(path.sep).join('/');
      context.report({
        node: source,
        messageId: 'crossRoute',
        data: { source: spec, target: shown(targetRoute), own: shown(ownRoute), shared: sharedDir },
      });
    }

    return {
      ImportDeclaration: check,
      ExportAllDeclaration: check,
      ExportNamedDeclaration: check,
      ImportExpression: check,
    };
  },
};
