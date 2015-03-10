'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.fieldError:catFieldErrors
 */
angular.module('cat.directives.fieldErrors')
    .directive('catFieldErrors', function CatFieldErrorsDirective() {
        return {
            replace: 'true',
            restrict: 'E',
            scope: {
                name: '@'
            },
            bindToController: true,
            controllerAs: 'catFieldErrors',
            controller: function CatFieldErrorsController($scope, catValidationService) {
                this.hasErrors = function() {
                    return catValidationService.hasFieldErrors($scope.name);
                };

                this.getErrors = function() {
                    return catValidationService.getFieldErrors($scope.name);
                };
            },
            template: '<div class="label label-danger" ng-if="catFieldErrors.hasErrors()"><ul><li ng-repeat="error in catFieldErrors.getErrors()">{{error}}</li></ul></div>'
        };
    });