# QueryString

## What is it?

## Installation

## Changes history
#### v2.5
- getAllParams to return an object with all `{ key: value }` pairs. Also support key with list of values, as long the key name end with `[]`
- Decode uri params of the query string when performing operation require key lookup like get, set, delete.. etc. So, no need to worry if the query string is encoded.
- Aliases:
    - getValue = getParamValue
    - getAllValues = getAllParamValues
    - getValues = getAllParamValues

#### v2.4 
- [Fix] Bind all class' methods to "this" in constructor

#### v2.3 
- get/set/removeHash
- Aliases:
    - setParam = updateParam
    - deleteParam = removeParam
    - deleteKey = removeKey

#### v2.2 
- Back to ES6 syntax
- togglePram, hasParam and removeKey functions
- updateParam will remove the key if value is falsy
- Simplify constructor
- Typos

#### v2.1 
- General enhancments

#### v2.0 
- Refactor all functions to one QueryString class.
- The class has attribute `this.queryString`, where all class' functions manipulate it, instead of the windows query string directly.
- Auto sync `this.queryString` with window query string, unless `autoUpdate` is false, which can be set through constructor or later with `setAutoUpdate()` function.

#### v1.0
- Utilities functions inside `uri-params.js` file that operate on windows query string by default:
    - updateQueryParams(params)
    - getQueryParams(key)
    - getQueryDateList()
    - updateOrAddParam(key, value, queryString)
    - appendParam(key, value, queryString)
    - deleteParam(key, value, needEscape, queryString)