'use strict';
angular.module('cat')
    .directive('catPaginated', function () {
        return {
            replace: true,
            restrict: 'E',
            transclude: true,
            scope: {
                api: '=',
                collection: '=',
                facets: '=',
                searchRequest: '=',
                defaultSort: '='
            },
            templateUrl: 'template/cat-paginated.tpl.html',
            link: function (scope, element, attrs) {
                if (scope.api === undefined) throw 'Attribute "api" must be set.';
                if (scope.collection === undefined) throw 'Attribute "collection" must be set and reference a scope property.';

                if (!!attrs.searchProps) {
                    scope.searchProps = _.filter(attrs.searchProps.split(','), function (prop) {
                        return !!prop;
                    });
                }
            },
            controller: function ($scope, $location) {

                var searchRequest = null;

                if ($scope.searchRequest === undefined) {
                    searchRequest = new window.cat.SearchRequest($location.search());
                } else {
                    searchRequest = $scope.searchRequest;
                }

                var reload = function () {
                    $scope.api.list(searchRequest).then(function (data) {
                        $scope.count = data.totalCount;
                        $scope.collection = data.elements;
                        $scope.firstResult = ($scope.pagination.page - 1) * $scope.pagination.size + 1;
                        $scope.lastResult = Math.min(
                                $scope.pagination.page * $scope.pagination.size,
                            $scope.count);

                        if ($scope.facets !== undefined) {
                            $scope.facets = data.facets;
                        }
                        $scope.isSinglePageList = data.totalCount <= $scope.pagination.size;
                    });
                };

                $scope.search = searchRequest.search();
                if ($scope.defaultSort) {
                    $scope.sort = angular.copy($scope.defaultSort);
                } else {
                    $scope.sort = {property: 'name', isDesc: false};
                }
                $scope.pagination = searchRequest.pagination();
                $scope.count = 0;

                $scope.$watch('sort', function (newVal, oldVal) {
                    if (!!newVal) {
                        console.log('broadcasting sort changed: ' + angular.toJson(newVal));
                        $scope.$parent.$broadcast('SortChanged', newVal);
                    }
                }, true);

                $scope.$on('SearchChanged', function (event, value) {
                    updateSearch(value);
                });

                $scope.$watch('pagination', function () {
                    searchRequest.setSearch($location);
                    reload();
                }, true);

                var updateSearch = function (value) {
                    $scope.search = searchRequest.search(value);
                    searchRequest.setSearch($location);
                    $scope.pagination.page = 1;
                    reload();
                };

                $scope.$watch('search', updateSearch, true);

                $scope.$on('SortChanged', function (event, value) {
                    $scope.sort = searchRequest.sort(value);
                    searchRequest.setSearch($location);
                    $scope.pagination.page = 1;
                    reload();
                });
            }
        };
    });
