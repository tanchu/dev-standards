const assert = require('node:assert/strict');
const { test } = require('node:test');
const browserslist = require('browserslist');
const lite = require('caniuse-lite');
const config = require('../index.js');

function unsupported(featureId) {
  const feature = lite.feature(lite.features[featureId]);
  return browserslist(config).filter((entry) => {
    const [browser, version] = entry.split(' ');
    const support = feature.stats[browser]?.[version];
    return !support?.startsWith('y');
  });
}

test('список разворачивается в реальные версии браузеров', () => {
  assert.ok(browserslist(config).length > 50);
});

test('все браузеры списка поддерживают то, без чего ломаются стили', () => {
  for (const feature of ['css-lch-lab', 'css-cascade-layers', 'css-color-function', 'css-media-range-syntax']) {
    assert.deepEqual(unsupported(feature), [], feature);
  }
});
