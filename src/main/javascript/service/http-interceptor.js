'use strict';

angular.module('cat.service.httpIntercept', ['cat.service.message', 'cat.service.loading', 'cat.service.validation'])

    /**
     * @ngdoc service
     * @name cat.service.httpIntercept:errorHttpInterceptor
     */
    .factory('errorHttpInterceptor', function CatErrorHttpInterceptor($q, $globalMessages, loadingService, catValidationMessageHandler) {
        return {
            'request': function (config) {
                loadingService.start();
                return config;
            },
            'requestError': function (rejection) {
                loadingService.stop();
                return $q.reject(rejection);
            },
            'response': function (success) {
                loadingService.stop();
                return success;
            },
            'responseError': function (rejection) {
                loadingService.stop();
                catValidationMessageHandler.handleRejectedResponse(rejection);
                return $q.reject(rejection);
            }
        };
    })
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('errorHttpInterceptor');
    });
