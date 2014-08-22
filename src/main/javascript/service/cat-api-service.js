'use strict';

function CatApiEndpoint(url, endpointConfig, $http) {
    var that = this;

    var _endpointName = endpointConfig.name;
    var _endpointUrl = url + (endpointConfig.config.url || endpointConfig.name);
    var ModelClass = endpointConfig.config.model;
    var _childEndpointSettings = endpointConfig.children;

    var _res = _.memoize(function (id) {
        var url = _endpointUrl + '/' + id + '/';
        var ret = {};
        _.forEach(_.keys(_childEndpointSettings), function (path) {
            ret[path] = new CatApiEndpoint(url, _childEndpointSettings[path], $http);
            ret[path].parentEndpoint = that;
            ret[path].parentId = id;
            ret[path].parentInfo = function () {
                return that.info(id);
            };
        });
        return ret;
    });

    this.res = function (id) {
        return _res(id);
    };

    var mapResponse = function (data) {
        var object = new ModelClass(data);
        return _.merge(object, _res(object.id));
    };

    var removeEndpoints = function (object) {
        var endpoints = _res(object.id);
        _.forEach(_.keys(endpoints), function (key) {
            delete object[key];
        });
        return object;
    };

    this.getEndpointUrl = function () {
        return _endpointUrl;
    };

    this.getEndpointName = function () {
        return _endpointName;
    };

    this.list = function (searchRequest) {
        var searchQuery = !!searchRequest && searchRequest instanceof window.cat.SearchRequest ? '?' + searchRequest.urlEncoded() : '';
        return $http.get(_endpointUrl + searchQuery).then(function (response) {
            if (!!response.data.totalCount || response.data.totalCount === 0) {
                var facets = [];

                if (!!response.data.facets) {
                    facets = _.map(response.data.facets, function (facet) {
                        return new window.cat.Facet(facet);
                    });
                }

                return {
                    totalCount: response.data.totalCount,
                    facets: facets,
                    elements: _.map(response.data.elements, function (elem) {
                        return mapResponse(elem);
                    })
                };
            } else {
                return _.map(response.data, function (elem) {
                    return mapResponse(elem);
                });
            }
        });
    };

    this.all = function () {
        return $http.get(_endpointUrl + '/all').then(function (response) {
            return _.map(response.data, function (elem) {
                return mapResponse(elem);
            });
        });
    };

    this.get = function (id) {
        return $http.get(_endpointUrl + '/' + id).then(function (response) {
            return mapResponse(response.data);
        });
    };

    this.info = function (id) {
        return $http.get(_endpointUrl + '/' + id + '?info').then(function (response) {
            return response.data;
        });
    };

    this.save = function (object) {
        if (!!object.id) {
            return $http.put(_endpointUrl + '/' + object.id, removeEndpoints(object)).then(function (response) {
                return mapResponse(response.data);
            });
        } else {
            return $http.post(_endpointUrl, removeEndpoints(object)).then(function (response) {
                return mapResponse(response.data);
            });
        }
    };

    this.remove = function (id) {
        return $http({method: 'DELETE', url: _endpointUrl + '/' + id});
    };
}

function EndpointConfig(name, config) {
    var that = this;
    this.config = config || {};
    this.children = {};
    this.name = name;

    this.child = function (childName, childConfig) {
        if (!_.isUndefined(childConfig)) {
            this.children[childName] = new EndpointConfig(childName, childConfig);
            this.children[childName].parent = this;
        }

        return this.children[childName];
    };

    // this takes care of mapping the 'old' config style to the new builder style
    if (!_.isUndefined(this.config.children)) {
        var childrenConfig = this.config.children;
        delete this.config.children;
        _.forEach(_.keys(childrenConfig), function (childName) {
            that.child(childName, childrenConfig[childName]);
        });
    }
}

// this is saved outside so that both $api and catApiService use the same config
var _endpoints = {};

function CatApiServiceProvider() {
    var _urlPrefix = '/api/';

    this.endpoint = function (path, settings) {
        if (!_.isUndefined(settings)) {
            _endpoints[path] = new EndpointConfig(path, settings);
        }
        return _endpoints[path];
    };

    this.$get = ['$http', function ($http) {
        var catApiService = {};

        _.forEach(_.keys(_endpoints), function (path) {
            catApiService[path] = new CatApiEndpoint(_urlPrefix, _endpoints[path], $http);
        });

        return catApiService;
    }];
}
angular.module('cat.service.api').provider('catApiService', CatApiServiceProvider);
// $api is deprecated, will be removed in a future release
angular.module('cat.service.api').provider('$api', CatApiServiceProvider);
