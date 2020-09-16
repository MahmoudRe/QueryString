# Query String Modifier
It is an easy and a robust way for manipulating / modifying a query string. The `QueryString` class has a set of operation modifies the local query string, with the option to sync it with the current window's query string on the browser. Operations like get, set, update param given its key; get all values of param-list; get sorted date list; and change the hash.

## Installation

`npm i -save query-string-modifier`

Then..
```js
import qs from 'query-string-modifier';

// Initialize QueryString obj with default behavior
const qs = new QueryString(); 

// Then Use it.. :)
qs.appendParam("someKey", "someValue");
qs.get("someKey");    
...
```

## Options
- queryString: `string`
    - Query string which all function modifies.
    - Default = current window query string.
- hash: `string`
    - Default = current window hash
- autoUpdate: `true | false`
    - Update the current window's URL after each modification
    - Default = true

Using option to create a virtual query string, which can be used in Ajax calls, but it won't modify or change current window URL.
```js 
const virtualQS = new QueryString({ 
            queryString: "myCustom=String&key=value", 
            hash: "someHash", 
            autoUpdate: false
        })
```

You can also change all of these configuration after initialization with getter and setter, as follow `getHash()`, `setHash(newValue)`, `getAutoUpdate()`... etc.


## Changes history
#### v2.6
- Change constructor to take object as parameter instead of passing one-by-one value. Check options example.
- getHash() will fetch current windows hash before return if autoUpdate option is set to true.

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