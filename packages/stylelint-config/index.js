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

    // Цвета — только OKLCH: `oklch(39.45% 0.0367 150.51)`, прозрачность — `oklch(… / 50%)`.
    // Единый формат вместо смеси hex/rgb/hsl; в нём же палитра Tailwind v4. Смешивание —
    // `color-mix(in oklch, …)`, переключение тем — `light-dark()`.
    // Оттенок — числом, без `deg`, как в палитре Tailwind v4: `oklch(62.7% 0.257 29.23)`.
    'hue-degree-notation': 'number',
    'color-no-hex': [true, { message: 'Цвет в hex: пиши в OKLCH — oklch(L% C H)' }],
    'function-disallowed-list': [['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab'], {
      message: (fn) => `Цвет через ${fn}(): пиши в OKLCH — oklch(L% C H)`,
    }],

    // Единицы: размеры шрифта, отступы и брейкпоинты — в rem (учитывают размер шрифта,
    // выбранный пользователем в браузере); межбуквенный интервал — в em; межстрочный —
    // без единиц. px — для рамок, теней, обводки и других «волосяных» деталей.
    'declaration-property-unit-allowed-list': [{
      'font-size': ['rem', 'em', '%', 'vw', 'vh', 'cqi'],
      'line-height': [],
      'letter-spacing': ['em'],
    }, { message: (property, unit) => `${property} в ${unit}: размер шрифта — rem, межбуквенный интервал — em, межстрочный — без единиц` }],
    'declaration-property-unit-disallowed-list': [{
      '/^(margin|padding|gap|row-gap|column-gap|inset)/': ['px'],
    }, { message: (property) => `${property} в px: отступы — в rem` }],
    'media-feature-name-unit-allowed-list': [{
      '/(width|height)$/': ['rem', 'em'],
    }, { message: 'Брейкпоинт в px: пиши в rem (40rem = 640px)' }],
  },
};
