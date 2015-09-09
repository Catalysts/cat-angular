/**
 * Created by agerstmayr on 30.07.2015.
 */

describe('CatValidationService', function () {
    'use strict';

    var $globalMessages;
    var catValidationService;

    beforeEach(function () {
        angular.module('cat.service.validation.test', []);

        module('cat.service.validation');
        module('cat.service.validation.test');

        inject(function (_$globalMessages_, _catValidationService_) {
            $globalMessages = _$globalMessages_;
            catValidationService = _catValidationService_;
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

        expect(catValidationService.hasFieldErrors('mail')).toBe(false);

        catValidationService.clearValidationErrors();
        expect(catValidationService.hasGlobalErrors()).toBe(false);
    });

});
