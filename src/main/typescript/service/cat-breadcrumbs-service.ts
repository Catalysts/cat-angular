interface CatBreadcrumb {
    url?: string;
    title?: string;
    key?: string;
}

interface ICatBreadcrumbsService {
    clear():void;
    set(bcs:CatBreadcrumb[]);
    get():CatBreadcrumb[];
    addFirst(entry:CatBreadcrumb):void;
    removeFirst():CatBreadcrumb;
    push(entry:CatBreadcrumb):void;
    pop():CatBreadcrumb;
    length():number;
    replaceLast(newVal:CatBreadcrumb):void;
    generateFromConfig(config:ICatBaseViewConfig):CatBreadcrumb[];
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
class CatBreadcrumbsService implements ICatBreadcrumbsService {

    constructor(private catBreadcrumbs:Array<CatBreadcrumb>,
                private $state:IStateService) {

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
    generateFromConfig(config:ICatBaseViewConfig):CatBreadcrumb[] {
        this.clear();
        let uiStack:CatBreadcrumb[] = [];

        let currentState = this.$state.$current['parent'];
        let currentEndpoint:ICatApiEndpoint = config.endpoint;
        let count:number = 0;
        let parents:string = '^';

        while (!!currentState && !!currentState.parent) {
            let stateName = currentState.name;

            if (!/\.tab$/g.test(stateName)) {
                let href = this.$state.href(parents);

                let breadcrumb:CatBreadcrumb;

                if (config.parents.length > count) {
                    let parent = config.parents[count++];
                    let regex = new RegExp('/' + window.cat.util.pluralize(currentEndpoint.getEndpointName()) + '$');
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

angular
    .module('cat.service.breadcrumbs', [])
    /**
     * @ngdoc overview
     * @name cat.service.breadcrumbs:catBreadcrumbs
     */
    .value('catBreadcrumbs', [])
    .service('catBreadcrumbsService', [
        'catBreadcrumbs',
        '$state',
        CatBreadcrumbsService
    ]);