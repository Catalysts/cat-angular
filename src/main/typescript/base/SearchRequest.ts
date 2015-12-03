'use strict';

interface Sort {
    property?:string;
    isDesc?:boolean|string;
}
interface Pagination {
    page:number;
    size:number;
}

interface SearchUrlParams {
    page?:number;
    size?:number;
    sort?:string;
    rev?:boolean;
}

/**
 * @ngdoc function
 * @name cat.SearchRequest
 * @module cat
 *
 * @description
 * A 'SearchRequest' model used by the catApiService to provide the backend with certain filter, order, page and size
 * parameters.
 *
 *
 * @param {Object} [searchUrlParams] an object representing the search parameters of the current url, which are
 * used to initialize the properties of the SearchRequest
 * @constructor
 */
export class SearchRequest {

    private _pagination:Pagination = {
        page: 1,
        size: 100
    };
    private _sort:Sort = {};
    private _search = {};
    private _dirty:boolean = false;

    private lastEncoded;


    constructor(searchUrlParams:SearchUrlParams = {}) {
        if (!_.isEmpty(searchUrlParams)) {
            this._pagination.page = searchUrlParams.page || this._pagination.page;
            this._pagination.size = searchUrlParams.size || this._pagination.size;
            this._sort.property = searchUrlParams.sort || this._sort.property;
            this._sort.isDesc = searchUrlParams.rev || this._sort.isDesc;
            _.forEach(_.keys(searchUrlParams), (param:string) => {
                if (param.indexOf('search.') > -1 && param.length > 7) {
                    this._search[param.substring(7)] = searchUrlParams[param];
                }
            });
        }
    }

    private _encodeSort() {
        let _sort = this._sort;
        return (!!_sort.property ? 'sort=' + _sort.property + ':' + ((_sort.isDesc === true || _sort.isDesc === 'true') ? 'desc' : 'asc') : '');
    }

    private _encodePagination() {
        let _pagination = this._pagination;
        return 'page=' + (!!_pagination.page ? Math.max(0, _pagination.page - 1) : 0) + '&size=' + _pagination.size || 100;
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

    private _encodeSearch() {
        if (!!this._search && !_.isEmpty(this._search)) {
            return $.param(this._search, true);
        }

        return '';
    }

    private _urlEndoded() {
        return _([this._encodePagination(), this._encodeSort(), this._encodeSearch()]).reduce(SearchRequest._concatenate);
    }


    /**
     * @param {Object} [pagination] if given this object overrides the current 'pagination' state
     * @returns {{}} the object representing the current pagination state
     */
    pagination(pagination:Pagination) {
        if (pagination === undefined) {
            return this._pagination;
        } else {
            this._pagination = pagination;
            this._dirty = true;
            return this._pagination;
        }
    }


    /**
     * @param {Object} [sort] if given this object overrides the current 'sort' state
     * @returns {{}} the object representing the current sort state
     */
    sort(sort) {
        if (sort === undefined) {
            return this._sort;
        } else {
            this._sort = sort;
            this._dirty = true;
            return this._sort;
        }
    }

    /**
     * @param {Object} [search] if given this object overrides the current 'search' state
     * @returns {{}} the object representing the current search state
     */
    search(search) {
        if (search === undefined) {
            return this._search;
        } else {
            this._search = search;
            this._dirty = true;
            return this._search;
        }
    }


    /**
     * @deprecated use catSearchService#encodeAsUrl instead
     *
     * @returns {String} a string representation of the current SearchRequest which can be used as part of the request
     * url
     */
    urlEncoded() {
        this.lastEncoded = this._urlEndoded();
        return this.lastEncoded;
    }

    /**
     * @returns {boolean} <code>true</code> if something changed since the last time {@link this#urlEncoded} was called
     */
    isDirty() {
        return this._dirty;
    }

    setPristine() {
        this._dirty = false;
    }

    /**
     * @deprecated use catSearchService#updateLocation instead
     *
     * A small helper function to update the current url to correctly reflect all properties set within this
     * SearchRequest
     * @param $location the angular $location service
     */
    setSearch($location) {
        let ret:any = {};
        ret.page = this._pagination.page;
        ret.size = this._pagination.size;
        if (!!this._sort.property) {
            ret.sort = this._sort.property;
            ret.rev = this._sort.isDesc || false;
        }
        _.forEach(_.keys(this._search), (s:string) => {
            ret['search.' + s] = this._search[s];
        });
        $location.search(ret);
    }
}

window.cat.SearchRequest = SearchRequest;