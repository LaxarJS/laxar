# Documentation

## HttpMock( q )
A http client mock for unit tests. All mocked http methods (like e.g. `get`, `post` or `put`) are being
spied on.

### Parameters
- **q {$q}**: a promise library conforming to AngularJS's `$q`



## HttpMock#history {Array}
A list of all http activities that took place so far. Each entry is a string consisting of the http
method, a boolean flag indicating whether the request could be handled successfully, the requested
url and the time stamp of the request. Use this for debugging purposes in your test case only.


## HttpMock#responseMap {Object}
A map of http methods to maps of urls to the mocked response objects.


## HttpMock#reset()
Resets the http mock by deleting all response mocks and the history recorded so far.

## HttpMock#setHttpResponse( method, uri, response )
Sets a new mocked http response. If a response for the given method / uri combination already exists,
it will be overwritten. If `response` is `null`, the entry is deleted. Use this method instead of
`respondWith`, if a more sophisticated response should be simulated or failed requests using a status
code of `404` for example.

### Parameters
- **method {String}**: the http method to mock

- **uri {String}**: the uri to mock the response for

- **response {Object}**: the response object, probably with `status`, `data` and `headers` fields


## HttpMock#respondWith( [optionalMethod], uri, data )
Sets a response for a status code of `200` without any headers. Thus only the `data` field must be
given for the response. If `data` is `null`, the entry is deleted.

### Parameters
- **_optionalMethod_ {String}**: the http method to use. If omitted, `GET` is assumed

- **uri {String}**: the uri to mock the response for

- **data {Object}**: the payload of the response
