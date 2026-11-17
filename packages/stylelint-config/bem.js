import base from './index.js';

/**
 * BEM: блок, элемент и модификатор в kebab-case —
 * `block`, `block__element`, `block--modifier`, `block__element--modifier`.
 */
const BEM_CLASS = '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$';

/**
 * Для проектов без Tailwind — обычный CSS или CSS Modules. Имена классов по BEM.
 * В CSS Modules блок — это сам модуль (`fab.module.css`), внутри — его элементы
 * и модификаторы: `.fab`, `.fab__icon`, `.fab--open`.
 */
export default {
  ...base,
  rules: {
    ...base.rules,
    'selector-class-pattern': [BEM_CLASS, {
      resolveNestedSelectors: true,
      message: (selector) => `Класс ${selector} не по BEM: block, block__element, block--modifier (kebab-case)`,
    }],
    // CSS Modules: `:global(...)` / `:local(...)`, `composes`, `@value`.
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global', 'local', 'export', 'import'] }],
    'property-no-unknown': [true, { ignoreProperties: ['composes'] }],
    'at-rule-no-unknown': [true, { ignoreAtRules: ['value'] }],
  },
};
