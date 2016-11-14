
# <a id="widget_services_i18n"></a>widget_services_i18n

Factory for i18n widget service instances.

## Contents

**Module Members**

- [create()](#create)

**Types**

- [AxI18n](#AxI18n)
  - [AxI18n.forFeature()](#AxI18n.forFeature)
- [AxI18nHandler](#AxI18nHandler)
  - [AxI18nHandler.localize()](#AxI18nHandler.localize)
  - [AxI18nHandler.update()](#AxI18nHandler.update)
  - [AxI18nHandler.languageTag()](#AxI18nHandler.languageTag)
  - [AxI18nHandler.track()](#AxI18nHandler.track)
  - [AxI18nHandler.format()](#AxI18nHandler.format)
  - [AxI18nHandler.whenLocaleChanged()](#AxI18nHandler.whenLocaleChanged)

## Module Members

#### <a id="create"></a>create( context, optionalOptions )

Creates a widget-specific helper for `didChangeLocale` events.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| context | [`AxContext`](runtime.widget_services.md#AxContext) |  the widget context/scope that the handler should work with. It uses the `eventBus` property there with which it can do the event handling. The i18n service may be asked to `track` more context properties `i18n`, an object that maps each locale to its current language tag. |
| _optionalOptions_ | `Object` |  the fallback language tag to use when no localization is available for a locale's current language tag |
| _optionalOptions.fallback_ | `String` |  the fallback language tag to use when no localization is available for a locale's current language tag |
| _optionalOptions.strict_ | `Boolean` |  if `true`, localizations are only used if the language tags exactly match the current locale's tag (after normalizing case and dash/underscore). If `false` (default), specific requests can be satisfied by general localizations (e.g. a translation for 'en' may be used when missing 'en_GB' was requested). |

##### Returns

| Type | Description |
| ---- | ----------- |
| [`AxI18n`](#AxI18n) |  an i18n instance |

## Types

### <a id="AxI18n"></a>AxI18n

An i18n instance allows to create [`#AxI18nHandler`](#AxI18nHandler) instances for any feature, but is itself also
an i18n handler for the feature `i18n`.
So if the widget using the [`axI18n`](runtime.widget_services.md#axI18n) injection does use the recommended
name `i18n` for the localization feature, use this directly with the i18n handler API.

#### <a id="AxI18n.forFeature"></a>AxI18n.forFeature( featurePath )

Creates and returns an i18n handler for the loclization configuration under the given
[feature path](../glossary#feature-path).
The value is expected to be an object with the key `locale` that is configured with the locale to use
in the widget instance.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| featurePath | `String` |  the feature path localization configuration can be found at |

##### Returns

| Type | Description |
| ---- | ----------- |
| [`AxI18nHandler`](#AxI18nHandler) |  the i18n handler for the given feature path |

### <a id="AxI18nHandler"></a>AxI18nHandler

#### <a id="AxI18nHandler.localize"></a>AxI18nHandler.localize( i18nValue, optionalFallbackValue, languageTag )

Localize the given internationalized object using the given languageTag.

If i18n is configured to be _strict_, the currently active language tag is used to lookup a
translation.
If nothing is found, the `languageTag` argument is tried.
If still nothing is found, `undefined` is returned.

In the case _strict_ is set to `false`, the behavior is the same as in _strict_ mode if an exact
localization is available.
If not, the language tag is successively generalized by stripping off the rightmost sub-tags
until a localization is found.
Eventually, a fallback (default: 'en') is used.
This behavior is especially useful for controls (such as a datepicker), where we cannot
anticipate all required language tags, as they may be app-specific.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| i18nValue | `*` |  a possibly internationalized value:<br>- when passing a primitive value, it is returned as-is<br>- when passing an object, the languageTag is used as a key within that object |
| _optionalFallbackValue_ | `*` |  a value to use if no localization is available for the given language tag |
| _languageTag_ | `String` |  a language tag to override the current locale tag. Only available in _strict_ mode |

##### Returns

| Type | Description |
| ---- | ----------- |
| `*` |  the localized value if found, the fallback (or `undefined`) otherwise |

#### <a id="AxI18nHandler.update"></a>AxI18nHandler.update( languageTag )

Updates the language tag for the configured locale by emitting the according `changeLocaleRequest`
event.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| languageTag | `String` |  the language tag to propagate |

##### Returns

| Type | Description |
| ---- | ----------- |
| `Promise` |  the promise of the event cycle |

#### <a id="AxI18nHandler.languageTag"></a>AxI18nHandler.languageTag()

Returns the language tag set for the configured locale.
If no tag is available, `undefined` is returned.

##### Returns

| Type | Description |
| ---- | ----------- |
| `String` |  the active language tag or `undefined` |

#### <a id="AxI18nHandler.track"></a>AxI18nHandler.track( enabled=true, property=featurePath )

Tracks the current i18n state under the given property.
This includes the current locale and the currently valid tag for this locale.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| _enabled=true_ | `Boolean` |  if `true`, tracking is enabled |
| _property=featurePath_ | `*` |  name of the context property to store the state at |

#### <a id="AxI18nHandler.format"></a>AxI18nHandler.format( i18nValue, optionalIndexedReplacements, optionalNamedReplacements )

Format an i18n value, by first localizing it and then applying substitutions.

These are equivalent:
- `string.format( axI18n.localize( i18nValue ), numericArgs, namedArgs )`
- `axI18n.format( i18nValue, numericArgs, namedArgs )`.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| i18nValue | `String` |  the value to localize and then format |
| _optionalIndexedReplacements_ | `Array` |  replacements for any numeric placeholders in the localized value |
| _optionalNamedReplacements_ | `Object` |  replacements for any named placeholders in the localized value |

##### Returns

| Type | Description |
| ---- | ----------- |
| `String` |  the formatted string after localization |

#### <a id="AxI18nHandler.whenLocaleChanged"></a>AxI18nHandler.whenLocaleChanged( callback )

Registers a callback that is called whenever the new valid locale was received via event.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| callback | `Function` |  the function to call on locale change |
