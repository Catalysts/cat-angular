interface ICatBaseDetailStateParams extends IStateParamsService {
    id:string|number;
}

interface ICatBaseDetailScope<T> extends IScope {
    baseTabsController:(string|Function)[];
    config:ICatDetailConfig;
    detail:T;
    editDetail:T;
    editTemplate:string;
    exists:boolean;
    mainViewTemplate:string;
    additionalViewTemplate?:string;
    uiStack:CatBreadcrumb[];

    add():void;
    copy():void;
    cancelEdit():void;
    edit():void;
    reloadDetails():void;
    remove():void;
    save(styInEdit?:boolean):void;
    title():string;
}

class CatBaseDetailController {

    /**
     * @ngdoc controller
     * @name cat.controller.base.detail:CatBaseDetailController
     * @module cat.controller.base.detail
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
     *
     * Common functions include:
     * * save - the save function to update / create an object
     * * edit - a function to switch from view to edit mode
     * * cancelEdit - a function to switch from edit to view mode (discarding all changes)
     * * add - a function to switch into edit mode of a new object
     * * remove - a function to delete the current object
     * * title - a function to resolve a 'title' of the current object
     *
     * @param {object} $scope DOCTODO
     * @param {object} $state DOCTODO
     * @param {object} $stateParams DOCTODO
     * @param {object} $location DOCTODO
     * @param {object} $window DOCTODO
     * @param {object} $globalMessages DOCTODO
     * @param {object} $controller DOCTODO
     * @param {object} $log DOCTODO
     * @param {object} catValidationService DOCTODO
     * @param {object} catBreadcrumbsService DOCTODO
     * @param {Object} config holds data like the current api endpoint, template urls, base url, the model constructor, etc.
     */
    constructor(private $scope:ICatBaseDetailScope<any>,
                private $state:IStateService,
                private $stateParams:ICatBaseDetailStateParams,
                private $location:ILocationService,
                private $window:IWindowService,
                private $globalMessages:ICatMessagesService,
                private $controller:any,
                private $log:ILogService,
                private catValidationService:ICatValidationService,
                private catBreadcrumbsService:ICatBreadcrumbsService,
                private config:ICatDetailConfig) {
        $scope.detail = config.detail;
        $scope.editDetail = undefined;

        $scope.config = config;
        let endpoint = config.endpoint;
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
            $scope.mainViewTemplate = templateUrls.view['main'];
            $scope.additionalViewTemplate = templateUrls.view['additional'];
        } else {
            $scope.mainViewTemplate = '' + templateUrls.view;
        }

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
        $scope.reloadDetails = function () {
            endpoint.get($stateParams.id).then(function (data) {
                $scope.detail = data;
                update();
            });
        };

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
            if (_.isFunction($scope.detail.setParent)) {
                $scope.detail.setParent(config.parents[0]);
            }
            $scope.editDetail = angular.copy($scope.detail);
        };

        /**
         * Either cancels the current edit of an object by resetting it or triggers a history back event if the 'new' mode
         * is active
         */
        $scope.cancelEdit = function () {
            catValidationService.clearValidationErrors();
            $scope.$broadcast('formReset');
            if ($scope.exists) {
                $scope.editDetail = undefined;
                $globalMessages.clearMessages();
            } else {
                $window.history.back();
            }
        };

        /**
         * Calls the copy function of the current endpoint and redirects to the detail page of the copied object upon success
         */
        $scope.copy = function () {
            endpoint.copy($scope.detail.id).then(function (data) {
                //Note: here we go to the detail state of the copied object although we have all the data of the copied object here,
                // but otherwise we would have to change the url and this leads to problems with browser back and so on
                $state.go('.', {id: data.id});
            });
        };

        /**
         * Calls the remove function of the current endpoint and redirects to the ^.list upon success
         */
        $scope.remove = () => {
            endpoint.remove($scope.detail.id).then(function () {
                if (_.isEmpty($scope.uiStack)) {
                    $state.go('^.list');
                } else {
                    var url = $state.href('^.^');
                    $location.url(url.substring(1, url.length));
                    $location.search('tab', endpoint.getEndpointName());
                }
            });
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
        $scope.save = (stayInEdit:boolean) => {
            // When passing data to an asynchronous method, it makes sense to clone it.
            endpoint.save(angular.copy($scope.editDetail)).then(function (data) {
                $globalMessages.clearMessages();
                catValidationService.clearValidationErrors();
                if (stayInEdit) {
                    $scope.editDetail = data;
                    // Refresh-Breadcrumb:
                    $scope.reloadDetails();
                } else {
                    if (!$scope.exists) {
                        $scope.$broadcast('formReset');
                        $state.go('.', {id: data.id});
                    } else {
                        $scope.editDetail = undefined;
                        $scope.detail = data;
                        update();
                    }
                }
            });
        };

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

        if ($scope.exists) {
            update();
        } else {
            $scope.edit();
        }
    }
}
angular
    .module('cat.controller.base.detail', [
        'cat.service.breadcrumbs',
        'cat.controller.base.tabs'
    ])
    .controller('CatBaseDetailController', [
        '$scope',
        '$state',
        '$stateParams',
        '$location',
        '$window',
        '$globalMessages',
        '$controller',
        '$log',
        'catValidationService',
        'catBreadcrumbsService',
        'config',
        CatBaseDetailController
    ]);