interface CatElementVisibleScope extends IScope {
    identifier:string;
    data:any;
}

function catElementVisibleDirectiveFactory(catElementVisibilityService):IDirective {
    return {
        restrict: 'A',
        scope: {
            identifier: '@catElementVisible',
            data: '=?catElementData'
        },
        link: function CatElementVisibleLink(scope:CatElementVisibleScope, element) {
            if (!catElementVisibilityService.isVisible(scope.identifier, scope.data)) {
                element.hide();
            }
        }
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
