'use strict';

/**
 * A CatApiEndpoint wraps several helper functions to easily execute backend calls for the base CRUD operations.
 * It also adds support for 'children' which can only be used by resolving them for a parent id.
 * @param {string} url the base url which is added before the configured urls
 * @param {object} endpointConfig the configuration of this endpoint - holds properties like name, url, the model and children
 * @param {object} $http the angular $http service which handles the actual xhr requests
 * @constructor
 */
function CatApiEndpoint(url, endpointConfig, $http) {
    var that = this;

    var _endpointName = endpointConfig.name;
    var _endpointUrl = url + (endpointConfig.config.url || endpointConfig.name);
    var ModelClass = endpointConfig.config.model;
    var _childEndpointSettings = endpointConfig.children;

    /**
     * This helper function initializes all configured child endpoints by creating the appropriate url by appending
     * the given id before initializing them.
     * @return {object} a object holding all resolved child endpoints for the given id
     * @private
     */
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

    /**
     * This helper method initializes a new instance of the configured model with the given data and adds all child
     * endpoints to it.
     * @param data the data received from the backend which is used to initialize the model
     * @return {Object} an instance of the configured model initialized with the given data and the resolved child
     * endpoints
     * @private
     */
    var _mapResponse = function (data) {
        var object = new ModelClass(data);
        return _.merge(object, _res(object.id));
    };

    /**
     * This helper methods deletes all child endpoints from the given object.
     * @param {object} object the object to remove the child endpoints from
     * @return {object} the passed in object without the child endpoints
     * @private
     */
    var _removeEndpoints = function (object) {
        var endpoints = _res(object.id);
        _.forEach(_.keys(endpoints), function (key) {
            delete object[key];
        });
        return object;
    };

    /**
     * This method is used to instantiate actual child api endpoints which are dependent on a certain parent id
     * @param id the id for which to 'resolve' the child endpoints.
     * @return {object} a object which maps all child endpoint names to the actual endpoints where the url was resolved
     * with the provided id
     */
    this.res = function (id) {
        return _res(id);
    };

    /**
     * A small helper function to retrieve the actual url this endpoint resolved to.
     * @return {string} the resolved url of this endpoint
     */
    this.getEndpointUrl = function () {
        return _endpointUrl;
    };

    /**
     * A small helper to retrieve the name of the endpoint.
     * @return {string} the name of this endpoint
     */
    this.getEndpointName = function () {
        return _endpointName;
    };

    /**
     * This function calls the url available via #getEndpointUrl without further modification apart from adding search
     * parameters if the searchRequest parameter is provided. It can handle either an array response in which case all
     * elements will be mapped to the appropriate configured model or a 'paginated' result in which case an object
     * with totalCount, facests and elements will be returned.
     *
     * @param {SearchRequest} [searchRequest] if given searchRequest#urlEncoded() will be added to the request url
     * @return {[{object}]|{totalCount: {Number}, facets: [{Facet}], elements: []}} a promise wrapping either a list of
     * instances of the configured model or a wrapper object which holds not only the list but pagination information
     * as well
     */
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
                        return _mapResponse(elem);
                    })
                };
            } else {
                return _.map(response.data, function (elem) {
                    return _mapResponse(elem);
                });
            }
        });
    };

    /**
     * A helper function which adds '/all' to the request url available via #getEndpointUrl and maps the response to
     * the configured model.
     * @return [{object}] a promise wrapping an array of new instances of the configured model initialized with the data retrieved from
     * the backend
     */
    this.all = function () {
        return $http.get(_endpointUrl + '/all').then(function (response) {
            return _.map(response.data, function (elem) {
                return _mapResponse(elem);
            });
        });
    };

    /**
     * This method makes a GET request the url available via #getEndpointUrl with the addition of the provided id at the end.
     * @param id the id which will be appended as '/:id' to the url
     * @return {object} a promise wrapping a new instance of the configured model initialized with the data retrieved
     * from the backend
     */
    this.get = function (id) {
        return $http.get(_endpointUrl + '/' + id).then(function (response) {
            return _mapResponse(response.data);
        });
    };


    /**
     * This method makes a GET the url available via #getEndpointUrl with the addition of the provided id at the end + the
     * 'info' request parameter.
     * @param id the id which will be appended as '/:id' to the url
     * @return {*} a promise wrapping the data retrieved from the backend
     */
    this.info = function (id) {
        return $http.get(_endpointUrl + '/' + id + '?info').then(function (response) {
            return response.data;
        });
    };


    /**
     * This method is either makes a PUT or POST request to the backend depending on wheter or not the given object
     * has an 'id' attribute.
     * For PUT requests the url resolves to #getEndpointUrl + /:id, for POST requests it is just the #getEndpointUrl
     * @param {object} object the object which should be sent to the sever. it is stripped of all child endpoints before
     * it is sent.
     * @return {object} a promise wrapping a new instance of the configured model initialized with the data retrieved
     * from the backend
     */
    this.save = function (object) {
        if (!!object.id) {
            return $http.put(_endpointUrl + '/' + object.id, _removeEndpoints(object)).then(function (response) {
                return _mapResponse(response.data);
            });
        } else {
            return $http.post(_endpointUrl, _removeEndpoints(object)).then(function (response) {
                return _mapResponse(response.data);
            });
        }
    };

    /**
     *
     * @param id
     * @return {object}
     */
    this.remove = function (id) {
        return $http({method: 'DELETE', url: _endpointUrl + '/' + id});
    };
}

/**
 * @description
 * An 'EndpointConfig' basically is a wrapper around the configuration for an api endpoint during the configuration
 * phase which is later used to instantiate the actual CatApiEndpoints. It exposes its name, the configuration itself,
 * as well as a map of all its children and helper function to create or receive child endpoint configurations.
 *
 * @param {string} name the name of the endpoint
 * @param {object} config the api endpoint configuration which basically wraps an 'url' and a 'model' attribute.
 * If a 'children' attribute is present as well it will be used to create the appropriate child endpoints automatically,
 * without the need to call the #child method manually - this works to arbitrary deps.
 * @constructor
 */
function EndpointConfig(name, config) {
    var that = this;
    this.config = config || {};
    this.children = {};
    this.name = name;

    /**
     * This method method either returns or creates and returns a child api endpoint of the current one.
     *
     * @param {string} childName the name of the child endpoint
     * @param {object} [childConfig] if given a new EndpointConfig will be created as a child of the current one. The
     * parent property of the created config will point to the current config
     * @return {EndpointConfig} the child endpoint config with the given name
     */
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

// this is saved outside so that both $api and catApiService use the same config - will be moved back inside
// CatApiServiceProvider in a future release
var _endpoints = {};

/**
 * @ngdoc service
 * @description
 *
 * The CatApiServiceProvider exposes a single configuration method 'endpoint' which can be used to create or retrieve
 * named endpoint configurations.
 *
 * @constructor
 */
function CatApiServiceProvider() {
    var _urlPrefix = '/api/';

    /**
     * This method is used to either create or retrieve named endpoint configurations.
     * @param {string} name the name of the api endpoint to create or retrieve the configuration for
     * @param {object} [settings] if given a new {EndpointConfig} will be created with the given settings
     * @return {EndpointConfig} the endpoint config for the given name
     */
    this.endpoint = function (name, settings) {
        if (!_.isUndefined(settings)) {
            _endpoints[name] = new EndpointConfig(name, settings);
        }
        return _endpoints[name];
    };


    this.$get = ['$http',
        /**
         * @return {object} returns a map from names to CatApiEndpoints
         */
            function $getCatApiService($http) {
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
