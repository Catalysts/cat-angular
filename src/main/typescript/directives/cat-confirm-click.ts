interface CatConfirmClickAttributes extends IAttributes {
    catConfirmClick?:string;
    catOnConfirm?:string;
}

function catConfirmClickDirectiveFactory():IDirective {
    let catConfirmClickLink:IDirectiveLinkFn = (scope:IScope,
                                                element:IAugmentedJQuery,
                                                attr:CatConfirmClickAttributes) => {
        let msg = attr.catConfirmClick || 'Are you sure?';
        let clickAction = attr.catOnConfirm;
        element.bind('click', () => {
            if (window.confirm(msg)) {
                scope.$eval(clickAction);
            }
        });
    };

    return {
        restrict: 'A',
        link: catConfirmClickLink
    };
}
/**
 * @ngdoc directive
 * @name cat.directives.confirmClick:catConfirmClick
 */
angular
    .module('cat.directives.confirmClick', [])
    .directive('catConfirmClick', [catConfirmClickDirectiveFactory]);
