# Changelog

## [1.0.0](https://github.com/tanchu/dev-standards/compare/stylelint-config-v0.1.0...stylelint-config-v1.0.0) (2026-11-18)


### ⚠ BREAKING CHANGES

* проекты с произвольными размерами текста (text-[…], font-size: 0.875rem) не проходят lint, пока размеры не заведены токенами темы.

### Features

* размеры текста только из токенов темы, размеры в rem ([#7](https://github.com/tanchu/dev-standards/issues/7)) ([f6c08fe](https://github.com/tanchu/dev-standards/commit/f6c08fe031d4e2cfa627e923bcdd507f769690ac))
