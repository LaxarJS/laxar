
# axId

A module for the `axId` and `axFor` directives.

## Contents

**AngularJS Directives**
- [axId](#axId)
- [axFor](#axFor)

## AngularJS Directives
### <a name="axId"></a>axId
This directive should be used within a widget whenever a unique id for a DOM element should be created.
It's value is evaluated as AngularJS expression and used as a local identifier to generate a distinct,
unique document wide id.

A common use case is in combination with [axFor](#axFor) for input fields having a label.

Example:
```html
<label ax-for="'userName'">Please enter your name:</label>
<input ax-id="'userName'" type="text" ng-model="username">
```

### <a name="axFor"></a>axFor
This directive should be used within a widget whenever an id, generated using the [axId](#axId) directive,
should be referenced at a `label` element.

Example:
```html
<label ax-for="'userName'">Please enter your name:</label>
<input ax-id="'userName'" type="text" ng-model="username">
```
