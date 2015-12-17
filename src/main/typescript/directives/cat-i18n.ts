interface CatI18nScope extends IScope {
    key?:string;
    params?:{[key:string]:string};
    watchParams?:boolean;
}

function catI18nDirectiveFactory($log:ILogService,
                                 $rootScope:IRootScopeService,
                                 catI18nService:ICatI18nService,
                                 catI18nResponseHandler:ICatI18nResponseHandler) {
    function _translate(scope, element) {
        if (!scope.key) {
            $log.warn('No key was given for cat-i18n!');
            return;
        }

        catI18nService
            .translate(scope.key, scope.params)
            .then((message) => {
                    catI18nResponseHandler.handleTranslationSuccess(message, scope, element);
                }, (reason) => {
                    catI18nResponseHandler.handleTranslationError(reason, scope, element);
                }
            );
    }

    let catI18nLink:IDirectiveLinkFn = (scope:CatI18nScope,
                                        element:IAugmentedJQuery) => {
        _translate(scope, element);

        if (!!scope.params && scope.watchParams === true) {
            scope.$watch('params', () => {
                _translate(scope, element);
            }, true);
        }

        $rootScope.$on('cat-i18n-refresh', () => {
            _translate(scope, element);
        });
    };

    return {
        restrict: 'A',
        scope: {
            key: '@catI18n',
            params: '=?i18nParams',
            watchParams: '=?i18nWatchParams'
        },
        link: catI18nLink
    };
}


/**
 * @ngdoc directive
 * @name cat.directives.i18n:catI18n
 */
angular
    .module('cat.directives.i18n', [
        'cat.service.i18n'
    ])
    .directive('catI18n', [
        '$log',
        '$rootScope',
        'catI18nService',
        'catI18nResponseHandler',
        catI18nDirectiveFactory
    ]);
