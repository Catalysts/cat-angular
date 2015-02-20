'use strict';

angular.module('cat.controller.base.tabs').controller('CatBaseTabsController', CatBaseTabsController);

/**
 * @ngdoc controller
 * @name cat.controller.base.tabs:CatBaseTabsController
 *
 */
function CatBaseTabsController($scope, $controller, $stateParams, $location, config) {
    var endpoint = config.endpoint;

    $scope.tabs = config.tabs;
    $scope.tabNames = _.map(config.tabs, 'name');
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

    $scope.getTabName = function (tab) {
        return window.cat.util.pluralize(window.cat.util.capitalize(tab));
    };

    _.forEach($scope.tabs, function (tab) {
        $scope.activeTab[tab.name] = isTabActive(tab);
    });

    // TODO replace by url resolver service as soon as it is available
    var parentUrl = endpoint.getEndpointName();
    var parentTemplateNamePrefix = endpoint.getEndpointName();

    var currentEndpoint = endpoint;

    while (!_.isUndefined(currentEndpoint.parentEndpoint)) {
        currentEndpoint = endpoint.parentEndpoint;
        var parentEndpointName = currentEndpoint.getEndpointName();

        parentUrl = parentEndpointName + '/' + parentUrl;

        parentTemplateNamePrefix = parentEndpointName + '-' + parentTemplateNamePrefix;
    }

    $scope.getTabTemplate = function (tab) {
        return parentUrl + '/' + tab + '/' + parentTemplateNamePrefix + '-' + tab + '-list.tpl.html';
    };

    var _getDefaultTabControllerName = function (tab) {
        return window.cat.util.capitalize(endpoint.getEndpointName()) + window.cat.util.capitalize(tab.name) + 'Controller';
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