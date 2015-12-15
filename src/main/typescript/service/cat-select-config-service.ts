function assignDeep(target, source) {
    return _.assign(target, source, function (targetProperty, sourceProperty) {
        if (_.isObject(targetProperty) && _.isObject(sourceProperty)) {
            return assignDeep(targetProperty, sourceProperty);
        }

        return sourceProperty;
    });
}

interface ICatSelectConfigService {
    getConfig(name:string, options?:any):any;
}

/**
 * @ngdoc service
 * @name cat.service.selectConfig:catSelectConfigService
 * @module cat.service.selectConfig
 *
 * @constructor
 */
class CatSelectConfigService implements ICatSelectConfigService {

    constructor(private configs) {

    }

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
    getConfig(name, options) {
        var config = this.configs[name];

        if (_.isUndefined(config) && _.isUndefined(options)) {
            return undefined;
        }

        return assignDeep(_.clone(config) || {}, options);
    };
}

interface ICatSelectConfigServiceProvider extends IServiceProvider {
    config(name:string, config?:any):any;
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
class CatSelectConfigServiceProvider implements ICatSelectConfigServiceProvider {
    private configs = {};

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
    config(name, config) {
        if (!_.isUndefined(config)) {
            this.configs[name] = config;
        }

        return this.configs[name];
    }

    $get = [() => {
        return new CatSelectConfigService(this.configs);
    }];
}

angular
    .module('cat.service.selectConfig', [])
    .provider('catSelectConfigService', CatSelectConfigServiceProvider);