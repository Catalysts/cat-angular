'use strict';
angular.module('cat.directives.facets')
    .directive('catFacets', function CatFacetsDirective() {
        function _initDefaults(scope) {
            if (_.isUndefined(scope.listData)) {
                scope.listData = scope.$parent.listData;
            }
        }

        function _checkConditions(scope) {
            if (_.isUndefined(scope.listData)) {
                throw new Error('listData was not defined and couldn\'t be found with default value');
            }

            if (_.isUndefined(scope.listData.facets)) {
                throw new Error('No facets are available within given listData');
            }
        }

        return {
            replace: true,
            restrict: 'E',
            scope: {
                listData: '=?',
                names: '='
            },
            require: '^catPaginated',
            templateUrl: 'template/cat-facets.tpl.html',
            link: function CatFacetsLink(scope, element, attrs, catPaginatedController) {
                _initDefaults(scope);
                _checkConditions(scope);

                scope.catPaginatedController = catPaginatedController;
            },
            controller: function CatFacetsController($scope) {
                $scope.isActive = function (facet) {
                    return !!$scope.catPaginatedController.getSearch()[facet.name];
                };

                function _search(search) {
                    return $scope.catPaginatedController.getSearchRequest().search(search);
                }

                $scope.facetName = function (facet) {
                    if ($scope.names !== undefined && $scope.names[facet.name] !== undefined) {
                        return $scope.names[facet.name];
                    } else {
                        return facet.name;
                    }
                };

                $scope.facets = {};

                $scope.facetChanged = function (facet) {
                    var search = _search();
                    var value = $scope.facets[facet.name];
                    if (!!value) {
                        search[facet.name] = value;
                    } else {
                        delete search[facet.name];
                    }
                };

                $scope.initFacets = function () {
                    _.forEach($scope.listData.facets, function (facet) {
                        if ($scope.isActive(facet)) {
                            $scope.facets[facet.name] = $scope.catPaginatedController.getSearch()[facet.name];
                        }
                    });
                };

                $scope.facetSelectOptions = {
                    allowClear: true
                };
            }
        };
    });
