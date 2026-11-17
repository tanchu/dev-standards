/**
 * Базовый stylelint-конфиг: stylelint-config-standard и общие для всех проектов
 * правила. Сам по себе не подключается — используй `/tailwind` или `/bem`.
 */
export default {
  extends: ['stylelint-config-standard'],
  rules: {
    // Цвета — только через переменные/токены, без `red`, `white` и т. п. в коде.
    'color-named': 'never',
    // `!important` — признак борьбы со специфичностью; если правда нужен — disable с причиной.
    'declaration-no-important': true,
    // Глубина вложенности: дальше 3 уровней селектор трудно читать и переопределять.
    'max-nesting-depth': 3,
    'selector-max-id': 0,
    // Названия шрифтов в переменных (`--font-heading: Georgia, …`) — не ключевые слова CSS.
    'value-keyword-case': ['lower', { ignoreProperties: ['/^--font/'], camelCaseSvgKeywords: true }],
  },
};
