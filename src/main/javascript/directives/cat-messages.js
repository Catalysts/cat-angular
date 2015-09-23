'use strict';

angular.module('cat.directives.messages', [
    'cat.config.messages',
    'cat.service.validation'
])

/**
 * @ngdoc directive
 * @name cat.directives.messages:catMessages
 */
    .directive('catMessages', function () {
        return {
            restrict: 'A',
            templateUrl: 'template/cat-messages.tpl.html',
            scope: {
                type: '=?'
            },
            require: '?^^catValidationGroup',
            link: function (scope, elem, attr, catValidationGroupCtrl) {
                if (!!catValidationGroupCtrl) {
                    scope.context = catValidationGroupCtrl.getContext();
                }
            },
            controller: function ($scope, catValidationService) {
                if (!$scope.type) {
                    $scope.type = 'error';
                }

                $scope.hasMessages = function () {
                    return catValidationService.hasGlobalErrors($scope.context);
                };

                $scope.getMessages = function () {
                    return catValidationService.getGlobalErrors($scope.context);
                };
            }
        };
    });