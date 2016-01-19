import IHttpProvider = angular.IHttpProvider;
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

angular
    .module('cat.service.httpIntercept', [
        'cat.service.loading',
        'cat.service.validation'
    ])
    /**
     * @ngdoc service
     * @name cat.service.httpIntercept:errorHttpInterceptor
     */
    .service('errorHttpInterceptor', [
        '$q',
        'loadingService',
        'catValidationMessageHandler',
        CatErrorHttpInterceptor
    ])
    .config(['$httpProvider', ($httpProvider:IHttpProvider) => {
        $httpProvider.interceptors.push('errorHttpInterceptor');
    }]);
