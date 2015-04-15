'use strict';

/**
 * @ngdoc overview
 * @name cat.service.validation
 *
 * @descripton
 * module wrapping the validation logic
 */
angular.module('cat.service.validation', ['cat.service.message'])
/**
 * @ngdoc object
 * @name cat.service.validation:catValidations
 *
 * @description
 * value holding 'global' and 'field' errors
 */
    .value('catValidations', {fieldErrors: {}})

/**
 * @ngdoc service
 * @name cat.service.validation:catValidationService
 *
 * @description
 * Service which maps the 'fieldErrors' list recieved from the backend to a usable map for the client
 */
    .service('catValidationService', function CatErrorHttpInterceptor($rootScope, $globalMessages, catValidations) {
        this.updateFromRejection = function (rejection) {
            delete catValidations.global;

            if (!!rejection.data.globalErrors) {
                catValidations.global = rejection.data.error;
                $globalMessages.addMessages('error', rejection.data.globalErrors);
            }

            var fieldErrors = catValidations.fieldErrors = {};

            if (!!rejection.data.fieldErrors) {
                // group by field
                _.forEach(rejection.data.fieldErrors, function (fieldError) {
                    fieldErrors[fieldError.field] = fieldErrors[fieldError.field] || [];
                    fieldErrors[fieldError.field].push(fieldError.message);
                });
                $rootScope.$on('fieldErrors', fieldErrors);
            }

        };

        this.clearValidationErrors = function() {
            delete catValidations.global;
            catValidations.fieldErrors = {};
        };

        this.hasGlobalErrors = function() {
            return !!catValidations.global;
        };

        this.getGlobalErrors = function() {
            return catValidations.global;
        };

        this.hasFieldErrors = function(fieldName) {
            return !!catValidations.fieldErrors[fieldName];
        };

        this.getFieldErrors = function(fieldName) {
            return catValidations.fieldErrors[fieldName];
        };
    });
