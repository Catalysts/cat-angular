'use strict';

/**
 * @ngdoc service
 * @name cat.service.i18n:catI18nMessageSourceService
 * @module cat.service.i18n
 * @service
 *
 * @description
 * A service to retrieve message templates for a given key and locale
 *
 * @param {object} $q DOCTODO
 * @param {object} catI18nLocaleService DOCTODO
 * @param {string} CAT_I18N_DEFAULT_LOCALE DOCTODO
 * @constructor
 */
function CatI18nMessageSourceService($q, catI18nLocaleService, CAT_I18N_DEFAULT_LOCALE) {
    function _getLocale(locale) {
        return locale || catI18nLocaleService.getDefaultLocale();
    }

    function _getMessages(locale) {
        var localeId = _getLocale(locale);

        var messages = window.cat.i18n[localeId];
        if (_.isUndefined(messages)) {
            messages = _getMessages(catI18nLocaleService.getLanguageOfLocale(localeId));
        }
        if (localeId !== CAT_I18N_DEFAULT_LOCALE && _.isUndefined(messages)) {
            messages = _getMessages(CAT_I18N_DEFAULT_LOCALE);
        }

        return messages;
    }

    /**
     * @ngdoc function
     * @name getMessages
     * @methodOf cat.service.i18n:catI18nMessageSourceService
     * @function
     *
     * @description
     * Function which retrieves a message bundle for a given locale
     *
     * @param {String} [locale] the locale in which the messages should be retrieved
     * @returns {Promise} a promise holding the retrieved message bundle
     */
    this.getMessages = function (locale) {
        return $q.when(_getMessages(locale));
    };

    /**
     * @ngdoc function
     * @name getMessage
     * @methodOf cat.service.i18n:catI18nMessageSourceService
     * @function
     *
     * @description
     * Function which retrieves a message for a given key and locale
     *
     * @param {String} key the key of the message to retrieve
     * @param {String} [locale = CAT_I18N_DEFAULT_LOCALE] the locale in which the messages should be retrieved
     * @returns {Promise} a promise holding the retrieved message
     */
    this.getMessage = function (key, locale) {
        var bundle = _getMessages(locale);
        if (_.isUndefined(bundle) || _.isUndefined(bundle[key])) {
            return $q.reject('No message found for key \'' + key + '\' and the given locale \'' + _getLocale(locale) + '\'');
        }
        return $q.when(bundle[key]);
    };


    /**
     * @ngdoc function
     * @name hasMessage
     * @methodOf cat.service.i18n:catI18nMessageSourceService
     * @function
     *
     * @description
     * Function which checks whether or not a message for a given key and locale exists
     *
     * @param {String} key the key of the message to retrieve
     * @param {String} [locale = CAT_I18N_DEFAULT_LOCALE] the locale in which the messages should be available
     * @returns {Promise} a promise holding <code>TRUE</code> if the key can be resolved for the given locale
     */
    this.hasMessage = function (key, locale) {
        var bundle = _getMessages(locale);
        return $q.when(!_.isUndefined(bundle) && !_.isUndefined(bundle[key]));
    };
}

angular.module('cat.service.i18n.message', ['cat.service.i18n.locale'])
    .service('catI18nMessageSourceService', ['$q', 'catI18nLocaleService', 'CAT_I18N_DEFAULT_LOCALE', CatI18nMessageSourceService]);
