'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.globalError:catGlobalErrors
 */
angular.module('cat.directives.globalErrors', ['cat.service.validation'])
    .directive('catGlobalErrors', function CatGlobalErrorsDirective() {
        return {
            replace: 'true',
            restrict: 'EA',
            scope: true,
            bindToController: true,
            controllerAs: 'catGlobalErrors',
            require: ['catGlobalErrors', '?^^catValidationGroup'],
            link: function (scope, elem, attr, controllers) {
                elem.addClass('cat-global-errors');

                var catGlobalErrors = controllers[0];
                var /* CatValidationController */ catValidationGroupCtrl = controllers[1];
                if (!!catValidationGroupCtrl) {
                    catGlobalErrors.contextId = catValidationGroupCtrl.getContextId();
                }
            },
            controller: function CatGlobalErrorsController($scope, /* CatValidationService */  catValidationService) {
                var that = this;

                hasErrors()
                {
                    return catValidationService.hasGlobalErrors(this.contextId);
                };

                getErrors()
                {
                    return catValidationService.getGlobalErrors(this.contextId);
                };
            },
            templateUrl: 'template/cat-global-errors.tpl.html'
        };
    });