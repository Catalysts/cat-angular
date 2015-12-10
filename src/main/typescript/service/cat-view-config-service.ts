import IStateParamsService = angular.ui.IStateParamsService;
import IControllerService = angular.IControllerService;
/**
 * @author Thomas Scheinecker, Catalysts GmbH.
 */

interface ICatTemplateUrls {
    edit: string;
    view: string|{main:string,additional:string};
}


interface ICatTab {

}

interface ICatBaseViewConfig {
    viewData: any;
    name: string;
    controller: string|Function|(string|Function)[];
}

interface ICatDetailConfig extends ICatBaseViewConfig {
    endpoint: ICatApiEndpoint;
    Model: Function;
    templateUrls: ICatTemplateUrls;
    tabs?: ICatTab[];
    detail?: any;
    parents?: any[];
}

interface ICatListConfig extends ICatBaseViewConfig {
    listData?: any[];
    title: string;
    searchProps: any;
    listTemplateUrl: string;
}

interface ICatViewConfigService {
    getDetailData($stateParams, Model, endpoint):IPromise<any>;
    getDetailConfig(config, $stateParams:IStateParamsService):IPromise<ICatDetailConfig>;
    getListConfig(config:any):IPromise<ICatListConfig>;
}

class CatViewConfigService implements ICatViewConfigService {

    constructor(private $q:IQService,
                private catApiService:ICatApiService,
                private catListDataLoadingService:ICatListDataLoadingService) {
    }

    private static toLowerCaseName(name) {
        if (!name) {
            return '';
        }
        return name.toLowerCase();
    }

    getDetailData($stateParams, Model, endpoint) {
        let detailPromise;

        let detailId = $stateParams.id;
        if (detailId === 'new') {
            detailPromise = this.$q.when(new Model());
        } else {
            detailPromise = endpoint.get(detailId);
        }
        return detailPromise;
    }

    private getEndpoint(endpointName, parentEndpointNames, $stateParams):ICatApiEndpoint {
        let endpoint = this.catApiService[endpointName];

        if (_.isArray(parentEndpointNames)) {
            _.forEach(parentEndpointNames, (parentEndpointName, idx:number) => {
                let currentEndpoint;
                if (idx === 0) {
                    // root api endpoint
                    currentEndpoint = this.catApiService[parentEndpointName];
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

    private getParentInfo(endpoint) {
        if (!_.isUndefined(endpoint) && !_.isUndefined(endpoint.parentInfo)) {
            let parents = [];
            return endpoint
                .parentInfo()
                .then((parent) => {
                    parents.push(parent);
                    return this.getParentInfo(endpoint.parentEndpoint)
                })
                .then((response) => {
                    parents.push(response);
                    parents = _.flatten(parents);
                    return parents;
                });
        } else {
            return this.$q.when([]);
        }
    }

    getDetailConfig(config, $stateParams:IStateParamsService) {
        let endpointName, parentEndpointNames;

        if (_.isString(config.endpoint)) {
            endpointName = config.endpoint;
        } else if (_.isObject(config.endpoint)) {
            parentEndpointNames = config.endpoint.parents;
            endpointName = config.endpoint.name;
        } else {
            endpointName = CatViewConfigService.toLowerCaseName(config.name);
        }

        let Model = config.model || window.cat.util.defaultModelResolver(config.name);

        let parentUrl = '';
        let parentTemplateNamePrefix = '';


        if (_.isArray(parentEndpointNames)) {
            _.forEach(parentEndpointNames, (parentEndpointName) => {
                parentUrl += parentEndpointName;
                parentUrl += '/';

                parentTemplateNamePrefix += parentEndpointName;
                parentTemplateNamePrefix += '-';
            });
        }

        let tabs;

        var defaultViewUrl = parentUrl + endpointName + '/' + parentTemplateNamePrefix + endpointName + '-details-view.tpl.html';
        let templateUrls:ICatTemplateUrls = {
            edit: parentUrl + endpointName + '/' + parentTemplateNamePrefix + endpointName + '-details-edit.tpl.html',
            view: defaultViewUrl
        };

        if (config.additionalViewTemplate === true) {
            templateUrls.view = {
                main: defaultViewUrl,
                additional: parentUrl + endpointName + '/' + parentTemplateNamePrefix + endpointName + '-additional-details-view.tpl.html'
            };
        } else if (config.additionalViewTemplate === 'tabs') {
            templateUrls.view = {
                main: defaultViewUrl,
                additional: 'template/cat-base-additional-details-tabs-view.tpl.html'
            };
            tabs = config.additionalViewTemplateTabs;
        }

        let deferred = this.$q.defer();
        let endpoint = this.getEndpoint(endpointName, parentEndpointNames, $stateParams);

        let resolvedConfig:ICatDetailConfig = {
            viewData: config.viewData,
            name: config.name,
            controller: config.controller || config.name + 'DetailsController',
            endpoint: endpoint,
            Model: Model,
            templateUrls: templateUrls,
            tabs: tabs
        };


        let detailPromise = this.getDetailData($stateParams, Model, endpoint);
        detailPromise.then((data) => {
            resolvedConfig.detail = data;
        });

        let parentsPromise = this.getParentInfo(endpoint);
        parentsPromise.then((parents) => {
            resolvedConfig.parents = parents;
        });

        this.$q.all([detailPromise, parentsPromise]).then(
            () => {
                deferred.resolve(resolvedConfig);
            },
            (reason) => {
                deferred.reject(reason);
            }
        );

        return deferred.promise;
    };


    private getListDataPromise(config, name) {
        return this.catListDataLoadingService.resolve(config.endpoint || name, config.defaultSort);
    }

    getListConfig(config) {
        let name = CatViewConfigService.toLowerCaseName(config.name);

        let deferredConfig = this.$q.defer();
        let resolvedConfig:ICatListConfig = {
            listData: undefined,
            viewData: config.viewData,
            name: config.name,
            controller: config.controller || config.name + 'Controller',
            title: window.cat.util.pluralize(config.name),
            searchProps: config.searchProps || window.cat.util.defaultListSearchProps,
            listTemplateUrl: config.listTemplateUrl || (name + '/' + name + '-list.tpl.html')
        };

        this.getListDataPromise(config, name).then(
            (listData) => {
                resolvedConfig.listData = listData;
                deferredConfig.resolve(resolvedConfig);
            }
        );

        return deferredConfig.promise;
    };
}

angular
    .module('cat.service.view.config', [
        'cat.service.api',
        'cat.service.listDataLoading'
    ])
    .service('catViewConfigService', CatViewConfigService);
