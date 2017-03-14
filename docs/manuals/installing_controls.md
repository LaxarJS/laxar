# Installing Controls

[« return to the manuals](index.md)

Installing Controls works almost in the same way as [installing widgets](./installing_widgets.md).


## Controls Root

The default directory that the laxar-loader uses when looking for controls within a project is `application/controls/`.
It can be changed by creating a file `laxar.config.js` in your project and configuring the export `paths.controls` to a different string.


## Listing Controls in the Widget Descriptor

The widgets of a LaxarJS application are identified by collecting them from the page definitions.
In turn, the controls are collected based on the `controls` entries collected from all widget descriptors.
Each widget should specify the controls that it requires by referencing their `name` property.
