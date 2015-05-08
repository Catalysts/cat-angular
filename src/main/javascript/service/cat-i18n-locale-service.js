'use strict';

/**
 * @ngdoc service
 * @name cat.service.i18n:catI18nLocaleService
 * @module cat.service.i18n
 */
function CatI18nLocaleService($q, $locale, CAT_I18N_DEFAULT_LOCALE) {
    this.getLanguageOfLocale = function (locale) {
        if (_.isUndefined(locale)) {
            return undefined;
        }

        if (locale.indexOf('-') !== -1) {
            return locale.split('-')[0];
        }

        return locale;
    };

    this.getCurrentLocale = function () {
        return $locale.id;
    };

    this.getDefaultLocale = function () {
        return CAT_I18N_DEFAULT_LOCALE;
    };
}

angular.module('cat.service.i18n.locale', [])
/**
 * @ngdoc overview
 * @name cat.service.i18n:CAT_I18N_DEFAULT_LOCALE
 * @constant
 *
 * @description
 * The default locale used for message translation
 */
    .constant('CAT_I18N_DEFAULT_LOCALE', 'de')
    .service('catI18nLocaleService', ['$q', '$locale', 'CAT_I18N_DEFAULT_LOCALE', CatI18nLocaleService]);