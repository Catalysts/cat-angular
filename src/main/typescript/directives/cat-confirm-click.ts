interface CatConfirmClickAttributes extends IAttributes {
    catConfirmClick?:string;
    catOnConfirm?:string;
}

function catConfirmClickDirectiveFactory():IDirective {
    return {
        restrict: 'A',
        link: function CatConfirmClickLink(scope:IScope,
                                           element:IAugmentedJQuery,
                                           attr:CatConfirmClickAttributes) {
            var msg = attr.catConfirmClick || 'Are you sure?';
            var clickAction = attr.catOnConfirm;
            element.bind('click', () => {
                if (window.confirm(msg)) {
                    scope.$eval(clickAction);
                }
            });
        }
    };
}
/**
 * @ngdoc directive
 * @name cat.directives.confirmClick:catConfirmClick
 */
angular
    .module('cat.directives.confirmClick', [])
    .directive('catConfirmClick', [catConfirmClickDirectiveFactory]);
