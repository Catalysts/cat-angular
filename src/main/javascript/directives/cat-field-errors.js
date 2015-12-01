'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.fieldError:catFieldErrors
 */
angular.module('cat.directives.fieldErrors', ['cat.service.validation'])
    .directive('catFieldErrors', function CatFieldErrorsDirective() {
        return {
            replace: 'true',
            restrict: 'EA',
            scope: {
                name: '@'
            },
            bindToController: true,
            controllerAs: 'catFieldErrors',
            require: ['catFieldErrors', '?^^catValidationGroup'],
            link: function (scope, elem, attr, controllers) {
                elem.addClass('cat-field-errors');

                var catFieldErrors = controllers[0];
                var /* CatValidationController */ catValidationGroupCtrl = controllers[1];
                if (!!catValidationGroupCtrl) {
                    catFieldErrors.contextId = catValidationGroupCtrl.getContextId();
                }
            },
            controller: function CatFieldErrorsController($scope, /* CatValidationService */  catValidationService) {
                var that = this;

                if (angular.version.major === 1 && angular.version.minor === 2) {
                    $scope.$watch('name', function (name) {
                        that.name = name;
                    });
                }

                this.hasErrors = function() {
                    return catValidationService.hasFieldErrors(that.name, this.contextId);
                };

                this.getErrors = function() {
                    return catValidationService.getFieldErrors(that.name, this.contextId);
                };
            },
            templateUrl: 'template/cat-field-errors.tpl.html'
        };
    });