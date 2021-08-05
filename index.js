/**
 * @version 2.8.7
 * @author Mahmoud Al-Refaai <Schuttelaar & Partners>
 */

export default class QueryString {

    /**
     * Constrict a new instance of QueryString, which set-up the internal values directly from current window URI.
     * Optionally, a custom queryString, origin, route and hash can be given in option/config parameter.
     * @param {Object} [config]
     * @param {String} [config.queryString]  Custom query string to be used. By default, the query string of current window is used (without the hash).
     * @param {String} [config.hash]         Custom hash. By default, the hash of the current window is used.
     * @param {String} [config.origin]       Custom origin. By default, the origin of the current window is used.
     * @param {String} [config.route]        Custom route/pathname. By default, the pathname of the current window is used.
     * @param {true} [config.autoUpdate]     Keep the current window's URI in sync with all modifications. [Default=`true`].
     * @constructs
     */
    constructor(config = {}) {
        let { queryString, hash, origin, route, autoUpdate } = config;

        // attr
        this.queryString = queryString ? queryString : this.getWindowQueryString();
        this.autoUpdate = autoUpdate ? autoUpdate : true;
        this.hash = window.location.hash.substr(1);
        this.origin = origin ? origin : window.location.origin;
        this.routeValues = route ?
            route.replace(/^\/+/g, '').split('/') :
            window.location.pathname.replace(/^\/+/g, '').split('/')

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
     * If the `key` is given, return the first value of the param of that key.
     * Otherwise, return the whole query string.
     * @param {String} key (optional)
     * @return {String} the whole query string or the first value (if `key` is given).
     */
    get(key) {
        if (key) return this.getParamValue(key);
        return this.queryString;
    }

    /**
     * Set the internal attribute this.queryString to the given string.
     * If a second argument is passed, then this behave as @alias updateParam where first argument is treated as key.
     * If `autoUpdate` option is set to true, it will update the window query string.
     * @param {String} str
     * @param {String} [value] optional - if this is passed, the function behave as alias to updateParam()
     */
    set(string, value) {
        if (value !== undefined)
            return this.updateParam(string, value);

        else if ((string + '').charAt(0) === '?')
            this.queryString = string.substr(1);

        else
            this.queryString = string;

        if (this.autoUpdate) this.updateWindowURI();
    }

    /**
     * Get the boolean value of autoUpdate
     * @return {boolean}
     */
    getAutoUpdate() {
        return this.autoUpdate;
    }

    /**
     * Set the boolean value of autoUpdate
     * @param {boolean} boolean
     */
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
     * Silent update the current window's URI without reload
     * using the origin, route, queryString and hash of this instance.
     * @return {string} the updated URI string
     */
    updateWindowURI() {
        const hash = this.hash ? "#" + this.hash : "";

        let updatedURI = this.origin + '/' + this.routeValues.join('/') + '?' + this.queryString + hash;

        if (!this.routeValues.length)
            updatedURI = this.origin + '?' + this.queryString + hash;

        window.history.replaceState({}, document.title, updatedURI);

        return updatedURI;
    }
    updateWindowQueryString() { return this.updateWindowURI(); }
    updateQueryString() { return this.updateWindowURI(); }

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
                paramsObj[param[0]].push(decodeURI(param[1]));
            } else {
                paramsObj[param[0]] = decodeURI(param[1]);
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

    /** @alias getParamValue */
    getValue(key) { return this.getParamValue(key); }

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

    /** @alias getAllParamValues */
    getAllValues(key) { return this.getAllParamValues(key); }

    /** @alias getAllParamValues */
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

        if (this.autoUpdate) this.updateWindowURI();
        return this.queryString;
    }

    /** @alias updateParam */
    setParam(key, value) { return this.updateParam(key, value); }

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

        if (this.autoUpdate) this.updateWindowURI();
        return this.queryString;
    }

    /** @alias appendParam */
    append(key, value) { return appendParam(key, value); }

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
            this.updateWindowURI();

        return this.queryString;
    }

    /** @alias removeParam */
    deleteParam(key, value, onlyFirstOccurrence, noEscape) {
        return this.removeParam(key, value, onlyFirstOccurrence, noEscape);
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
            this.updateWindowURI();

        return this.queryString;
    }

    /** @alias removeKey */
    deleteKey(key, onlyFirstOccurrence, noEscape) {
        return this.removeKey(key, onlyFirstOccurrence, noEscape);
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

    /** @alias hasParam */
    has(key, value, noEscape) { return this.hasParam(key, value, noEscape); }

    /**
     * Check if there is any parameter with the given key.
     *
     * @param {String} key
     * @param {boolean} noEscape set to true if you need to pass regex expression as a key
     * @returns {boolean} boolean value whether this.queryString has the a parameter with the given key
     */
    hasKey(key, noEscape) { return this.hasParam(key, false, noEscape); }

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
            this.updateWindowURI();
    }

    /**
     * Remove the value of "this.hash" of qs instance.
     * If "autoUpdate" is true, it will update window URI.
     */
    removeHash() { this.setHash(''); }

    /** @alias removeHash */
    deleteHash() { this.setHash(''); }


    // -------------------- [ Modify Routes ] -------------------- //

    /**
     * Get the route value at specific index.
     * The index can be negative, where "-1" is the last value.
     * @param {int} index positive or negative number, where "-1" is the last value. 
     * @returns {String} value of route token
     */
    getRouteAtIndex(i) {
        // accept negative index, where -1 is last element
        if (i < 0) i += this.routeValues.length;
        return this.routeValues.length > i ? this.routeValues[i] : undefined
    }

    /**
     * Update the route value at specific index.
     * The index can be negative, where "-1" is the last value.
     * If given value is empty, return without modifying the route
     * If "autoUpdate" is true, it will update window URI.
     * @param {int} index positive or negative number, where "-1" is the last value. 
     * @param {String} value the new value of the route at the given index. If empty, no modification will happen.
     * @returns {String} the updated route string
     */
    updateRouteAtIndex(i, value) {
        // accept negative index, where -1 is last element
        if (i < 0) i += this.routeValues.length;

        // if given value is empty, return without modifying the route
        if (!value) return this.routeValues.join('/');

        this.routeValues[i] = value;

        if (this.autoUpdate)
            this.updateWindowURI();

        return this.routeValues.join('/');
    }

    /** @alias setRouteAtIndex */
    setRouteAtIndex(i, value) { return this.updateRouteAtIndex(i, value); }

    /**
     * Delete the route value at specific index.
     * The index can be negative, where "-1" is the last value.
     * If "autoUpdate" is true, it will update window URI.
     * @param {int} index positive or negative number, where "-1" is the last value. 
     * @returns {String} the updated route string
     */
    removeRouteAtIndex(i) {
        // accept negative index, where -1 is last element
        if (i < 0) i += this.routeValues.length;

        this.routeValues.splice(i, 1);

        if (this.autoUpdate)
            this.updateWindowURI();

        return this.routeValues.join('/');
    }

    /** @alias removeRouteAtIndex */
    deleteRouteAtIndex(i) { return this.removeRouteAtIndex(i); }

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