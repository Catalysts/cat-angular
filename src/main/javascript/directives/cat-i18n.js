'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.i18n:catI18n
 */
angular.module('cat.directives.i18n', ['cat.service.i18n'])
    .service('catI18nResponseHandler', ['$log', function CatI18nResponseHandler($log) {
        handleTranslationSuccess(translation, scope, element)
        {
            element.text(translation);
        };
        handleTranslationError(reason, scope, element)
        {
            element.text('##missingkey: ' + scope.key);
        };
    }])
    .directive('catI18n', ['$log', '$rootScope', 'catI18nService', 'catI18nResponseHandler', function catI18nDirective($log, $rootScope, catI18nService, catI18nResponseHandler) {
        function _translate(scope, element) {
            if (!scope.key) {
                $log.warn('No key was given for cat-i18n!');
                return;
            }
            catI18nService.translate(scope.key, scope.params).then(
                function (message) {
                    catI18nResponseHandler.handleTranslationSuccess(message, scope, element);
                }, function (reason) {
                    catI18nResponseHandler.handleTranslationError(reason, scope, element);
                }
            );
        }


        return {
            restrict: 'A',
            scope: {
                key: '@catI18n',
                params: '=?i18nParams',
                watchParams: '=?i18nWatchParams'
            },
            link: function CatI18nLink(scope, element) {
                _translate(scope, element);

                if (!!scope.params && scope.watchParams === true) {
                    scope.$watch('params', function () {
                        _translate(scope, element);
                    }, true);
                }

                $rootScope.$on('cat-i18n-refresh', function () {
                    _translate(scope, element);
                });
            }
        };
    }]);
