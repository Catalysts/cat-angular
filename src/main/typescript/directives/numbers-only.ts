function catNumbersOnlyDirectiveFactory():IDirective {
    return {
        require: 'ngModel',
        link: function CatNumbersOnlyLink(scope, element, attrs, modelCtrl:INgModelController) {
            modelCtrl.$parsers.push(function (inputValue) {
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
        }
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