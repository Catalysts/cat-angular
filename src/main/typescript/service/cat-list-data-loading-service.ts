import ILocationService = angular.ILocationService;
import IStateService = angular.ui.IStateService;

interface ICatListData<T> {
    count:number;
    collection:T[];
    pagination:Pagination;
    firstResult:number;
    lastResult:number;
    facets?:Facet[],
    isSinglePageList:boolean;
    endpoint:ICatApiEndpoint,
    searchRequest: SearchRequest
}

interface ICatListDataLoadingService {
    load(endpoint:ICatApiEndpoint, searchRequest:SearchRequest):IPromise<ICatListData>;
    resolve(endpointName:string, defaultSort?:Sort):IPromise<ICatListData>;
}

class CatListDataLoadingService implements ICatListDataLoadingService {

    constructor(private $location:ILocationService,
                private $q:IQService,
                private catApiService:ICatApiService,
                private catSearchService:ICatSearchService) {

    }

    load(endpoint:ICatApiEndpoint, searchRequest):IPromise<ICatListData> {
        return endpoint
            .list(searchRequest)
            .then((data) => {
                let pagination = searchRequest.pagination();

                let result:ICatListData = {
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

                return _.assign(result, data);
            });
    }

    /**
     *
     * @param {String} endpointName
     * @param {Object} [defaultSort={property:'name',isDesc:false}]
     */
    resolve(endpointName, defaultSort:Sort = {property: 'name', isDesc: false}):IPromise<ICatListData> {
        let searchRequest = this.catSearchService.fromLocation();
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
