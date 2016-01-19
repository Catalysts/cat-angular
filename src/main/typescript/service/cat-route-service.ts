import IStateProvider = angular.ui.IStateProvider;
interface ICatRouteService extends Array<string> {

}

interface ICatStateConfig {
    parent?:string;
}

interface ICatListAndDetailViewConfig extends ICatStateConfig {
    url?:string;
    list?:ICatListViewConfig;
    details?:ICatDetailViewConfig;
    viewData?:any;
    endpoint?:CatApiEndpointSettings;
}

interface ICatRouteServiceProvider extends IServiceProvider {
    detailRoute(baseUrl:string, name:string, config?:ICatDetailViewConfig):void;
    listAndDetailRoute(baseUrl:string, name:string, config?:ICatListAndDetailViewConfig):void;
}


/**
 * @ngdoc service
 * @name cat.service.route:catRouteServiceProvider
 * @description
 * This service provider delegates to the $stateProvider and actually creates 2 separate routes after applying letious
 * conventions / defaults
 */
class CatRouteServiceProvider implements ICatRouteServiceProvider {
    private viewNames:string[] = [];

    constructor(private $stateProvider:IStateProvider) {

    }

    private static _getListUrl(baseUrl:string, name:string, config:ICatViewConfig) {
        let listUrl = baseUrl + '/' + window.cat.util.pluralize(name.toLowerCase());

        if (!!config && config.url) {
            listUrl = baseUrl + '/' + config.url;
        }

        return listUrl;
    }

    private _registerAbstractState(url, name) {
        this.$stateProvider
            .state(name, {
                abstract: true,
                template: '<ui-view></ui-view>',
                url: url
            });
    }

    private static _getStateName(name:string, config:ICatStateConfig):string {
        if (!!config && !!config.parent) {
            return config.parent + '.' + name;
        }

        return name;
    }

    private _registerDetailState(config:ICatDetailViewConfig, name) {
        let stateName:string = CatRouteServiceProvider._getStateName(name, config);
        let detailConfig:IState = this._getDetailConfig(config, name);

        this.$stateProvider
            .state(stateName + '.detail', detailConfig);

        if (!!config && config.additionalViewTemplate === 'tabs') {
            this.$stateProvider
                .state(stateName + '.tab', {
                    abstract: true,
                    template: '<ui-view></ui-view>',
                    url: '/:' + name.toLowerCase() + 'Id'
                });
        }
    }

    private _registerListState(config, name) {
        let stateName = CatRouteServiceProvider._getStateName(name, config);
        let listConfig = this._getListConfig(config, name);
        this.$stateProvider
            .state(stateName + '.list', listConfig);
    }

    /**
     * A helper function for detail routes which applies a few optimizations and some auto configuration.
     * The actual instantiated controller will be 'CatBaseDetailController' with a default templateUrl
     * 'template/cat-base-detail.tpl.html'. As the CatBaseDetailController expects a config object with several properties
     * (templateUrls, parents, detail, endpoint, etc.) this function also takes care of providing the correct 'resolve'
     * object which pre-loads all the necessary data.
     * @param {Object} config the route config object which will be used to generate the actual route configuration
     * @param {string} name the name of the state
     * @returns {{templateUrl: (string), controller: string, reloadOnSearch: (boolean), resolve: {config: (object)}}}
     */
    private _getDetailConfig(config:ICatDetailViewConfig, name:string):IState {
        let _config:ICatDetailViewConfig = _.assign({name: name}, config);

        return {
            url: _config.url || '/:id',
            templateUrl: _config.templateUrl || 'template/cat-base-detail.tpl.html',
            controller: 'CatBaseDetailController',
            reloadOnSearch: _config.reloadOnSearch,
            resolve: {
                config: ($stateParams:IStateParamsService, catViewConfigService:ICatViewConfigService) => {
                    // TODO $stateParams needs to be passed from here because otherwise it's empty...
                    return catViewConfigService.getDetailConfig(_config, $stateParams);
                }
            }
        };
    }

    /**
     * A helper function for list routes which applies a few optimizations and some auto configuration.
     * In the current state it handles 4 settings:
     * * templateUrl - Auto-generation of the correct templateUrl based on conventions and the config.name property
     * * controller - Auto-generation of the correct controller based on conventions and the config.name property
     * * reloadOnSearch - this property is set to false
     * * resolve - a object with a 'listData' property is returned which is resolved via the correct endpoint
     *
     * @param {Object} config the route config object which will be used to generate the actual route configuration
     * @param {string} name the name of the sate
     * @return {{reloadOnSearch: boolean, controller: string, templateUrl: (string), resolve: {config: Object}}}
     */
    private _getListConfig(config:ICatListViewConfig, name:string):IState {
        let _config:any = _.assign({name: name}, config);

        return {
            url: _config.url || '',
            reloadOnSearch: false,
            controller: 'CatBaseListController',
            controllerAs: 'catBaseListController',
            templateUrl: _config.templateUrl || 'template/cat-base-list.tpl.html',
            resolve: {
                config: (catViewConfigService) => {
                    return catViewConfigService.getListConfig(_config);
                }
            }
        };
    }

    /**
     * @ngdoc function
     * @name detailRoute
     * @methodOf cat.service.route:catRouteServiceProvider
     *
     * @description
     * This function creates route url via convention from the given parameters and passes them (together with the
     * configuration) to the $stateProvider. The actual route configuration is received by passing the given one
     * to #window.cat.util.route.detail
     *
     * @param {string} baseUrl the base url which will be prepended to all routes
     * @param {string} name the name for which the routes will be created
     * @param {Object} [config] the config object which wraps the configurations for the list and detail route
     */
    detailRoute(baseUrl, name, config:ICatDetailViewConfig) {
        let stateName:string = CatRouteServiceProvider._getStateName(name, config);

        let viewData:any = {viewData: !!config ? (config.viewData || {}) : {}};
        this.viewNames.push(stateName);

        let listUrl:string = CatRouteServiceProvider._getListUrl(baseUrl, name, config);

        this._registerAbstractState(listUrl, stateName);
        this._registerDetailState(_.assign({}, config, viewData), name);
    }

    /**
     * @ngdoc function
     * @name detailRoute
     * @methodOf cat.service.route:catRouteServiceProvider
     *
     * @description
     * This function creates route urls via convention from the given parameters and passes them (together with the
     * configuration) to the $stateProvider. The actual route configuration is received by passing the given one
     * to #window.cat.util.route.list and #window.cat.util.route.detail
     *
     * @param {string} baseUrl the base url which will be prepended to all routes
     * @param {string} name the name for which the routes will be created
     * @param {Object} [config] the config object which wraps the configurations for the list and detail route
     */
    listAndDetailRoute(baseUrl:string, name:string, config:ICatListAndDetailViewConfig = {}) {
        let stateName:string = CatRouteServiceProvider._getStateName(name, config);

        let viewData:any = {viewData: config.viewData || {}};
        this.viewNames.push(stateName);

        let listUrl:string = CatRouteServiceProvider._getListUrl(baseUrl, name, config);

        this._registerAbstractState(listUrl, stateName);
        this._registerDetailState(_.assign({}, config.details, viewData), name);
        this._registerListState(_.assign({}, config.list, viewData), name);
    }

    /**
     * @ngdoc service
     * @name cat.service.route:catRouteService
     * @module cat.service.route
     *
     * @description
     * This service simply exposes the created view and endpoint names, as the provider basically only delegates
     * to the $stateProvider
     */
    $get = [():ICatRouteService=> {
        return this.viewNames;
    }];
}

angular
    .module('cat.service.route', [
        'ui.router',
        'cat.service.message',
        'cat.service.breadcrumbs',
        'cat.service.validation'
    ])
    .provider('catRouteService', CatRouteServiceProvider)
    .run(['$rootScope', '$log', '$globalMessages', 'catBreadcrumbsService', 'catValidationService',
        ($rootScope:IRootScopeService,
         $log:ILogService,
         $globalMessages:ICatMessagesService,
         catBreadcrumbsService:ICatBreadcrumbsService,
         catValidationService) => {
            $rootScope.$on('$stateChangeError', function() {
                let exception:string = arguments[arguments.length - 1];
                $globalMessages.addMessage('warning', exception);
                $log.warn(exception);
            });
            $rootScope.$on('$stateChangeSuccess', () => {
                catBreadcrumbsService.clear();
                catValidationService.clearValidationErrors();
            });
        }]);