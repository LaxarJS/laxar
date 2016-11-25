# LaxarJS Glossary

While reading LaxarJS manuals and api documentation you will from time to time stumble over terms, that have a certain meaning within the context of LaxarJS.
To prevent from defining these terms over and over again, this document is a collection of all terms and our definition.
If you deem something important is missing here, feel free to [contact us](http://laxarjs.org/the-team/).

## Attribute Path

An attribute path is a JavaScript string that references a property in an object or array, possibly deeply nested.
It consists of a list of keys denoting the path to follow within the object hierarchy.
The keys are written as a string, where each key is separated by a dot from each other.

### Example

Consider the following object:
```js
{
   "something": [
      { "user": { "name": "Tom" } },
      { "user": { "name": "Pete" } },
      { "user": { "name": "Suzi" } }
   ]
}
```
The attribute path `"something.1.user.name"` would then return the string `"Pete"`.

## Feature Path

_Most commonly used as function argument called `featurePath`_

This is an [attribute path](#attribute-path) for a widget feature.
If not said otherwise, the path starts after the `features` key.
You'll find this being used very frequently when working with the [LaxarJS Patterns library](https://github.com/LaxarJS/laxar-patterns).
