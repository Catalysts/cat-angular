'use strict';

angular.module('cat.controller.base.edit', [])

/**
 * @ngdoc controller
 * @name cat.controller.base.edit:CatBaseEditController
 *
 * @description
 * The CatBaseEditController takes care of providing several common properties and functions to the scope
 * of every edit page. It also instantiates the controller given via the config.controller parameter and shares
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
 * * cancelEdit - a function to switch from edit to view mode (discarding all changes)
 * * title - a function to resolve a 'title' of the current object
 *
 * @param {object} $scope DOCTODO
 * @param {object} $state DOCTODO
 * @param {object} $stateParams DOCTODO
 * @param {object} $window DOCTODO
 * @param {object} $globalMessages DOCTODO
 * @param {object} $controller DOCTODO
 * @param {object} $log DOCTODO
 * @param {object} catBreadcrumbsService DOCTODO
 * @param {Object} config holds data like the current api endpoint, template urls, base url, the model constructor, etc.
 * @param {object} catValidationService DOCTODO
 * @constructor
 */
    .controller('CatBaseEditController', CatBaseEditController);

function CatBaseEditController($scope, $state, $stateParams, $window, $globalMessages, $controller, $log, catBreadcrumbsService, catValidationService, config) {
    $scope.detail = config.detail;
    $scope.editDetail = undefined;
    $scope.$fieldErrors = {};

    $scope.config = config;
    var endpoint = config.endpoint;
    var baseUrl = config.baseUrl;
    var templateUrls = config.templateUrls;
    var Model = config.Model;

    $scope.uiStack = catBreadcrumbsService.generateFromConfig(config);

    if ($stateParams.id === 'new' || $stateParams.id === undefined) {
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

    /**
     * reloads the current object from the server
     */
    $scope.reloadDetails = function () {
        endpoint.get($stateParams.id).then(function (data) {
            $scope.detail = data;
            update();
        });
    };

    $scope.exists = !!$stateParams.id && $stateParams.id !== 'new';

    $scope.cancelEdit = function () {
        $scope.$broadcast('formReset'); // TODO necessary to call?
        if ($scope.exists) {
            $state.go(config.name + '.detail', {id: config.detail.id});
        } else {
            $window.history.back();
        }
    };

    /**
     * Calls the save function of the current endpoint.
     * Upon success the view mode of the details of the currently created / updated object will be shown.
     * Upon an error the reported errors (global & field errors) will be shown to the user and the edit mode
     * will remain active.
     *
     * * @param {object} stayInEdit If true the view stays in detail edit state after save instead of switching to
     *                              detail view state.
     */
    $scope.save = function (stayInEdit) {
        endpoint.save($scope.editDetail).then(function (data) {
            catValidationService.clearValidationErrors();
            $scope.$broadcast('formReset');
            $globalMessages.addMessage('success', 'Saved successfully.', true);
            if (stayInEdit) {
                $state.go('^.edit', {id: data.id});
            } else {
                $state.go('^.detail', {id: data.id});
            }
        });
    };

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

    // set edit object with parent relations
    $scope.editDetail = $scope.detail;
    if (_.isFunction($scope.editDetail.setParent)) {
        $scope.editDetail.setParent(config.parents[0]);
    }
}
