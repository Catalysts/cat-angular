/**
 * Created by agerstmayr on 29.07.2015.
 */

describe('CatLoadingService', function () {
    'use strict';

    var $rootScope;
    var $timeout;
    var loadingService;

    beforeEach(function () {
        angular.module('cat.service.loading.test', []);

        module('cat.service.loading');
        module('cat.service.loading.test');

        inject(function (_$rootScope_, _$timeout_, _loadingService_) {
            $rootScope = _$rootScope_;
            $timeout = _$timeout_;
            loadingService = _loadingService_;
        });
    });

    it('should not stop loading if multiple loading processes are started', function () {
        expect($rootScope.loading).toBeUndefined();

        loadingService.start();
        $timeout.flush();
        expect($rootScope.loading).toBe(true);

        // second loading start
        loadingService.start();
        expect($rootScope.loading).toBe(true);

        // stop first loading
        loadingService.stop();
        expect($rootScope.loading).toBe(true); // one loading process is still pending

        // stop second loading
        loadingService.stop();
        $timeout.flush();
        expect($rootScope.loading).toBe(false); // now all loading processes are stopped
    });

    it('should cancel pending stop request if start is called', function () {
        expect($rootScope.loading).toBeUndefined();

        loadingService.start();
        $timeout.flush();
        expect($rootScope.loading).toBe(true);

        // starts the stopTimer
        loadingService.stop();
        // should cancel this stopTimer
        loadingService.start();

        $timeout.flush();
        // at the end, it should be loading.
        expect($rootScope.loading).toBe(true);
    });

});
