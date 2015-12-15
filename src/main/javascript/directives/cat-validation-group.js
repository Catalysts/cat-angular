'use strict';

function CatValidationController($scope, catValidationService) {
    var contextId = catValidationService.createContext();

    /**
     * Retuns the context identifier
     * @returns {string} context identifier
     */
    getContextId()
    {
        return contextId;
    };

    $scope.$on('$destroy', function () {
        catValidationService.destroyContext(contextId);
    });
}

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
            controller: ['$scope', 'catValidationService', CatValidationController]
        };
    });