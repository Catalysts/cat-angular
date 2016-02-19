/**
 * Created by tscheinecker on 21.10.2014.
 */
'use strict';

function CatI18nService($q, $log, catI18nMessageSourceService, catI18nMessageParameterResolver) {
    var that = this;

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
    this.translate = function (key, parameters, locale) {
        var deferred = $q.defer();
        var model = parameters;

        if (_.isArray(parameters)) {
            parameters.forEach(function (value, idx) {
                model['p' + idx] = value;
            });
        }

        that.canTranslate(key, locale).then(
            function (canTranslate) {
                if (canTranslate) {
                    catI18nMessageSourceService.getMessage(key, locale).then(
                        function (message) {
                            try {
                                var translation = catI18nMessageParameterResolver(message, model);
                                if (_.isString(translation)) {
                                    deferred.resolve(translation);
                                } else {
                                    $log.warn('Didn\'t get a string from catI18nMessageParameterResolver');
                                    deferred.reject(translation);
                                }
                            } catch (e) {
                                $log.warn(e);
                                deferred.reject(e);
                            }
                        },
                        function (reason) {
                            $log.warn(reason);
                            deferred.reject(reason);
                        }
                    );
                } else {
                    var reason = 'No translation for key \'' + key + '\' available!';
                    $log.warn(reason);
                    deferred.reject(reason);
                }
            },
            deferred.reject
        );
        return deferred.promise;
    };

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
    this.canTranslate = function (key, locale) {
        var deferred = $q.defer();

        catI18nMessageSourceService.getMessages(locale).then(
            function (messages) {
                deferred.resolve(!_.isUndefined(messages) && !_.isUndefined(messages[key]));
            },
            function (reason) {
                $q.reject(reason);
            }
        );

        return deferred.promise;
    };
}

angular.module('cat.service.i18n', ['cat.service.i18n.message'])
    /**
     * @ngdoc service
     * @name cat.service.i18n:catI18nMessageParameterResolver
     * @value
     *
     * @description
     * A function which accepts a message and parameters and returns the resolved message
     */
    .value('catI18nMessageParameterResolver', function (message, parameters) {
        var result = _.template(message, null, {interpolate: /{{([\s\S\d]+?)}}/g})(parameters || {});

        // lodash >=3
        if (_.isFunction(result)) {
            return result();
        }
        return result;  // lodash <3
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
    .service('catI18nService', ['$q', '$log', 'catI18nMessageSourceService', 'catI18nMessageParameterResolver', CatI18nService]);
