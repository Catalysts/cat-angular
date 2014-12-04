/**
 * Created by tscheinecker on 05.05.2014.
 */
'use strict';

angular.module('cat.service.httpIntercept')
    .factory('errorHttpInterceptor', function CatErrorHttpInterceptor($q, $globalMessages, loadingService) {
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
                $globalMessages.clearMessages('error');

                if (!!rejection.data.error) {
                    var error = '[' + rejection.status + ' - ' + rejection.statusText + '] ' + rejection.data.error;
                    if (!!rejection.data.cause) {
                        error += '\n' + rejection.data.cause;
                    }
                    $globalMessages.addMessage('error', error);
                }
                if (!!rejection.data.globalErrors) {
                    $globalMessages.addMessages('error', rejection.data.globalErrors);
                }

                return $q.reject(rejection);
            }
        };
    })
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('errorHttpInterceptor');
    });
