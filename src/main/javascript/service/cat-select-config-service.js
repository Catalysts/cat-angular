'use strict';

function assignDeep(target, source) {
    return _.assign(target, source, function (targetProperty, sourceProperty) {
        if (_.isObject(targetProperty) && _.isObject(sourceProperty)) {
            return assignDeep(targetProperty, sourceProperty);
        }

        return sourceProperty;
    });
}

/**
 * @ngdoc service
 * @name cat.service.selectConfig:catSelectConfigService
 * @module cat.service.selectConfig
 *
 * @constructor
 */
function CatSelectConfigService(configs) {
    var _configs = configs;

    /**
     * @ngdoc function
     * @name getConfig
     * @method of cat.service.selectConfig:catSelectConfigService
     *
     * @description
     *
     * @param {String} name the name of the config to retreive
     * @param {Object} [options] Optional options to use as default values
     * @returns {*} the named config object (with applied defaults) or undefined
     */
    this.getConfig = function (name, options) {
        var config = configs[name];

        if (_.isUndefined(config) && _.isUndefined(options)) {
            return undefined;
        }

        return assignDeep(_.clone(config) || {}, options);
    };
}

/**
 * @ngdoc service
 * @name cat.service.selectConfig:catSelectConfigServiceProvider
 * @module cat.service.selectConfig
 *
 * @description
 *
 * @constructor
 */
function CatSelectConfigServiceProvider() {
    var configs = {};

    /**
     * @ngdoc function
     * @name getConfig
     * @method of cat.service.selectConfig:catSelectConfigServiceProvider
     *
     * @description
     *
     * @param {String} name the name of the config to save or retrieve
     * @param {Object} [config] The config to save for the given name or undefined to receive the config
     * @returns {*} the named config object
     */
    this.config = function (name, config) {
        if (!_.isUndefined(config)) {
            configs[name] = config;
        }

        return configs[name];
    };

    this.$get = function () {
        return new CatSelectConfigService(configs);
    };
}

angular.module('cat.service.selectConfig', []).provider('catSelectConfigService', CatSelectConfigServiceProvider);