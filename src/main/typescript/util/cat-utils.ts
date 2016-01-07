interface CatUtils {
    defaultListSearchProps?:string[];
    /**
     * Pluralizes a string
     * @param string
     * @returns {*}
     */
    pluralize(string:string):string;
    /**
     * Capitalizes a string (first letter to uppercase)
     * @param string
     * @returns {string}
     */
    capitalize(string:string):string;
    /**
     * Generates a new UUID
     *
     * @returns {string} uuid
     */
    generateUUID():string;
    /**
     * This helper function is used to acquire the constructor function which is used as a 'model' for the api endpoint.
     * @param name the name of the 'entity' for which the constructor has to be returned
     * @returns {Constructor}
     */
    defaultModelResolver(name:string):{new(data?:any):any};
}

window.cat = window.cat || {};
window.cat.models = window.cat.models || {};
window.cat.util = window.cat.util || {
        pluralize: (string):string => {
            if (_.isUndefined(string) || string.length === 0) {
                return '';
            }
            let lastChar = string[string.length - 1];

            switch (lastChar) {
                case 'y':
                    return string.substring(0, string.length - 1) + 'ies';
                case 's':
                    return string + 'es';
                default :
                    return string + 's';
            }
        },
        capitalize: (string) => {
            if (_.isUndefined(string) || string.length === 0) {
                return '';
            }

            return string.substring(0, 1).toUpperCase() + string.substring(1, string.length);
        },
        generateUUID: () => {
            // http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
            /* jshint ignore:start */
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            /* jshint ignore:end */
        },
        defaultModelResolver: (name) => {
            return window.cat.models[name];
        }
    };