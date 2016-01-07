interface ICatElementVisibilityService {

    /**
     * A helper function to determine wheter or not a ui element should be visible.
     *
     * @param {string} identifier an identifier upon which the the implementation can mofiy it's behaviour
     * @param data the data representing the element for which the visibility check is performed
     * @returns {boolean} <code>true</code> if the element should be rendered, <code>false</code> otherwise
     */
    isVisible(identifier:string, data?:any):boolean;
}


/**
 * @ngdoc service
 * @name cat.service.elementVisibility:catElementVisibilityService
 * @service
 *
 * @description
 * This service provides a entry point for handling the visibility of ui elements.
 * The basic implementation always returns true and is intended to be decorated accordingly within production environments.
 *
 * @constructor
 */
class CatElementVisibilityService implements ICatElementVisibilityService {
    isVisible() {
        return true;
    }
}

angular
    .module('cat.service.elementVisibility', [])
    .service('catElementVisibilityService', [
        CatElementVisibilityService
    ]);