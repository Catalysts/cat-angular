'use strict';

angular.module('cat.directives.validation')

/**
 * @ngdoc directive
 * @name cat.directives.validation.inputs:catValidationGroup
 *
 * @description
 * This directive provides a container which defines a new validation context. Via the controller the context can be
 * retrieved.
 */
    .directive('catValidationGroup', function CatValidationGroup() {
        return {
            restrict: 'A',
            controllerAs: 'catValidationGroupCtrl',
            bindToController: true,
            controller: function ($scope, catValidationService) {
                var context = catValidationService.createContext();

                this.getContext = function () {
                    return context;
                };

                $scope.$on('$destroy', function () {
                    catValidationService.destroyContext(context);
                });
            }
        };
    });