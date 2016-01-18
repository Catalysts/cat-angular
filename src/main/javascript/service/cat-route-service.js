'use strict';

/**
 * @ngdoc service
 * @name cat.service.route:catRouteServiceProvider
 * @description
 * This service provider delegates to the $stateProvider and actually creates 2 separate routes after applying various
 * conventions / defaults
 */
function CatRouteServiceProvider($stateProvider) {
    var viewNames = [];

    function _getListUrl(baseUrl, name, config) {
        var listUrl = baseUrl + '/' + window.cat.util.pluralize(name.toLowerCase());

        if (!!config && config.url) {
            listUrl = baseUrl + '/' + config.url;
        }

        return listUrl;
    }

    function _registerAbstractState(url, name) {
        $stateProvider
            .state(name, {
                abstract: true,
                template: '<ui-view></ui-view>',
                url: url
            });
    }

    function _getStateName(name, config) {
        if (!!config && !!config.parent) {
            return config.parent + '.' + name;
        }

        return name;
    }


    /**
     * A helper function for detail routes which applies a few optimizations and some auto configuration.
     * The actual instantiated controller will be 'CatBaseDetailController' with a default templateUrl
     * 'template/cat-base-detail.tpl.html'. As the CatBaseDetailController expects a config object with several properties
     * (templateUrls, parents, detail, endpoint, etc.) this function also takes care of providing the correct 'resolve'
     * object which pre-loads all the necessary data.
     * @param {Object} config the route config object which will be used to generate the actual route configuration
     * @param name the name used to resolve default values like templates, etc.
     * @returns {{templateUrl: (string), controller: string, reloadOnSearch: (boolean), resolve: {config: (object)}}}
     */
    function _getDetailConfig(config, name) {
        var _config = _.assign({name: name}, config);

        return {
            url: _config.url || '/:id',
            templateUrl: _config.templateUrl || 'template/cat-base-detail.tpl.html',
            controller: 'CatBaseDetailController',
            reloadOnSearch: _config.reloadOnSearch,
            resolve: {
                config: function ($stateParams, catViewConfigService) {
                    // TODO $stateParams needs to be passed from here because otherwise it's empty...
                    return catViewConfigService.getDetailConfig(_config, $stateParams);
                }
            }
        };
    }

    function _registerDetailState(config, name) {
        var stateName = _getStateName(name, config);
        var detailConfig = _getDetailConfig(config, name);

        $stateProvider
            .state(stateName + '.detail', detailConfig);

        if (!!config && config.additionalViewTemplate === 'tabs') {
            $stateProvider
                .state(stateName + '.tab', {
                    abstract: true,
                    template: '<ui-view></ui-view>',
                    url: '/:' + name.toLowerCase() + 'Id'
                });
        }
    }

    /**
     * A helper function for list routes which applies a few optimizations and some auto configuration.
     * In the current state it handles 4 settings:
     * * templateUrl - Auto-generation of the correct templateUrl based on conventions and the config.name property
     * * controller - Auto-generation of the correct controller based on conventions and the config.name property
     * * reloadOnSearch - this property is set to false
     * * resolve - a object with a 'listData' property is returned which is resolved via the correct endpoint
     *
     * @param {Object} config the route config object which will be used to generate the actual route configuration
     * @param name the name used to resolve default values like templates, etc.
     * @return {{reloadOnSearch: boolean, controller: string, templateUrl: (string), resolve: {config: Object}}}
     */
    function _getListConfig(config, name) {
        var _config = _.assign({name: name}, config);

        return {
            url: _config.url || '',
            reloadOnSearch: false,
            controller: 'CatBaseListController',
            controllerAs: 'catBaseListController',
            templateUrl: _config.templateUrl || 'template/cat-base-list.tpl.html',
            resolve: {
                config: function (catViewConfigService) {
                    return catViewConfigService.getListConfig(_config);
                }
            }
        };
    }

    function _registerListState(config, name) {
        var stateName = _getStateName(name, config);
        var listConfig = _getListConfig(config, name);
        $stateProvider
            .state(stateName + '.list', listConfig);
    }


    /**
     * @ngdoc function
     * @name detailRoute
     * @methodOf cat.service.route:catRouteServiceProvider
     *
     * @description
     * This function creates route url via convention from the given parameters and passes them (together with the
     * configuration) to the $stateProvider. The actual route configuration is received by passing the given one
     * to #window.cat.util.route.detail
     *
     * @param {string} baseUrl the base url which will be prepended to all routes
     * @param {string} name the name for which the routes will be created
     * @param {Object} [config] the config object which wraps the configurations for the list and detail route
     */
    this.detailRoute = function (baseUrl, name, config) {
        var stateName = _getStateName(name, config);

        var viewData = {viewData: !!config ? (config.viewData || {}) : {}};
        viewNames.push(stateName);

        var listUrl = _getListUrl(baseUrl, name, config);

        _registerAbstractState(listUrl, stateName);
        _registerDetailState(_.assign({}, config, viewData), name);
    };

    /**
     * @ngdoc function
     * @name detailRoute
     * @methodOf cat.service.route:catRouteServiceProvider
     *
     * @description
     * This function creates route urls via convention from the given parameters and passes them (together with the
     * configuration) to the $stateProvider. The actual route configuration is received by passing the given one
     * to #window.cat.util.route.list and #window.cat.util.route.detail
     *
     * @param {string} baseUrl the base url which will be prepended to all routes
     * @param {string} name the name for which the routes will be created
     * @param {Object} [config] the config object which wraps the configurations for the list and detail route
     */
    this.listAndDetailRoute = function (baseUrl, name, config) {
        var stateName = _getStateName(name, config);

        var viewData = {viewData: !!config ? (config.viewData || {}) : {}};
        viewNames.push(stateName);
        if (_.isUndefined(config)) {
            config = {};
        }

        var listUrl = _getListUrl(baseUrl, name, config);

        _registerAbstractState(listUrl, stateName);
        _registerDetailState(_.assign({}, config.details, viewData), name);
        _registerListState(_.assign({}, config.list, viewData), name);
    };

    /**
     * @ngdoc service
     * @name cat.service.route:catRouteService
     * @module cat.service.route
     *
     * @description
     * This service simply exposes the created view and endpoint names, as the provider basically only delegates
     * to the $stateProvider
     */
    this.$get = function () {
        return viewNames;
    };
}

angular
    .module('cat.service.route', [
        'ui.router',
        'cat.service.message',
        'cat.service.breadcrumbs',
        'cat.service.validation'
    ])
    .provider('catRouteService', CatRouteServiceProvider)
    .run(['$rootScope', '$log', '$globalMessages', 'catBreadcrumbsService', 'catValidationService',
        function ($rootScope, $log, $globalMessages, catBreadcrumbsService, catValidationService) {
            $rootScope.$on('$stateChangeError', function () {
                var exception = arguments[arguments.length - 1];
                $globalMessages.addMessage('warning', exception);
                $log.warn(exception);
            });
            $rootScope.$on('$stateChangeSuccess', function () {
                catBreadcrumbsService.clear();
                catValidationService.clearValidationErrors();
            });
        }]);