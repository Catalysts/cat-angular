'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.sortable:catSortable
 */
angular.module('cat.directives.sortable', ['cat.directives.paginated'])
    .directive('catSortable', function CatSortableDirective($compile) {
        return {
            restrict: 'AC',
            require: '^catPaginated',
            link: function CatSortableLink(scope, element, attrs, catPaginatedController) {
                var title = element.text();
                var property = attrs.catSortable || title.toLowerCase().trim();
                var i18n = 'cc.catalysts.cat-sortable.sort.' + property;

                if (!!attrs.i18n) {
                    i18n = attrs.i18n;
                }

                // todo - make configurable
                scope.sort = scope.listData.searchRequest.sort();
                scope.catPaginatedController = catPaginatedController;
                var icon = 'glyphicon-sort-by-attributes';

                if (!!attrs.sortMode) {
                    if (attrs.sortMode === 'numeric') {
                        icon = 'glyphicon-sort-by-order';
                    } else if (attrs.sortMode === 'alphabet') {
                        icon = 'glyphicon-sort-by-alphabet';
                    }
                }

                element.text('');
                element.append($compile('<a class="sort-link" href="" ng-click="toggleSort(\'' + property + '\')"><span cat-i18n="' + i18n + '">' + title + '</span><span class="glyphicon" ng-class="{\'' + icon + '\': sort.property == \'' + property + '\' && !sort.isDesc, \'' + icon + '-alt\': sort.property == \'' + property + '\' && sort.isDesc}"></span></a>')(scope));
            },
            controller: function CatSortableController($scope) {
                $scope.toggleSort = function (property) {
                    if ($scope.sort.property === property) {
                        $scope.sort.isDesc = !$scope.sort.isDesc;
                    } else {
                        $scope.sort.property = property;
                        $scope.sort.isDesc = false;
                    }

                    $scope.catPaginatedController.sort($scope.sort);
                };

                $scope.$on('SortChanged', function (event, value) {
                    $scope.sort = value;
                });
            }
        };
    });