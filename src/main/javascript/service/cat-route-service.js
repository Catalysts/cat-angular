/**
 * Created by tscheinecker on 05.08.2014.
 */

'use strict';

function CatRouteServiceProvider($routeProvider) {
    var viewNames = [];

    this.listAndDetailRoute = function (baseUrl, name, config) {
        viewNames.push(name);


        var listUrl = baseUrl + '/' + name.toLowerCase() + 's';

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


    this.$get = function () {
        return viewNames;
    };
}


angular.module('cat.service').provider('catRouteService', CatRouteServiceProvider);