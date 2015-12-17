interface ICatI18nMessageSourceService {
    getMessages(locale:string):IPromise<any>;
    getMessage(key:string, locale?:string):IPromise<string>;
    hasMessage(key:string, locale?:string):IPromise<boolean>;
}

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
class CatI18nMessageSourceService implements ICatI18nMessageSourceService {

    constructor(private $q:IQService,
                private catI18nLocaleService:ICatI18nLocaleService,
                private CAT_I18N_DEFAULT_LOCALE:string) {

    }

    private _getLocale(locale) {
        return locale || this.catI18nLocaleService.getDefaultLocale();
    }

    private _getMessages(locale) {
        let localeId = this._getLocale(locale);

        let messages = window.cat.i18n[localeId];
        if (_.isUndefined(messages)) {
            messages = this._getMessages(this.catI18nLocaleService.getDefaultLocale());
        }
        if (localeId !== this.CAT_I18N_DEFAULT_LOCALE && _.isUndefined(messages)) {
            messages = this._getMessages(this.CAT_I18N_DEFAULT_LOCALE);
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
    getMessages(locale) {
        return this.$q.when(this._getMessages(locale));
    }

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
    getMessage(key, locale) {
        let bundle = this._getMessages(locale);
        if (_.isUndefined(bundle) || _.isUndefined(bundle[key])) {
            return this.$q.reject('No message found for key \'' + key + '\' and the given locale \'' + this._getLocale(locale) + '\'');
        }
        return this.$q.when(bundle[key]);
    }


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
    hasMessage(key, locale) {
        let bundle = this._getMessages(locale);
        return this.$q.when(!_.isUndefined(bundle) && !_.isUndefined(bundle[key]));
    };
}

angular
    .module('cat.service.i18n.message', [
        'cat.service.i18n.locale'
    ])
    .service('catI18nMessageSourceService', [
        '$q',
        'catI18nLocaleService',
        'CAT_I18N_DEFAULT_LOCALE',
        CatI18nMessageSourceService
    ]);
