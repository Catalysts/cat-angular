import IAttributes = angular.IAttributes;
import INgModelController = angular.INgModelController;
import IAugmentedJQuery = angular.IAugmentedJQuery;
import IScope = angular.IScope;
import IWindowService = angular.IWindowService;
import IDirective = angular.IDirective;
import IHttpPromise = angular.IHttpPromise;
import IPromise = angular.IPromise;
import ILocaleService = angular.ILocaleService;
import ILocationService = angular.ILocationService;
import IStateService = angular.ui.IStateService;
import IState = angular.ui.IState;
import ILogService = angular.ILogService;
import IHttpPromiseCallbackArg = angular.IHttpPromiseCallbackArg;
import IRequestConfig = angular.IRequestConfig;
import IStateParamsService = angular.ui.IStateParamsService;
import IControllerService = angular.IControllerService;
import IServiceProvider = angular.IServiceProvider;
import IQService = angular.IQService;
import IHttpInterceptor = angular.IHttpInterceptor;
import IRootScopeService = angular.IRootScopeService;
import ITimeoutService = angular.ITimeoutService;
import IFormController = angular.IFormController;
import IAngularEvent = angular.IAngularEvent;

interface ISelect2AugmentedJQuery extends IAugmentedJQuery {
    select2(...args):ISelect2AugmentedJQuery;
}

interface CatRequestConfig extends IRequestConfig {
    catValidationContextId?:string;
}

interface CatHttpPromiseCallbackArg<T> extends IHttpPromiseCallbackArg<T> {
    config?:CatRequestConfig;
}

interface CatI18nTranslations {
    'cc.catalysts.cat-paginated.itemsFound': string;
    'cc.catalysts.cat-paginated.noItemsFound': string;
    'cc.catalysts.general.new': string;
    'cc.catalysts.general.edit': string;
    'cc.catalysts.general.delete': string;
    'cc.catalysts.general.copy': string;
    'cc.catalysts.general.save': string;
    'cc.catalysts.general.cancel': string;
    'cc.catalysts.cat-breadcrumbs.entry.home': string;
    'cc.catalysts.cat-breadcrumbs.entry.edit': string;
    'cc.catalysts.cat-field-errors-info.text': string;
    'cc.catalysts.cat-validation-service.networkError': string;
}

interface CatGlobals {
    i18n:{[language:string]:CatI18nTranslations}
    SearchRequest: new(data?:any)=>SearchRequest;
    Facet: new(data?:any)=>Facet;
    FacetTerm: new(data?:any)=>FacetTerm;
    util: CatUtils;
    models:{[name:string]:new(data?:any)=>any};
}

interface Window {
    cat: CatGlobals;
}