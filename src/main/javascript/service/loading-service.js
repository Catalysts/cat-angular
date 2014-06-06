/**
 * Created by tscheinecker on 01.06.2014.
 */
'use strict';

angular.module('cat.service')
    .factory('loadingService', function ($rootScope, usSpinnerService, $timeout) {
        var activeCount = 0;
        var timer;

        var start = function () {
            if (!activeCount) {
                timer = $timeout(function () {
                    usSpinnerService.spin('loading-spinner');
                    $rootScope.loading = true;
                }, 50);
            }
            activeCount++;
        };

        var stop = function () {
            activeCount--;
            if (!activeCount) {
                if (!!timer) {
                    $timeout.cancel(timer);
                    timer = undefined;
                }
                usSpinnerService.stop('loading-spinner');
                $rootScope.loading = false;
            }
        };

        $rootScope.$on('$routeChangeStart', function (event) {
            start();

        });
        $rootScope.$on('$routeChangeSuccess', function (event) {
            stop();
        });
        $rootScope.$on('$routeChangeError', function (event) {
            stop();
        });

        return {
            start: start,
            stop: stop
        };
    });
