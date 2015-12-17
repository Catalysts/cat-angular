interface CatInputGroupScope extends IScope {
    label:string;
    name:string;
    catI18nKey?:string;
}

function catInputGroupDirectiveFactory(catValidationService):IDirective {
    let catInputGroupLink:IDirectiveLinkFn = (scope:CatInputGroupScope,
                                              element:IAugmentedJQuery,
                                              attr:IAttributes,
                                              catValidationGroupCtrl?:ICatValidationGroupController) => {
        if (!!catValidationGroupCtrl && !!catValidationService) {
            catValidationService
                .getContext(catValidationGroupCtrl.getContextId())
                .registerField(scope.name);
        }

        element.addClass('form-group');
    };


    return {
        restrict: 'A',
        transclude: true,
        scope: {
            label: '@',
            name: '@',
            catI18nKey: '@'
        },
        require: '?^^catValidationGroup',
        link: catInputGroupLink,
        templateUrl: 'template/cat-input.tpl.html'
    };
}
angular
    .module('cat.directives.inputGroup', [])
    /**
     * @ngdoc directive
     * @name cat.directives.inputGroup:catInputGroup
     */
    .directive('catInputGroup', [
        catInputGroupDirectiveFactory
    ]);