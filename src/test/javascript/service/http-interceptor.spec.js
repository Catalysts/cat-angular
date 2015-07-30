/**
 * Created by agerstmayr on 29.07.2015.
 */

describe('CatHttpInterceptorService', function () {
    'use strict';

    var $rootScope;
    var $timeout;
    var $globalMessages;
    var errorHttpInterceptor;

    beforeEach(function () {
        angular.module('cat.service.httpIntercept.test', []);

        module('cat.service.httpIntercept');
        module('cat.service.httpIntercept.test');

        inject(function (_$rootScope_, _$timeout_, _$globalMessages_, _errorHttpInterceptor_) {
            $rootScope = _$rootScope_;
            $timeout = _$timeout_;
            $globalMessages = _$globalMessages_;
            errorHttpInterceptor = _errorHttpInterceptor_;
        });
    });

    it('should start and stop loading service', function () {
        errorHttpInterceptor.request();
        $timeout.flush();
        expect($rootScope.loading).toBe(true);

        errorHttpInterceptor.response();
        $timeout.flush();
        expect($rootScope.loading).toBe(false);
    });

    it('should stop loading service on request error', function () {
        errorHttpInterceptor.request();
        $timeout.flush();
        expect($rootScope.loading).toBe(true);

        errorHttpInterceptor.requestError();
        $timeout.flush();
        expect($rootScope.loading).toBe(false);
    });

    it('should handle response errors', function () {
        errorHttpInterceptor.request();
        $timeout.flush();
        expect($rootScope.loading).toBe(true);

        errorHttpInterceptor.responseError({
            data: {
                error: 'Page not found',
                cause: 'Page doesn\'t exist'
            },
            status: 404,
            statusText: 'Page not found'
        });
        expect($globalMessages.hasMessages('error')).toBe(true);
        $timeout.flush();
        expect($rootScope.loading).toBe(false);
    });

});
