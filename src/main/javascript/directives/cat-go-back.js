'use strict';

angular.module('cat.directives.goBack', [
    'cat.service.state',
    'cat.directives.i18n'
])

/**
 * @description
 * Configuration for cat-go-back.
 */
    .constant('catGoBackConfig', {
        visible: false
    })

/**
 * @ngdoc directive
 * @name cat.directives.goBack:catGoBack
 *
 * @description This creates a back link to the previous state or to the 'list' state, if no last state is available.
 */
    .directive('catGoBack', function CatGoBack(catGoBackConfig) {
        return {
            restrict: 'A',
            scope: {},
            replace: true,
            template: '<a href="" ng-click="goBackCtrl.goBack()" ng-if="goBackCtrl.isVisible()" cat-i18n="cc.catalysts.general.navigation.go.back">Back</a>',
            bindToController: true,
            controllerAs: 'goBackCtrl',
            controller: function ($q, $scope, catStateService) {
                this.goBack = function () {
                    catStateService.goBack();
                };

                this.isVisible = function () {
                    return catGoBackConfig.visible;
                };
            }
        };
    });
