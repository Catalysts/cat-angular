interface CatIconMapping {
    [icon:string]:string
    create:string;
    edit:string;
    remove:string;
    save:string;
}

interface CatIconConfig {
    xsClass?:string
    icons: CatIconMapping
}

interface CatIconScope extends IScope {
    size?:string;
    iconClass:string;
    icon:string;
}

class CatIconController {
    constructor($scope:CatIconScope,
                catIconConfig:CatIconConfig) {
        let icons:CatIconMapping = catIconConfig.icons;

        let iconClasses:string[] = [];

        // add size class
        if (!!$scope.size && $scope.size === 'xs' && !!catIconConfig.xsClass) {
            iconClasses.push(catIconConfig.xsClass);
        }

        // add icon class
        iconClasses.push(icons[$scope.icon]);

        $scope.iconClass = iconClasses.join(' ');
    }
}

function catIconDirectiveFactory() {
    return {
        restrict: 'A',
        replace: true,
        template: '<span class="{{iconClass}}" title="{{title}}"></span>',
        scope: {
            icon: '@catIcon',
            title: '@',
            size: '@'
        },
        controller: [CatIconController]
    };
}

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
    .directive('catIcon', [
        catIconDirectiveFactory
    ]);
