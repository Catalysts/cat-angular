import IHttpPromiseCallbackArg = angular.IHttpPromiseCallbackArg;
import IRequestConfig = angular.IRequestConfig;
/**
 * Validation Context which holds all information about a validation context
 */
class ValidationContext {
    global:Array<string>;
    fieldErrors:Object = {};
    knownFields:Array<string> = [];

    /**
     * @param uuid context identifier
     */
    constructor(public uuid?:string) {
    }

    /**
     * Registers a field name to be a known field which is visible in the ui
     * @param {string} name name of the field
     */
    registerField(name:string) {
        if (this.knownFields.indexOf(name) === -1) {
            this.knownFields.push(name);
        }
    }
}

interface CatFieldError {
    field:string;
    message:string;
}

interface CatRejectionData {
    fieldErrors: Array<CatFieldError>;
    globalErrors: Array<string>;
}

interface ICatValidationService {
    getContext(contextId?:string):ValidationContext;
    createContext():string;
    destroyContext(contextId:string):void;
    updateFromRejection(rejection:CatHttpPromiseCallbackArg<CatRejectionData>):void;
    clearValidationErrors(contextId?:string):void;
    hasGlobalErrors(contextId?:string):boolean;
    getGlobalErrors(contextId?:string):string[];
    hasFieldErrors(fieldName:string, contextId?:string):boolean;
    hasAnyFieldErrors(contextId?:string):boolean;
    getFieldErrors(fieldName:string, contextId?:string):CatFieldError[];
    hasErrors(contextId?:string):boolean;
    prepareConfig(contextId:string, config:any):any;
}

class CatValidationService implements ICatValidationService {
    constructor(private $log,
                private $globalMessages:CatMessageService,
                private catValidations,
                private catValidationContexts,
                private catMessagesConfig,
                private catI18nService) {
    }

    /**
     * Returns the validations context for a specific context identifier.
     * @param {string} contextId context identifier
     * @returns {ValidationContext} validation context
     */
    getContext(contextId?:string):ValidationContext {
        if (contextId !== undefined) {
            let validations = this.catValidationContexts[contextId];
            if (validations === undefined) {
                throw new Error(`Unknown contextId: ${contextId}`);
            }
            return validations;
        } else {
            return this.catValidations;
        }
    }

    /**
     * Creates a new validation context.
     * @returns {string} context identifier
     */
    createContext():string {
        let uuid = window.cat.util.generateUUID();
        this.catValidationContexts[uuid] = new ValidationContext(uuid);
        return uuid;
    }

    /**
     * Removes/unregisters the context from the validation service.
     * @param contextId context context identifier
     */
    destroyContext(contextId:string) {
        delete this.catValidationContexts[contextId];
    }

    updateFromRejection(rejection:CatHttpPromiseCallbackArg<CatRejectionData>) {
        let contextId;
        if (!!rejection.config) {
            contextId = rejection.config.catValidationContextId;
        }

        let context:ValidationContext = this.getContext(contextId);

        let fieldErrors = context.fieldErrors = {};

        let rejectionData:CatRejectionData = rejection.data;
        context.global = undefined;

        if (!rejectionData) {
            this.$log.warn('Network error occurred');
            this.$log.warn(rejection);
            this.catI18nService
                .translate('cc.catalysts.cat-validation-service.networkError')
                .then(function (message) {
                    context.global = [message];
                });
            return;
        }

        if (!!rejectionData.fieldErrors) {
            // group by field
            rejectionData.fieldErrors.forEach((fieldError:CatFieldError) => {
                // Allow config to switch between displaying errors at the field and displaying errors at known fields or globally
                if (this.catMessagesConfig.knownFieldsActive === true) {
                    // If the error is for a known field, show the error at the field.
                    // If not, display it as a global error.
                    if (context.knownFields.indexOf(fieldError.field) !== -1) {
                        fieldErrors[fieldError.field] = fieldErrors[fieldError.field] || [];
                        fieldErrors[fieldError.field].push(fieldError.message);
                    } else {
                        rejection.data.globalErrors = rejection.data.globalErrors || [];
                        rejection.data.globalErrors.push(fieldError.message);
                    }
                } else {
                    fieldErrors[fieldError.field] = fieldErrors[fieldError.field] || [];
                    fieldErrors[fieldError.field].push(fieldError.message);
                }
            });
        }

        if (!!rejectionData.globalErrors) {
            context.global = rejection.data.globalErrors;

            // TODO is this also context dependend? or even necessary?
            this.$globalMessages.addMessages('error', rejection.data.globalErrors);
        }
    }

    clearValidationErrors(contextId) {
        let context = this.getContext(contextId);
        context.global = undefined;
        context.fieldErrors = {};
    }

    hasGlobalErrors(contextId) {
        let globalErrors = this.getContext(contextId).global;
        return !!globalErrors && globalErrors.length > 0;
    }

    getGlobalErrors(contextId) {
        return this.getContext(contextId).global;
    }

    hasFieldErrors(fieldName, contextId) {
        let fieldErrors = this.getContext(contextId).fieldErrors[fieldName];
        return !!fieldErrors && fieldErrors.length > 0;
    }

    hasAnyFieldErrors(contextId) {
        let fieldErrors = this.getContext(contextId).fieldErrors;
        return !_.isEmpty(fieldErrors);
    }

    getFieldErrors(fieldName, contextId) {
        return this.getContext(contextId).fieldErrors[fieldName];
    }

    hasErrors(contextId) {
        let hasGlobalErrors = this.hasGlobalErrors(contextId);
        let hasFieldErrors = this.hasAnyFieldErrors(contextId);
        return hasGlobalErrors || hasFieldErrors;
    }

    prepareConfig(contextId, config) {
        return _.assign(config || {}, {
            catValidationContextId: contextId
        });
    }
}

/**
 * @ngdoc overview
 * @name cat.service.validation
 *
 * @descripton
 * module wrapping the validation logic
 */
angular.module('cat.service.validation', [
        'cat.service.message',
        'cat.service.i18n'
    ])
    /**
     * @ngdoc object
     * @name cat.service.validation:catValidations
     *
     * @description
     * value holding 'global' and 'field' errors
     */
    .value('catValidations', new ValidationContext())

    /**
     * @ngdoc object
     * @name cat.service.validation:catValidationContexts
     *
     * @description
     * value holding 'global' and 'field' errors
     */
    .value('catValidationContexts', {})

    /**
     * @ngdoc service
     * @name cat.service.validation:catValidationService
     *
     * @description
     * Service which maps the 'fieldErrors' list recieved from the backend to a usable map for the client. All methods
     * have a 'context' parameter as the last parameter. If no context is provided the global context will be used,
     * otherwise the field error messages will be assigned to the specified context.
     */
    .service('catValidationService', [
        '$log',
        'CatMessageService',
        'catValidations',
        'catValidationContexts',
        'catMessagesConfig',
        'catI18nService',
        CatValidationService.prototype.constructor
    ]);