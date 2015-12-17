interface CatSortableScope<T> extends CatPaginatedScope<T> {
    sort:Sort;
    toggleSort(property:string):void;
}

class CatSortableController<T> {
    constructor($scope:CatSortableScope<T>) {
        $scope.toggleSort = (property) => {
            if ($scope.sort.property === property) {
                $scope.sort.isDesc = !$scope.sort.isDesc;
            } else {
                $scope.sort.property = property;
                $scope.sort.isDesc = false;
            }

            $scope.catPaginatedController.sort($scope.sort);
        };

        $scope.$on('SortChanged', (event:IAngularEvent,
                                   value:Sort) => {
            $scope.sort = value;
        });
    }
}

interface CatSortableAttributes extends IAttributes {
    catSortable?:string;
    catI18nKey?:string;
    sortMode?:string;
}

function catSortableDirectiveFactory($compile:ICompileService):IDirective {
    let catSortableLink:IDirectiveLinkFn = (scope:CatSortableScope<any>,
                                            element:IAugmentedJQuery,
                                            attrs:CatSortableAttributes,
                                            catPaginatedController) => {
        let title = element.text();
        let property = attrs.catSortable || title.toLowerCase().trim();
        let i18n = 'cc.catalysts.cat-sortable.sort.' + property;

        if (!!attrs.catI18nKey) {
            i18n = attrs.catI18nKey;
        }

        // todo - make configurable
        scope.sort = scope.listData.searchRequest.sort();
        scope.catPaginatedController = catPaginatedController;
        let icon = 'glyphicon-sort-by-attributes';

        if (!!attrs.sortMode) {
            if (attrs.sortMode === 'numeric') {
                icon = 'glyphicon-sort-by-order';
            } else if (attrs.sortMode === 'alphabet') {
                icon = 'glyphicon-sort-by-alphabet';
            }
        }

        element.text('');
        element.append($compile(`
<a class="sort-link" href="" ng-click="toggleSort('${property}')">
    <span cat-i18n="${i18n}">${title}</span>
    <span class="glyphicon"
          ng-class="{
            '${icon}': sort.property == '${property}' && !sort.isDesc,
            '${icon}-alt': sort.property == '${property}' && sort.isDesc
          }">
    </span>
</a>`)(scope));
    };

    return {
        restrict: 'AC',
        require: '^catPaginated',
        link: catSortableLink,
        controller: CatSortableController
    };
}

/**
 * @ngdoc directive
 * @name cat.directives.sortable:catSortable
 */
angular
    .module('cat.directives.sortable', [
        'cat.directives.paginated'
    ])
    .directive('catSortable', [
        catSortableDirectiveFactory
    ]);