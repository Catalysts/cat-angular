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
 * @param $location The $location service holding the current path + params
 * @param $stateParams The $stateParams service holding all params of the requested state
 * @param {string} [baseUrl]
 * @return {string} the extracted baseUrl which is either the provided one, or one, generated from the parentEndpointNames
 */
var getBaseUrl = function ($location, $stateParams, baseUrl) {
    if (!_.isUndefined(baseUrl)) {
        return baseUrl;
    }

    var path = $location.path();
    if (_.isUndefined($stateParams.id)) {
        return path;
    }

    return path.substring(0, path.lastIndexOf('/'));
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

    function getResolvedConfig($q, $stateParams, $location, catListDataLoadingService) {
        var deferredConfig = $q.defer();
        var resolvedConfig = {
            name: config.name,
            controller: config.controller || config.name + 'Controller',
            baseUrl: getBaseUrl($location, $stateParams, config.baseUrl),
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
        url: config.url || '',
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
 * 'template/cat-base-detail.tpl.html'. As the CatBaseDetailController expects a config object with several properties
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

    var tabs;

    var templateUrls = {
        edit: parentUrl + endpointName + '/' + parentTemplateNamePrefix + endpointName + '-details-edit.tpl.html',
        view: parentUrl + endpointName + '/' + parentTemplateNamePrefix + endpointName + '-details-view.tpl.html'
    };

    if (config.additionalViewTemplate === true) {
        templateUrls.view = {
            main: templateUrls.view,
            additional: parentUrl + endpointName + '/' + parentTemplateNamePrefix + endpointName + '-additional-details-view.tpl.html'
        };
    } else if (config.additionalViewTemplate === 'tabs') {
        templateUrls.view = {
            main: templateUrls.view,
            additional: 'template/cat-base-additional-details-tabs-view.tpl.html'
        };
        tabs = config.additionalViewTemplateTabs;
    }

    function getEndpoint($stateParams, catApiService) {
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
                endpoint = currentEndpoint.res($stateParams[parentEndpointName + 'Id']);
            });

            endpoint = endpoint[endpointName];
        }

        return endpoint;
    }

    function getDetailData($stateParams, $q, endpoint) {
        var detailPromise;
        var detailId = $stateParams.id;
        if (detailId === 'new') {
            detailPromise = $q.when(new Model());
        } else {
            detailPromise = endpoint.get(detailId);
        }
        return detailPromise;
    }

    function getConfig($location, $stateParams, $q, catApiService) {
        var deferred = $q.defer();
        var endpoint = getEndpoint($stateParams, catApiService);

        var baseUrl = getBaseUrl($location, $stateParams, config.baseUrl);

        var resolvedConfig = {
            name: config.name,
            controller: config.controller || config.name + 'DetailsController',
            endpoint: endpoint,
            Model: Model,
            templateUrls: templateUrls,
            tabs: tabs,
            baseUrl: baseUrl
        };


        var detailPromise = getDetailData($stateParams, $q, endpoint);
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
        url: config.url || '/:id',
        templateUrl: config.templateUrl || 'template/cat-base-detail.tpl.html',
        controller: 'CatBaseDetailController',
        reloadOnSearch: config.reloadOnSearch,
        resolve: {
            config: getConfig
        }
    };
};

window.cat.util.route = {
    list: listRoute,
    detail: detailRoute
};