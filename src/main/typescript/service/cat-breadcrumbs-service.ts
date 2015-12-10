'use strict';

interface CatBreadcrumb {
    url: string;
    title: string;
    key?: string;
}

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
class CatBreadcrumbsService {

    constructor(private catBreadcrumbs:Array<CatBreadcrumb>,
                private $state) {

    }

    clear() {
        this.catBreadcrumbs.length = 0;
    }

    set(bcs:Array<CatBreadcrumb>) {
        this.clear();
        _.forEach(bcs, (bc) => {
            this.catBreadcrumbs.push(bc);
        });
    }

    get() {
        return this.catBreadcrumbs;
    }

    addFirst(entry:CatBreadcrumb) {
        this.catBreadcrumbs.unshift(entry);
    }

    removeFirst() {
        return this.catBreadcrumbs.shift();
    }

    push(entry:CatBreadcrumb) {
        this.catBreadcrumbs.push(entry);
    }

    pop() {
        return this.catBreadcrumbs.pop();
    }

    length() {
        return this.catBreadcrumbs.length;
    }

    replaceLast(newVal:CatBreadcrumb) {
        this.catBreadcrumbs[this.catBreadcrumbs.length - 1] = newVal;
    }

    /**
     * This method auto-generates the breadcrumbs from a given view configuration
     * @param {Object} config a config object as provided to CatBaseDetailController
     * @return {Array} an array which represents the 'ui stack' of directly related parents
     */
    generateFromConfig(config) {
        this.clear();
        var uiStack = [];

        var currentState = this.$state.$current.parent;
        var currentEndpoint = config.endpoint;
        var count = 0;
        var parents = '^';

        while (!!currentState && !!currentState.parent) {
            var stateName = currentState.name;

            if (!/\.tab$/g.test(stateName)) {
                var href = this.$state.href(parents);

                var breadcrumb:CatBreadcrumb;

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
                        title: window.cat.util.capitalize(window.cat.util.pluralize(currentEndpoint.getEndpointName())),
                        key: 'cc.catalysts.cat-breadcrumbs.entry.' + currentEndpoint.getEndpointName(),
                        url: href
                    };
                }

                this.addFirst(breadcrumb);
                currentEndpoint = currentEndpoint.parentEndpoint;
            }

            currentState = currentState.parent;
            parents += '.^';
        }
        return uiStack;
    }
}

angular.module('cat.service.breadcrumbs', [])

/**
 * @ngdoc overview
 * @name cat.service.breadcrumbs:catBreadcrumbs
 */
    .value('catBreadcrumbs', [])
    .service('catBreadcrumbsService', CatBreadcrumbsService);