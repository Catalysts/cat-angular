interface CatSelectOptions {
    endpoint:string|ICatApiEndpoint|Function;
    searchRequestAdapter?:Function|Object;
    size?:number;
    sort?:Sort;

    filter?(term:string):boolean;
    search?(term:string, page:number, context:any):any;
}

interface CatSelectScope<T> extends IScope {
    elements:T[];
    selectOptions:Select2Options;
    config?:string;
    options?:CatSelectOptions;
}

class CatSelectController {
    constructor($scope:CatSelectScope<any>,
                private $log:ILogService,
                catApiService:ICatApiService,
                catSelectConfigService:ICatSelectConfigService) {


        let options:CatSelectOptions = catSelectConfigService.getConfig($scope.config, $scope.options);

        if (_.isUndefined(options)) {
            throw new Error('At least one of "config" or "options" has to be specified');
        }

        let searchRequestAdapter = options.searchRequestAdapter || {};

        let transport,
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
        let endpoint:any = options.endpoint;
        if (_.isArray(endpoint)) {
            transport = function (queryParams) {
                return queryParams.success({
                    elements: options.endpoint
                });
            };
            quietMillis = 0;
        } else if (_.isFunction(endpoint)) {
            transport = endpoint;
            quietMillis = 500;
        } else if (_.isObject(endpoint)) {
            transport = this.fetchElements(endpoint, options.sort, searchRequestAdapter);
            quietMillis = 500;
        } else if (_.isString(endpoint)) {
            let api = catApiService['' + endpoint];
            if (!api) {
                $log.error('No api endpoint "' + endpoint + '" defined');
                $scope.elements = [];
                return;
            }
            transport = this.fetchElements(api, options.sort, searchRequestAdapter);
            quietMillis = 500;
        } else {
            $log.error('The given endpoint has to be one of the following types: array, object, string or function - but was ' + (typeof endpoint));
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
                results: (data:CatPagedResponse<any>, page:number) => {
                    let more = (page * (options.size || 100)) < data.totalCount;
                    return {
                        results: _.filter(data.elements, filterFunc),
                        more: more
                    };
                }
            },
            formatResult: (element) => {
                return element.name;
            },
            formatSelection: (element) => {
                return element.name;
            }
        }, options['ui-select2']);
    }

    private fetchElements(endpoint:ICatApiEndpoint,
                          sort?:Sort,
                          searchRequestAdapter?:Function|Object) {
        return function (queryParams) {
            let searchRequest = new window.cat.SearchRequest(queryParams.data);
            searchRequest.sort(sort || {property: 'name', isDesc: false});

            if (_.isFunction(searchRequestAdapter)) {
                searchRequest = searchRequestAdapter(searchRequest);
            } else if (_.isObject(searchRequestAdapter)) {
                _.assign(searchRequest, searchRequestAdapter);
            } else {
                this.$log.warn('searchRequestAdapter has to be either a function or an object but was ' + (typeof searchRequestAdapter));
            }

            return endpoint.list(searchRequest).then(queryParams.success);
        };
    }
}

/**
 * @ngdoc directive
 * @name cat.directives.select:catSelect
 * @scope
 * @restrict EA
 *
 * @description
 * The 'cat-select' directive is a wrapper around the 'ui-select2' directive which adds support for using an api
 * endpoint provided by catApiService. There exist 2 supported ways of configuration:
 * - The 'config' attribute: This represents a named configuration which will be retrieved from the catSelectConfigService
 * - The 'options' attribute: Here the options object can directly be passed in
 *
 * The 2 different approaches exist to easily reuse certain options, as the named config is seen as 'default' and all
 * values which are provided via the options object will be overridden.
 *
 * An config / options object has the following properties:
 * - endpoint: This can either be an array, in which case it will directly be treated as the source, an endpoint name
 * or an endpoint object to call the given endpoint, or a function which is used as the 'transport' function
 * - sort: An object which defines the 'sort' property and direction used when retrieving the list from an endpoint
 * - ui-select2: An config object which supports all options provided by the 'ui-select2' directive
 *
 * TODO fix returns doc (not the correct format)
 * returns {{
 *      restrict: {string},
 *      replace: {boolean},
 *      priority: {number},
 *      scope: {
 *          options: {string},
 *          id: {string},
 *          config: {string}
 *      },
 *      link: {CatSelectLink},
 *      controller: {CatSelectController},
 *      template: {string}
 * }}
 * @constructor
 */
function catSelectDirectiveFactory():IDirective {
    let catSelectLink:IDirectiveLinkFn = (scope:IScope,
                                          element:IAugmentedJQuery,
                                          attrs:IAttributes,
                                          ngModel:INgModelController) => {
        element.addClass('form-control');
        // clear formatters, otherwise $viewModel will be converted to a string
        // see https://github.com/angular/angular.js/commit/1eda18365a348c9597aafba9d195d345e4f13d1e
        ngModel.$formatters = [];
    };


    return {
        restrict: 'EA',
        replace: true,
        priority: 1,
        require: 'ngModel',
        scope: {
            options: '=?',
            id: '@',
            config: '@?'
        },
        link: catSelectLink,
        controller: [
            '$scope',
            '$log',
            'catApiService',
            'catSelectConfigService',
            CatSelectController
        ],
        template: '<input type="text" ui-select2="selectOptions">'
    };
}

angular.module('cat.directives.select', ['ui.select2', 'cat.service.api', 'cat.service.selectConfig'])
    .directive('catSelect', [catSelectDirectiveFactory]);
