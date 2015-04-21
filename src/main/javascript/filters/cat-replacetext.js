'use strict';


angular.module('cat.filters.replaceText', [])

/**
 * @ngdoc filter
 * @name cat.filters.replaceText:replaceText
 *
 * @description
 * Replaces text passages with other text, based on regular expressions
 *
 * @param {string} text original text
 * @param {string} pattern regular expression
 * @param {object} options regular expression options
 * @param {string} replacement replacement text
 */
.filter('replaceText', function CatReplaceTetFilter() {
    return function (text, pattern, options, replacement) {
        if (pattern === undefined)
            pattern = '\n';
        if (options === undefined)
            options = 'g';
        if (replacement === undefined)
            replacement = ', ';
        if (!text) {
            return text;
        } else {
            return String(text).replace(new RegExp(pattern, options), replacement);
        }
    };
});
