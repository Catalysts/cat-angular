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
    var endpointName, parentEndpointName;

    if (_.isString(config.endpoint)) {
        endpointName = config.endpoint;
    } else if (_.isObject(config.endpoint)) {
        parentEndpointName = config.endpoint.parent;
        endpointName = config.endpoint.name;
    } else {
        endpointName = toLowerCaseName(config.name);
    }

    var Model = config.model || window.cat.util.defaultModelResolver(config.name);

    var parentUrl = (parentEndpointName ? parentEndpointName + '/' : '');
    var parentTemplateNamePrefix = (parentEndpointName ? parentEndpointName + '-' : '');

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

    return {
        templateUrl: config.templateUrl || 'template/base-detail.tpl.html',
        controller: 'CatBaseDetailController',
        reloadOnSearch: config.reloadOnSearch,
        resolve: {
            config: function ($api, $route) {
                var currentRoute = $route.current.originalPath;
                var endpoint = $api[endpointName];

                if (!_.isUndefined(parentEndpointName)) {
                    endpoint = $api[parentEndpointName].res($route.current.params[config.endpoint.id])[endpointName];
                }

                var baseUrl = config.baseUrl;

                if (_.isUndefined(baseUrl)) {
                    var baseUrlTemplate = currentRoute.substring(0, currentRoute.lastIndexOf('/'));
                    if (!_.isUndefined(parentEndpointName)) {
                        baseUrl = baseUrlTemplate.replace(':' + config.endpoint.id, $route.current.params[config.endpoint.id]);
                    } else {
                        baseUrl = baseUrlTemplate;
                    }
                }

                return {
                    controller: config.controller || config.name + 'DetailsController',
                    endpoint: endpoint,
                    Model: Model,
                    templateUrls: templateUrls,
                    baseUrl: baseUrl
                };
            },
            parent: ['$api', '$route', function ($api, $route) {
                if (_.isUndefined(parentEndpointName)) {
                    return null;
                }

                return $api[parentEndpointName].info($route.current.params[config.endpoint.id]);
            }],
            detail: ['$api', '$route', function ($api, $route) {
                var detailId = $route.current.params.id;
                if (detailId === 'new') {
                    return new Model();
                }
                if (_.isUndefined(parentEndpointName)) {
                    return $api[endpointName].get(detailId);
                } else {
                    return $api[parentEndpointName].res($route.current.params[config.endpoint.id])[endpointName].get(detailId);
                }
            }]
        }
    };
};

window.cat.util.route = {
    list: listRoute,
    detail: detailRoute
};