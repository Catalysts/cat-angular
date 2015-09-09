'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.fieldError:catFieldErrors
 */
angular.module('cat.directives.fieldErrors', ['cat.service.validation'])
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
                var that = this;

                if (angular.version.major === 1 && angular.version.minor === 2) {
                    $scope.$watch('name', function (name) {
                        that.name = name;
                    });
                }

                this.hasErrors = function () {
                    return catValidationService.hasFieldErrors(that.name);
                };

                this.getErrors = function () {
                    return catValidationService.getFieldErrors(that.name);
                };
            },
            template: '<div class="label label-danger" ng-show="catFieldErrors.hasErrors()"><ul><li ng-repeat="error in catFieldErrors.getErrors()">{{error}}</li></ul></div>'
        };
    });