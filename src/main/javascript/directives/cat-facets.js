'use strict';
angular.module('cat')
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
            templateUrl: 'template/cat-facets.tpl.html',
            link: function CatFacetsLink(scope) {
                _initDefaults(scope);
                _checkConditions(scope);
            },
            controller: function CatFacetsController($scope) {

                function _search(search) {
                    return $scope.listData.searchRequest.search(search);
                }

                $scope.isActive = function (facet) {
                    return !_search()[facet.name];
                };

                $scope.showAll = function (facet) {
                    var search = _search();
                    delete search[facet.name];
                    _search(search);
                };

                $scope.facetName = function (facet) {
                    if ($scope.names !== undefined && $scope.names[facet.name] !== undefined) {
                        return $scope.names[facet.name];
                    } else {
                        return facet.name;
                    }
                };

                $scope.setActive = function (facet, term) {
                    facet.activeTerm = term;
                    var search = _search();
                    search[facet.name] = term.id;
                    _search(search);
                };
            }
        };
    });
