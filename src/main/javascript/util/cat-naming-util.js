/**
 * Created by tscheinecker on 26.08.2014.
 */
'use strict';

window.cat.util = window.cat.util || {};

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

window.cat.util.capitalize = function (string) {
    if (_.isUndefined(string) || string.length === 0) {
        return '';
    }

    return string.substring(0, 1).toUpperCase() + string.substring(1, string.length);
};