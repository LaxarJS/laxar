
# axLayout

A module for the `axLayout` directive.

## Contents

**AngularJS Directives**
- [axLayout](#axLayout)

## AngularJS Directives
### <a name="axLayout"></a>axLayout
This directive uses the *axLayoutLoader* service to load a given layout and compile it as child to the
element the directive is set on. In contrast to *ngInclude* it doesn't watch the provided expression for
performance reasons and takes LaxarJS theming into account when loading the assets.
