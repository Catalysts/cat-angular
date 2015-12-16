interface CatBreadcrumbsConfig {
    homeState: string;
}

interface CatBreadcrumbsScope extends IScope {
    homeState: string;
    breadcrumbs: ICatBreadcrumbsService;

    showHome():boolean;
}

function catBreadcrumbsDirectiveFactory(catBreadcrumbsConfig:CatBreadcrumbsConfig,
                                        catBreadcrumbs:ICatBreadcrumbsService):IDirective {
    return {
        restrict: 'A',
        templateUrl: 'template/cat-breadcrumbs.tpl.html',
        link: function catAutofocusLink(scope:CatBreadcrumbsScope, element:IAugmentedJQuery) {
            if (catBreadcrumbsConfig.homeState) {
                scope.homeState = catBreadcrumbsConfig.homeState;
            }
            scope.breadcrumbs = catBreadcrumbs;
            scope.showHome = () => {
                return !!catBreadcrumbsConfig.homeState;
            };
        }
    };
}

angular
    .module('cat.directives.breadcrumbs', ['cat.service.breadcrumbs'])

    /**
     * @description
     * Configuration for cat-breadcrumbs.
     */
    .constant('catBreadcrumbsConfig', {
        homeState: 'dashboard'
    })

    /**
     * @ngdoc directive
     * @name cat.directives.breadcrumbs:catBreadcrumbs
     */
    .directive('catBreadcrumbs', catBreadcrumbsDirectiveFactory);
