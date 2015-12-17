interface CatMessagesDirectiveScope extends IScope {
    contextId?:string;
    type?:string;
    hasMessages():boolean;
    getMessages():string[];
}

class CatMessagesController {
    constructor($scope:CatMessagesDirectiveScope,
                catValidationService:ICatValidationService) {
        if (!$scope.type) {
            $scope.type = 'error';
        }

        $scope.hasMessages = () => {
            return catValidationService.hasGlobalErrors($scope.contextId);
        };

        $scope.getMessages = () => {
            return catValidationService.getGlobalErrors($scope.contextId);
        };
    }
}
function catMessagesDirectiveFactory():IDirective {
    let catMessagesLink:IDirectiveLinkFn = (scope:CatMessagesDirectiveScope,
                                            elem:IAugmentedJQuery,
                                            attr:IAttributes,
                                            catValidationGroupCtrl:ICatValidationGroupController) => {
        if (!!catValidationGroupCtrl) {
            scope.contextId = catValidationGroupCtrl.getContextId();
        }
    };

    return {
        restrict: 'A',
        templateUrl: 'template/cat-messages.tpl.html',
        scope: {
            type: '=?'
        },
        require: '?^^catValidationGroup',
        link: catMessagesLink,
        controller: [
            '$scope',
            'catValidationService',
            CatMessagesController
        ]
    };
}

angular
    .module('cat.directives.messages', [
        'cat.config.messages',
        'cat.service.validation'
    ])
    /**
     * @ngdoc directive
     * @name cat.directives.messages:catMessages
     */
    .directive('catMessages', [
        catMessagesDirectiveFactory
    ]);