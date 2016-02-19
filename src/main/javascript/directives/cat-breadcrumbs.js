'use strict';

angular.module('cat.directives.breadcrumbs', ['cat.service.breadcrumbs'])

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
    .directive('catBreadcrumbs', function CatBreadcrumbsDirective(catBreadcrumbsConfig, catBreadcrumbs) {
        return {
            restrict: 'A',
            templateUrl: 'template/cat-breadcrumbs.tpl.html',
            link: function CatAutofocusLink(scope, element) {
                if (catBreadcrumbsConfig.homeState) {
                    scope.homeState = catBreadcrumbsConfig.homeState;
                }
                scope.breadcrumbs = catBreadcrumbs;
                scope.showHome = function () {
                    return !!catBreadcrumbsConfig.homeState;
                };
            }
        };
    });
