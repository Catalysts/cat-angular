import IDirectiveLinkFn = angular.IDirectiveLinkFn;
interface CatFormAttributes extends IAttributes {
    eocsWarnOnNavIfDirty?:string;
}

function catFormDirectiveFactory($timeout:ITimeoutService) {
    let catFormLink:IDirectiveLinkFn = (scope:IScope,
                                        element:IAugmentedJQuery,
                                        attrs:CatFormAttributes,
                                        formCtrl:IFormController) => {
        let warningMessage = attrs.eocsWarnOnNavIfDirty || 'You have unsaved changes. Leave the page?';

        // TODO - remove this ugly hack if ui-select2 fixes this problem...
        $timeout(() => {
            formCtrl.$setPristine();
        }, 50);

        scope.$on('formReset', () => {
            formCtrl.$setPristine();
        });

        scope.$on('formDirty', () => {
            formCtrl.$setDirty();
        });

        // handle angular route change
        scope.$on('$locationChangeStart', (event) => {
            if (formCtrl.$dirty) {
                if (!window.confirm(warningMessage)) {
                    event.preventDefault();
                }
            }
        });

        // handle browser window/tab close
        $(window).on('beforeunload', () => {
            if (formCtrl.$dirty) {
                return warningMessage;
            }
        });

        // clean up beforeunload handler when scope is destroyed
        scope.$on('$destroy', () => {
            $(window).unbind('beforeunload');
        });
    };

    return {
        restrict: 'E',
        scope: true,
        require: 'form',
        link: catFormLink
    };
}


/**
 * @ngdoc directive
 * @name cat.directives.form:form
 */
angular
    .module('cat.directives.form', [])
    .directive('form', [
        '$timeout',
        catFormDirectiveFactory
    ]);
