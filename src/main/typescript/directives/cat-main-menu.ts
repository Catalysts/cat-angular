import IDirective = angular.IDirective;

function catMainMenuDirectiveFactory($mainMenu:ICatMainMenuService,
                                     catElementVisibilityService:ICatElementVisibilityService,
                                     $location:ILocationService):IDirective {
    return {
        restrict: 'E',
        scope: {},
        link: (scope) => {
            scope['getMenus'] = $mainMenu.getMenus;

            scope['isVisible'] = (entry) => {
                var visible = false;
                if (entry.isMenu() || entry.isGroup()) {
                    _.forEach(entry.getEntries(), (subEntry) => {
                        visible = visible || scope['isVisible'](subEntry);
                    });
                    if (entry.isMenu()) {
                        _.forEach(entry.getGroups(), (groups) => {
                            visible = visible || scope['isVisible'](groups);
                        });
                    }
                } else {
                    return catElementVisibilityService.isVisible('cat.menu.entry', entry);
                }
                return visible;
            };

            scope['isActive'] = (path) => {
                return $location.path().substr(0, path.length) === path;
            };
        },
        templateUrl: 'template/cat-main-menu.tpl.html'
    };
}

/**
 * @ngdoc directive
 * @name cat.directives.menu:catLoadMore
 */
angular
    .module('cat.directives.menu', [
        'cat.service.menu',
        'cat.service.elementVisibility'
    ])
    .directive('catMainMenu', [
        '$mainMenu',
        'catElementVisibilityService',
        '$location',
        catMainMenuDirectiveFactory
    ]);
