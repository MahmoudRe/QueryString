/**
 * @version 2.7.1
 * @author Mahmoud Al-Refaai <Schuttelaar & Partners>
 */

export default class QueryString {

    /**
     * By default, this constructor takes no parameters and set its queryString directly from URI.
     * Optionally, a custom queryString and hash can be given als parameter.
     * @param {String} queryString  Custom query string to be used. Default is the query string of current URI will be used (without the hash)
     * @param {String} hash         Custom hash. Default is the hash of current URI will be used
     * @param {boolean}   autoUpdate   update the current window's URI after each modification. This set to true by default
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
    set(string, value) {
        if (value !== undefined)
            return this.updateParam(string, value);

        else if ((string + '').charAt(0) === '?')
            this.queryString = string.substr(1);

        else
            this.queryString = string;

        if (this.autoUpdate) this.updateQueryString();
    }
    getAutoUpdate() {
        return this.autoUpdate;
    }
    setAutoUpdate(boolean) {
        this.autoUpdate = boolean;
    }

    // --------------- [QueryString functions] --------------- //

    /**
     * Get the query string part of the current window's URI.
     * This will update "this.queryString" and "this.hash".
     * @return {String} the query string
     */
    getWindowQueryString() {
        this.queryString = window.location.search.substr(1);
        this.hash = window.location.hash.substr(1);
        return this.queryString;
    }

    /**
     * Force update the current window's URI using
     * "this.queryString" and "this.hash" of this instance.
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
    updateWindowQueryString() { this.updateQueryString(); }

    // ---------------[Param functions]--------------- //
    /**
     * Get all parameters as an object where:
     *  - { key: value } for single value params,
     *  - { key[]: [values_array] } for list parameters (ie. key name end with [])
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
     * Get the first value of the parameter with the given key.
     * @param {String} key the parameter's key to look for.
     * @return {String} the first value of the parameter.
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
     * @return {Array} list of all values of the given key.
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
     * Get sorted array in ascending order of all dates from "this.queryString".
     * @param {String} dateParamKey the parameter's key of the dates (default => "dates[]").
     * @return {Array} sorted array of date-strings
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

        var regex = new RegExp(`(&|^)?(${key}=.*?)($|&)`, 'g');

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
     * If value isn't given, remove all parameters wut the given key.
     * @param {String} key
     * @param {String} value (optional)
     * @param {boolean} onlyFirstOccurrence set to true, to remove only the first occurrence
     * @param {boolean} noEscape set to true if you need to pass regex expression as a key
     * @return {String} this.queryString after modification
     */
    removeParam(key, value, onlyFirstOccurrence, noEscape) {
        if (!key) return this.queryString;
        if (!value && value !== 0) return this.removeKey(key);
        if (!noEscape) {
            key = escapeRegExp(key);
            value = escapeRegExp(value);
        }

        //NOTE: URLSearchParams() is an option but it is not compatible with IE, so I didn't use it.
        var regex = new RegExp(`(&)?(${key}=${value})`, `g`);
        this.queryString = this.queryString.replace(regex, ``);
        this.queryString = this.queryString.replace(/^[&]*/, ``);

        if (this.queryString.match(regex) && !onlyFirstOccurrence)
            return this.removeParam(key);

        if (this.autoUpdate)
            this.updateQueryString();

        return this.queryString;
    }
    deleteParam(key, value, onlyFirstOccurrence, noEscape) {
        this.removeParam(key, value, onlyFirstOccurrence, noEscape);
    }

    /**
     * Remove any parameter with the given key from "this.queryString".
     * @param {String} key
     * @param {boolean} onlyFirstOccurrence set to true, to remove only the first occurrence
     * @param {boolean} noEscape set to true if you need to pass regex expression as a key
     * @return {String} this.queryString after modification
     */
    removeKey(key, onlyFirstOccurrence, noEscape) {
        if (!key) return this.queryString;
        if (!noEscape)
            key = escapeRegExp(key);

        var regex = new RegExp(`(&)?(${key}=[^&]*)`, `g`);
        this.queryString = this.queryString.replace(regex, ``);
        this.queryString = this.queryString.replace(/^[&]*/, ``);

        if (this.queryString.match(regex) && !onlyFirstOccurrence)
            return this.removeKey(key);

        if (this.autoUpdate)
            this.updateQueryString();

        return this.queryString;
    }
    deleteKey(key, onlyFirstOccurrence, noEscape) {
        this.removeKey(key, onlyFirstOccurrence, noEscape);
    }

    /**
     * Check whether this.queryString has the given parameter [ key=value ].
     * If the value is not set, then check whether any parameter has the given key.
     *
     * @param {String} key
     * @param {String} value (optional)
     * @param {boolean} noEscape set to true if you need to pass regex expression as a key
     * @returns {boolean} boolean wether this.queryString has the given parameter
     */
    hasParam(key, value, noEscape) {
        if (!key) return false;
        if (!noEscape) {
            key = escapeRegExp(key);
            if (value) value = escapeRegExp(value);
        }
        //if there the value is not set, then match all parameters with the given key
        if (!value && value !== 0) value = '[^&]*';

        let regex = new RegExp(`(&)?(${key}=${value})($|&)`, `g`);
        return this.queryString.match(regex);
    }
    hasKey(key, noEscape) { this.hasParam(key, false, noEscape); }

    /**
     * Append/Remove the given parameter from "this.queryString".
     * If "autoUpdate" is true, it will update window URI.
     * 
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
     * Get the hash part of URI.
     * If "autoUpdate" is true, it will update "this.hash" attribute of qs instance.
     * @return {String}
     */
    getHash() {
        if (this.autoUpdate) this.hash = window.location.hash.substr(1);
        return this.hash;
    }

    /**
     * Set "the.hash" of qs instance to the given hash.
     * It ignores the '#' char at the the start, so no need to include it.
     * If given hash is falsy (but not 0), it will remove the hash part.
     * If "autoUpdate" is true, it will update window URI.
     */
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

    /**
     * Remove the value of "this.hash" of qs instance.
     * If "autoUpdate" is true, it will update window URI.
     */
    removeHash() { this.setHash(''); }

    /**
     * Remove the value of "this.hash" of qs instance.
     * If "autoUpdate" is true, it will update window URI.
     */
    deleteHash() { this.setHash(''); }

}

// ------- helper functions ------- //

/**
 * Escape all special characters of regex expressions.
 * @param {String} str 
 * @return {String} escaped string that ready to be used in regex expressions.
 */
function escapeRegExp(str) {
    return (str + "").replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}