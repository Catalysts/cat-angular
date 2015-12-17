interface ICatI18nResponseHandler {
    handleTranslationSuccess(translation:string, scope:IScope, element:IAugmentedJQuery):void;
    handleTranslationError(reason:any, scope:IScope, element:IAugmentedJQuery):void;
}

class CatI18nResponseHandler implements ICatI18nResponseHandler {
    handleTranslationSuccess(translation:string,
                             scope:IScope,
                             element:IAugmentedJQuery):void {
        element.text(translation);
    }

    handleTranslationError(reason:any,
                           scope:CatI18nScope,
                           element:IAugmentedJQuery):void {
        element.text('##missingkey: ' + scope.key);
    }
}

/**
 * @ngdoc service
 * @name cat.directives.i18n.responseHandler:catI18nResponseHandler
 */
angular
    .module('cat.service.i18n.responseHandler', [])
    .service('catI18nResponseHandler', [
        CatI18nResponseHandler
    ]);
