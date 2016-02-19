/**
 * Created by Thomas on 08/03/2015.
 */

'use strict';

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
    .service('catUrlEncodingService', function () {
        this.encodeAsUrl = function (params) {
            if (!!params && !_.isEmpty(params)) {
                return $.param(params);
            }

            return '';
        };
    })
    /**
     * @ngdoc service
     * @name cat.service.search:catSearchService
     * @requires cat.service.search:catUrlEncodingService
     * @module cat.service.search
     *
     * @descripton
     * A helper service which encapsulates several operations which can be performed on a cat.SearchRequest
     */
    .service('catSearchService', function ($location, catUrlEncodingService) {

        var _encodeSort = function (_sort) {
            return (!!_sort.property ? 'sort=' + _sort.property + ':' + ((_sort.isDesc === true || _sort.isDesc === 'true') ? 'desc' : 'asc') : '');
        };

        var _encodePagination = function (_pagination) {
            return 'page=' + (!!_pagination.page ? Math.max(0, _pagination.page - 1) : 0) + '&size=' + _pagination.size || 100;
        };
        var _encodeSearch = function (_search) {
            return catUrlEncodingService.encodeAsUrl(_search);
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

        var urlEndoded = function (searchRequest) {
            return _([
                _encodePagination(searchRequest.pagination()),
                _encodeSort(searchRequest.sort()),
                _encodeSearch(searchRequest.search())
            ]).reduce(_concatenate);
        };


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
        this.encodeAsUrl = function (searchRequest) {
            if (!searchRequest) {
                return '';
            }

            return urlEndoded(searchRequest);
        };

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
        this.updateLocation = function (searchRequest) {
            if (!searchRequest) {
                return;
            }

            var pagination = searchRequest.pagination();
            var sort = searchRequest.sort();
            var search = searchRequest.search();
            var ret = {};
            ret.page = pagination.page;
            ret.size = pagination.size;
            if (!!sort.property) {
                ret.sort = sort.property;
                ret.rev = sort.isDesc || false;
            }
            _.forEach(_.keys(search), function (s) {
                ret['search.' + s] = search[s];
            });
            $location.search(ret);
        };

        /**
         * @ngdoc function
         * @name fromLocation
         * @methodOf cat.service.search:catSearchService
         *
         * @description
         * This methods returns a new instance of {@link cat.SearchRequest} with all parameters set according to the current url search parameters
         */
        this.fromLocation = function () {
            return new cat.SearchRequest($location.search());
        };
    });
