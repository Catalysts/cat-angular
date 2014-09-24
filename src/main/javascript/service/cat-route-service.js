/**
 * Created by tscheinecker on 05.08.2014.
 */

'use strict';

/**
 * @ngdoc service
 * @description
 * This service provider delegates to the $routeProvider and actually creates 2 separate routes after applying various
 * conventions / defaults
 *
 * @param $routeProvider
 * @constructor
 */
function CatRouteServiceProvider($routeProvider) {
    var viewNames = [];

    /**
     * This function creates route urls via convention from the given parameters and passes them (together with the
     * configuration) to the $routeProvider. The actual route configuration is received by passing the given one
     * to #window.cat.util.route.list and #window.cat.util.route.detail
     * @param {string} baseUrl the base url which will be prepended to all routes
     * @param {string} name the name for which the routes will be created
     * @param {Object} [config] the config object which wraps the configurations for the list and detail route
     */
    this.listAndDetailRoute = function (baseUrl, name, config) {
        viewNames.push(name);


        var listUrl = baseUrl + '/' + window.cat.util.pluralize(name.toLowerCase());

        if (!!config && config.url) {
            listUrl = baseUrl + '/' + config.url || listUrl;
        }

        var listConfig = !!config ? config.list : {};
        var detailsConfig = !!config ? config.details : {};
        var nameConf = {
            name: name
        };

        $routeProvider
            .when(listUrl, window.cat.util.route.list(_.assign({}, nameConf, listConfig)))
            .when(listUrl + '/:id', window.cat.util.route.detail(_.assign({}, nameConf, detailsConfig)));
    };

    /**
     * This service simply exposes the created view and endpoint names, as the provider basically only delegates
     * to the $routeProvider
     * @return {Array} the registered view names
     */
    this.$get = function () {
        return viewNames;
    };
}


angular.module('cat.service').provider('catRouteService', CatRouteServiceProvider);