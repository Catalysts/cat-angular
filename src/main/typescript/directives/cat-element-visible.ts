interface CatElementVisibleScope extends IScope {
    identifier:string;
    data:any;
}

function catElementVisibleDirectiveFactory(catElementVisibilityService):IDirective {
    let catElementVisibleLink:IDirectiveLinkFn = (scope:CatElementVisibleScope,
                                                  element:IAugmentedJQuery) => {
        if (!catElementVisibilityService.isVisible(scope.identifier, scope.data)) {
            element.hide();
        }
    };

    return {
        restrict: 'A',
        scope: {
            identifier: '@catElementVisible',
            data: '=?catElementData'
        },
        link: catElementVisibleLink
    };
}


/**
 * @ngdoc directive
 * @name cat.directives.elementVisible:catElementVisible
 */
angular
    .module('cat.directives.elementVisible', [
        'cat.service.elementVisibility'
    ])
    .directive('catElementVisible', [
        'catElementVisibilityService',
        catElementVisibleDirectiveFactory
    ]);
