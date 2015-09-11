'use strict';

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
 */
function CatBaseTabsController($scope, $controller, $stateParams, $location, catElementVisibilityService, config, urlResolverService, catI18nService, $q) {
    var endpoint = config.endpoint;

    $scope.tabs = _.filter(config.tabs, function (tab) {
        return catElementVisibilityService.isVisible('cat.base.tab', tab);
    });
    $scope.tabNames = _.map($scope.tabs, 'name');
    $scope.activeTab = {};

    $scope.activateTab = function (tab) {
        $scope.$broadcast('tab-' + tab + '-active');
        _.forEach($scope.tabs, function (currentTab) {
            $scope.activeTab[currentTab.name] = false;
        });
        $scope.activeTab[tab] = true;
    };

    $scope.selectTab = function (tabName) {
        if (_.isUndefined($location.search().tab) && tabName === $scope.tabNames[0]) {
            // don't add 'default' tab to url
            return;
        }
        $location.search('tab', tabName);
    };

    var isTabActive = function (tab) {
        if (tab.name === $scope.tabNames[0] && _.isUndefined($stateParams.tab)) {
            // first tab is active if no parameter is given
            return true;
        }
        return $stateParams.tab === tab.name;
    };

    $scope.$watchCollection(function () {
        return $location.search();
    }, function (newValue) {
        if (_.isString(newValue.tab)) {
            $scope.activateTab(newValue.tab);
        } else if (_.isUndefined(newValue.tab)) {
            // activate first tab if undefined
            $scope.activateTab($scope.tabNames[0]);
        }
    });

    var tabNamePromises = {};

    $scope.getTabName = function (tab) {
        var i18n = tab.i18n || ('cc.catalysts.cat-tab.' + tab.name);
        var key = i18n + ';;' + tab.name + ';;' + tab.$$hashKey;

        if (!tabNamePromises[key]) {
            var defer = $q.defer();
            var promise = tabNamePromises[key] = defer.promise;

            catI18nService.translate(i18n).then(
                function (translated) {
                    promise.value = translated;
                },
                function () {
                    promise.value = window.cat.util.pluralize(window.cat.util.capitalize(tab.name));
                }
            );
        }

        return tabNamePromises[key];
    };

    _.forEach($scope.tabs, function (tab) {
        $scope.activeTab[tab.name] = isTabActive(tab);
    });

    $scope.getTabTemplate = function (tab) {
        return urlResolverService.getTabTemplate(tab, config);
    };

    $scope.getTabKey = function (tabName) {
        var key = 'cc.catalysts.general.tab.' + endpoint.getEndpointName();

        var parentEndpoint = endpoint.parentEndpoint;

        while (parentEndpoint) {
            key += '.';
            key += parentEndpoint.getEndpointName();
            parentEndpoint = parentEndpoint.parentEndpoint;
        }

        return key + '.' + tabName;
    };

    var _getDefaultTabControllerName = function (tab) {
        var name = window.cat.util.capitalize(endpoint.getEndpointName());
        var parentEndpoint = endpoint.parentEndpoint;

        while (parentEndpoint) {
            name = window.cat.util.capitalize(parentEndpoint.getEndpointName()) + name;
            parentEndpoint = parentEndpoint.parentEndpoint;
        }

        return name + window.cat.util.capitalize(tab.name) + 'Controller';
    };

    var _getTabControllerName = function (tab) {
        if (!!tab.controller) {
            return tab.controller;
        }

        return _getDefaultTabControllerName(tab);
    };

    var tabIndex = 0;

    $scope.tabController = ['$scope', 'catListDataLoadingService', function ($tabScope, catListDataLoadingService) {
        var activeTab = $scope.tabs[tabIndex++];
        var tabControllerName = _getTabControllerName(activeTab);

        $tabScope.getSearchRequest = function () {
            return new window.cat.SearchRequest();
        };

        $tabScope.getEndpoint = function () {
            return config.detail[activeTab.name];
        };

        $tabScope.loadListData = function () {
            catListDataLoadingService.load($tabScope.getEndpoint(), $tabScope.getSearchRequest()).then(function (data) {
                $tabScope.listData = data;
            });
        };

        $tabScope.$on('tab-' + activeTab.name + '-active', function () {
            if (_.isUndefined($scope.listData)) {
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

angular
    .module('cat.controller.base.tabs', [
        'cat.service.elementVisibility',
        'cat.url.resolver.service'
    ]).controller('CatBaseTabsController', CatBaseTabsController);