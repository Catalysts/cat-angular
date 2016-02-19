'use strict';

/**
 * Validation Context which holds all information about a validation context
 * @param {string} uuid context identifier (optional)
 * @constructor
 */
function ValidationContext(uuid) {
    var that = this;
    this.uuid = uuid;
    this.global = undefined;
    this.fieldErrors = {};
    this.knownFields = [];

    /**
     * Registers a field name to be a known field which is visible in the ui
     * @param {string} name name of the field
     */
    this.registerField = function (name) {
        if (!_.includes(that.knownFields, name)) {
            that.knownFields.push(name);
        }
    };
}

function CatValidationService($log,
                              $globalMessages,
                              catValidations,
                              catValidationContexts,
                              catMessagesConfig,
                              catI18nService) {
    var that = this;

    /**
     * Adds a field error to the context
     * @param fieldName name of the faulty field
     * @param errorMessage associated error message to display
     * @param context affected context
     */
    function appendFieldErrorToContext(fieldName, errorMessage, context) {
        if (catMessagesConfig.knownFieldsActive === true) {
            // If the error is for a known field, show the error at the field.
            // If not, display it as a global error.
            if (_.contains(context.knownFields, fieldName)) {
                context.fieldErrors[fieldName] = context.fieldErrors[fieldName] || [];
                context.fieldErrors[fieldName].push(errorMessage);
            } else {
                context.global = [ errorMessage ];
                // TODO is this also context dependend? or even necessary?
                $globalMessages.addMessages('error', context.global, context);
            }
        } else {
            context.fieldErrors[fieldName] = context.fieldErrors[fieldName] || [];
            context.fieldErrors[fieldName].push(errorMessage);
        }
    }

    /**
     * Returns the validations context for a specific context identifier.
     * @param {string} contextId context identifier
     * @returns {ValidationContext} validation context
     */
    this.getContext = function (contextId) {
        if (contextId !== undefined) {
            var validations = catValidationContexts[contextId];
            if (validations === undefined) {
                throw new Error('Unknown contextId: ' + contextId);
            }
            return validations;
        } else {
            return catValidations;
        }
    };

    /**
     * Creates a new validation context.
     * @returns {string} context identifier
     */
    this.createContext = function () {
        var uuid = window.cat.util.generateUUID();
        catValidationContexts[uuid] = new ValidationContext(uuid);
        return uuid;
    };

    /**
     * Removes/unregisters the context from the validation service.
     * @param contextId context context identifier
     */
    this.destroyContext = function (contextId) {
        delete catValidationContexts[contextId];
    };

    /**
     * Adds a error message for a specific field to the context.
     * @param fieldName name of the faulty field
     * @param errorMessage associated error message
     * @param contextId id of the affected context
     */
    this.addFieldError = function (fieldName, errorMessage, contextId) {
        var context = that.getContext(contextId);
        context.fieldErrors = context.fieldErrors || {};
        appendFieldErrorToContext(fieldName, errorMessage, context);
    };

    this.updateFromRejection = function (rejection) {
        var contextId;
        if (!!rejection.config) {
            contextId = rejection.config.catValidationContextId;
        }

        var context = that.getContext(contextId);
        context.fieldErrors = {};

        var rejectionData = rejection.data;
        context.global = undefined;

        if (!rejectionData) {
            $log.warn('Network error occurred');
            $log.warn(rejection);
            catI18nService
                .translate('cc.catalysts.cat-validation-service.networkError')
                .then(function(message) {
                    context.global = [message];
                });
            return;
        }

        if (!!rejectionData.fieldErrors) {
            // group by field
            _.forEach(rejection.data.fieldErrors, function (fieldError) {
                // Allow config to switch between displaying errors at the field and displaying errors at known fields or globally
                appendFieldErrorToContext(fieldError.field, fieldError.message, context);
            });
        }

        if (!!rejectionData.globalErrors) {
            context.global = rejection.data.globalErrors;

            // TODO is this also context dependend? or even necessary?
            $globalMessages.addMessages('error', rejection.data.globalErrors, context);
        }
    };

    this.clearValidationErrors = function (contextId) {
        var context = that.getContext(contextId);
        delete context.global;
        context.fieldErrors = {};
    };

    /**
     * Clears existing errors for the field of the specified context
     * @param fieldName name of the field
     * @param contextId id of the affected context
     */
    this.clearFieldError = function (fieldName, contextId) {
        var context = that.getContext(contextId);
        delete context.fieldErrors[fieldName];
    };

    this.hasGlobalErrors = function (contextId) {
        var globalErrors = that.getContext(contextId).global;
        return !!globalErrors && globalErrors.length > 0;
    };

    this.getGlobalErrors = function (contextId) {
        return that.getContext(contextId).global;
    };

    this.hasFieldErrors = function (fieldName, contextId) {
        var fieldErrors = that.getContext(contextId).fieldErrors[fieldName];
        return !!fieldErrors && fieldErrors.length > 0;
    };

    this.hasAnyFieldErrors = function (contextId) {
        var fieldErrors = that.getContext(contextId).fieldErrors;
        return !_.isEmpty(fieldErrors);
    };

    this.getFieldErrors = function (fieldName, contextId) {
        return that.getContext(contextId).fieldErrors[fieldName];
    };

    this.hasErrors = function (contextId) {
        var hasGlobalErrors = this.hasGlobalErrors(contextId);
        var hasFieldErrors = this.hasAnyFieldErrors(contextId);
        return hasGlobalErrors || hasFieldErrors;
    };

    this.prepareConfig = function (contextId, config) {
        return _.assign(config || {}, {
            catValidationContextId: contextId
        });
    };
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
        '$globalMessages',
        'catValidations',
        'catValidationContexts',
        'catMessagesConfig',
        'catI18nService',
        CatValidationService
    ]);