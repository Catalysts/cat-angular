import IQService = angular.IQService;
import IHttpInterceptor = angular.IHttpInterceptor;

class CatErrorHttpInterceptor implements IHttpInterceptor {

    constructor(private $q:IQService,
                private loadingService:CatLoadingService,
                private catValidationMessageHandler:CatValidationMessageHandler) {
    }

    request(config:IRequestConfig) {
        this.loadingService.start();
        return config;
    }

    requestError(rejection) {
        this.loadingService.stop();
        return this.$q.reject(rejection);
    }

    response(success) {
        this.loadingService.stop();
        return success;
    }

    responseError(rejection) {
        this.loadingService.stop();
        this.catValidationMessageHandler.handleRejectedResponse(rejection);
        return this.$q.reject(rejection);
    }
}

function catErrorHttpInterceptorFactory($q:IQService,
                                        loadingService:CatLoadingService,
                                        catValidationMessageHandler:CatValidationMessageHandler) {
    return new CatErrorHttpInterceptor($q, loadingService, catValidationMessageHandler);
}

angular.module('cat.service.httpIntercept', ['cat.service.loading', 'cat.service.validation'])

/**
 * @ngdoc service
 * @name cat.service.httpIntercept:errorHttpInterceptor
 */
    .factory('errorHttpInterceptor', [
        '$q',
        'loadingService',
        'catValidationMessageHandler',
        catErrorHttpInterceptorFactory
    ])
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('errorHttpInterceptor');
    });
