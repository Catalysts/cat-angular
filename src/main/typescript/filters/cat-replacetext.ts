interface CatReplaceTextFilter {

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
    (text?:string, pattern?:string, options?:string, replacement?:string):string|void;
}

function catReplaceTextFilterFactory():CatReplaceTextFilter {
    return (text?:string, pattern:string = '\n', options:string = 'g', replacement:string = ', ') => {
        if (!text) {
            return text;
        } else {
            return String(text).replace(new RegExp(pattern, options), replacement);
        }
    };
}

angular
    .module('cat.filters.replaceText', [])
    .filter('replaceText', [catReplaceTextFilterFactory]);
