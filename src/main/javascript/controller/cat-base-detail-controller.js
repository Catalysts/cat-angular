'use strict';

/**
 * @ngdoc function
 *
 * @description
 * The CatBaseDetailController takes care of providing several common properties and functions to the scope
 * of every detail page. It also instantiates the controller given via the config.controller parameter and shares
 * the same scope with it.
 *
 * Common properties include:
 * * detail - the actual object to view
 * * editDetail - a copy of the detail object used for editing
 * * breadcrumbs - the breadcrumbs array
 * * uiStack - the ui stack array if parents exist
 * * editTemplate - the url of the edit template
 * * mainViewTemplate - the url of the main view template
 * * additionalViewTemplate - the url of the additional view template if it exists
 * * $fieldErrors - a map of validation errors returned by the server
 *
 * Common functions include:
 * * save - the save function to update / create an object
 * * edit - a function to switch from view to edit mode
 * * cancelEdit - a function to switch from edit to view mode (discarding all changes)
 * * add - a function to switch into edit mode of a new object
 * * remove - a function to delete the current object
 * * title - a function to resolve a 'title' of the current object
 *
 * @param $scope
 * @param $stateParams
 * @param $location
 * @param $window
 * @param $globalMessages
 * @param $controller
 * @param $log
 * @param catBreadcrumbsService
 * @param {Object} config holds data like the current api endpoint, template urls, base url, the model constructor, etc.
 * @constructor
 */
function CatBaseDetailController($scope, $stateParams, $location, $window, $globalMessages, $controller, $log, catBreadcrumbsService, config) {
    $scope.detail = config.detail;
    $scope.editDetail = undefined;
    $scope.$fieldErrors = {};

    var endpoint = config.endpoint;
    var baseUrl = config.baseUrl;
    var templateUrls = config.templateUrls;
    var Model = config.Model;

    $scope.uiStack = catBreadcrumbsService.generateFromConfig(config);

    if ($stateParams.id === 'new') {
        catBreadcrumbsService.push({
            title: 'New',
            key: 'cc.catalysts.general.new'
        });
    } else {
        catBreadcrumbsService.push({});
    }

    $scope.editTemplate = templateUrls.edit;

    if (_.isObject(templateUrls.view)) {
        $scope.mainViewTemplate = templateUrls.view.main;
        $scope.additionalViewTemplate = templateUrls.view.additional;
    } else {
        $scope.mainViewTemplate = templateUrls.view;
    }

    $scope.baseUrl = baseUrl;

    /**
     * @returns {String|Number} A title of the current object or the 'id' as fallback
     */
    $scope.title = function () {
        var data = $scope.detail;
        if (_.isUndefined(data)) {
            return '';
        }
        return !!data.breadcrumbTitle ? data.breadcrumbTitle() : (!!data.name ? data.name : data.id);
    };

    var update = function () {
        catBreadcrumbsService.replaceLast({
            title: $scope.title()
        });
    };

    /**
     * reloads the current object from the server
     */
    var reload = function () {
        endpoint.get($stateParams.id).then(function (data) {
            $scope.detail = data;
            update();
        });
    };

    $scope.reloadDetails = reload;

    $scope.exists = !!$stateParams.id && $stateParams.id !== 'new';

    /**
     * Creates a new copy of the given model and sets its parent if applicable.
     * Triggers a switch into the edit mode
     */
    $scope.add = function () {
        $scope.editDetail = new Model();
        if (_.isFunction($scope.editDetail.setParent)) {
            $scope.editDetail.setParent(config.parents[0]);
        }
    };

    /**
     * Creates a copy of the current object and triggers a switch into edit mode
     */
    $scope.edit = function () {
        $scope.editDetail = angular.copy($scope.detail);
        if (_.isFunction($scope.editDetail.setParent)) {
            $scope.editDetail.setParent(config.parents[0]);
        }
    };

    /**
     * Either cancels the current edit of an object by resetting it or triggers a history back event if the 'new' mode
     * is active
     */
    $scope.cancelEdit = function () {
        $scope.$broadcast('formReset');
        if ($scope.exists) {
            $scope.editDetail = undefined;
            $globalMessages.clearMessages();
            $scope.$fieldErrors = undefined;
        } else {
            $window.history.back();
        }
    };

    /**
     * Calls the remove function of the current endpoint and redirects to the given baseUrl upon success
     */
    $scope.remove = function () {
        endpoint.remove($scope.detail.id).then(function () {
            if (_.isEmpty($scope.uiStack)) {
                $location.path(baseUrl);
            } else {
                var parentUrl = $scope.uiStack[$scope.uiStack.length - 1].url;
                $location.path(parentUrl.substring(1, parentUrl.indexOf('?')));
                $location.search('tab', endpoint.getEndpointName());
            }
        });
    };

    /**
     * Calls the save function of the current endpoint.
     * Upon success the view mode of the details of the currently created / updated object will be shown.
     * Upon an error the reported errors (global & field errors) will be shown to the user and the edit mode
     * will remain active.
     */
    $scope.save = function () {
        endpoint.save($scope.editDetail).then(function (data) {
            $globalMessages.clearMessages();
            $scope.$fieldErrors = undefined;
            if (!$scope.exists) {
                $scope.$broadcast('formReset');
                $location.path(baseUrl + '/' + data.id);
            } else {
                $scope.editDetail = undefined;
                $scope.detail = data;
                update();
            }
        }, function (response) {
            if (!response.data.fieldErrors) {
                $scope.$fieldErrors = undefined;
                return;
            }
            // group by field
            var fieldErrors = {};
            _.forEach(response.data.fieldErrors, function (fieldError) {
                fieldErrors[fieldError.field] = fieldErrors[fieldError.field] || [];
                fieldErrors[fieldError.field].push(fieldError.message);
            });

            $scope.$fieldErrors = fieldErrors;
            $scope.$broadcast('fieldErrors', fieldErrors);
        });
    };

    if ($scope.exists) {
        if (_.isUndefined($scope.detail)) {
            reload();
        } else {
            update();
        }
    } else {
        if (_.isUndefined($scope.detail)) {
            $scope.add();
        } else {
            $scope.edit();
        }
    }


    // TABS
    $scope.baseTabsController = ['$scope', function ($tabsScope) {
        $controller('CatBaseTabsController', {
            $scope: $tabsScope,
            config: config
        });
    }];

    try {
        // extend with custom controller
        $controller(config.controller, {
            $scope: $scope,
            detail: config.detail,
            parents: config.parents,
            config: config
        });
    } catch (unused) {
        $log.info('Couldn\'t instantiate controller with name ' + config.controller);
    }
}

angular.module('cat.controller.base.detail').controller('CatBaseDetailController', CatBaseDetailController);