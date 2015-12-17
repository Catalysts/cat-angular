class CatFieldErrorsInfoController {
    contextId:string;

    constructor(private catValidationService) {
    }

    hasErrors() {
        return this.catValidationService.hasAnyFieldErrors(this.contextId);
    }
}

function catFieldErrorsInfoDirectiveFactory():IDirective {
    let catFieldErrorsLink:IDirectiveLinkFn = (scope:IScope,
                                               elem:IAugmentedJQuery,
                                               attr:IAttributes,
        [catFieldErrors, catValidationGroup]:[CatFieldErrorsInfoController,ICatValidationGroupController]) => {
        elem.addClass('cat-field-errors-info');

        if (!!catValidationGroup) {
            catFieldErrors.contextId = catValidationGroup.getContextId();
        }
    };

    return {
        replace: true,
        restrict: 'EA',
        scope: true,
        bindToController: true,
        controllerAs: 'catFieldErrorsInfo',
        require: ['catFieldErrorsInfo', '?^^catValidationGroup'],
        link: catFieldErrorsLink,
        controller: CatFieldErrorsInfoController,
        templateUrl: 'template/cat-field-errors-info.tpl.html'
    };
}
/**
 * @ngdoc directive
 * @name cat.directives.fieldErrors.info:catFieldErrorsInfo
 */
angular
    .module('cat.directives.fieldErrors.info', [
        'cat.service.validation'
    ])
    .directive('catFieldErrorsInfo', [
        catFieldErrorsInfoDirectiveFactory
    ]);