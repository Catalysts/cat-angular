import ILocationService = angular.ILocationService;
import IStateService = angular.ui.IStateService;

interface ICatListDataLoadingService {
    load(endpoint, searchRequest?:SearchRequest);
    resolve(endpointName:string, defaultSort?:Sort);
}

class CatListDataLoadingService implements ICatListDataLoadingService {

    constructor(private $location:ILocationService,
                private $q:IQService,
                private catApiService:ICatApiService,
                private catSearchService:ICatSearchService) {

    }

    load(endpoint, searchRequest) {
        let deferred = this.$q.defer();
        endpoint.list(searchRequest).then(
            function success(data) {
                var pagination = searchRequest.pagination();

                var result = {
                    count: data.totalCount,
                    collection: data.elements,
                    pagination: pagination,
                    firstResult: (pagination.page - 1) * pagination.size + 1,
                    lastResult: Math.min(pagination.page * pagination.size, data.totalCount),
                    facets: data.facets,
                    isSinglePageList: data.totalCount <= pagination.size,
                    endpoint: endpoint,
                    searchRequest: searchRequest
                };

                delete data.totalCount;
                delete data.elements;
                delete data.facets;

                deferred.resolve(_.assign(result, data));
            },
            function error(reason) {
                deferred.reject(reason);
            });
        return deferred.promise;
    }

    /**
     *
     * @param {String} endpointName
     * @param {Object} [defaultSort={property:'name',isDesc:false}]
     */
    resolve(endpointName, defaultSort:Sort = {property: 'name', isDesc: false}) {
        var searchRequest = this.catSearchService.fromLocation();
        if (!this.$location.search().sort) {
            searchRequest.sort(defaultSort);
        }
        return this.load(this.catApiService[endpointName], searchRequest);
    }
}

/**
 * @ngdoc service
 * @name cat.service.listDataLoading:catListDataLoadingService
 */
angular
    .module('cat.service.listDataLoading', [
        'cat.service.api',
        'ui.router'
    ])
    .service('catListDataLoadingService', [
        '$location',
        '$q',
        'catApiService',
        'catSearchService',
        CatListDataLoadingService
    ]);
