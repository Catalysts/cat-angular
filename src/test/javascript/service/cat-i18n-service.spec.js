/**
 * Created by agerstmayr on 29.07.2015.
 */

describe('CatI18nService', function () {
    'use strict';

    var catI18nService;
    var $rootScope;

    beforeEach(function () {
        angular.module('cat.service.i18n.test', []);

        module('cat.service.i18n');
        module('cat.service.i18n.test');

        inject(function (_catI18nService_, _$rootScope_) {
            catI18nService = _catI18nService_;
            $rootScope = _$rootScope_;
        });
    });

    it('should fail when message key doesnt exist', function () {
         catI18nService.translate('hello').then(function(msg) {
             throw new Error('key should not exist');
         }, function(err) {
             expect(err).toBeDefined();
         });

         $rootScope.$digest();
    });

    it('should translate an existing message key', function () {
        catI18nService.translate('cc.catalysts.general.new', {}, 'en').then(function(msg) {
            expect(msg).toBe('New');
        }, function(err) {
            throw err;
        });

        $rootScope.$digest();
    });

    it('should translate an existing message key with parameters', function () {
        catI18nService.translate('cc.catalysts.cat-paginated.itemsFound', {count: 10, firstResult: 1, lastResult: 10}, 'en').then(function(msg) {
            expect(msg).toBe('10 entries found. Entries 1-10');
        }, function(err) {
            throw err;
        });

        $rootScope.$digest();
    });

    it('should tell me that a key exists', function () {
        catI18nService.canTranslate('cc.catalysts.general.new').then(function(result) {
            expect(result).toBe(true);
        }, function(err) {
            throw err;
        });

        $rootScope.$digest();
    });

});
