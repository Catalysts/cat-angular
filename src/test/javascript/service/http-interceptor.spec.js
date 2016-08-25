/**
 * Created by agerstmayr on 29.07.2015.
 */

describe('CatHttpInterceptorService', function () {
    'use strict';

    var $globalMessages;
    var errorHttpInterceptor;
    var loadingService = {
        start: function(){},
        stop: function(){}
    };

    beforeEach(function () {
        angular.module('cat.service.httpIntercept.test', [])
            .factory('loadingService', function(){
                return loadingService;
            });

        module('cat.service.httpIntercept');
        module('cat.service.httpIntercept.test');

        inject(function (_$globalMessages_, _errorHttpInterceptor_) {
            $globalMessages = _$globalMessages_;
            errorHttpInterceptor = _errorHttpInterceptor_;
        });

        spyOn(loadingService, 'start');
        spyOn(loadingService, 'stop');
    });

    it('should start and stop loading service', function () {
        errorHttpInterceptor.request();
        expect(loadingService.start).toHaveBeenCalled();

        errorHttpInterceptor.response({});
        expect(loadingService.start.calls.count()).toEqual(1);
    });

    it('should stop loading service on request error', function () {
        errorHttpInterceptor.request();
        expect(loadingService.start).toHaveBeenCalled();

        errorHttpInterceptor.requestError({});
        expect(loadingService.start.calls.count()).toEqual(1);
    });

    it('should handle response errors', function () {
        errorHttpInterceptor.request();
        expect(loadingService.start).toHaveBeenCalled();

        errorHttpInterceptor.responseError({
            data: {
                error: 'Page not found',
                cause: 'Page doesn\'t exist'
            },
            status: 404,
            statusText: 'Page not found'
        });
        expect($globalMessages.hasMessages('error')).toBe(true);
        expect(loadingService.start.calls.count()).toBe(1);
    });

    it('should ignore calling loadingService if skipLoadingService is set to true', function () {
        var ignoreLoadingConfig = {
            skipLoadingService: true
        };

        errorHttpInterceptor.request(ignoreLoadingConfig);
        expect(loadingService.start).not.toHaveBeenCalled();

        errorHttpInterceptor.request();
        expect(loadingService.start).toHaveBeenCalled();

    });
});
