/**
 * Created by tscheinecker on 05.08.2014.
 */

'use strict';

function CatViewServiceProvider(catRouteServiceProvider, catApiServiceProvider) {
    var viewNames = [];
    var endpointNames = [];

    this.listAndDetailView = function (baseUrl, name, config) {
        var endpointName = name.toLowerCase();
        var url = endpointName + 's';

        if (!!config) {
            url = config.url || url;
        }

        var listUrl = baseUrl + '/' + url;

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


    this.$get = function () {
        return {
            views: viewNames,
            endpoints: endpointNames
        };
    };
}


angular.module('cat.service').provider('catViewService', CatViewServiceProvider);