'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.i18n:catI18n
 */
angular.module('cat.directives.i18n', ['cat.service.i18n'])
    .directive('catI18n', ['$log', '$rootScope', 'catI18nService', function CatI18nDirective($log, $rootScope, catI18nService) {
        function _translate(scope, element) {
            if (!scope.key) {
                $log.warn('No key was given for cat-i18n!');
                return;
            }
            catI18nService.translate(scope.key, scope.params).then(
                function (message) {
                    element.text(message);
                }, function (reason) {
                    // TODO - introduce a handler service for this case - eg show '##missingkey: somekey##'
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
