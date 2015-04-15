'use strict';

/**
 * @ngdoc service
 * @name cat.service.loading:loadingService
 */
angular.module('cat.service.loading', ['angularSpinner'])
    .factory('loadingService', function CatLoadingService($rootScope, usSpinnerService, $timeout) {
        var timeout = 50;
        var animationDuration = 200;
        var activeCount = 0;
        var startTime;
        var startTimer, stopTimer;

        var start = function () {
            if (!activeCount && !startTimer) {
                if (!!stopTimer) {
                    $timeout.cancel(stopTimer);
                    stopTimer = undefined;
                }
                startTimer = $timeout(function () {
                    usSpinnerService.spin('loading-spinner');
                    $rootScope.loading = true;
                    startTime = new Date().getTime();
                }, timeout);
            }
            activeCount++;
        };

        var stop = function () {
            activeCount--;
            if (!activeCount && !stopTimer) {
                if (!!startTimer) {
                    $timeout.cancel(startTimer);
                    startTimer = undefined;
                }
                var now = new Date().getTime();
                var stopTimeout = timeout + (Math.max((animationDuration - (now - startTime)), 0));
                stopTimer = $timeout(function () {
                    usSpinnerService.stop('loading-spinner');
                    $rootScope.loading = false;
                }, stopTimeout);
            }
        };

        $rootScope.$on('$stateChangeStart', function (event) {
            start();

        });
        $rootScope.$on('$stateChangeSuccess', function (event) {
            stop();
        });
        $rootScope.$on('$stateChangeError', function (event) {
            stop();
        });

        return {
            start: start,
            stop: stop
        };
    });
