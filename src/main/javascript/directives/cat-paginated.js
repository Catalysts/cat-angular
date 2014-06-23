'use strict';
angular.module('cat')
    .directive('catPaginated', function () {
        return {
            replace: true,
            restrict: 'E',
            transclude: true,
            scope: {
                listData: '=?'
            },
            templateUrl: 'template/cat-paginated.tpl.html',
            link: function (scope, element, attrs) {
                if (!!attrs.searchProps) {
                    scope.searchProps = _.filter(attrs.searchProps.split(','), function (prop) {
                        return !!prop;
                    });
                }
            },
            controller: function ($scope, $location, catListDataLoadingService, $timeout, $rootScope) {
                var searchTimeout = null, DELAY_ON_SEARCH = 500;

                if (_.isUndefined($scope.listData)) {
                    $scope.listData = $scope.$parent.listData;
                    if (_.isUndefined($scope.listData)) {
                        throw new Error('listData was not defined and couldn\'t be found with default value');
                    }
                }

                $scope.listData.search = $scope.listData.search || $scope.listData.searchRequest.search() || {};

                var searchRequest = $scope.listData.searchRequest;

                var reload = function (delay) {
                    $timeout.cancel(searchTimeout);
                    searchTimeout = $timeout(function () {
                        if (searchRequest.isDirty()) {
                            catListDataLoadingService.load($scope.listData.endpoint, searchRequest).then(
                                function (data) {
                                    _.assign($scope.listData, data);
                                }
                            );
                        }
                    }, delay || 0);
                };

                $scope.$watch('listData.sort', function (newVal, oldVal) {
                    if (!!newVal) {
                        console.log('broadcasting sort changed: ' + angular.toJson(newVal));
                        $scope.$parent.$broadcast('SortChanged', newVal);
                    }
                }, true);

                $scope.$on('SearchChanged', function (event, value, delay) {
                    searchChanged(value, delay);
                });

                $scope.$watch('listData.pagination', function () {
                    searchRequest.setSearch($location);
                    reload();
                }, true);

                var searchChanged = function (value, delay) {
                    searchRequest.search(value);
                    searchRequest.setSearch($location);
                    $scope.listData.pagination.page = 1;
                    reload(delay);
                };

                var updateSearch = function (value) {
                    var search = searchRequest.search();
                    _.assign(search, value);
                    $rootScope.$broadcast('SearchChanged', search, DELAY_ON_SEARCH);
                };

                $scope.$watch('listData.search', updateSearch, true);

                $scope.$on('SortChanged', function (event, value) {
                    searchRequest.sort(value);
                    searchRequest.setSearch($location);
                    $scope.listData.pagination.page = 1;
                    reload();
                });
            }
        };
    });
