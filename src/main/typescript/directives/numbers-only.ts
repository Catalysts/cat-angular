function catNumbersOnlyDirectiveFactory():IDirective {
    let catNumbersOnlyLink:IDirectiveLinkFn = (scope:IScope,
                                               element:IAugmentedJQuery,
                                               attrs:IAttributes,
                                               modelCtrl:INgModelController) => {
        modelCtrl.$parsers.push((inputValue) => {
            if (!inputValue) return '';

            let pattern = '[^0-9]';

            if (!!attrs.hasOwnProperty('allowFraction')) {
                pattern = '[^0-9,.]';
            }

            let transformedInput = inputValue.replace(new RegExp(pattern, 'g'), '');

            if (transformedInput !== inputValue) {
                modelCtrl.$setViewValue(transformedInput);
                modelCtrl.$render();
            }

            return transformedInput;
        });
    };

    return {
        require: 'ngModel',
        link: catNumbersOnlyLink
    };
}

/**
 * @ngdoc directive
 * @name cat.directives.numbersOnly:numbersOnly
 */
angular.module('cat.directives.numbersOnly', [])
    .directive('numbersOnly', [
        catNumbersOnlyDirectiveFactory
    ]);