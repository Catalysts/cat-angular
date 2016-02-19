'use strict';

angular.module('cat.directives.icon', [])

    /**
     * @description
     * Configuration for cat-icon.
     */
    .constant('catIconConfig', {
        icons: {
            config: {
                xsClass: undefined
            },
            create: 'glyphicon glyphicon-plus',
            edit: 'glyphicon glyphicon-edit',
            remove: 'glyphicon glyphicon-remove',
            save: 'glyphicon glyphicon-floppy-disk'
        }
    })

    /**
     * @ngdoc directive
     * @name cat.directives.icon:catIcon
     *
     * @param icon name of the icon
     * @param title title of the icon
     * @param size size of the icon [undefined | '': normal, 'xs': small]
     */
    .directive('catIcon', function CatIcon() {
        return {
            restrict: 'A',
            replace: true,
            template: '<span class="{{iconClass}}" title="{{title}}"></span>',
            scope: {
                icon: '@catIcon',
                title: '@',
                size: '@'
            },
            controller: function ($scope, catIconConfig) {
                var icons = catIconConfig.icons;
                var iconsConfig = icons.config;

                var iconClasses = [];

                // add size class
                if (!!$scope.size && $scope.size === 'xs' && !!iconsConfig.xsClass) {
                    iconClasses.push(iconsConfig.xsClass);
                }

                // add icon class
                iconClasses.push(icons[$scope.icon]);

                $scope.iconClass = iconClasses.join(' ');
            }
        };
    });
