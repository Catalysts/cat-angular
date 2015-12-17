interface CatPaginatedScope<T> extends IScope {
    catPaginatedController:ICatPaginatedController
    listData?:ICatListData<T>;
    syncLocation?:boolean;
    searchProps:string[];
    searchPropertyPlaceholders:{[property:string]:string};
}

interface CatPaginatedAttributes extends IAttributes {
    searchProps?:string;
}

interface ICatPaginatedController {

    sort(newVal:Sort, oldVal?:Sort):void;

    getSearch():any;

    getSearchRequest():SearchRequest;
}

class CatPaginatedController implements ICatPaginatedController {

    private searchTimeout = null;
    private searchRequest:SearchRequest;

    private static DELAY_ON_SEARCH = 500;
    private static PAGINATION_PREVIOUS_KEY = 'cc.catalysts.cat-paginated.pagination.previous';
    private static PAGINATION_NEXT_KEY = 'cc.catalysts.cat-paginated.pagination.next';
    private static PAGINATION_FIRST_KEY = 'cc.catalysts.cat-paginated.pagination.first';
    private static PAGINATION_LAST_KEY = 'cc.catalysts.cat-paginated.pagination.last';

    constructor(private $scope,
                private $location,
                private $timeout,
                private $rootScope,
                private catListDataLoadingService,
                private catI18nService,
                private catSearchService) {
        this.initScopeProperties();
        this.registerScopeEventHandlers();
        this.registerScopeWatches();
    }

    private initScopeProperties() {
        if (_.isUndefined(this.$scope.listData)) {
            this.$scope.listData = this.$scope.$parent.listData;

            if (_.isUndefined(this.$scope.listData)) {
                throw new Error('listData was not defined and couldn\'t be found with default value');
            }
        }

        if (_.isUndefined(this.$scope.syncLocation)) {
            this.$scope.syncLocation = _.isUndefined(this.$scope.$parent.detail);
        }

        this.$scope.paginationText = {
            previous: 'Previous',
            next: 'Next',
            first: 'First',
            last: 'Last'
        };

        this._loadPaginationTranslations();

        this.$scope.listData.search = this.$scope.listData.search || this.$scope.listData.searchRequest.search() || {};

        this.searchRequest = this.$scope.listData.searchRequest;

    }

    private registerScopeWatches() {
        this.$scope.$watch('listData.sort', function (newVal) {
            if (!!newVal) {
                console.log('broadcasting sort changed: ' + angular.toJson(newVal));
                this.$scope.$parent.$broadcast('SortChanged', newVal);
            }
        }, true);


        this.$scope.$watch('listData.search', this.updateSearch, true);

        this.$scope.$watch('listData.pagination', (newVal, oldVal) => {
            // TODO check wheter or not this is necessary with angular >= 1.3
            if (angular.equals(newVal, oldVal)) {
                return;
            }
            this.searchRequest.pagination(this.$scope.listData.pagination);
            this.updateLocation();
            this.reload();
        }, true);
    }

    private registerScopeEventHandlers() {
        this.$rootScope.$on('cat-i18n-refresh', () => {
            this._loadPaginationTranslations();
        });

        this.$scope.$on('cat-paginated-refresh', () => {
            this.reload(0, true);
        });


        this.$scope.$on('SortChanged', function (event, value) {
            this.sort(value);
        });
    }

    private handlePaginationTextResponse(prop) {
        return (message) => {
            this.$scope.paginationText[prop] = message;
        };
    }


    private _loadPaginationTranslations() {
        this.catI18nService.translate(CatPaginatedController.PAGINATION_PREVIOUS_KEY).then(this.handlePaginationTextResponse('previous'));
        this.catI18nService.translate(CatPaginatedController.PAGINATION_NEXT_KEY).then(this.handlePaginationTextResponse('next'));
        this.catI18nService.translate(CatPaginatedController.PAGINATION_FIRST_KEY).then(this.handlePaginationTextResponse('first'));
        this.catI18nService.translate(CatPaginatedController.PAGINATION_LAST_KEY).then(this.handlePaginationTextResponse('last'));
    }

    private reload(delay = 0, force = false) {
        this.$timeout.cancel(this.searchTimeout);
        this.searchTimeout = this.$timeout(() => {
            if (this.searchRequest.isDirty() || force) {
                this.catListDataLoadingService.load(this.$scope.listData.endpoint, this.searchRequest).then(
                    (data) => {
                        this.searchRequest.setPristine();
                        _.assign(this.$scope.listData, data);
                    }
                );
            }
        }, delay);
    }

    private updateLocation() {
        if (this.$scope.syncLocation !== false) {
            this.catSearchService.updateLocation(this.searchRequest);
            this.$location.replace();
        }
    }

    private searchChanged(value, delay) {
        this.searchRequest.search(value);
        this.updateLocation();
        this.$scope.listData.pagination.page = 1;
        this.reload(delay);
    }

    private updateSearch(newVal, oldVal) {
        // TODO check wheter or not this is necessary with angular >= 1.3
        if (angular.equals(newVal, oldVal)) {
            return;
        }
        let search = this.searchRequest.search();
        _.assign(search, newVal);
        this.searchChanged(newVal, CatPaginatedController.DELAY_ON_SEARCH);
    }

    sort(newVal:Sort, oldVal?:Sort) {
        // TODO check wheter or not this is necessary with angular >= 1.3
        if (angular.equals(newVal, oldVal)) {
            return;
        }
        this.searchRequest.sort(newVal);
        this.updateLocation();
        this.$scope.listData.pagination.page = 1;
        this.reload();
    }


    getSearch() {
        return this.searchRequest.search();
    }

    getSearchRequest() {
        return this.searchRequest;
    }
}

function catPaginatedDirectiveFactory(catI18nService:ICatI18nService):IDirective {
    let SEARCH_PROP_KEY = 'cc.catalysts.cat-paginated.search.prop';

    return {
        replace: true,
        restrict: 'E',
        transclude: true,
        scope: {
            listData: '=?',
            syncLocation: '=?'
        },
        templateUrl: 'template/cat-paginated.tpl.html',
        link: function CatPaginatedLink(scope:CatPaginatedScope<any>,
                                        element:IAugmentedJQuery,
                                        attrs:CatPaginatedAttributes) {
            if (!!attrs.searchProps) {
                scope.searchProps = _.filter(attrs.searchProps.split(','), function (prop) {
                    return !!prop;
                });

                scope.searchPropertyPlaceholders = {};

                _.forEach(scope.searchProps, function (searchProp) {
                    scope.searchPropertyPlaceholders[searchProp] = 'Search by ' + searchProp;
                    catI18nService.translate(SEARCH_PROP_KEY, {prop: searchProp})
                        .then(function (message) {
                            scope.searchPropertyPlaceholders[searchProp] = message;
                        });
                });
            }
        },
        controllerAs: 'catPaginatedController',
        controller: CatPaginatedController
    };
}

/**
 * @ngdoc directive
 * @name cat.directives.paginated:catPaginated
 */
angular
    .module('cat.directives.paginated', [
        'ui.bootstrap.pagination',
        'cat.service.listDataLoading',
        'cat.service.i18n',
        'cat.service.search'
    ])
    .directive('catPaginated', [
        'catI18nService',
        catPaginatedDirectiveFactory
    ]);
