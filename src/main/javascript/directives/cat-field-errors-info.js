'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.fieldErrors.info:catFieldErrorsInfo
 */
angular.module('cat.directives.fieldErrors.info', ['cat.service.validation'])
    .directive('catFieldErrorsInfo', function CatFieldErrorsInfoDirective() {
        return {
            replace: 'true',
            restrict: 'EA',
            scope: true,
            bindToController: true,
            controllerAs: 'catFieldErrorsInfo',
            require: ['catFieldErrorsInfo', '?^^catValidationGroup'],
            link: function (scope, elem, attr, controllers) {
                elem.addClass('cat-field-errors-info');

                var catFieldErrors = controllers[0];
                var catValidationGroupCtrl = controllers[1];
                if (!!catValidationGroupCtrl) {
                    catFieldErrors.contextId = catValidationGroupCtrl.getContextId();
                }
            },
            controller: function CatFieldErrorsController(/* CatValidationService */  catValidationService) {
                var that = this;

                this.hasErrors = function () {
                    return catValidationService.hasAnyFieldErrors(that.contextId);
                };
            },
            templateUrl: 'template/cat-field-errors-info.tpl.html'
        };
    });