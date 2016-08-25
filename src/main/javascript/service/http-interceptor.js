'use strict';

angular.module('cat.service.httpIntercept', ['cat.service.message', 'cat.service.loading', 'cat.service.validation'])

/**
 * @ngdoc service
 * @name cat.service.httpIntercept:errorHttpInterceptor
 */
    .factory('errorHttpInterceptor', function CatErrorHttpInterceptor($q, $globalMessages, loadingService, $injector) {
        function toBeIgnored(config) {
            return !!config && config.skipLoadingService;
        }

        return {
            'request': function (config) {
                if (!toBeIgnored(config)) {
                    loadingService.start();
                }
                return config;
            },
            'requestError': function (rejection) {
                if (!toBeIgnored(rejection.config)) {
                    loadingService.stop();
                }
                return $q.reject(rejection);
            },
            'response': function (success) {
                if (!toBeIgnored(success.config)) {
                    loadingService.stop();
                }
                return success;
            },
            'responseError': function (rejection) {
                if (!toBeIgnored(rejection.config)) {
                    loadingService.stop();
                }
                $injector.get('catValidationMessageHandler').handleRejectedResponse(rejection);
                return $q.reject(rejection);
            }
        };
    })
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('errorHttpInterceptor');
    });
