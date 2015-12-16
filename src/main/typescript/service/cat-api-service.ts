interface ICatApiService {
    [key:string]:ICatApiEndpoint;
}

interface CatApiEndpointSettings {
    name?: string;
    url?:string;
    model?:new(data?:any)=>any;
    children?:CatApiEndpointSettings[];
}

interface CatApiEndpointConfig {
    name: string;
    model:new(data?:any)=>any;
}

interface ICatApiServiceProvider extends IServiceProvider {
    endpoint(name:string, settings?:CatApiEndpointSettings):EndpointConfig;
}

interface CatApiCustom {
    get(url:string, searchRequest);
    put(url:string, object);
    post(url:string, object);
}

interface CatPagedResponse<T> {
    elements:T[];
    totalCount: number;
    facets?:Facet[];
}

interface ICatApiEndpoint {
    parentEndpoint?:ICatApiEndpoint;
    config:CatApiEndpointConfig;
    custom:CatApiCustom;
    getEndpointName():string;
    getEndpointUrl():string;
    get(id:any):any;
    info(id:any):any;
    copy(id:any):any;
    list(searchRequest?:SearchRequest):IPromise<CatPagedResponse<any>>;
    all():any[];
    save(data:any):IPromise<any>;
    remove(id:any):IHttpPromise<any>;
}

/**
 * @name CatApiEndpoint
 *
 * @description
 * A CatApiEndpoint wraps several helper functions to easily execute backend calls for the base CRUD operations.
 * It also adds support for 'children' which can only be used by resolving them for a parent id.
 * @param {string} url the base url which is added before the configured urls
 * @param {object} endpointConfig the configuration of this endpoint - holds properties like name, url, the model and children
 * @param {object} $http the angular $http service which handles the actual xhr requests
 * @param {object} catConversionService the catConversionService used to convert from and to server side data
 * @param {object} catSearchService the catSearchService for handling all operations concerning cat.uitl.SearchRequest objects
 * @constructor
 */
class CatApiEndpoint implements ICatApiEndpoint {
    _endpointName:string;
    config:CatApiEndpointConfig;
    _endpointUrl:string;
    _childEndpointSettings;
    _endpointListConfig;

    /**
     * Simple wrapper object which contains the custom get, put and post methods
     * @type {{}}
     */
    custom:CatApiCustom;

    constructor(url:string,
                endpointConfig,
                private $http,
                private catConversionService,
                private catSearchService) {
        let config = endpointConfig.config;
        this._endpointName = endpointConfig.name;
        this._endpointUrl = `${url}${config.url || endpointConfig.name}`;
        this._childEndpointSettings = endpointConfig.children;
        this._endpointListConfig = config.list || {};


        /**
         * This method executes a GET request to the url available via #getEndpointUrl joined with the provided one.
         * Be aware that the result of the promise will not be mapped to the configured model but instead will be passed on directly.
         * @param url the url to be appended to the endpoint url
         * @param searchRequest an optional cat.SearchRequest to be applied to the request
         * @return {*} The promise returned by the $http.get call
         */
        let get = (url, searchRequest) => {
            return this.$http.get([this._endpointUrl, url].join('/') + this._getSearchQuery(searchRequest));
        };

        /**
         * This method executes a POST request to the url available via #getEndpointUrl joined with the provided one.
         * Be aware that the result of the promise will not be mapped to the configured model but instead will be passed on directly.
         * @param url the url to be appended to the endpoint url
         * @param object hte object to send as payload - not that it will be used as is for this request
         * @return {*} The promise returned by the $http.post call
         */
        let post = (url, object) => {
            return this.$http.post([this._endpointUrl, url].join('/'), object);
        };

        /**
         * This method executes a PUT request to the url available via #getEndpointUrl joined with the provided one.
         * Be aware that the result of the promise will not be mapped to the configured model but instead will be passed on directly.
         * @param url the url to be appended to the endpoint url
         * @param object hte object to send as payload - not that it will be used as is for this request
         * @return {*} The promise returned by the $http.put call
         */
        let put = (url, object) => {
            return this.$http.put([this._endpointUrl, url].join('/'), object);
        };

        this.custom = {
            get: get,
            put: put,
            post: post
        };
    }

    /**
     * This helper function initializes all configured child endpoints by creating the appropriate url by appending
     * the given id before initializing them.
     * @return {object} a object holding all resolved child endpoints for the given id
     * @private
     */
    private _res = _.memoize((id) => {

        let url = this._endpointUrl + '/' + id + '/';
        let ret = {};
        _.forEach(_.keys(this._childEndpointSettings), (path:string) => {
            ret[path] = new CatApiEndpoint(url,
                this._childEndpointSettings[path],
                this.$http,
                this.catConversionService,
                this.catSearchService);
            ret[path].parentEndpoint = this;
            ret[path].parentId = id;
            ret[path].parentInfo = () => {
                return this.info(id);
            };
        });
        return ret;
    });

    private _addChildEndpoints(data):void {
        _.merge(data, this._res(data.id));
    }

    /**
     * This helper method initializes a new instance of the configured model with the given data and adds all child
     * endpoints to it.
     * @param data the data received from the backend which is used to initialize the model
     * @return {Object} an instance of the configured model initialized with the given data and the resolved child
     * endpoints
     * @private
     */
    private _mapResponse(data):any {
        let object = this.catConversionService.toClient(data, this.config);

        if (!_.isUndefined(object.id)) {
            this._addChildEndpoints(object);
        }

        if (_.isArray(object)) {
            _.forEach(object, this._addChildEndpoints);
        }

        if (_.isArray(object.elements)) {
            _.forEach(object.elements, this._addChildEndpoints);
        }

        return object;
    }

    /**
     * This helper methods deletes all child endpoints from the given object.
     * @param {object} object the object to remove the child endpoints from
     * @return {object} the passed in object without the child endpoints
     * @private
     */
    private _removeEndpoints(object):Object {
        let endpoints = this._res(object.id);
        _.forEach<string>(_.keys(endpoints), (key) => {
            delete object[key];
        });
        return object;
    }

    /**
     * This helper method turns a cat.SearchRequest in to en url encoded search query
     * @param {window.cat.SearchRequest} [searchRequest] the search request which should be url encoded
     * @return {string} either the url encoded search query or an empty string if no search request is given or it is not a instance of cat.SearchRequest
     * @private
     */
    private _getSearchQuery(searchRequest):string {
        if (!!searchRequest && searchRequest instanceof window.cat.SearchRequest) {
            return '?' + this.catSearchService.encodeAsUrl(searchRequest);
        }

        return '';
    }

    /**
     * This method is used to instantiate actual child api endpoints which are dependent on a certain parent id
     * @param id the id for which to 'resolve' the child endpoints.
     * @return {object} a object which maps all child endpoint names to the actual endpoints where the url was resolved
     * with the provided id
     */
    res(id):Object {
        return this._res(id);
    }

    /**
     * A small helper function to retrieve the actual url this endpoint resolved to.
     * @return {string} the resolved url of this endpoint
     */
    getEndpointUrl():string {
        return this._endpointUrl;
    }

    /**
     * A small helper to retrieve the name of the endpoint.
     * @return {string} the name of this endpoint
     */
    getEndpointName():string {
        return this._endpointName;
    }

    /**
     * This function calls by default the url available via #getEndpointUrl without further modification apart from
     * adding search parameters if the searchRequest parameter is provided. In addition an alternative  endpoint url can
     * be configured with `endpoint.list.endpoint`, such that the request will be send to another endpoint url.
     * (#getEndpointUrl + additional_url).
     * It can handle either an array response in which case all elements will be
     * mapped to the appropriate configured model or a 'paginated' result in which case an object with totalCount,
     * facests and elements will be returned.
     *
     * @param {SearchRequest} [searchRequest] if given searchRequest#urlEncoded() will be added to the request url
     * @return {[{object}]|{totalCount: {Number}, facets: [{Facet}], elements: []}} a promise wrapping either a list of
     * instances of the configured model or a wrapper object which holds not only the list but pagination information
     * as well
     */
    list(searchRequest) {
        let url = !!this._endpointListConfig.endpoint ? this._endpointListConfig.endpoint : '';
        return this.$http.get(this._endpointUrl + url + this._getSearchQuery(searchRequest)).then((response) => {
            return this._mapResponse(response.data);
        });
    }

    /**
     * A helper function which adds '/all' to the request url available via #getEndpointUrl and maps the response to
     * the configured model.
     * @return [{object}] a promise wrapping an array of new instances of the configured model initialized with the data retrieved from
     * the backend
     */
    all() {
        return this.$http.get(this._endpointUrl + '/all').then((response) => {
            return _.map(response.data, (elem) => {
                return this._mapResponse(elem);
            });
        });
    }

    /**
     * This method makes a GET request to the url available via #getEndpointUrl with the addition of the provided id at the end.
     * @param id the id which will be appended as '/:id' to the url
     * @return {object} a promise wrapping a new instance of the configured model initialized with the data retrieved
     * from the backend
     */
    get(id) {
        return this.$http.get(this._endpointUrl + '/' + id).then((response) => {
            return this._mapResponse(response.data);
        });
    }

    /**
     * This method makes a GET request to the url available via #getEndpointUrl with the addition of '/copy' and the provided id at the end.
     * @param id the id which will be appended as '/copy/:id' to the url
     * @return {object} a promise wrapping a new instance of the configured model initialized with the data retrieved
     * from the backend
     */
    copy(id) {
        return this.$http.get(this._endpointUrl + '/copy/' + id).then((response) => {
            return this._mapResponse(response.data);
        });
    }


    /**
     * This method makes a GET the url available via #getEndpointUrl with the addition of the provided id at the end + the
     * 'info' request parameter.
     * @param id the id which will be appended as '/:id' to the url
     * @return {*} a promise wrapping the data retrieved from the backend
     */
    info(id) {
        return this.$http.get(this._endpointUrl + '/' + id + '?info').then((response) => {
            return response.data;
        });
    }


    /**
     * This method is either makes a PUT or POST request to the backend depending on wheter or not the given object
     * has an 'id' attribute.
     * For PUT requests the url resolves to #getEndpointUrl + /:id, for POST requests it is just the #getEndpointUrl
     * @param {object} object the object which should be sent to the sever. it is stripped of all child endpoints before
     * it is sent.
     * @return {object} a promise wrapping a new instance of the configured model initialized with the data retrieved
     * from the backend
     */
    save(object) {
        var t = _<number>([34, 342]).value();
        if (!!object.id) {
            return this.$http.put(this._endpointUrl + '/' + object.id, this._removeEndpoints(object)).then((response) => {
                return this._mapResponse(response.data);
            });
        } else {
            return this.$http.post(this._endpointUrl, this._removeEndpoints(object)).then((response) => {
                return this._mapResponse(response.data);
            });
        }
    }

    /**
     * This method executes a DELETE request to the url available via #getEndpointUrl with the addition of the provided url at the end.
     * @param url the url to be appended to the endpoint url - usually only the id of the object to delete
     * @return {*} The promise returned by the $http 'DELETE' call
     */
    remove(url) {
        return this.$http({method: 'DELETE', url: this._endpointUrl + '/' + url});
    }
}

/**
 * @ngdoc service
 * @name EndpointConfig
 *
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
class EndpointConfig {
    parent:EndpointConfig;
    children:{[key:string]:EndpointConfig} = {};

    constructor(public name:string,
                public config:CatApiEndpointSettings = {}) {

        // this takes care of mapping the 'old' config style to the new builder style
        if (!_.isUndefined(config.children)) {
            let childrenConfig = config.children;
            delete config.children;
            _.forEach(_.keys(childrenConfig), (childName) => {
                this.child(childName, childrenConfig[childName]);
            });
        }
    }

    /**
     * This method method either returns or creates and returns a child api endpoint of the current one.
     *
     * @param {string} childName the name of the child endpoint
     * @param {object} [childConfig] if given a new EndpointConfig will be created as a child of the current one. The
     * parent property of the created config will point to the current config
     * @return {EndpointConfig} the child endpoint config with the given name
     */
    child(childName:string, childConfig:CatApiEndpointSettings):EndpointConfig {
        if (!_.isUndefined(childConfig)) {
            this.children[childName] = new EndpointConfig(childName, childConfig);
            this.children[childName].parent = this;
        }

        return this.children[childName];
    }
}

class CatApiServiceProvider implements ICatApiServiceProvider {
    private _endpoints = {};

    /**
     * This method is used to either create or retrieve named endpoint configurations.
     * @param {string} name the name of the api endpoint to create or retrieve the configuration for
     * @param {object} [settings] if given a new {EndpointConfig} will be created with the given settings
     * @return {EndpointConfig} the endpoint config for the given name
     */
    endpoint(name, settings) {
        if (!_.isUndefined(settings)) {
            this._endpoints[name] = new EndpointConfig(name, settings);
        }
        return this._endpoints[name];
    };

    /**
     * @return {object} returns a map from names to CatApiEndpoints
     */
    private $getCatApiService($http, catConversionService, catSearchService, CAT_API_SERVICE_DEFAULTS) {
        let catApiService:any = {};

        let dynamicEndpoints = {};

        /**
         * This method allows to define (dynamic) endpoints after the configuration phase.
         * @param {string} name (optional the name of the api endpoint to create or retrieve the configuration for
         * @param {object} [settings] if given a new {EndpointConfig} will be created with the given settings
         * @returns {CatApiEndpoint}
         */
        catApiService['dynamicEndpoint'] = (name, settings) => {
            if (typeof name === 'object' && _.isUndefined(settings)) {
                settings = name;
                name = settings.url;
            }
            if (_.isUndefined(dynamicEndpoints[name])) {
                if (_.isUndefined(settings)) {
                    throw new Error('Undefined dynamic endpoint settings');
                }
                dynamicEndpoints[name] = new CatApiEndpoint(CAT_API_SERVICE_DEFAULTS.endpointUrlPrefix,
                    new EndpointConfig(name, settings), $http, catConversionService, catSearchService);
            }
            return dynamicEndpoints[name];
        };

        _.forEach(_.keys(this._endpoints), (path) => {
            catApiService[path] = new CatApiEndpoint(CAT_API_SERVICE_DEFAULTS.endpointUrlPrefix, this._endpoints[path], $http, catConversionService, catSearchService);
        });

        return catApiService;
    }


    $get = ['$http', 'catConversionService', 'catSearchService', 'CAT_API_SERVICE_DEFAULTS', this.$getCatApiService];
}

/**
 * @ngdoc service
 * @name cat.service.api:catApiService
 *
 * @description
 * The CatApiServiceProvider exposes a single configuration method 'endpoint' which can be used to create or retrieve
 * named endpoint configurations.
 *
 * @constructor
 */
angular
    .module('cat.service.api', ['cat.service.conversion', 'cat.service.search'])
    .constant('CAT_API_SERVICE_DEFAULTS', {endpointUrlPrefix: 'api/'})
    .provider('catApiService', CatApiServiceProvider);

/**
 * @ngdoc service
 * @name cat.service.api:$api
 * @deprecated use 'catApiService'
 *
 * @description
 * deprecated use 'catApiService'
 * The CatApiServiceProvider exposes a single configuration method 'endpoint' which can be used to create or retrieve
 * named endpoint configurations.
 *
 * @constructor
 */
// $api is deprecated, will be removed in a future release
angular.module('cat.service.api').provider('$api', CatApiServiceProvider);
