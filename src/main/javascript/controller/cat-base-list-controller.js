'use strict';


/**
 * @ngdoc controller
 * @name cat.controller.base.list:CatBaseListController
 * @module cat.controller.base.list
 *
 * @description
 * The CatBaseListController takes care of providing several common properties to the scope
 * of every list page. It also instantiates the controller given via the config.controller parameter and shares
 * the same scope with it. In addition it has a common template 'cat-base-list.tpl.html' which shows a title,
 * new button and provides the cat-paginated directive.
 *
 * Common properties include:
 * * listData - the listData to be used by cat-paginated
 * * title - the title of the view
 * * searchProps - the list of search properties passed on to the cat-paginated directive
 * * config - the config object used to instantiate this view
 *
 * @param {object} $scope scope
 * @param {object} $state state service
 * @param {object} $controller controller
 * @param {object} $log log
 * @param {object} catBreadcrumbsService catBreadcrumbsService
 * @param {object} catListDataLoadingService catListDataLoadingService
 * @param {object} config holds data like the listData object, the template url, base url, the model constructor, etc.
 */
function CatBaseListController($scope, $state, $controller, $log, catBreadcrumbsService, catListDataLoadingService, config) {
    if (!_.isUndefined(config.listData)) {
        this.titleKey = 'cc.catalysts.cat-breadcrumbs.entry.' + config.listData.endpoint.getEndpointName();

        catBreadcrumbsService.set([
            {
                title: config.title,
                key: this.titleKey
            }
        ]);

        $scope.listData = config.listData;
    } else {
        $log.warn('No listData available!');
    }

    this.title = config.title;
    this.searchProps = config.searchProps;
    this.config = config;

    this.getUrlForId = function (id) {
        $log.warn('use ui-sref directly - this method will be removed in the near future');
        return $state.href('^.detail', {id: id});
    };

    this.getUrlForNewPage = function () {
        return this.getUrlForId('new');
    };

    this.remove = function(id) {
        config.listData.endpoint.remove(id)
            .then(function() {
                catListDataLoadingService.load(config.listData.endpoint, config.listData.searchRequest).then(
                    function (data) {
                        _.assign($scope.listData, data);
                    }
                );
            });
    };

    try {
        // extend with custom controller
        $controller(config.controller, {$scope: $scope, listData: config.listData, config: config});
    } catch (unused) {
        $log.info('Couldn\'t instantiate controller with name ' + config.controller);
    }
}


angular.module('cat.controller.base.list')
    .controller('CatBaseListController',
    ['$scope', '$state', '$controller', '$log', 'catBreadcrumbsService', 'catListDataLoadingService', 'config', CatBaseListController]);
