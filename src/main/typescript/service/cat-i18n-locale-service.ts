import ILocaleService = angular.ILocaleService;

interface ICatI18nLocaleService {
    getLanguageOfLocale(locale?:string):string|void;
    getCurrentLocale():string;
    getDefaultLocale():string;
}

/**
 * @ngdoc service
 * @name cat.service.i18n:catI18nLocaleService
 * @module cat.service.i18n
 */
class CatI18nLocaleService implements ICatI18nLocaleService {
    constructor(private $locale:ILocaleService,
                private CAT_I18N_DEFAULT_LOCALE:string) {

    }

    getLanguageOfLocale(locale) {
        if (_.isUndefined(locale)) {
            return undefined;
        }

        if (locale.indexOf('-') !== -1) {
            return locale.split('-')[0];
        }

        return locale;
    }

    getCurrentLocale() {
        return this.$locale.id;
    }

    getDefaultLocale() {
        return this.CAT_I18N_DEFAULT_LOCALE;
    }
}

angular
    .module('cat.service.i18n.locale', [])
    /**
     * @ngdoc overview
     * @name cat.service.i18n:CAT_I18N_DEFAULT_LOCALE
     * @constant
     *
     * @description
     * The default locale used for message translation
     */
    .constant('CAT_I18N_DEFAULT_LOCALE', 'de')
    .service('catI18nLocaleService', [
        '$locale',
        'CAT_I18N_DEFAULT_LOCALE',
        CatI18nLocaleService
    ]);