'use strict';

/**
 * @ngdoc service
 * @name catBreadcrumbService
 * @service
 *
 * @description
 *
 * This service is a simple wrapper around a list of Objects.
 * It provides some convenience methods for manipulating the list.
 * It's main purpose is to make breadcrumb handling less cumbersome.
 *
 * @constructor
 */
function CatBreadcrumbsService(catBreadcrumbs) {
    var that = this;

    this.clear = function () {
        catBreadcrumbs.length = 0;
    };

    this.set = function (bcs) {
        that.clear();
        _.forEach(bcs, function (bc) {
            catBreadcrumbs.push(bc);
        });
    };

    this.get = function () {
        return catBreadcrumbs;
    };

    this.addFirst = function (entry) {
        catBreadcrumbs.unshift(entry);
    };

    this.removeFirst = function () {
        return catBreadcrumbs.shift();
    };

    this.push = function (entry) {
        catBreadcrumbs.push(entry);
    };

    this.pop = function () {
        return catBreadcrumbs.pop();
    };

    this.length = function () {
        return catBreadcrumbs.length;
    };

    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.substring(1);
    }

    this.replaceLast = function (newVal) {
        catBreadcrumbs[catBreadcrumbs.length - 1] = newVal;
    };

    function splitShiftAndJoin(path, amount) {
        return _.initial(path.split('/'), amount).join('/');
    }

    /**
     * This method auto-generates the breadcrumbs from a given view configuration
     * @param {Object} config a config object as provided to CatBaseDetailController
     * @return {Array} an array which represents the 'ui stack' of directly related parents
     */
    this.generateFromConfig = function (config) {
        that.clear();
        var uiStack = [];
        if (!_.isUndefined(config.endpoint.parentEndpoint)) {
            var currentEndpoint = config.endpoint;
            var parentEndpoint = currentEndpoint.parentEndpoint;
            var parentUrl = config.baseUrl;
            var count = 0;

            while (!_.isUndefined(parentEndpoint)) {
                var parent = config.parents[count++];
                parentUrl = splitShiftAndJoin(parentUrl, 1);

                var detailBreadcrumb = {
                    url: '#' + parentUrl + '?tab=' + currentEndpoint.getEndpointName(),
                    title: parent.name
                };
                uiStack.unshift(detailBreadcrumb);
                that.addFirst(detailBreadcrumb);

                parentUrl = splitShiftAndJoin(parentUrl, 1);
                var breadcrumb = {
                    title: capitalize(window.cat.util.pluralize(parentEndpoint.getEndpointName())),
                    key: 'cc.catalysts.cat-breadcrumbs.entry.' + config.endpoint.getEndpointName(),
                    url: '#' + parentUrl
                };
                that.addFirst(breadcrumb);

                currentEndpoint = parentEndpoint;
                parentEndpoint = currentEndpoint.parentEndpoint;
            }
        } else {
            that.push({
                title: capitalize(window.cat.util.pluralize(config.endpoint.getEndpointName())),
                key: 'cc.catalysts.cat-breadcrumbs.entry.' + config.endpoint.getEndpointName(),
                url: '#' + config.baseUrl
            });
        }
        return uiStack;
    };
}

angular.module('cat.service.breadcrumbs')
    .value('catBreadcrumbs', [])
    .service('catBreadcrumbsService', CatBreadcrumbsService);