'use strict';

angular.module('cat')
    .directive('numbersOnly', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, modelCtrl) {
                modelCtrl.$parsers.push(function (inputValue) {
                    if (!inputValue) return '';

                    var pattern = '[^0-9]';

                    if (!!attrs.hasOwnProperty('allowFraction')) {
                        pattern = '[^0-9,.]';
                    }

                    var transformedInput = inputValue.replace(new RegExp(pattern, 'g'), '');

                    if (transformedInput !== inputValue) {
                        modelCtrl.$setViewValue(transformedInput);
                        modelCtrl.$render();
                    }

                    return transformedInput;
                });
            }
        };
    });