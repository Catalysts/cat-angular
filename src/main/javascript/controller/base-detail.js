'use strict';
window.BaseDetailController = function ($scope, $routeParams, $breadcrumbs, $location, $window, endpoint, tempalteUrls, baseUrl, Model, $globalMessages) {

    $scope.detail = undefined;
    $scope.editDetail = undefined;
    $scope.$fieldErrors = {};

    $scope.editTemplate = tempalteUrls.edit;

    if (_.isObject(tempalteUrls.view)) {
        $scope.mainViewTemplate = tempalteUrls.view.main;
        $scope.additionalViewTemplate = tempalteUrls.view.additional;
    } else {
        $scope.mainViewTemplate = tempalteUrls.view;
    }

    $scope.baseUrl = baseUrl;

    var reload = function () {
        endpoint.get($routeParams.id).then(function (data) {
            $scope.title = !!data.breadcrumbTitle ? data.breadcrumbTitle() : (!!data.name ? data.name : data.id);
            $scope.detail = data;
            $breadcrumbs.replaceLast({
                title: $scope.title
            });
        });
    };

    $scope.reloadDetails = reload;

    $scope.exists = !!$routeParams.id && $routeParams.id !== 'new';

    $scope.add = function () {
        $scope.editDetail = new Model();
    };

    $scope.edit = function () {
        $scope.editDetail = angular.copy($scope.detail);
    };

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

    $scope.remove = function () {
        endpoint.remove($scope.detail.id).then(function () {
            $location.path(baseUrl);
        });
    };

    $scope.save = function () {
        endpoint.save($scope.editDetail).then(function (data) {
            $globalMessages.clearMessages();
            $scope.$fieldErrors = undefined;
            if (!$scope.exists) {
                $scope.$broadcast('formReset');
                $location.path(baseUrl + '/' + data.id);
            } else {
                $scope.editDetail = undefined;
                $scope.title = !!data.breadcrumbTitle ? data.breadcrumbTitle() : data.name;
                $scope.detail = data;
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
        reload();
    } else {
        $scope.add();
    }
};

window.BaseDetailController.$inject = ['$scope', '$routeParams', '$breadcrumbs', '$location', '$window', 'endpoint', 'templateUrls', 'baseUrl', 'Model', '$globalMessages'];
