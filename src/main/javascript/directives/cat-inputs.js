'use strict';

angular.module('cat.directives.inputs', [])

/**
 * @ngdoc directive
 * @name cat.directives.inputs:input
 */
    .directive('input', function CatInputDirective() {
        return {
            require: '?ngModel',
            restrict: 'E',
            link: function CatInputLink(scope, element, attrs, ctrl) {
                if (!!ctrl) {
                    scope.$on('fieldErrors', function (event, fieldErrors) {
                        if (!fieldErrors || !attrs.id) {
                            return;
                        }
                        var valid = !fieldErrors[attrs.id];
                        ctrl.$setValidity(attrs.id, valid);
                    });
                }
            }
        };
    })

/**
 * @ngdoc directive
 * @name cat.directives.inputs:catInputGroup
 */
    .directive('catInputGroup', function CatInputGroupDirective() {
        return {
            restrict: 'A',
            transclude: true,
            scope: {
                label: '@',
                name: '@'
            },
            link: function CatInputGroupLink(scope, element) {
                element.addClass('form-group');
            },
            templateUrl: 'template/cat-input.tpl.html'
        };
    });