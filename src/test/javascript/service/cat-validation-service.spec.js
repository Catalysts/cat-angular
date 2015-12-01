describe('CatValidationService', function () {
    'use strict';

    /**
     * @type CatGlobalMessages
     */
    var $globalMessages;

    /**
     * @type CatValidationService
     */
    var catValidationService;
    var catMessagesConfig;

    beforeEach(function () {
        angular.module('cat.service.validation.test', []);

        module('cat.service.validation');
        module('cat.service.validation.test');

        inject(function (_$globalMessages_, _catValidationService_, _catMessagesConfig_) {
            $globalMessages = _$globalMessages_;
            catValidationService = _catValidationService_;
            catMessagesConfig = _catMessagesConfig_;
        });
    });

    it('should handle errors', function () {
        catValidationService.updateFromRejection({
            data: {
                globalErrors: ['Database unreachable'],
                fieldErrors: [
                    {field: 'name', message: 'name too short'},
                    {field: 'password', message: 'password too short'},
                    {
                        field: 'password',
                        message: 'password must contain uppercase letters, lowercase letters and numbers'
                    }
                ]
            }
        });

        expect($globalMessages.getMessages('error')).toEqual(['Database unreachable']);
        expect(catValidationService.getGlobalErrors()).toEqual(['Database unreachable']);

        expect(catValidationService.getFieldErrors('password')).toContain('password too short');
        expect(catValidationService.getFieldErrors('password')).toContain('password must contain uppercase letters, lowercase letters and numbers');

        expect(catValidationService.hasFieldErrors('password')).toBe(true);
        expect(catValidationService.hasFieldErrors('mail')).toBe(false);
        expect(catValidationService.hasAnyFieldErrors()).toBe(true);
        expect(catValidationService.hasErrors()).toBe(true);

        catValidationService.clearValidationErrors();
        expect(catValidationService.hasGlobalErrors()).toBe(false);
    });

    it('createContext should generate different uuids on call', function () {
        var contextId1 = catValidationService.createContext();
        var contextId2 = catValidationService.createContext();
        var contextId3 = catValidationService.createContext();

        expect(contextId1).toBeDefined();
        expect(contextId2).toBeDefined();
        expect(contextId3).toBeDefined();

        expect(contextId1).not.toEqual(contextId2);
        expect(contextId2).not.toEqual(contextId3);
        expect(contextId1).not.toEqual(contextId3);
    });

    it('context should be registered within the service', function () {
        var contextId = catValidationService.createContext();

        var context = catValidationService.getContext(contextId);

        expect(context).toBeDefined();
    });

    it('getContext should throw error if an unknown context is passed', function () {
        var contextId = '06e76d2c-6db5-4f32-a7bc-767977d97f0d';

        expect(function () {
            catValidationService.getContext(contextId);
        }).toThrow(new Error('Unknown contextId: 06e76d2c-6db5-4f32-a7bc-767977d97f0d'));
    });

    it('destroyContext should remove the context from the service', function () {
        var contextId = catValidationService.createContext();
        catValidationService.destroyContext(contextId);

        expect(function () {
            catValidationService.getContext(contextId);
        }).toThrow(new Error('Unknown contextId: ' + contextId));
    });

    it('should handle context specific errors', function () {
        var contextId = catValidationService.createContext();

        catValidationService.updateFromRejection({
            config: {
                catValidationContextId: contextId
            },
            data: {
                globalErrors: ['Database unreachable'],
                fieldErrors: [
                    {field: 'name', message: 'name too short'}
                ]
            }
        });

        expect(catValidationService.hasGlobalErrors()).toBe(false);
        expect(catValidationService.hasGlobalErrors(contextId)).toBe(true);
        expect(catValidationService.hasFieldErrors('name')).toBe(false);
        expect(catValidationService.getFieldErrors('name')).toBeUndefined();
        expect(catValidationService.hasFieldErrors('name', contextId)).toBe(true);
        expect(catValidationService.getFieldErrors('name', contextId)).toBeDefined();
    });

    describe('with knownFieldsActive flag', function () {

        beforeEach(function () {
            catMessagesConfig.knownFieldsActive = true;
        });

        it('should handle field error as global error if field unknown', function () {
            var contextId = catValidationService.createContext();

            catValidationService.updateFromRejection({
                config: {
                    catValidationContextId: contextId
                },
                data: {
                    fieldErrors: [
                        {field: 'name', message: 'name too short'}
                    ]
                }
            });

            expect(catValidationService.hasGlobalErrors(contextId)).toBe(true);
            expect(catValidationService.hasFieldErrors('name', contextId)).toBe(false);
        });

        it('should handle field error as field error if field known', function () {
            var contextId = catValidationService.createContext();

            catValidationService.getContext(contextId).registerField('name');
            catValidationService.updateFromRejection({
                config: {
                    catValidationContextId: contextId
                },
                data: {
                    fieldErrors: [
                        {field: 'name', message: 'name too short'}
                    ]
                }
            });

            expect(catValidationService.hasGlobalErrors(contextId)).toBe(false);
            expect(catValidationService.hasFieldErrors('name', contextId)).toBe(true);
            expect(catValidationService.hasAnyFieldErrors(contextId)).toBe(true);
            expect(catValidationService.hasErrors(contextId)).toBe(true);
        });
    });

});
