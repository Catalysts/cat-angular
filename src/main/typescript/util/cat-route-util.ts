/**
 * Created by tscheinecker on 01.08.2014.
 */

window.cat.util = window.cat.util || {};

window.cat.models = window.cat.models || {};

/**
 * This helper function is used to acquire the constructor function which is used as a 'model' for the api endpoint.
 * @param name the name of the 'entity' for which the constructor has to be returned
 * @returns {Constructor}
 */
window.cat.util.defaultModelResolver = function (name) {
    return window.cat.models[name];
};