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

        var currentState = $state.$current.parent;
        var currentEndpoint = config.endpoint;
        var count = 0;
        var parents = '^';

        while (!!currentState && !!currentState.parent) {
            var stateName = currentState.name;

            if (!/\.tab$/g.test(stateName)) {
                var href = $state.href(parents);

                var breadcrumb = {};

                if (config.parents.length > count) {
                    var parent = config.parents[count++];
                    var regex = new RegExp('/' + window.cat.util.pluralize(currentEndpoint.getEndpointName()) + '$');
                    href = href.replace(regex, '?tab=' + currentEndpoint.getEndpointName());

                    breadcrumb = {
                        url: href,
                        title: parent.name
                    };

                    uiStack.unshift(breadcrumb);
                } else {
                    breadcrumb = {
                        title: capitalize(window.cat.util.pluralize(currentEndpoint.getEndpointName())),
                        key: 'cc.catalysts.cat-breadcrumbs.entry.' + currentEndpoint.getEndpointName(),
                        url: href
                    };
                }

                that.addFirst(breadcrumb);
                currentEndpoint = currentEndpoint.parentEndpoint;
            }

            currentState = currentState.parent;
            parents += '.^';
        }
        return uiStack;
    };
}

angular.module('cat.service.breadcrumbs', [])

/**
 * @ngdoc overview
 * @name cat.service.breadcrumbs:catBreadcrumbs
 */
    .value('catBreadcrumbs', [])
    .service('catBreadcrumbsService', CatBreadcrumbsService);