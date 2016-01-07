/**
 * Created by tscheinecker on 21.10.2014.
 */

interface ICatI18nService {
    translate(key:string, parameters?:any, locale?:string):IPromise<string>;
    canTranslate(key:string, locale?:string):IPromise<boolean>;
}

class CatI18nService implements ICatI18nService {

    constructor(private $q:IQService,
                private $log:ILogService,
                private catI18nMessageSourceService:ICatI18nMessageSourceService,
                private catI18nMessageParameterResolver:(string, any)=>string) {

    }

    /**
     * @name catI18nService#translate
     * @function
     *
     * @description
     * Tries to resolve the given key to a message of the given locale. The messages are retrieved from the
     * {@link catI18nMessageSourceService} and then passed through {@link catI18nMessageParameterResolver}.
     *
     * @param {String} key the key of the message to be translated
     * @param {Object|Array} [parameters] message parameters usable in the resolved message
     * @param {String} [locale = CAT_I18N_DEFAULT_LOCALE] the locale to use for translation
     * @returns {promise} Returns a promise of the translated key
     */
    translate(key, parameters, locale) {
        let model = parameters;

        if (_.isArray(parameters)) {
            parameters.forEach((value, idx) => {
                model['p' + idx] = value;
            });
        }

        return this
            .canTranslate(key, locale)
            .then((canTranslate) => {
                if (canTranslate) {
                    return this.catI18nMessageSourceService.getMessage(key, locale)
                } else {
                    let reason = 'No translation for key \'' + key + '\' available!';
                    return this.$q.reject(reason);
                }
            })
            .then((message) => {
                let translation = this.catI18nMessageParameterResolver(message, model);
                if (_.isString(translation)) {
                    return translation;
                } else {
                    this.$log.warn('Didn\'t get a string from catI18nMessageParameterResolver');
                    return this.$q.reject(translation);
                }
            })
            .then(undefined, (reason) => {
                this.$log.warn(reason);
                return this.$q.reject(reason);
            });
    }

    /**
     * @name catI18nService#canTranslate
     * @function
     *
     * @description
     * Wraps an object that might be a value or a (3rd party) then-able promise into a $q promise.
     * This is useful when you are dealing with an object that might or might not be a promise, or if
     * the promise comes from a source that can't be trusted.
     *
     * @param {String} key the key of the message to be translated
     * @param {String} [locale] the locale to use for translation
     * @returns {promise} Returns a promise which resolves to true when a message for the given key exists for the
     * specified locale
     */
    canTranslate(key, locale) {
        return this.catI18nMessageSourceService
            .getMessages(locale)
            .then((messages) => {
                return !_.isUndefined(messages) && !_.isUndefined(messages[key]);
            });
    }
}

angular
    .module('cat.service.i18n', [
        'cat.service.i18n.message',
        'cat.service.i18n.responseHandler'
    ])
    /**
     * @ngdoc service
     * @name cat.service.i18n:catI18nMessageParameterResolver
     * @value
     *
     * @description
     * A function which accepts a message and parameters and returns the resolved message
     */
    .value('catI18nMessageParameterResolver', (message, parameters) => {
        return _.template(message, {interpolate: /{{([\s\S\d]+?)}}/g})(parameters || {});
    })


    /**
     * @ngdoc service
     * @name cat.service.i18n:catI18nService
     * @service
     *
     * @description
     * A service to translate message keys to messages of specific locales
     *
     * @param {object} $q DOCTODO
     * @param {object} catI18nMessageSourceService DOCTODO
     * @param {object} catI18nMessageParameterResolver DOCTODO
     * @constructor
     */
    .service('catI18nService', [
        '$q',
        '$log',
        'catI18nMessageSourceService',
        'catI18nMessageParameterResolver',
        CatI18nService
    ]);
