'use strict';

/**
 * @ngdoc service
 * @name cat.service.view:catViewService
 * @module cat.service.view
 *
 * @description
 * This service provider can be used to initialize an api endpoint and the according detail and list routes by simply
 * providing a name and a config object.
 *
 * @param {CatRouteServiceProvider} catRouteServiceProvider DOCTODO
 * @param {CatApiServiceProvider} catApiServiceProvider DOCTODO
 * @constructor
 */
function CatViewServiceProvider(catRouteServiceProvider, catApiServiceProvider) {
    var viewNames = [];
    var endpointNames = [];

    /**
     * This function registers a new api endpoint with catApiServiceProvider and a list and detail route with
     * catRouteServiceProvider
     * @param {string} baseUrl the base url which will be prepended to all generated route pats
     * @param {string} name the name used as entry point to all routes and endpoint creations (camel cased)
     * @param {object} [config] the config object which can in turn hold objects used for configuration of the endpoint,
     * detail route or list route
     */
    this.listAndDetailView = function (baseUrl, name, config) {
        var endpointName = name.toLowerCase();
        var url = window.cat.util.pluralize(endpointName);

        if (!!config) {
            url = config.url || url;
        }

        var endpoint = {
            model: window.cat.util.defaultModelResolver(name),
            url: url
        };

        if (!!config) {
            endpoint = _.assign(endpoint, config.endpoint);
        }


        viewNames.push(name);
        endpointNames.push(endpointName);

        catApiServiceProvider.endpoint(name.toLowerCase(), endpoint);
        catRouteServiceProvider.listAndDetailRoute(baseUrl, name, config);
    };

    /**
     * This service simply exposes the created view and endpoint names, as the provider basically only delegates
     * to other service providers
     * @return {{views: Array, endpoints: Array}}
     */
    this.$get = function () {
        return {
            views: viewNames,
            endpoints: endpointNames
        };
    };
}

angular.module('cat.service.view', ['cat.service.api', 'cat.service.route', 'cat.service.view.config']).provider('catViewService', CatViewServiceProvider);