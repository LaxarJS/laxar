
# controls_service

The controls service helps to lookup control assets and implementations.
It should be used via dependency injection as the *axControls* service.

## Contents

**Module Members**
- [provide](#provide)

## Module Members
#### <a name="provide"></a>provide( controlRef )
Provides the implementation module of the given control, for manual instantiation by a widget.

Because the method must return synchronously, it may only be called for controls that have been
loaded before (using `load`)!

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| controlRef | `String` |  a valid control reference as used in the `widget.json` |

##### Returns
| Type | Description |
| ---- | ----------- |
| `*` |  the AMD module for the requested control reference |
