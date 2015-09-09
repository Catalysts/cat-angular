/**
 * Created by Mustafa on 29.07.2015.
 */


describe('catI18nLocaleService', function () {
    'use strict';

    var catI18nMessageSourceService;
    var $rootScope;

    beforeEach(function () {

        angular.module('cat.service.i18n.message.test', []);
        module('cat.service.i18n.message');
        module('cat.service.i18n.message.test');


        inject(function (_catI18nMessageSourceService_, _$rootScope_) {
            catI18nMessageSourceService = _catI18nMessageSourceService_;
            $rootScope = _$rootScope_;
        });

    });


    describe('testGetMessages', function () {

        it('should get the messages correctly when language available', function () {

            var result = catI18nMessageSourceService.getMessages('de');
            expect(result).toBeDefined();

            result.then(function (actualResult) {
                expect(actualResult['cc.catalysts.cat-paginated.itemsFound']).toBeDefined();
            });

            result = catI18nMessageSourceService.getMessages('en');

            result.then(function (actualResult) {
                expect(actualResult['cc.catalysts.cat-paginated.itemsFound']).toBeDefined();
            });

            $rootScope.$digest();
        });

        it('should get a correct default language when original language is not available', function () {

            var result = catI18nMessageSourceService.getMessages('fr');
            expect(result).toBeDefined();

            result.then(function (actualResult) {
                expect(actualResult['cc.catalysts.cat-paginated.itemsFound']).toBeDefined();
            });

            $rootScope.$digest();
        });

        it('should get a correct default language when there is no input', function () {

            var result = catI18nMessageSourceService.getMessages(null);
            expect(result).toBeDefined();

            result.then(function (actualResult) {
                expect(actualResult['cc.catalysts.cat-paginated.itemsFound']).toBeDefined();
            });

            $rootScope.$digest();
        });

    });

    describe('testGetMessage', function () {

        it('should get the messages correctly when key is correct', function () {
            var result = catI18nMessageSourceService.getMessage('cc.catalysts.general.new', 'de');
            expect(result).toBeDefined();

            result.then(function (actualResult) {
                expect(actualResult).toEqual('Neu');

            });
            $rootScope.$digest();
        });

        it('should get correct error when key is wrong', function () {
            var result = catI18nMessageSourceService.getMessage('key', 'de');
            expect(result).toBeDefined();

            result.then(function (actualResult) {
                expect(actualResult).toEqual('Neu');

            }, function (errorResult) {

                expect(errorResult.indexOf('No message found for key')).toEqual(0);
            });
            $rootScope.$digest();
        });

    });

    describe('testHasMessage', function () {

        it('should return whether the message exists or not', function () {
            var result = catI18nMessageSourceService.hasMessage('cc.catalysts.general.new', 'de');
            expect(result).toBeDefined();

            result.then(function (actualResult) {

                expect(actualResult).toEqual(true);
            });

            $rootScope.$digest();
        });

        it('should return true event though the language not defined', function () {
            var result = catI18nMessageSourceService.hasMessage('key', 'de');
            expect(result).toBeDefined();

            result.then(function (actualResult) {
                expect(actualResult).toEqual(false);
            });

            $rootScope.$digest();
        });


    });


});