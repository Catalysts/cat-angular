'use strict';

angular.module('cat')
    .directive('catSelect', function ($log, $api) {
        var fetchElements = function (endpoint, sort) {
            return function (queryParams) {
                var searchRequest = new window.cat.SearchRequest(queryParams.data);
                searchRequest.sort(sort || { property: 'name', isDesc: false });
                return endpoint.list(searchRequest).then(queryParams.success);
            };
        };

        return {
            restrict: 'EA',
            replace: true,
            priority: 1,
            scope: {
                options: '=',
                id: '@'
            },
            link: function (scope, element) {
                element.addClass('form-control');
            },
            controller: function ($scope) {
                var transport,
                    quietMillis,
                    searchRequestFunc = $scope.options.search || function (term, page) {
                        return { 'search.name': term };
                    },
                    filterFunc = $scope.options.filter || function (term) {
                        return true;
                    };
                if (Object.prototype.toString.call($scope.options.endpoint) === '[object Array]') {
                    transport = function (queryParams) {
                        return queryParams.success({
                            elements: $scope.options.endpoint
                        });
                    };
                    quietMillis = 0;
                } else {
                    var api = $api[$scope.options.endpoint];
                    if (!api) {
                        $log.error('No api endpoint "' + $scope.options.endpoint + '" defined');
                        $scope.elements = [];
                        return;
                    }
                    transport = fetchElements(api, $scope.options.sort);
                    quietMillis = 500;
                }

                $scope.selectOptions = _.assign({
                    placeholder: ' ', // space in default placeholder is required, otherwise allowClear property does not work
                    minimumInputLength: 0,
                    adaptDropdownCssClass: function (cssClass) {
                        if (_.contains(['ng-valid', 'ng-invalid', 'ng-pristine', 'ng-dirty'], cssClass)) {
                            return cssClass;
                        }
                        return null;
                    },
                    ajax: {
                        data: searchRequestFunc,
                        quietMillis: quietMillis,
                        transport: transport,
                        results: function (data, page) {
                            return {results: _.filter(data.elements, filterFunc)};
                        }
                    },
                    formatResult: function (element) {
                        return element.name;
                    },
                    formatSelection: function (element) {
                        return element.name;
                    }
                }, $scope.options['ui-select2']);
            },
            template: '<input type="text" ui-select2="selectOptions">'
        };
    });
