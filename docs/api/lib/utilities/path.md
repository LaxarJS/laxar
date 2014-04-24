# Documentation

## join( fragments )
Joins multiple path fragments into one normalized path. Absolute paths (paths starting with a `/`)
and URLs will "override" any preceding paths. I.e. joining a URL or an absolute path to _anything_
will give the URL or absolute path.

### Parameters
- **fragments {...String}**: the path fragments to join


### Returns
- **{String}**: the joined path


## normalize( path )
Normalizes a path. Removes multiple consecutive slashes, strips trailing slashes, removes `.`
references and resolves `..` references (unless there are no preceding directories).

### Parameters
- **path {String}**: the path to normalize


### Returns
- **{String}**: the normalized path
