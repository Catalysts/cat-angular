interface CatLoadMoreParentScope extends IScope {
    elementsCount?:number;
    elements?:IAugmentedJQuery[]
}

interface CatLoadMoreScope extends IScope {
    $parent:CatLoadMoreParentScope;
}

interface CatLoadMoreAttributes extends IAttributes {
    catLoadMore:string;
}

function catLoadMoreDirectiveFactory():IDirective {
    let catLoadMoreLink:IDirectiveLinkFn = (scope:CatLoadMoreScope,
                                            element:IAugmentedJQuery,
                                            attrs:CatLoadMoreAttributes) => {
        let initialCount = parseInt(attrs.catLoadMore);
        scope.$parent.elementsCount = scope.$parent.elementsCount || initialCount;
        scope.$parent.elements = scope.$parent.elements || [];
        scope.$parent.elements.push(element);
        if (scope.$parent.elements.length > scope.$parent.elementsCount) {
            element.addClass('hidden');
        }
        if (!element.parent().next().length && scope.$parent.elements.length > scope.$parent.elementsCount) {
            let elt = $('<a href="#">Show more</a>');
            elt.on({
                click: function () {
                    scope.$parent.elementsCount += initialCount;
                    if (scope.$parent.elements.length <= scope.$parent.elementsCount) {
                        elt.addClass('hidden');
                    }
                    scope.$parent.elements.forEach((elt:IAugmentedJQuery, ind:number) => {
                        if (ind < scope.$parent.elementsCount) {
                            elt.removeClass('hidden');
                        }
                    });
                    return false;
                }
            });
            element.parent().after(elt);
        }
    };

    return {
        replace: true,
        restrict: 'A',
        link: catLoadMoreLink
    };
}

/**
 * @ngdoc directive
 * @name cat.directives.loadMore:catLoadMore
 */
angular
    .module('cat.directives.loadMore', [])
    .directive('catLoadMore', [
        catLoadMoreDirectiveFactory
    ]);
