# Documentation

## Assertion( subject, optionalDetails )
Constructor for Assert.

### Parameters
- **subject {*}**: the object assertions are made for

- **optionalDetails {String=}**: details that should be printed whenever no details are given for an assertion method



## Assertion#isNotNull( optionalDetails )
Throws an error if the subject is `null` or `undefined`.

### Parameters
- **optionalDetails {String=}**: details to append to the error message


### Returns
- **{Assertion}**: this instance


## Assertion#hasType( type, optionalDetails )
Throws an error if the subject is not of the given type. No error is thrown for `null` or `undefined`.

### Parameters
- **type {Function}**: the expected type of the subject

- **optionalDetails {String=}**: details to append to the error message


### Returns
- **{Assertion}**: this instance


## Assertion#hasProperty( property, optionalDetails )
Throws an error if the subject is no object or the given property is not defined on it.

### Parameters
- **property {String}**: the property that is expected for the subject

- **optionalDetails {String=}**: details to append to the error message


### Returns
- **{Assertion}**: this instance


## assert( subject, optionalDetails )
Creates and returns a mew `Assertion` instance for the given `subject`.

### Parameters
- **subject {*}**: the object assertions are made for

- **optionalDetails {String=}**: details that should be printed whenever no details are given for an assertion method


### Returns
- **{Assertion}**: the assertion instance


## function Object() { [native code] }#codeIsUnreachable( optionalDetails )
Marks a code path as erroneous if reached by throwing an error.

### Parameters
- **optionalDetails {String=}**: details to append to the error message


## function Object() { [native code] }#state( expression, optionalDetails )
Throws an error if the given expression is falsy.

### Parameters
- **expression {*}**: the expression to test for truthyness

- **optionalDetails {String=}**: details to append to the error message
