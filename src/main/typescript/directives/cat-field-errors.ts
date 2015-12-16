class CatFieldErrorsController {
    name:string;
    contextId:string;

    constructor(private catValidationService:ICatValidationService) {
    }

    hasErrors() {
        return this.catValidationService.hasFieldErrors(this.name, this.contextId);
    }

    getErrors() {
        return this.catValidationService.getFieldErrors(this.name, this.contextId);
    }
}

function catFieldErrorsDirectiveFactory() {
    return {
        replace: 'true',
        restrict: 'EA',
        scope: {
            name: '@'
        },
        bindToController: true,
        controllerAs: 'catFieldErrors',
        require: ['catFieldErrors', '?^^catValidationGroup'],
        link: function (scope:IScope,
                        elem:IAugmentedJQuery,
                        attr:IAttributes,
            [catFieldErrorsController,catValidationGroupController]:[CatFieldErrorsController, ICatValidationGroupController]) {
            elem.addClass('cat-field-errors');

            if (!!catValidationGroupController) {
                catFieldErrorsController.contextId = catValidationGroupController.getContextId();
            }
        },
        controller: CatFieldErrorsController,
        templateUrl: 'template/cat-field-errors.tpl.html'
    };
}

/**
 * @ngdoc directive
 * @name cat.directives.fieldError:catFieldErrors
 */
angular
    .module('cat.directives.fieldErrors', [
        'cat.service.validation'
    ])
    .directive('catFieldErrors', [
        catFieldErrorsDirectiveFactory
    ]);