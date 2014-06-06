'use strict';

angular.module('cat')
    .directive('catSelect', function ($log, $api) {
        var fetchElements = function (endpoint) {
            return function (queryParams) {
                var searchRequest = new window.cat.SearchRequest(queryParams.data);
                searchRequest.sort({ property: 'name', isDesc: false });
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
                var api = $api[$scope.options.endpoint];
                if (!api) {
                    $log.error('No api endpoint "' + $scope.options.endpoint + '" defined');
                    $scope.elements = [];
                    return;
                }
                $scope.selectOptions = _.assign({
                    minimumInputLength: 0,
                    adaptDropdownCssClass: function (cssClass) {
                        if (_.contains(['ng-valid', 'ng-invalid', 'ng-pristine', 'ng-dirty'], cssClass)) {
                            return cssClass;
                        }
                        return null;
                    },
                    ajax: {
                        data: function (term, page) {
                            return { 'search.name': term };
                        },
                        quietMillis: 500,
                        transport: fetchElements(api),
                        results: function (data, page) {
                            return {results: data.elements};
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
