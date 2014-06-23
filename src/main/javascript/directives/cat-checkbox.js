'use strict';
angular.module('cat')
    .directive('catCheckbox', function () {
        return {
            replace: true,
            restrict: 'E',
            scope: {
                checked: '='
            },
            link: function (scope, element, attrs) {
                if (!!scope.checked) {
                    element.addClass('glyphicon glyphicon-check');
                }
                else {
                    element.addClass('glyphicon glyphicon-unchecked');
                }
            }
        };
    });