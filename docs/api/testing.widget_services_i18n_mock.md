
# <a id="i18n_mock"></a>i18n_mock

Allows to instantiate a mock implementation of [`AxI18n`](runtime.widget_services_i18n.md), compatible to "axI18n" injection.

## Contents

**Module Members**

- [create()](#create)

## Module Members

#### <a id="create"></a>create( tagsByLocale, context, configuration )

Creates a mock for the "axI18n" injection of a widget.

Custom language tags for locales may be passed on creation, or changed using `mockUpdateLocale`.
Alternatively, pass an AxContext instance to control the feature configuration and/or control the
locale state using events. This is for use by widget test-beds (e.g. LaxarJS Mocks) to connect the i18n
mock to the same event bus and feature configuration as the rest of the test.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| _tagsByLocale_ | `Object` |  starting locales with language tag(s) for which to simulate `didChangeLocale`. Use this to test controls (where using the event bus is out-of-scope) |
| _context_ | [`AxContext`](runtime.widget_services.md#AxContext) |  a context with features and/or eventBus to use. By default (or when set to an empty object), a mock eventBus will be used, and a widget with ID "test-widget" will be assumed, with its feature configuration `"i18n.locale"` set to `"default"` |
| _configuration_ | `AxConfiguration` |  pass a (mock) configuration to control the fallback language tag ("en" by default), using the configuration key `i18n.locales.default` |

##### Returns

| Type | Description |
| ---- | ----------- |
| [`AxI18n`](runtime.widget_services_i18n.md#AxI18n) |  a mock of `axI18n` with preconfigured jasmine spies, plus the `mockUpdateLocale` method |
