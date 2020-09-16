/**
 * @version 2.6.3
 * @author Mahmoud Al-Refaai <Schuttelaar & Partners>
 */

export default class QueryString {

    /**
     * By default, this constructor takes no parameters and set its queryString directly from URL.
     * Optionally, a custom queryString and hash can be given als parameter.
     * @param {String} queryString  Custom query string to be used. Default is the query string of current URL will be used (without the hash)
     * @param {String} hash         Custom hash. Default is the hash of current URL will be used
     * @param {bool}   autoUpdate   update the current window's URL after each modification. This set to true by default
     */
    constructor({ queryString, hash, autoUpdate } = {}) {

        // attr
        this.queryString = queryString ? queryString : this.getWindowQueryString();
        this.autoUpdate = autoUpdate ? autoUpdate : true;
        this.hash = window.location.hash.substr(1);

        if (hash) this.setHash(hash);
        this.autoUpdate && queryString && this.set(queryString);

        // Bind all class' functions to "this"
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
        methods
            .filter(method => (method !== 'constructor'))
            .forEach((method) => { this[method] = this[method].bind(this); });
    }

    // ------------------ [Getters and Setters] ------------------ //
    /**
     * By default, return this.queryString attribute.
     * If the key is given, then return the first value of this key.
     * @param {String} key (optional)
     */
    get(key) {
        if (key) return this.getParamValue(key);
        return this.queryString;
    }
    set(queryString) {
        this.queryString = queryString;
        if (this.autoUpdate) this.updateQueryString();
    }
    getAutoUpdate() {
        return this.autoUpdate;
    }
    setAutoUpdate(bool) {
        this.autoUpdate = bool;
    }

    // --------------- [QueryString functions] --------------- //

    /**
     * Get the whole string after "?" from the current window's URL, 
     * update "this.queryString" and return it.
     * @return {String} the query string
     */
    getWindowQueryString() {
        this.queryString = window.location.search.substr(1);
        this.hash = window.location.hash.substr(1);
        return this.queryString;
    }

    /**
     * Update the current window's URL with "this.queryString"
     */
    updateQueryString() {
        let url = window.location.href;
        let urlParts = url.split('?');

        if (urlParts.length > 0) {
            let urlHash = this.hash ? "#" + this.hash : "";
            let updatedURL = urlParts[0] + '?' + this.queryString + urlHash;
            window.history.replaceState({}, document.title, updatedURL);
            return true;
        } else {
            return false;
        }
    }

    // ---------------[Param functions]--------------- //
    /**
     * Get all parameters as object where { key: value } for single value params , 
     * and { key[]: [values_array] } for list parameters (ie. key name end with [])
     * @return {Object} Object with all parameter of this queryString
     */
    getAllParams() {
        let paramsObj = {};
        this.queryString.split('&').forEach(e => {
            let param = e.split('=');
            param[0] = decodeURI(param[0]);

            if (param[0].slice(-2) === "[]") {
                if (!paramsObj[param[0]]) paramsObj[param[0]] = [];
                paramsObj[param[0]].push(param[1]);
            } else {
                paramsObj[param[0]] = param[1];
            }
        });
        return paramsObj;
    }

    /**
     * get the first value of the given parameter's key.
     * @param {String} key the parameter's key to look for.
     * @return {String} if getAll set to false, return the first value of the given key.
     */
    getParamValue(key) {
        let paramList = this.queryString.split('&');
        for (let i = 0; i < paramList.length; i++) {
            let param = paramList[i].split('=');
            if (decodeURI(param[0]) == key) {
                return param[1];
            }
        }
        return '';
    }
    getValue(key) { this.getParamValue(key); }

    /**
     * Get a list of all values that corresponds to the given parameter's key.
     * @param {String} key the parameter's key to look for.
     * @return {Array} if getAll set to true, return list of all values of the given key.
     */
    getAllParamValues(key) {
        let paramList = this.queryString.split('&');
        let valueList = [];
        for (let i = 0; i < paramList.length; i++) {
            let param = paramList[i].split('=');

            if (decodeURI(param[0]) == key) {
                valueList.push(param[1]);
            }
        }
        return valueList;
    }
    getAllValues(key) { return this.getAllParamValues(key); }
    getValues(key) { return this.getAllParamValues(key); }

    /**
     * Get list of all dates from "this.queryString". The dates paramter should be like: [ dateParamKey=VALUE ].
     * The resulted list is ASC sorted.
     * @param {String} dateParamKey the parameter's key of the dates (default => "dates[]").
     * @return {Array} array of date-strings
     */
    getDateList(dateParamKey = 'dates[]') {
        let dateList = this.getAllParamValues(dateParamKey);

        //sort the date ASC
        dateList.sort(function(a, b) {
            // Turn strings into dates, and then subtract them 
            // return (negative | positive | 0)
            return (new Date(a) - new Date(b));
        });
        return dateList;
    }

    /**
     * Replace the value of the given parameter's key.
     * If this key does not exist, append a new parameter to "this.queryString".
     * If the value is falsy (except int 0), remove the parameter.
     * @param {String} key
     * @param {String} value 
     * @return {String} this.queryString after modification
     */
    updateParam(key, value) {
        if (!key) return this.queryString;
        if (!value && value !== 0) return this.removeKey(key);

        var regex = new RegExp(`(${key}=.*?)($|&)`, 'g');

        if (this.queryString.match(regex)) {
            // key is existed, so update the value
            this.queryString = this.queryString.replace(regex, `$1${key}=${value}$3`);
        } else {
            // key is not existed, so append it
            let prefix = this.queryString.length ? '&' : '';
            this.queryString += prefix + key + '=' + value;
        }

        if (this.autoUpdate) this.updateQueryString();
        return this.queryString;
    }
    setParam(key, value) { this.updateParam(key, value); }

    /**
     * Append a new parameter to "this.queryString" (even if the key is already existed).
     * If the value is falsy (except int 0), return without appending.
     * @param {String} key
     * @param {String} value 
     * @return {String} this.queryString after modification
     */
    appendParam(key, value) {
        if (!key) return this.queryString;
        if (!value && value !== 0) return this.queryString;

        let prefix = !this.queryString.length ? '' : '&';
        this.queryString += prefix + key + '=' + value;

        if (this.autoUpdate) this.updateQueryString();
        return this.queryString;
    }

    /**
     * Remove the given query parameter [ KEY=VALUE ] from "this.queryString".
     * If value isn't given 
     * @param {String} key
     * @param {String} value (optional)
     * @param {Bool} removeOnlyFirstOccurrence set to true, to remove only the first occurrence
     * @param {Bool} noEscape set to true if you need to pass regex expression as a key or if key/value strings are already escaped
     * @return {String} this.queryString after modification
     */
    removeParam(key, value, removeOnlyFirstOccurrence = false, noEscape = false) {
        if (!key) return this.queryString;
        if (!value && value !== 0) return this.removeKey(key);
        if (!noEscape) {
            key = escapeRegExp(key);
            value = escapeRegExp(value);
        }

        //NOTE: URLSearchParams() is an option but it is not compatible with IE, so I didn't use it.
        var regex = new RegExp(`(${key}=${value})($|&)`, `g`);
        this.queryString = this.queryString.replace(regex, ``);
        this.queryString = this.queryString.replace(/^[&]*/, ``);

        if (this.queryString.match(regex) && !removeOnlyFirstOccurrence)
            return this.removeParam(key);

        if (this.autoUpdate)
            this.updateQueryString();

        return this.queryString;
    }
    deleteParam(key, value, removeOnlyFirstOccurrence = false, noEscape = false) {
        this.removeParam(key, value, removeOnlyFirstOccurrence, noEscape);
    }

    /**
     * Remove any parameter with the given key from "this.queryString".
     * @param {String} key
     * @param {Bool} removeOnlyFirstOccurrence set to true, to remove only the first occurrence
     * @param {Bool} noEscape set to true if you need to pass regex expression as a key or if key/value strings are already escaped
     * @return {String} this.queryString after modification
     */
    removeKey(key, removeOnlyFirstOccurrence = false, noEscape = false) {
        if (!key) return this.queryString;
        if (!noEscape)
            key = escapeRegExp(key);

        var regex = new RegExp(`(${key}=.*?)($|&)`, `g`);
        this.queryString = this.queryString.replace(regex, ``);
        this.queryString = this.queryString.replace(/^[&]*/, ``);

        if (this.queryString.match(regex) && !removeOnlyFirstOccurrence)
            return this.removeKey(key);

        if (this.autoUpdate)
            this.updateQueryString();

        return this.queryString;
    }
    deleteKey(key, removeOnlyFirstOccurrence = false, noEscape = false) {
        this.removeKey(key, removeOnlyFirstOccurrence, noEscape);
    }

    /**
     * Check whether this.queryString has the given paramter [ key=value ].
     * If the value is not set, then check whether any parameter has the given key.
     * @param {String} key 
     * @param {String} value (optional attribute) 
     * @param {Bool} noEscape set to true if you need to pass regex expression as a key or if key/value strings are already escaped
     * @returns {bool} bool wether this.queryString has the given paramter
     */
    hasParam(key, value, noEscape = false) {
        if (!key) return false;
        if (!noEscape) {
            key = escapeRegExp(key);
            if (value) value = escapeRegExp(value);
        }
        //if there the value is not set, then remove all parameters matches the given key
        if (!value && value !== 0) value = '[^&]*';

        let regex = new RegExp(`(${key}=${value})`, `g`);
        return this.queryString.match(regex);
    }

    /**
     * Append/Remove the given paramter from "this.queryString".
     * @param {String} key 
     * @param {String} value
     * @return {String} this.queryString after modification 
     */
    toggleParam(key, value) {
        if (this.hasParam(key, value)) {
            this.removeParam(key, value);
        } else {
            this.appendParam(key, value);
        }
    }

    // -------------------- [Get/Set Hash] -------------------- //
    /**
     * Shorthand functions to get the hash part of URL.
     */
    getHash() {
        if (this.autoUpdate) this.hash = window.location.hash.substr(1);
        return this.hash;
    }
    setHash(hash) {
        if (!hash && hash !== 0)
            this.hash = '';
        else if (("" + hash).charAt(0) === '#')
            this.hash = hash.substr(1);
        else
            this.hash = hash;

        if (this.autoUpdate)
            this.updateQueryString();
    }
    removeHash() { this.setHash(''); }
    deleteHash() { this.setHash(''); }

}

// ------- helper functions ------- //

/**
 * Escape all special characters of regex expressions.
 * @param {String} str 
 * @return {String} escaped string that ready to be used in regex expressions.
 */
function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}