interface ICatViewServiceProvider extends IServiceProvider {
    listAndDetailView(baseUrl:string, name:string, config?:any):void;
}


/**
 * @ngdoc service
 * @name cat.service.view:catViewService
 * @module cat.service.view
 *
 * @description
 * This service provider can be used to initialize an api endpoint and the according detail and list routes by simply
 * providing a name and a config object.
 *
 * @param {CatRouteServiceProvider} catRouteServiceProvider DOCTODO
 * @param {CatApiServiceProvider} catApiServiceProvider DOCTODO
 * @constructor
 */
class CatViewServiceProvider implements ICatViewServiceProvider {
    private viewNames:string[] = [];
    private endpointNames:string[] = [];

    constructor(private catRouteServiceProvider:ICatRouteServiceProvider,
                private catApiServiceProvider:ICatApiServiceProvider) {
    }

    /**
     * This function registers a new api endpoint with catApiServiceProvider and a list and detail route with
     * catRouteServiceProvider
     * @param {string} baseUrl the base url which will be prepended to all generated route pats
     * @param {string} name the name used as entry point to all routes and endpoint creations (camel cased)
     * @param {object} [config] the config object which can in turn hold objects used for configuration of the endpoint,
     * detail route or list route
     */
    listAndDetailView(baseUrl:string, name:string, config:ICatListAndDetailViewConfig) {
        let endpointName = name.toLowerCase();
        let url = window.cat.util.pluralize(endpointName);

        if (!!config) {
            url = config.url || url;
        }

        let endpoint:CatApiEndpointSettings = {
            model: window.cat.util.defaultModelResolver(name),
            url: url
        };

        if (!!config) {
            endpoint = _.assign(endpoint, config.endpoint);
        }


        this.viewNames.push(name);
        this.endpointNames.push(endpointName);

        this.catApiServiceProvider.endpoint(name.toLowerCase(), endpoint);
        this.catRouteServiceProvider.listAndDetailRoute(baseUrl, name, config);
    };

    /**
     * This service simply exposes the created view and endpoint names, as the provider basically only delegates
     * to other service providers
     * @return {{views: Array, endpoints: Array}}
     */
    $get = [() => {
        return {
            views: this.viewNames,
            endpoints: this.endpointNames
        };
    }];
}

angular.module('cat.service.view',
    [
        'cat.service.api',
        'cat.service.route',
        'cat.service.view.config'
    ]).provider('catViewService', CatViewServiceProvider);