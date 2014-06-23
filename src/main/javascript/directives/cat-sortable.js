'use strict';
angular.module('cat')
    .directive('catSortable', function ($compile, $log) {
        return {
            restrict: 'AC',
            link: function (scope, element, attrs) {
                var title = element.text();
                var property = attrs.catSortable || title.toLowerCase().trim();

                // todo - make configurable
                scope.sort = scope.listData.searchRequest.sort();

                var icon = 'glyphicon-sort-by-attributes';

                if (!!attrs.sortMode) {
                    if (attrs.sortMode === 'numeric') {
                        icon = 'glyphicon-sort-by-order';
                    } else if (attrs.sortMode === 'alphabet') {
                        icon = 'glyphicon-sort-by-alphabet';
                    }
                }

                element.text('');
                element.append($compile('<a class="sort-link" href="" ng-click="toggleSort(\'' + property + '\')">' + title + ' <span class="glyphicon" ng-class="{\'' + icon + '\': sort.property == \'' + property + '\' && !sort.isDesc, \'' + icon + '-alt\': sort.property == \'' + property + '\' && sort.isDesc}"></span></a>')(scope));
            },
            controller: function ($scope) {
                $scope.toggleSort = function (property) {
                    if ($scope.sort.property === property) {
                        $scope.sort.isDesc = !$scope.sort.isDesc;
                    } else {
                        $scope.sort.property = property;
                        $scope.sort.isDesc = false;
                    }
                    $scope.$parent.$broadcast('SortChanged', $scope.sort); // broadcast from the parent scope (= controller or transclude scope)
                };

                $scope.$on('SortChanged', function (event, value) {
                    $scope.sort = value;
                });
            }
        };
    });
