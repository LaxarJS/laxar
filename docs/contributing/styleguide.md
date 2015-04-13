# LaxarJS Coding Styles

These are basic coding style guidelines for use with LaxarJS.
Their purpose is to warrant consistency across the code base, so that developers do not need to mentally "switch gears" when working on different parts of the code.


## JavaScript

Most of the LaxarJS code base is written in JavaScript, so this language takes up the bulk of the coding styles.


### 1. Use JSHint

LaxarJS comes with a `.jshintrc` that encodes the LaxarJS code formatting rules and allows you to check them automatically.
You should configure your editor to use this file when working with the LaxarJS code base.
Pull Requests that violate JSHint rules cannot be accepted.


### 2. Use Functions to Create Objects (not `new`).

When using classes with prototypes, it is often difficult to tell if instance methods need to be called directly on an instance (so that `this` is available), or if they can be passed around as callbacks for use with `then`, `map`, `filter` and so on.
Also, the properties defined on `this` are not safe against undesired modification. 
Because of this, and because inheritance is very hard to get right in JavaScript, the recommended way to create objects is by defining a closure that returns the new object or, in most cases, an API to that object.
For example, rather than defining a constructor function `MyService`, have your AMD-module provide a factory function `createMyService` like shown here:

```javascript

/** ...jsdoc... */
function createMyService() {

   var exports = {
      queryValue: queryValue,
      // ...
   };

   var myPrivateValue = 17;
   
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   
   /** ...jsdoc... */
   function queryValue() { /* ... */ }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return exports;
   
}
```

This format ensures that anyone looking at the code can see the structure of the return value without having to go through the implementation.

In some simple cases, you do not need any imperative initialization logic for your object and just want to provide access to a bunch of methods.
To do this, you can omit the intermediate _return_ variable and return the exports right away.

```javascript

/** ...jsdoc... */
function createMyService() {

   return {
      calculateValue: calculateValue,
      // ...
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   
   /** ...jsdoc... */
   function calculateValue() { /* ... */ }
   
}
```


## JSON

Because JSON is a subset of JavaScript, the same formatting rules apply.
But since string literals cannot span multiple lines and cannot be broken up in JSON, the maximum line length may be violated to encode a JSON string that has to be long. 
