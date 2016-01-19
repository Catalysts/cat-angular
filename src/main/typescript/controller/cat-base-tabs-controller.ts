interface ICatBaseTabsScope<T> extends ICatBaseDetailScope<T> {
    activeTab: {[tabName:string]:boolean};
    tabController:(string|Function)[];
    tabNames: string[];
    tabs: ICatTab[];

    activateTab(tabName:string):void;
    getTabName(configName:string):string;
    getTabTemplate(tabName:string):string;
    getTabKey(tabName:string):string;
    selectTab(tabName:string):void;
}

interface ICatBaseTabScope<T> extends IScope {
    listData?:ICatListData<T>;

    getEndpoint():ICatApiEndpoint;
    getSearchRequest():SearchRequest;
    loadListData():void;
}

interface ICatBaseTabsStateParams extends ICatBaseDetailStateParams {
    tab?:string;
}

class CatBaseTabsController<T> {
    /**
     * @ngdoc controller
     * @name cat.controller.base.tabs:CatBaseTabsController
     * @module cat.controller.base.tabs
     *
     * @description
     * The base code for handling sub entites (as tabs).
     * Includes the instantiation of one controller per tab/list and lazy loading of the approrpiate data
     *
     * @param {Object} $scope The angular scope
     * @param {Object} $controller The angular $controller service
     * @param {Object} $stateParams The ui-router $stateParams service
     * @param {Object} $location The angular $location service
     * @param {Object} catElementVisibilityService The visibility service to check wheter or not a tab should be rendered
     * @param {Object} config The config as handled by state resolve
     * @param {ICatUrlResolverService} urlResolverService service to resolve the template urls
     */
    constructor($scope:ICatBaseTabsScope<T>,
                $controller,
                $stateParams:ICatBaseTabsStateParams,
                $location:ILocationService,
                catElementVisibilityService:ICatElementVisibilityService,
                config:ICatDetailConfig,
                urlResolverService:ICatUrlResolverService) {
        let endpoint = config.endpoint;

        $scope.tabs = _.filter(config.tabs, (tab) => {
            return catElementVisibilityService.isVisible('cat.base.tab', tab);
        });
        $scope.tabNames = _.map<ICatTab, string>($scope.tabs, 'name');
        $scope.activeTab = {};

        $scope.activateTab = (tab) => {
            $scope.$broadcast('tab-' + tab + '-active');
            _.forEach($scope.tabs, (currentTab) => {
                $scope.activeTab[currentTab.name] = false;
            });
            $scope.activeTab[tab] = true;
        };

        $scope.selectTab = (tabName) => {
            if (_.isUndefined($location.search().tab) && tabName === $scope.tabNames[0]) {
                // don't add 'default' tab to url
                return;
            }
            $location.search('tab', tabName);
        };

        let isTabActive = (tab) => {
            if (tab.name === $scope.tabNames[0] && _.isUndefined($stateParams.tab)) {
                // first tab is active if no parameter is given
                return true;
            }
            return $stateParams.tab === tab.name;
        };

        $scope.$watchCollection(
            () => {
                return $location.search();
            },
            (newValue) => {
                if (_.isString(newValue.tab)) {
                    $scope.activateTab(newValue.tab);
                } else if (_.isUndefined(newValue.tab)) {
                    // activate first tab if undefined
                    $scope.activateTab($scope.tabNames[0]);
                }
            });

        $scope.getTabName = (tab) => {
            return window.cat.util.pluralize(window.cat.util.capitalize(tab));
        };

        _.forEach($scope.tabs, (tab) => {
            $scope.activeTab[tab.name] = isTabActive(tab);
        });

        $scope.getTabTemplate = (tab) => {
            return urlResolverService.getTabTemplate(tab, config);
        };

        $scope.getTabKey = (tabName) => {
            let key = 'cc.catalysts.general.tab.' + endpoint.getEndpointName();

            let parentEndpoint = endpoint.parentEndpoint;

            while (parentEndpoint) {
                key += '.';
                key += parentEndpoint.getEndpointName();
                parentEndpoint = parentEndpoint.parentEndpoint;
            }

            return key + '.' + tabName;
        };

        let _getDefaultTabControllerName = (tab) => {
            let name = window.cat.util.capitalize(endpoint.getEndpointName());
            let parentEndpoint = endpoint.parentEndpoint;

            while (parentEndpoint) {
                name = window.cat.util.capitalize(parentEndpoint.getEndpointName()) + name;
                parentEndpoint = parentEndpoint.parentEndpoint;
            }

            return name + window.cat.util.capitalize(tab.name) + 'Controller';
        };

        let _getTabControllerName = (tab) => {
            if (!!tab.controller) {
                return tab.controller;
            }

            return _getDefaultTabControllerName(tab);
        };

        let tabIndex = 0;

        $scope.tabController = [
            '$scope',
            'catListDataLoadingService',
            ($tabScope:ICatBaseTabScope<any>,
                      catListDataLoadingService:ICatListDataLoadingService) => {
                let activeTab = $scope.tabs[tabIndex++];
                let tabControllerName = _getTabControllerName(activeTab);

                $tabScope.getSearchRequest = () => {
                    return new window.cat.SearchRequest();
                };

                $tabScope.getEndpoint = () => {
                    return config.detail[activeTab.name];
                };

                $tabScope.loadListData = () => {
                    catListDataLoadingService
                        .load($tabScope.getEndpoint(), $tabScope.getSearchRequest())
                        .then((data) => {
                            $tabScope.listData = data;
                        });
                };

                $tabScope.$on('tab-' + activeTab.name + '-active', () => {
                    if (_.isUndefined($tabScope.listData)) {
                        $tabScope.loadListData();
                    }
                });

                $controller(tabControllerName, {
                    $scope: $tabScope,
                    detail: config.detail,
                    parents: config.parents,
                    config: config
                });

                if ($scope.activeTab[activeTab.name] === true) {
                    $scope.activateTab(activeTab.name);
                }
            }];
    }
}
angular
    .module('cat.controller.base.tabs', [
        'cat.service.elementVisibility',
        'cat.url.resolver.service'
    ]).controller('CatBaseTabsController', CatBaseTabsController);