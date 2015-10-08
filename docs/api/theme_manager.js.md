
# theme_manager

The theme manager simplifies lookup of theme specific assets. It should be used via AngularJS DI as
*axThemeManager* service.

## Contents

**Module Members**
- [create](#create)

**Types**
- [ThemeManager](#ThemeManager)
  - [ThemeManager#getTheme](#ThemeManager#getTheme)
  - [ThemeManager#urlProvider](#ThemeManager#urlProvider)

## Module Members
#### <a name="create"></a>create( fileResourceProvider, q, theme )
Creates and returns a new theme manager instance.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| fileResourceProvider | `FileResourceProvider` |  the file resource provider used for theme file lookup |
| q | `$q` |  a `$q` like promise library |
| theme | `String` |  the theme to use |

##### Returns
| Type | Description |
| ---- | ----------- |
| `ThemeManager` |   |

## Types
### <a name="ThemeManager"></a>ThemeManager

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| fileResourceProvider | `FileResourceProvider` |  the file resource provider used for theme file lookups |
| q | `$q` |  a `$q` like promise library |
| theme | `String` |  the theme to use |

#### <a name="ThemeManager#getTheme"></a>ThemeManager#getTheme()
Returns the currently used theme.

##### Returns
| Type | Description |
| ---- | ----------- |
| `String` |  the currently active theme |

#### <a name="ThemeManager#urlProvider"></a>ThemeManager#urlProvider( artifactPathPattern, themePathPattern, fallbackPathPatterns )
Returns a URL provider for specific path patterns that are used to lookup themed artifacts. The token
`[theme]` will be replaced by the name of the currently active theme (plus `.theme` suffix) or by
`default.theme` as a fallback. The `provide` method of the returned object can be called with a list of
files for which a themed version should be found. The most specific location is searched first and the
default theme last.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| artifactPathPattern | `String` |  a path pattern for search within the artifact directory itself, based on the current theme |
| _themePathPattern_ | `String` |  a path pattern for search within the current theme |
| _fallbackPathPatterns_ | `Array.<String>` |  fallback paths, used if all else fails. Possibly without placeholders, e.g. for loading the default theme itself. |

##### Returns
| Type | Description |
| ---- | ----------- |
| `[object Object]` |  an object with a provide method |
