/**
 * Created by tscheinecker on 05.05.2014.
 */
'use strict';

angular.module('cat')
    .directive('input', function () {
        return {
            require: 'ngModel',
            restrict: 'E',
            link: function (scope, element, attrs, ctrl) {
                scope.$on('fieldErrors', function (event, fieldErrors) {
                    if (!fieldErrors || !attrs.id) {
                        return;
                    }
                    var valid = !fieldErrors[attrs.id];
                    ctrl.$setValidity(attrs.id, valid);
                });
            }
        };
    })
    .directive('catInputGroup', function () {
        return {
            restrict: 'A',
            transclude: true,
            scope: {
                errors: '=',
                label: '@',
                name: '@'
            },
            link: function (scope, element, attrs) {
                element.addClass('form-group');
            },
            templateUrl: 'template/cat-input.tpl.html'
        };
    });