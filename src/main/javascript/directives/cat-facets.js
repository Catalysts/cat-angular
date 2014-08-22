'use strict';
angular.module('cat')
    .directive('catFacets', function CatFacetsDirective() {
        return {
            replace: true,
            restrict: 'E',
            scope: {
                facets: '=',
                names: '='
            },
            templateUrl: 'template/cat-facets.tpl.html',
            link: function CatFacetsLink(scope) {
                if (scope.facets === undefined) throw 'Attribute facets must be set!';
            },
            controller: function ($scope, $location, $rootScope) {

                $scope.isActive = function (facet, term) {
                    var search = $location.search();
                    var name = 'search.' + facet.name;
                    if (!!search[name]) {
                        return !!term && search[name] === term.id;
                    } else {
                        return true;
                    }
                };

                $scope.showAll = function (facet) {
                    var search = new window.cat.SearchRequest($location.search()).search();
                    delete search[facet.name];
                    $rootScope.$broadcast('SearchChanged', search);
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
                    var search = new window.cat.SearchRequest($location.search()).search();
                    search[facet.name] = term.id;
                    $rootScope.$broadcast('SearchChanged', search);

                };

                $scope.remove = function (facet) {
                    var search = new window.cat.SearchRequest($location.search()).search();
                    delete search[facet.name];
                    $rootScope.$broadcast('SearchChanged', search);
                };

                $scope.showItem = function (facet, term) {
                    return $scope.isActive(facet) || $scope.isActive(facet, term);
                };
            }
        };
    });
