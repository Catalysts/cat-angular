function catAutofocusDirectiveFactory($timeout:ITimeoutService):IDirective {
    let catAutofocusLink:IDirectiveLinkFn = (scope:IScope,
                                             element:ISelect2AugmentedJQuery) => {
        $timeout(() => {
            if (!_.isUndefined(element.data('select2'))) {
                element.select2('open');
            } else {
                element[0].focus();
            }
        }, 100);
    };

    return {
        restrict: 'A',
        link: catAutofocusLink
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


