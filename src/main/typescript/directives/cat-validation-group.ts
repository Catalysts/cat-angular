interface ICatValidationGroupController {
    getContextId():string;
}

class CatValidationGroupController implements ICatValidationGroupController {

    private contextId:string;

    constructor($scope:IScope,
                catValidationService:ICatValidationService) {
        this.contextId = catValidationService.createContext();

        $scope.$on('$destroy', () => {
            catValidationService.destroyContext(this.contextId);
        });
    }

    /**
     * Retuns the context identifier
     * @returns {string} context identifier
     */
    getContextId() {
        return this.contextId;
    }
}

function catValidationGroupDirectiveFactory():IDirective {
    return {
        restrict: 'A',
        controllerAs: 'catValidationGroupCtrl',
        bindToController: true,
        controller: [
            '$scope',
            'catValidationService',
            CatValidationGroupController
        ]
    };
}

angular
    .module('cat.directives.validation')
    /**
     * @ngdoc directive
     * @name cat.directives.validation.inputs:catValidationGroup
     *
     * @description
     * This directive provides a container which defines a new validation context. Via the controller the context can be
     * retrieved.
     */
    .directive('catValidationGroup', [
        catValidationGroupDirectiveFactory
    ]);