interface ICatListScope<T> extends IScope {
    listData:ICatListData<T>;
}

interface ICatBaseListController {
    titleKey:string;
    title:string;
    searchProps:any;
    config:ICatListConfig;

    remove(id):void;
}

class CatBaseListController implements ICatBaseListController {

    titleKey:string;
    title:string;
    searchProps:any;

    /**
     * @ngdoc controller
     * @name cat.controller.base.list:CatBaseListController
     * @module cat.controller.base.list
     *
     * @description
     * The CatBaseListController takes care of providing several common properties to the scope
     * of every list page. It also instantiates the controller given via the config.controller parameter and shares
     * the same scope with it. In addition it has a common template 'cat-base-list.tpl.html' which shows a title,
     * new button and provides the cat-paginated directive.
     *
     * Common properties include:
     * * listData - the listData to be used by cat-paginated
     * * title - the title of the view
     * * searchProps - the list of search properties passed on to the cat-paginated directive
     * * config - the config object used to instantiate this view
     *
     * @param {object} $scope scope
     * @param {object} $state state service
     * @param {object} $controller controller
     * @param {object} $log log
     * @param {object} catBreadcrumbsService catBreadcrumbsService
     * @param {object} catListDataLoadingService catListDataLoadingService
     * @param {object} config holds data like the listData object, the template url, base url, the model constructor, etc.
     */
    constructor(private $scope:ICatListScope<any>,
                private $state:IStateService,
                $controller:any,
                private $log:ILogService,
                catBreadcrumbsService:ICatBreadcrumbsService,
                private catListDataLoadingService:ICatListDataLoadingService,
                public config:ICatListConfig) {

        if (!_.isUndefined(config.listData)) {
            this.titleKey = 'cc.catalysts.cat-breadcrumbs.entry.' + config.listData.endpoint.getEndpointName();

            catBreadcrumbsService.set([
                {
                    title: config.title,
                    key: this.titleKey
                }
            ]);

            $scope.listData = config.listData;
        } else {
            $log.warn('No listData available!');
        }

        this.title = config.title;
        this.searchProps = config.searchProps;
        this.config = config;


        try {
            // extend with custom controller
            $controller(config.controller, {$scope: $scope, listData: config.listData, config: config});
        } catch (unused) {
            $log.info('Couldn\'t instantiate controller with name ' + config.controller);
        }
    }

    getUrlForId(id) {
        this.$log.warn('use ui-sref directly - this method will be removed in the near future');
        return this.$state.href('^.detail', {id: id});
    }

    getUrlForNewPage() {
        return this.getUrlForId('new');
    }

    remove(id) {
        let endpoint = this.config.listData.endpoint;
        endpoint
            .remove(id)
            .then(() => {
                return this.catListDataLoadingService
                    .load(this.config.listData.endpoint, this.config.listData.searchRequest);
            })
            .then((data) => {
                return _.assign(this.$scope.listData, data);
            });
    }
}


angular
    .module('cat.controller.base.list', [
        'cat.service.breadcrumbs'
    ])
    .controller('CatBaseListController', [
        '$scope',
        '$state',
        '$controller',
        '$log',
        'catBreadcrumbsService',
        'catListDataLoadingService',
        'config',
        CatBaseListController
    ]);
