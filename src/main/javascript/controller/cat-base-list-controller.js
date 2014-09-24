'use strict';

/**
 * @ngdoc function
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
 * @param $scope
 * @param $controller
 * @param $log
 * @param catBreadcrumbsService
 * @param {Object} config holds data like the listData object, the template url, base url, the model constructor, etc.
 * @constructor
 */
function CatBaseListController($scope, $controller, $log, catBreadcrumbsService, config) {

    catBreadcrumbsService.set([
        {
            title: config.title
        }
    ]);

    $scope.listData = config.listData;

    this.title = config.title;
    this.searchProps = config.searchProps;
    this.config = config;

    this.getUrlForId = function (id) {
        return '#' + config.baseUrl + '/' + id;
    };

    this.getUrlForNewPage = function () {
        return this.getUrlForId('new');
    };


    try {
        // extend with custom controller
        $controller(config.controller, {$scope: $scope, listData: config.listData, config: config});
    } catch (unused) {
        $log.info('Couldn\'t instantiate controller with name ' + config.controller);
    }
}

angular.module('cat').controller('CatBaseListController', CatBaseListController);
