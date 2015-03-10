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

    function _registerListState(config, name) {
        var stateName = _getStateName(name, config);
        var listConfig = _getListConfig(config, name);
        $stateProvider
            .state(stateName + '.list', listConfig);
    }

    function _getDetailConfig(config, name) {
        return window.cat.util.route.detail(_.assign({name: name}, config));
    }

    function _getListConfig(config, name) {
        return window.cat.util.route.list(_.assign({name: name}, config));
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
        viewNames.push(stateName);

        var listUrl = _getListUrl(baseUrl, name, config);

        _registerAbstractState(listUrl, stateName);
        _registerDetailState(config, name);
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
        viewNames.push(stateName);
        if (_.isUndefined(config)) {
            config = {};
        }

        var listUrl = _getListUrl(baseUrl, name, config);

        _registerAbstractState(listUrl, stateName);
        _registerDetailState(config.details, name);
        _registerListState(config.list, name);
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

angular.module('cat.service.route')
    .provider('catRouteService', CatRouteServiceProvider)
    .run(function($rootScope, $log, $globalMessages, catBreadcrumbsService) {
        $rootScope.$on('$stateChangeError', function() {
            var exception = arguments[arguments.length - 1];
            $globalMessages.addMessage('warning', exception);
            $log.warn(exception);
        });
        $rootScope.$on('$stateChangeSuccess', function() {
            catBreadcrumbsService.clear();
        });
    });