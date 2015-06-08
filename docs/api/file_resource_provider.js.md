
# file_resource_provider

The *file_resource_provider* module defines a mechanism to load static assets from the web server of the
LaxarJS application efficiently. Whenever a file should be requested from the server, the file resource
provider should be used in favor of manual http requests, due to two reasons: During development it reduces
the amount of `404` status replies for files that may or may not exist, and when making a release build,
file contents may optionally be embedded in the build bundle. This makes further http requests redundant,
which is especially relevant in high-latency networks, such as cellular networks.

This module should not be used directly, but via the `axFileResourceProvider` service provided by LaxarJS.

## Contents

**Module Members**
- [create](#create)
- [init](#init)

**Types**
- [FileResourceProvider](#FileResourceProvider)
  - [FileResourceProvider#provide](#FileResourceProvider#provide)
  - [FileResourceProvider#isAvailable](#FileResourceProvider#isAvailable)
  - [FileResourceProvider#setFileListingUri](#FileResourceProvider#setFileListingUri)
  - [FileResourceProvider#setFileListingContents](#FileResourceProvider#setFileListingContents)

## Module Members
#### <a name="create"></a>create( rootPath )
Creates and returns a new instance.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| rootPath | `String` |  the path to the root of the application. It is needed to prefix relative paths found in a listing with an absolute prefix |

##### Returns
| Type | Description |
| ---- | ----------- |
| `FileResourceProvider` |  a new instance |

#### <a name="init"></a>init( q, httpClient )
Initializes the module.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| q | `Object` |  a promise library like AngularJS' `$q` |
| httpClient | `Object` |  a http client whose api conforms to AngularJS' `$http` service |

## Types
### <a name="FileResourceProvider"></a>FileResourceProvider

#### <a name="FileResourceProvider#provide"></a>FileResourceProvider#provide( url )
If available, resolves the returned promise with the requested file's contents. Otherwise the promise is
rejected. It uses the file mapping prior to fetching the contents to prevent from 404 errors. In the
optimal case the contents are already embedded in the listing and simply need to be returned. If no
listing for the path is available, a request simply takes place and either succeeds or fails.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| url | `String` |  the uri to the resource to provide |

##### Returns
| Type | Description |
| ---- | ----------- |
| `Promise` |  resolved with the file's content or rejected when the file could not be fetched |

#### <a name="FileResourceProvider#isAvailable"></a>FileResourceProvider#isAvailable( url )
Resolves the returned promise with `true` as argument, if the requested resource is available and
`false` otherwise.  If no listing for the path is available, a HEAD request takes place and either
succeeds or fails.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| url | `String` |  the uri to check for availability |

##### Returns
| Type | Description |
| ---- | ----------- |
| `Promise` |  a promise that is always resolved with a boolean value |

#### <a name="FileResourceProvider#setFileListingUri"></a>FileResourceProvider#setFileListingUri( directory, listingUri )
Sets the uri to a file listing file for a given path.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| directory | `String` |  the directory the file listing is valid for |
| listingUri | `String` |  the uri to the listing file |

#### <a name="FileResourceProvider#setFileListingContents"></a>FileResourceProvider#setFileListingContents( directory, listing )
Sets the contents of a file listing file to the given object. This a useful alternative to
[FileResourceProvider#setFileListingUri](#FileResourceProvider#setFileListingUri), to avoid an additional round-trip during production.

##### Parameters
| Property | Type | Description |
| -------- | ---- | ----------- |
| directory | `String` |  the directory the file listing is valid for |
| listing | `String` |  the actual file listing |
