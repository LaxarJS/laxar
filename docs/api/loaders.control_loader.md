
# <a id="control_loader"></a>control_loader

The control loader helps to load control assets and implementations.

## Contents

**Types**

- [ControlLoader](#ControlLoader)
  - [ControlLoader.provide()](#ControlLoader.provide)
  - [ControlLoader.load()](#ControlLoader.load)

## Types

### <a id="ControlLoader"></a>ControlLoader

#### <a id="ControlLoader.provide"></a>ControlLoader.provide( controlRef )

Provides the implementation module of the given control, for manual instantiation by a widget.

Because the method must return synchronously, it may only be called for controls that have been
loaded before (using [`#load()`](#load))!
For controls that are correctly listed in the `controls` section of the `widget.json`, this is ensured
by the widget loader.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| controlRef | `String` |  a valid control reference as used in the `widget.json` |

##### Returns

| Type | Description |
| ---- | ----------- |
| `*` |  the module for the requested control reference |

#### <a id="ControlLoader.load"></a>ControlLoader.load( controlRef )

Fetches the descriptor for a given control reference, and saves it as a side-effect.
This is part of the internal API used by the widget loader.

This process must be completed before the descriptor or the module for a control can be provided.
For this reason, `load` is called by the widget-loader, using information from the `widget.json` file.

##### Parameters

| Property | Type | Description |
| -------- | ---- | ----------- |
| controlRef | `String` |  a valid control reference as used in the `widget.json` |

##### Returns

| Type | Description |
| ---- | ----------- |
| `Promise` |  a promise for the (fetched or synthesized) control descriptor |
