interface CatInputAttributes extends IAttributes {
    id?:string;
}

function catInputDirectiveFactory():IDirective {
    let catInputLink:IDirectiveLinkFn = (scope:IScope,
                                         element:IAugmentedJQuery,
                                         attrs:CatInputAttributes,
                                         ctrl?:INgModelController) => {
        if (!!ctrl) {
            scope.$on('fieldErrors', (event:IAngularEvent,
                                      fieldErrors?:{[key:string]:CatFieldError}) => {
                if (!fieldErrors || !attrs.id) {
                    return;
                }

                var valid = !fieldErrors[attrs.id];
                ctrl.$setValidity(attrs.id, valid);
            });
        }
    };

    return {
        require: '?ngModel',
        restrict: 'E',
        link: catInputLink
    };
}
angular
    .module('cat.directives.input', [])
    /**
     * @ngdoc directive
     * @name cat.directives.input:input
     */
    .directive('input', [
        catInputDirectiveFactory
    ]);