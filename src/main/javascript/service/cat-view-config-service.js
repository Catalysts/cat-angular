/**
 * @author Thomas Scheinecker, Catalysts GmbH.
 */

'use strict';

function CatViewConfigService($q, catApiService, catListDataLoadingService) {
    function toLowerCaseName(name) {
        if (!name) {
            return '';
        }
        return name.toLowerCase();
    }

    function getDetailData($stateParams, Model, endpoint) {
        var detailPromise;

        var detailId = $stateParams.id;
        if (detailId === 'new') {
            detailPromise = $q.when(new Model());
        } else {
            detailPromise = endpoint.get(detailId);
        }
        return detailPromise;
    }

    function getEndpoint(endpointName, parentEndpointNames, $stateParams) {
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

    function getParentInfo(endpoint) {
        if (!_.isUndefined(endpoint) && !_.isUndefined(endpoint.parentInfo)) {
            var deferred = $q.defer();
            var parents = [];
            endpoint.parentInfo().then(
                function (parent) {
                    parents.push(parent);
                    getParentInfo(endpoint.parentEndpoint).then(
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

    this.getDetailConfig = function (config, $stateParams) {
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

        var deferred = $q.defer();
        var endpoint = getEndpoint(endpointName, parentEndpointNames, $stateParams);

        var resolvedConfig = {
            name: config.name,
            controller: config.controller || config.name + 'DetailsController',
            endpoint: endpoint,
            Model: Model,
            templateUrls: templateUrls,
            tabs: tabs
        };


        var detailPromise = getDetailData($stateParams, Model, endpoint);
        detailPromise.then(function (data) {
            resolvedConfig.detail = data;
        });

        var parentsPromise = getParentInfo(endpoint);
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
    };


    function getListDataPromise(config, name) {
        return catListDataLoadingService.resolve(config.endpoint || name, config.defaultSort);
    }

    this.getListConfig = function(config) {
        var name = toLowerCaseName(config.name);

        var deferredConfig = $q.defer();
        var resolvedConfig = {
            name: config.name,
            controller: config.controller || config.name + 'Controller',
            title: window.cat.util.pluralize(config.name),
            searchProps: config.searchProps || window.cat.util.defaultListSearchProps,
            listTemplateUrl: config.listTemplateUrl || (name + '/' + name + '-list.tpl.html')
        };

        getListDataPromise(config, name).then(
            function (listData) {
                resolvedConfig.listData = listData;
                deferredConfig.resolve(resolvedConfig);
            }
        );

        return deferredConfig.promise;
    };
}

angular.module('cat.service.view.config', ['cat.service.api'])
    .service('catViewConfigService', CatViewConfigService);
