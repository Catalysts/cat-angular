'use strict';


/**
 * @ngdoc service
 * @name cat.service.breadcrumbs:catBreadcrumbService
 * @service
 *
 * @description
 * This service is a simple wrapper around a list of Objects.
 * It provides some convenience methods for manipulating the list.
 * It's main purpose is to make breadcrumb handling less cumbersome.
 *
 * @constructor
 */
function CatBreadcrumbsService(catBreadcrumbs, $state) {
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
            var count = 0;
            var parentState = '^.^';

            while (!_.isUndefined(parentEndpoint)) {
                var parent = config.parents[count++];

                var detailBreadcrumb = {
                    url: $state.href(parentState) + '?tab=' + currentEndpoint.getEndpointName(),
                    title: parent.name
                };
                uiStack.unshift(detailBreadcrumb);
                that.addFirst(detailBreadcrumb);

                var breadcrumb = {
                    title: capitalize(window.cat.util.pluralize(parentEndpoint.getEndpointName())),
                    key: 'cc.catalysts.cat-breadcrumbs.entry.' + parentEndpoint.getEndpointName(),
                    url: $state.href(parentState+'.^.list')
                };
                that.addFirst(breadcrumb);

                currentEndpoint = parentEndpoint;
                parentEndpoint = currentEndpoint.parentEndpoint;

                parentState += '.^.^';
            }
        } else {
            that.push({
                title: capitalize(window.cat.util.pluralize(config.endpoint.getEndpointName())),
                key: 'cc.catalysts.cat-breadcrumbs.entry.' + config.endpoint.getEndpointName(),
                url: $state.href('^.list')
            });
        }
        return uiStack;
    };
}

angular.module('cat.service.breadcrumbs')

/**
 * @ngdoc overview
 * @name cat.service.breadcrumbs:catBreadcrumbs
 */
    .value('catBreadcrumbs', [])
    .service('catBreadcrumbsService', CatBreadcrumbsService);