# Documentation

## function Object() { [native code] }#mockResult( method, selectorOrElement, result )
Mocks the result to a jQuery method call. The mocked result is only returned if `selectorOrElement`
matches either the selector or the DOM element the jQuery object was created with.

### Parameters
- **method {String}**: name of the method to mock the result for

- **selectorOrElement {String|HTMLElement}**: the selector or DOM element for which the mocked result is returned

- **result {*}**: the mocked result


## function Object() { [native code] }#mockMethod( method, selectorOrElement, mockMethod )
Mocks the call to a jQuery method. The mock method is only called if `selectorOrElement` matches either
the selector or the DOM element the jQuery object was created with.

### Parameters
- **method {String}**: name of the method to mock the result for

- **selectorOrElement {String|HTMLElement}**: the selector or DOM element for which the mocked result is returned

- **mockMethod {Function}**: the function to call instead of the original one


## function Object() { [native code] }#mockReset()
Removes all mocked methods and results from jQuery and reattaches the original implementations.