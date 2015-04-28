'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.elementVisible:catElementVisible
 */
angular.module('cat.directives.elementVisible', ['cat.service.elementVisibility'])
    .directive('catElementVisible', ['catElementVisibilityService',
        function CatElementVisibleDirective(catElementVisibilityService) {
            return {
                restrict: 'A',
                scope: {
                    identifier: '@catElementVisible',
                    data: '@?catElementData'
                },
                link: function CatElementVisibleLink(scope, element) {
                    if (!catElementVisibilityService.isVisible(scope.identifier, scope.data)) {
                        element.hide();
                    }
                }
            };
        }]);
