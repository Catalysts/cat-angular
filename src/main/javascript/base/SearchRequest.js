'use strict';

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
window.cat.SearchRequest = function (searchUrlParams) {

    var _pagination = {
        page: 1,
        size: 100
    };
    var _sort = {};
    var _search = {};
    var _dirty = false;

    var lastEncoded;

    if (!!searchUrlParams && !_.isEmpty(searchUrlParams)) {
        _pagination.page = searchUrlParams.page || _pagination.page;
        _pagination.size = searchUrlParams.size || _pagination.size;
        _sort.property = searchUrlParams.sort || _sort.property;
        _sort.isDesc = searchUrlParams.rev || _sort.isDesc;
        _.forEach(_.keys(searchUrlParams), function (param) {
            if (param.indexOf('search.') > -1 && param.length > 7) {
                _search[param.substring(7)] = searchUrlParams[param];
            }
        });
    }

    var _encodeSort = function () {
        if(!!_sort.property) {
            var properties = _sort.property.split(';');
            var result = 'sort=';
            for(var i = 0; i< properties.length; i++) {
                result += properties[i] + ':' + ((_sort.isDesc === true || _sort.isDesc === 'true') ? 'desc' : 'asc') + ';';
            }
            return result.slice(0, -1);
        } else {
            return '';
        }
    };

    var _encodePagination = function () {
        return 'page=' + (!!_pagination.page ? Math.max(0, _pagination.page - 1) : 0) + '&size=' + _pagination.size || 100;
    };

    var _concatenate = function (result, next) {
        if (!result) {
            return next;
        }

        if (!next) {
            return result;
        }
        return result + '&' + next;
    };

    var _encodeSearch = function () {
        if (!!_search && !_.isEmpty(_search)) {
            return $.param(_search, true);
        }

        return '';
    };

    var urlEndoded = function () {
        return _([_encodePagination(), _encodeSort(), _encodeSearch()]).reduce(_concatenate);
    };

    /**
     * @param {Object} [pagination] if given this object overrides the current 'pagination' state
     * @returns {{}} the object representing the current pagination state
     */
    this.pagination = function (pagination) {
        if (pagination === undefined) {
            return _pagination;
        } else {
            _pagination = pagination;
            _dirty = true;
            return _pagination;
        }
    };


    /**
     * @param {Object} [sort] if given this object overrides the current 'sort' state
     * @returns {{}} the object representing the current sort state
     */
    this.sort = function (sort) {
        if (sort === undefined) {
            return _sort;
        } else {
            _sort = sort;
            _dirty = true;
            return _sort;
        }
    };

    /**
     * @param {Object} [search] if given this object overrides the current 'search' state
     * @returns {{}} the object representing the current search state
     */
    this.search = function (search) {
        if (search === undefined) {
            return _search;
        } else {
            _search = search;
            _dirty = true;
            return _search;
        }
    };

    /**
     * @deprecated use catSearchService#encodeAsUrl instead
     *
     * @returns {String} a string representation of the current SearchRequest which can be used as part of the request
     * url
     */
    this.urlEncoded = function () {
        lastEncoded = urlEndoded();
        return lastEncoded;
    };

    this.setPristine = function () {
        _dirty = false;
    };

    /**
     * @returns {boolean} <code>true</code> if something changed since the last time {@link this#urlEncoded} was called
     */
    this.isDirty = function () {
        return _dirty;
    };

    /**
     * @deprecated use catSearchService#updateLocation instead
     *
     * A small helper function to update the current url to correctly reflect all properties set within this
     * SearchRequest
     * @param $location the angular $location service
     */
    this.setSearch = function ($location) {
        var ret = {};
        ret.page = _pagination.page;
        ret.size = _pagination.size;
        if (!!_sort.property) {
            ret.sort = _sort.property;
            ret.rev = _sort.isDesc || false;
        }
        _.forEach(_.keys(_search), function (s) {
            ret['search.' + s] = _search[s];
        });
        $location.search(ret);
    };
};