
# <a id="pages"></a>pages

A module for compatibility with old LaxarJS tooling.

## Contents

**Types**

- [PagesTooling](#PagesTooling)
  - [PagesTooling.enable()](#PagesTooling.enable)
  - [PagesTooling.disable()](#PagesTooling.disable)
  - [PagesTooling.current()](#PagesTooling.current)
  - [PagesTooling.addListener()](#PagesTooling.addListener)
  - [PagesTooling.removeListener()](#PagesTooling.removeListener)

## Types

### <a id="PagesTooling"></a>PagesTooling

#### <a id="PagesTooling.enable"></a>PagesTooling.enable()

Start collecting page/composition data.

#### <a id="PagesTooling.disable"></a>PagesTooling.disable()

Stop collecting page/composition data.

#### <a id="PagesTooling.current"></a>PagesTooling.current()

Access the current page information.
Everything is returned as a copy, sothis object cannot be used to modify the host application.

##### Returns

| Type | Description |
| ---- | ----------- |
| `Object` |  the current page information, with the following properties:<br>- `pageDefinitions` {Object} both the original as well as the expanded/flattened page model for each available page<br>- `compositionDefinitions` {Object} both the original as well as the expanded/flattened composition model for each composition of any available page<br>- `widgetDescriptors` {Object} the widget descriptor for each widget that was referenced<br>- `pageReference` {String} the reference for the current page, to lookup page/composition definitions |

#### <a id="PagesTooling.addListener"></a>PagesTooling.addListener( callback )

Add a listener function to be notified whenever the page information changes.
As a side-effect, this also automatically enables collecting page/composition data.
Each listener will be delivered its own copy of the page information.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| callback | `Function` |  The listener to add. Will be called with the current page information whenever that changes. |

#### <a id="PagesTooling.removeListener"></a>PagesTooling.removeListener( callback )

Remove a page information listener function.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| callback | `Function` |  The listener to remove |
