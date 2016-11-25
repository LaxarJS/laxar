
# <a id="i18n_mock"></a>i18n_mock

Allows to instantiate a mock implementation of [`AxI18n`](runtime.widget_services_i18n.md), compatible to "axI18n" injection.

## Contents

**Module Members**

- [create()](#create)

## Module Members

#### <a id="create"></a>create( i18n )

Creates a mock for the "axI18n" injection of a widget.

The mock needs to be backed by an actual i18n implementation. In widget tests, the provided implementation
should usually use the same context as the rest of the widget test. Feature-specific locales constructed
multiple times using the `forFeature` method will retain their spies over time, as long as the same mock
object is used.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| i18n | [`AxI18n`](runtime.widget_services_i18n.md#AxI18n) |  a specific backing [`AxI18n`](runtime.widget_services_i18n.md) instance to return localizations from |

##### Returns

| Type | Description |
| ---- | ----------- |
| [`AxI18n`](runtime.widget_services_i18n.md#AxI18n) |  a mock of `axI18n` that can be spied upon and/or mocked with additional items |
