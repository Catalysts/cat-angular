/**
 * Created by Mustafa on 29.07.2015.
 */


describe('catI18nLocaleService', function () {
    'use strict';

    var catI18nLocaleService;

    beforeEach(function () {
        angular.module('cat.service.i18n.locale.test', []);
        module('cat.service.i18n.locale');
        module('cat.service.i18n.locale.test');


        inject(function (_catI18nLocaleService_) {
            catI18nLocaleService = _catI18nLocaleService_;
        });

    });

    describe('getLanguageOfLocale', function () {

        it('should return undefined language', function () {
            var result = catI18nLocaleService.getLanguageOfLocale(undefined);
            expect(result).toBeUndefined();
        });

        it('should return splitted string', function () {
            var result = catI18nLocaleService.getLanguageOfLocale('de-AT');
            expect(result).toEqual('de');
        });

        it('should return actual data', function () {
            var result = catI18nLocaleService.getLanguageOfLocale('fr');
            expect(result).toEqual('fr');
        });

    });

    describe('getCurrentLocale', function(){

        it('should return current locale id', function () {
            var result = catI18nLocaleService.getCurrentLocale();
            expect(result).toEqual('en-us');
        });

    });

    describe('getDefaultLocale', function(){

        it('should return default locale id', function () {
            var result = catI18nLocaleService.getDefaultLocale();
            expect(result).toEqual('de');
        });

    });
});