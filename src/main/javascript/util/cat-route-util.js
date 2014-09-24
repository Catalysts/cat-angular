/**
 * Created by tscheinecker on 01.08.2014.
 */

'use strict';

window.cat.util = window.cat.util || {};

window.cat.models = window.cat.models || {};

/**
 * This helper function is used to acquire the constructor function which is used as a 'model' for the api endpoint.
 * @param name the name of the 'entity' for which the constructor has to be returned
 * @returns {Constructor}
 */
window.cat.util.defaultModelResolver = function (name) {
    return window.cat.models[name];
};

var toLowerCaseName = function (name) {
    if (!name) {
        return '';
    }
    return name.toLowerCase();
};

/**
 * Helper function to extract the base url from the current route and the parent endpoints
 * @param $route The angular $route service
 * @param {string} [baseUrl]
 * @param {array} [parentEndpointNames]
 * @return {string} the extracted baseUrl which is either the provided one, or one, generated from the parentEndpointNames
 */
var getBaseUrl = function ($route, baseUrl, parentEndpointNames) {
    if (_.isUndefined(baseUrl)) {
        baseUrl = $route.current.originalPath;
        if (_.keys($route.current.pathParams).length !== 0) {
            baseUrl = baseUrl.substring(0, baseUrl.lastIndexOf('/'));
        }
        if (_.isArray(parentEndpointNames)) {
            _.forEach(parentEndpointNames, function (parentEndpointName) {
                var idName = parentEndpointName + 'Id';
                baseUrl = baseUrl.replace(':' + idName, $route.current.params[idName]);
            });
        }
    }

    return baseUrl;
};

/**
 * A helper function for list routes which applies a few optimizations and some auto configuration.
 * In the current state it handles 4 settings:
 * * templateUrl - Auto-generation of the correct templateUrl based on conventions and the config.name property
 * * controller - Auto-generation of the correct controller based on conventions and the config.name property
 * * reloadOnSearch - this property is set to false
 * * resolve - a object with a 'listData' property is returned which is resolved via the correct endpoint
 *
 * @param {Object} config the route config object which will be used to generate the actual route configuration
 * @return {{reloadOnSearch: boolean, controller: string, templateUrl: (string), resolve: {config: Object}}}
 */
var listRoute = function (config) {
    var name = toLowerCaseName(config.name);

    function getListDataPromise(catListDataLoadingService) {
        return catListDataLoadingService.resolve(config.endpoint || name, config.defaultSort);
    }

    function getResolvedConfig($q, $route, catListDataLoadingService) {
        var deferredConfig = $q.defer();
        var resolvedConfig = {
            controller: config.controller || config.name + 'Controller',
            baseUrl: getBaseUrl($route, config.baseUrl),
            title: window.cat.util.pluralize(config.name),
            searchProps: config.searchProps || window.cat.util.defaultListSearchProps,
            listTemplateUrl: config.listTemplateUrl || (name + '/' + name + '-list.tpl.html')
        };

        getListDataPromise(catListDataLoadingService).then(
            function (listData) {
                resolvedConfig.listData = listData;
                deferredConfig.resolve(resolvedConfig);
            }
        );

        return deferredConfig.promise;
    }

    return {
        reloadOnSearch: false,
        controller: 'CatBaseListController',
        controllerAs: 'catBaseListController',
        templateUrl: config.templateUrl || 'template/cat-base-list.tpl.html',
        resolve: {
            config: getResolvedConfig
        }
    };
};

/**
 * A helper function for detail routes which applies a few optimizations and some auto configuration.
 * The actual instantiated controller will be 'CatBaseDetailController' with a default templateUrl
 * 'template/base-detail.tpl.html'. As the CatBaseDetailController expects a config object with several properties
 * (templateUrls, parents, detail, endpoint, etc.) this function also takes care of providing the correct 'resolve'
 * object which pre-loads all the necessary data.
 * @param {Object} config the route config object which will be used to generate the actual route configuration
 * @returns {{templateUrl: (string), controller: string, reloadOnSearch: (boolean), resolve: {config: (object)}}}
 */
var detailRoute = function (config) {
    var endpointName, parentEndpointNames;

    if (_.isString(config.endpoint)) {
        endpointName = config.endpoint;
    } else if (_.isObject(config.endpoint)) {
        parentEndpointNames = config.endpoint.parents;
        endpointName = config.endpoint.name;
    } else {
        endpointName = toLowerCaseName(config.name);
    }

    var Model = config.model || window.cat.util.defaultModelResolver(config.name);

    var parentUrl = '';
    var parentTemplateNamePrefix = '';


    if (_.isArray(parentEndpointNames)) {
        _.forEach(parentEndpointNames, function (parentEndpointName) {
            parentUrl += parentEndpointName;
            parentUrl += '/';

            parentTemplateNamePrefix += parentEndpointName;
            parentTemplateNamePrefix += '-';
        });
    }

    var templateUrls = {
        edit: parentUrl + endpointName + '/' + parentTemplateNamePrefix + endpointName + '-details-edit.tpl.html',
        view: parentUrl + endpointName + '/' + parentTemplateNamePrefix + endpointName + '-details-view.tpl.html'
    };

    if (config.additionalViewTemplate === true) {
        templateUrls.view = {
            main: templateUrls.view,
            additional: parentUrl + endpointName + '/' + parentTemplateNamePrefix + endpointName + '-additional-details-view.tpl.html'
        };
    }

    function getEndpoint($route, catApiService) {
        var endpoint = catApiService[endpointName];

        if (_.isArray(parentEndpointNames)) {
            _.forEach(parentEndpointNames, function (parentEndpointName, idx) {
                var currentEndpoint;
                if (idx === 0) {
                    // root api endpoint
                    currentEndpoint = catApiService[parentEndpointName];
                } else {
                    // child api endpoint
                    currentEndpoint = endpoint[parentEndpointName];
                }
                endpoint = currentEndpoint.res($route.current.params[parentEndpointName + 'Id']);
            });

            endpoint = endpoint[endpointName];
        }

        return endpoint;
    }

    function getDetailData($route, $q, endpoint) {
        var detailPromise;
        var detailId = $route.current.params.id;
        if (detailId === 'new') {
            detailPromise = $q.when(new Model());
        } else {
            detailPromise = endpoint.get(detailId);
        }
        return detailPromise;
    }

    function getConfig($route, $q, catApiService) {
        var deferred = $q.defer();
        var endpoint = getEndpoint($route, catApiService);

        var baseUrl = getBaseUrl($route, config.baseUrl, parentEndpointNames);

        var resolvedConfig = {
            controller: config.controller || config.name + 'DetailsController',
            endpoint: endpoint,
            Model: Model,
            templateUrls: templateUrls,
            baseUrl: baseUrl
        };


        var detailPromise = getDetailData($route, $q, endpoint);
        detailPromise.then(function (data) {
            resolvedConfig.detail = data;
        });

        var parentsPromise = getParentInfo($q, endpoint);
        parentsPromise.then(function (parents) {
            resolvedConfig.parents = parents;
        });

        $q.all([detailPromise, parentsPromise]).then(
            function () {
                deferred.resolve(resolvedConfig);
            },
            function (reason) {
                deferred.reject(reason);
            }
        );

        return deferred.promise;
    }

    function getParentInfo($q, endpoint) {
        if (!_.isUndefined(endpoint) && !_.isUndefined(endpoint.parentInfo)) {
            var deferred = $q.defer();
            var parents = [];
            endpoint.parentInfo().then(
                function (parent) {
                    parents.push(parent);
                    getParentInfo($q, endpoint.parentEndpoint).then(
                        function (response) {
                            parents.push(response);
                            parents = _.flatten(parents);
                            deferred.resolve(parents);
                        },
                        function (error) {
                            deferred.reject(error);
                        }
                    );
                }, function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        } else {
            return $q.when([]);
        }
    }

    return {
        templateUrl: config.templateUrl || 'template/base-detail.tpl.html',
        controller: 'CatBaseDetailController',
        reloadOnSearch: config.reloadOnSearch,
        resolve: {
            config: function ($route, $q, catApiService) {
                return getConfig($route, $q, catApiService);
            }
        }
    };
};

window.cat.util.route = {
    list: listRoute,
    detail: detailRoute
};