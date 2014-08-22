'use strict';

function CatSelectLink(scope, element) {
    element.addClass('form-control');
}

var fetchElements = function (endpoint, sort) {
    return function (queryParams) {
        var searchRequest = new window.cat.SearchRequest(queryParams.data);
        searchRequest.sort(sort || { property: 'name', isDesc: false });
        return endpoint.list(searchRequest).then(queryParams.success);
    };
};

function CatSelectController($scope, $log, catApiService, catSelectConfigService) {

    var options = catSelectConfigService.getConfig($scope.config, $scope.options);

    if (_.isUndefined(options)) {
        throw new Error('At least one of "config" or "options" has to be specified');
    }

    var transport,
        quietMillis,
        searchRequestFunc = options.search || function (term, page) {
            return {
                'search.name': term,
                page: page
            };
        },
        filterFunc = options.filter || function (term) {
            return true;
        };
    if (_.isArray(options.endpoint)) {
        transport = function (queryParams) {
            return queryParams.success({
                elements: options.endpoint
            });
        };
        quietMillis = 0;
    } else if (_.isObject(options.endpoint)) {
        transport = fetchElements(options.endpoint, options.sort);
        quietMillis = 500;
    } else if (_.isString(options.endpoint)) {
        var api = catApiService[options.endpoint];
        if (!api) {
            $log.error('No api endpoint "' + options.endpoint + '" defined');
            $scope.elements = [];
            return;
        }
        transport = fetchElements(api, options.sort);
        quietMillis = 500;
    } else {
        $log.error('The given endpoint has to be one of the following types: array, object, string - but was ' + (typeof options.endpoint));
        $scope.elements = [];
        return;
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
                var more = (page * options.size || 100) < data.totalCount;
                return {
                    results: _.filter(data.elements, filterFunc),
                    more: more
                };
            }
        },
        formatResult: function (element) {
            return element.name;
        },
        formatSelection: function (element) {
            return element.name;
        }
    }, options['ui-select2']);
}

/**
 * @ngdoc directive
 * @scope
 * @restrict EA
 * @description
 *
 * The 'cat-select' directive is a wrapper around the 'ui-select2' directive which adds support for using an api
 * endpoint provided by catApiService. There exist 2 supported ways of configuration:
 * - The 'config' attribute: This represents a named configuration which will be retrieved from the catSelectConfigService
 * - The 'options' attribute: Here the options object can directly be passed in
 *
 * The 2 different approaches exist to easily reuse certain options, as the named config is seen as 'default' and all
 * values which are provided via the options object will be overridden.
 *
 * An config / options object has the following properties:
 * - endpoint: This can either be an array, in which case it will directly be treated as the source, an endpoint name, or an endpoint object
 * - sort: An object which defines the 'sort' property and direction used when retrieving the list from an endpoint
 * - ui-select2: An config object which supports all options provided by the 'ui-select2' directive
 *
 *
 * @returns {{
 *      restrict: string,
 *      replace: boolean,
 *      priority: number,
 *      scope: {
 *          options: string,
 *          id: string,
 *          config: string
 *      },
 *      link: CatSelectLink,
 *      controller: CatSelectController,
 *      template: string
 * }}
 * @constructor
 */
function CatSelectDirective() {
    return {
        restrict: 'EA',
        replace: true,
        priority: 1,
        scope: {
            options: '=?',
            id: '@',
            config: '@?'
        },
        link: CatSelectLink,
        controller: CatSelectController,
        template: '<input type="text" ui-select2="selectOptions">'
    };
}

angular.module('cat.directives')
    .directive('catSelect', CatSelectDirective);
