'use strict';

angular.module('cat.directives.input', [])

    /**
     * @ngdoc directive
     * @name cat.directives.input:input
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
    });