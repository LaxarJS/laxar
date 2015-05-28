
# assert

The *assert* module provides some simple assertion methods for type checks, truthyness tests and guards
invalid code paths.

When requiring `laxar`, it is available as `laxar.assert`.

## Contents

**Module Members**
- [assert](#assert)
- [codeIsUnreachable](#codeIsUnreachable)
- [state](#state)

**Types**
- [Assertion](#Assertion)
  - [Assertion#isNotNull](#Assertion#isNotNull)
  - [Assertion#hasType](#Assertion#hasType)
  - [Assertion#hasProperty](#Assertion#hasProperty)

## Module Members
#### <a name="assert"></a>assert( subject, optionalDetails )
Creates and returns a new `Assertion` instance for the given `subject`.

**Note**: this function is no member of the module, but the module itself. Thus when using `assert` via
laxar, `assert` is will be no simple object, but this function having the other functions as
properties.

Example:
```js
define( [ 'laxar' ], function( ax ) {
   ax.assert( ax.assert ).hasType( Function );
   ax.assert.state( typeof ax.assert.codeIsUnreachable === 'function' );
} );
```

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| subject | `*` | the object assertions are made for |
| _optionalDetails_ | `String` | details that should be printed in case no specific details are given when calling an assertion method |

##### Returns
| Type | Description |
| ---- | ----------- |
| `Assertion` | the assertion instance |

#### <a name="codeIsUnreachable"></a>codeIsUnreachable( optionalDetails )
Marks a code path as erroneous by throwing an error when reached.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| _optionalDetails_ | `String` | details to append to the error message |

#### <a name="state"></a>state( expression, optionalDetails )
Throws an error if the given expression is falsy.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| expression | `*` | the expression to test for truthyness |
| _optionalDetails_ | `String` | details to append to the error message |

## Types
### <a name="Assertion"></a>Assertion

#### <a name="Assertion#isNotNull"></a>Assertion#isNotNull( optionalDetails )
Throws an error if the subject is `null` or `undefined`.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| _optionalDetails_ | `String` | details to append to the error message |

##### Returns
| Type | Description |
| ---- | ----------- |
| `Assertion` | this instance |

#### <a name="Assertion#hasType"></a>Assertion#hasType( type, optionalDetails )
Throws an error if the subject is not of the given type. No error is thrown for `null` or `undefined`.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| type | `Function` | the expected type of the subject |
| _optionalDetails_ | `String` | details to append to the error message |

##### Returns
| Type | Description |
| ---- | ----------- |
| `Assertion` | this instance |

#### <a name="Assertion#hasProperty"></a>Assertion#hasProperty( property, optionalDetails )
Throws an error if the subject is no object or the given property is not defined on it.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| property | `String` | the property that is expected for the subject |
| _optionalDetails_ | `String` | details to append to the error message |

##### Returns
| Type | Description |
| ---- | ----------- |
| `Assertion` | this instance |
