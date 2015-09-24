'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.menu:catLoadMore
 */
angular.module('cat.directives.menu', ['cat.service.menu', 'cat.service.elementVisibility'])
    .directive('catMainMenu', ['$mainMenu', 'catElementVisibilityService', '$location',
        function CatMainMenuDirective($mainMenu, catElementVisibilityService, $location) {
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

                    scope.isActive = function (path) {
                        return $location.path().substr(0, path.length) === path;
                    };
                },
                templateUrl: 'template/cat-main-menu.tpl.html'
            };
        }]);
