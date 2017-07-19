
# <a id="bootstrap"></a>bootstrap

Module providing bootstrapping machinery.

## Contents

**Types**

- [AxBootstrap](#AxBootstrap)
- [ItemMeta](#ItemMeta)
  - [ItemMeta.instance](#ItemMeta.instance)
  - [ItemMeta.item](#ItemMeta.item)
  - [ItemMeta.type](#ItemMeta.type)
  - [ItemMeta.${type}](#ItemMeta.${type})

## Types

### <a id="AxBootstrap"></a>AxBootstrap

An API to bootstrap (additional) artifacts.

### <a id="ItemMeta"></a>ItemMeta

An object of strings which together identify a bootstrapping item.

#### <a id="ItemMeta.instance"></a>ItemMeta.instance `String`

The (topic-formatted) name of the LaxarJS instance.
#### <a id="ItemMeta.item"></a>ItemMeta.item `String`

The (topic-formatted, ID-suffixed) name of the bootstrapping item.
#### <a id="ItemMeta.type"></a>ItemMeta.type `String`

The type of the bootstrapping item.
#### <a id="ItemMeta.${type}"></a>ItemMeta.${type} `String`

The artifact reference used for creating the bootstrapping item.
