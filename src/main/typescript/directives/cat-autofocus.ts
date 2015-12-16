function catAutofocusDirectiveFactory($timeout:ITimeoutService):IDirective {
    return {
        restrict: 'A',
        link: function CatAutofocusLink(scope:IScope, element:ISelect2AugmentedJQuery) {
            $timeout(function () {
                if (!_.isUndefined(element.data('select2'))) {
                    element.select2('open');
                } else {
                    element[0].focus();
                }
            }, 100);
        }
    };
}

/**
 * @ngdoc directive
 * @name cat.directives.autofocus:catAutofocus
 */
angular
    .module('cat.directives.autofocus', [])
    .directive('catAutofocus', [
        '$timeout',
        catAutofocusDirectiveFactory
    ]);


