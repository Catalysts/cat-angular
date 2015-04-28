'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.menu:catLoadMore
 */
angular.module('cat.directives.menu', ['cat.service.menu', 'cat.service.elementVisibility'])
    .directive('catMainMenu', ['$mainMenu', 'catElementVisibilityService',
        function CatMainMenuDirective($mainMenu, catElementVisibilityService) {
            return {
                restrict: 'E',
                scope: {},
                link: function CatMainMenuLink(scope) {
                    scope.getMenus = function() {
                        return $mainMenu.getMenus();
                    };

                    scope.isVisible = function (entry) {
                        var visible = false;
                        if (entry.isMenu() || entry.isGroup()) {
                            _.forEach(entry.getEntries(), function (subEntry) {
                                visible = visible || scope.isVisible(subEntry);
                            });
                            if (entry.isMenu()) {
                                _.forEach(entry.getGroups(), function (groups) {
                                    visible = visible || scope.isVisible(groups);
                                });
                            }
                        } else {
                            return catElementVisibilityService.isVisible('cat.menu.entry', entry);
                        }
                        return visible;
                    };
                },
                templateUrl: 'template/cat-main-menu.tpl.html'
            };
        }]);
