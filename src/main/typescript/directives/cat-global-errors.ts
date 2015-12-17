class CatGlobalErrorsController {
    contextId:string;

    constructor(private catValidationService:ICatValidationService) {
    }

    hasErrors() {
        return this.catValidationService.hasGlobalErrors(this.contextId);
    }

    getErrors() {
        return this.catValidationService.getGlobalErrors(this.contextId);
    }
}

function catGlobalErrorsDirectiveFactory():IDirective {
    let catGlobalErrorsLink:IDirectiveLinkFn = (scope:IScope,
                                                elem:IAugmentedJQuery,
                                                attr:IAttributes,
        [catGlobalErrors,catValidationGroup]:[CatGlobalErrorsController,ICatValidationGroupController]) => {
        elem.addClass('cat-global-errors');

        if (!!catValidationGroup) {
            catGlobalErrors.contextId = catValidationGroup.getContextId();
        }
    };

    return {
        replace: true,
        restrict: 'EA',
        scope: true,
        bindToController: true,
        controllerAs: 'catGlobalErrors',
        require: ['catGlobalErrors', '?^^catValidationGroup'],
        link: catGlobalErrorsLink,
        controller: CatGlobalErrorsController,
        templateUrl: 'template/cat-global-errors.tpl.html'
    };
}

/**
 * @ngdoc directive
 * @name cat.directives.globalError:catGlobalErrors
 */
angular
    .module('cat.directives.globalErrors', [
        'cat.service.validation'
    ])
    .directive('catGlobalErrors', [
        catGlobalErrorsDirectiveFactory
    ]);