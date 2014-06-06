'use strict';

function ApiEndpoint(url, endpointName, settings, $http) {
    var _endpointUrl = url + (settings.url || endpointName);
    var ModelClass = settings.model;
    var _childEndpointSettings = settings.children;

    var _res = _.memoize(function (id) {
        var url = _endpointUrl + '/' + id + '/';
        var ret = {};
        _.forEach(_.keys(_childEndpointSettings), function (path) {
            var settings = _childEndpointSettings[path];
            ret[path] = new ApiEndpoint(url, path, settings, $http);
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

    this.get = function (id, pathParams) {
        return $http.get(_endpointUrl + '/' + id).then(function (response) {
            return mapResponse(response.data);
        });
    };

    this.save = function (object, pathParams) {
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

    this.remove = function (id, pathParams) {
        return $http({method: 'DELETE', url: _endpointUrl + '/' + id});
    };
}

function ApiProvider() {
    var _urlPrefix = '/api/';
    var _endpoints = {};

    this.endpoint = function (path, settings) {
        _endpoints[path] = settings;
    };

    this.$get = ['$http', function ($http) {
        var $api = {};

        _.forEach(_.keys(_endpoints), function (path) {
            var settings = _endpoints[path];
            $api[path] = new ApiEndpoint(_urlPrefix, path, settings, $http);
        });

        return $api;
    }];
}

angular.module('cat.api').provider('$api', ApiProvider);
