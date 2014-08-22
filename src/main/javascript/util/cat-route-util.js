/**
 * Created by tscheinecker on 01.08.2014.
 */

'use strict';

window.cat.util = window.cat.util || {};

window.cat.models = window.cat.models || {};

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
 * Helper function for list routes
 * @param config
 * @returns {{templateUrl: string, controller: string, reloadOnSearch: boolean, resolve: {listData: *[]}}}
 */
var listRoute = function (config) {
    var name = toLowerCaseName(config.name);
    return {
        templateUrl: config.templateUrl || (name + '/' + name + '-list.tpl.html'),
        controller: config.controller || config.name + 'Controller',
        reloadOnSearch: false,
        resolve: {
            listData: ['catListDataLoadingService', function (catListDataLoadingService) {
                return catListDataLoadingService.resolve(config.endpoint || name, config.defaultSort);
            }]
        }
    };
};

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

    var resolvedConfig;

    function getConfig(catApiService, $route) {
        if (!_.isUndefined(resolvedConfig)) {
            return resolvedConfig;
        }

        var currentRoute = $route.current.originalPath;
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

        var baseUrl = config.baseUrl;

        if (_.isUndefined(baseUrl)) {
            var baseUrlTemplate = currentRoute.substring(0, currentRoute.lastIndexOf('/'));
            if (_.isArray(parentEndpointNames)) {
                _.forEach(parentEndpointNames, function (parentEndpointName) {
                    var idName = parentEndpointName + 'Id';
                    baseUrl = baseUrlTemplate.replace(':' + idName, $route.current.params[idName]);
                });
            } else {
                baseUrl = baseUrlTemplate;
            }
        }

        resolvedConfig = {
            controller: config.controller || config.name + 'DetailsController',
            endpoint: endpoint,
            Model: Model,
            templateUrls: templateUrls,
            baseUrl: baseUrl
        };

        return resolvedConfig;
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
            config: function (catApiService, $route) {
                return getConfig(catApiService, $route);
            },
            parents: ['catApiService', '$route', '$q', function (catApiService, $route, $q) {
                if (_.isUndefined(parentEndpointNames)) {
                    return null;
                }

                return getParentInfo($q, getConfig(catApiService, $route).endpoint);
            }],
            detail: ['catApiService', '$route', function (catApiService, $route) {
                var detailId = $route.current.params.id;
                if (detailId === 'new') {
                    return new Model();
                }

                return getConfig(catApiService, $route).endpoint.get(detailId);
            }]
        }
    };
};

window.cat.util.route = {
    list: listRoute,
    detail: detailRoute
};