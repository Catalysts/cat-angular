/**
 * Created by Thomas on 08/03/2015.
 */

interface ICatUrlEncodingService {
    encodeAsUrl(params?:any):string;
}

class CatUrlEncodingService implements ICatUrlEncodingService {
    encodeAsUrl(params) {
        if (!!params && !_.isEmpty(params)) {
            return $.param(params);
        }

        return '';
    }
}

interface ICatSearchService {
    encodeAsUrl(searchRequest?:SearchRequest):string;
    updateLocation(searchRequest?:SearchRequest):void;
    fromLocation():SearchRequest;
}

class CatSearchService implements ICatSearchService {

    constructor(private $location,
                private catUrlEncodingService) {

    }

    private static _encodeSort(_sort) {
        return (!!_sort.property ? 'sort=' + _sort.property + ':' + ((_sort.isDesc === true || _sort.isDesc === 'true') ? 'desc' : 'asc') : '');
    }

    private static _encodePagination(_pagination) {
        return 'page=' + (!!_pagination.page ? Math.max(0, _pagination.page - 1) : 0) + '&size=' + _pagination.size || 100;
    }

    private _encodeSearch(_search) {
        return this.catUrlEncodingService.encodeAsUrl(_search);
    }

    private urlEndoded(searchRequest) {
        return _([
            CatSearchService._encodePagination(searchRequest.pagination()),
            CatSearchService._encodeSort(searchRequest.sort()),
            this._encodeSearch(searchRequest.search())
        ]).reduce(CatSearchService._concatenate);
    }

    private static _concatenate(result, next) {
        if (!result) {
            return next;
        }

        if (!next) {
            return result;
        }
        return result + '&' + next;
    }


    /**
     * @ngdoc function
     * @name encodeAsUrl
     * @methodOf cat.service.search:catSearchService
     *
     * @param {cat.SearchRequest} searchRequest the search request to encode as url
     *
     * @description
     * This methods returns an url encoded version of the given search request
     */
    encodeAsUrl(searchRequest) {
        if (!searchRequest) {
            return '';
        }

        return this.urlEndoded(searchRequest);
    }

    /**
     * @ngdoc function
     * @name updateLocation
     * @methodOf cat.service.search:catSearchService
     *
     * @param {cat.SearchRequest} searchRequest the search request from which to update the $location service
     *
     * @description
     * This methods updates the browsers address bar via the $location service to reflect the given SearchRequest
     */
    updateLocation(searchRequest) {
        if (!searchRequest) {
            return;
        }

        let pagination = searchRequest.pagination();
        let sort = searchRequest.sort();
        let search = searchRequest.search();
        let ret:any = {};
        ret.page = pagination.page;
        ret.size = pagination.size;
        if (!!sort.property) {
            ret.sort = sort.property;
            ret.rev = sort.isDesc || false;
        }
        _.forEach(_.keys(search), (s) => {
            ret['search.' + s] = search[s];
        });
        this.$location.search(ret);
    }

    /**
     * @ngdoc function
     * @name fromLocation
     * @methodOf cat.service.search:catSearchService
     *
     * @description
     * This methods returns a new instance of {@link cat.SearchRequest} with all parameters set according to the current url search parameters
     */
    fromLocation() {
        return new window.cat.SearchRequest(this.$location.search());
    }
}

/**
 * @ngdoc overview
 * @name cat.service.search
 */
angular.module('cat.service.search', [])
    /**
     * @ngdoc service
     * @name cat.service.search:catUrlEncodingService
     * @module cat.service.search
     *
     * @description
     * A small helper service which encapsulates the url encoding of an object.
     * In it's default version it just delegates to jQuery.param
     */
    .service('catUrlEncodingService', [
        CatUrlEncodingService
    ])
    /**
     * @ngdoc service
     * @name cat.service.search:catSearchService
     * @requires cat.service.search:catUrlEncodingService
     * @module cat.service.search
     *
     * @descripton
     * A helper service which encapsulates several operations which can be performed on a cat.SearchRequest
     */
    .service('catSearchService', [
        '$location',
        'catUrlEncodingService',
        CatSearchService
    ]);
