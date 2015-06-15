'use strict';

/**
 * @ngdoc overview
 * @name cat.service.validation
 *
 * @descripton
 * module wrapping the validation logic
 */
angular.module('cat.service.validation', [
    'cat.service.message'
])
/**
 * @ngdoc object
 * @name cat.service.validation:catValidations
 *
 * @description
 * value holding 'global' and 'field' errors
 */
    .value('catValidations', {
        global: undefined,
        fieldErrors: {}
    })

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
    .service('catValidationService', function CatErrorHttpInterceptor($rootScope, $globalMessages, catValidations, catValidationContexts, catMessagesConfig) {

        this.getValidations = function (context) {
            if (context !== undefined) {
                var validations = catValidationContexts[context];
                if (validations === undefined) {
                    throw new Error('Unknown context: ' + context);
                }
                return validations;
            } else {
                return catValidations;
            }
        };

        this.createContext = function () {
            var uuid = window.cat.util.generateUUID();
            catValidationContexts[uuid] = {
                uuid: uuid,
                global: undefined,
                fieldErrors: {}
            };
            return uuid;
        };

        this.destroyContext = function (context) {
            delete catValidationContexts[context];
        };

        this.updateFromRejection = function (rejection) {
            var context = undefined;
            if (!!rejection.config) {
                context = rejection.config.catValidationContext;
            }

            var validations = this.getValidations(context);

            if (!!rejection.data.globalErrors) {
                validations.global = rejection.data.globalErrors;

                // TODO is this also context dependend? or even necessary?
                $globalMessages.addMessages('error', rejection.data.globalErrors, context);
            }

            var fieldErrors = validations.fieldErrors = {};

            if (!!rejection.data.fieldErrors) {
                // group by field
                _.forEach(rejection.data.fieldErrors, function (fieldError) {
                    fieldErrors[fieldError.field] = fieldErrors[fieldError.field] || [];
                    fieldErrors[fieldError.field].push(fieldError.message);
                });
            }

        };

        this.clearValidationErrors = function (context) {
            delete this.getValidations(context).global;
            this.getValidations(context).fieldErrors = {};
        };

        this.hasGlobalErrors = function (context) {
            var globalErrors = this.getValidations(context).global;
            return !!globalErrors && globalErrors.length > 0;
        };

        this.getGlobalErrors = function (context) {
            return this.getValidations(context).global;
        };

        this.hasFieldErrors = function (fieldName, context) {
            var fieldErrors = this.getValidations(context).fieldErrors[fieldName];
            return !!fieldErrors && fieldErrors.length > 0;
        };

        this.getFieldErrors = function (fieldName, context) {
            return this.getValidations(context).fieldErrors[fieldName];
        };

        this.prepareConfig = function (context, config) {
            return _.assign(config || {}, {
                catValidationContext: context
            });
        };
    });
