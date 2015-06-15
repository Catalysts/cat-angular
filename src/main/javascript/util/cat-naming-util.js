'use strict';

window.cat.util = window.cat.util || {};

/**
 * Capitalizes a string (first letter to uppercase)
 * @param string
 * @returns {string}
 */
window.cat.util.pluralize = function (string) {
    if (_.isUndefined(string) || string.length === 0) {
        return '';
    }
    var lastChar = string[string.length - 1];

    switch (lastChar) {
        case 'y':
            return string.substring(0, string.length - 1) + 'ies';
        case 's':
            return string + 'es';
        default :
            return string + 's';
    }
};

/**
 * Pluralizes a string
 * @param string
 * @returns {*}
 */
window.cat.util.capitalize = function (string) {
    if (_.isUndefined(string) || string.length === 0) {
        return '';
    }

    return string.substring(0, 1).toUpperCase() + string.substring(1, string.length);
};

/**
 * Generates a new UUID
 *
 * @returns {string} uuid
 */
window.cat.util.generateUUID = function () {
    // http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
