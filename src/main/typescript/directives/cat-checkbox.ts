interface CatCheckboxDirectiveScope extends IScope {
    checked:boolean;
}

function catCheckboxDirectiveFactory():IDirective {
    let catCheckboxLink:IDirectiveLinkFn = (scope:CatCheckboxDirectiveScope,
                                            element:IAugmentedJQuery) => {
        if (!!scope.checked) {
            element.addClass('glyphicon glyphicon-check');
        } else {
            element.addClass('glyphicon glyphicon-unchecked');
        }
    };

    return {
        replace: true,
        restrict: 'E',
        scope: {
            checked: '='
        },
        link: catCheckboxLink
    };
}


/**
 * @ngdoc directive
 * @name cat.directives.checkbox:catCheckbox
 */
angular
    .module('cat.directives.checkbox', [])
    .directive('catCheckbox', [catCheckboxDirectiveFactory]);