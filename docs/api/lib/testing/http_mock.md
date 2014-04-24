# Documentation

## HttpMock( q )
A http client mock for unit tests. All mocked http methods (like e.g. `get`, `post` or `put`) are being
spied on.

### Parameters
- **q {$q}**: a promise library conforming to AngularJS's `$q`



## function Object() { [native code] }#history {Array}
A list of all http activities that took place so far. Each entry is a string consisting of the http
method, a boolean flag indicating whether the request could be handled successfully, the requested
url and the time stamp of the request. Use this for debugging purposes in your test case only.


## function Object() { [native code] }#responseMap {Object}
A map of http methods to maps of urls to the mocked response objects.
