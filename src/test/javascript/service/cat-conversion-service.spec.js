/**
 * Created by tscheinecker on 05.12.2014.
 */

// actual spec
describe('CatConversionService', function () {
    'use strict';

    var testData = [
        {id: 1, name: 'TestData1'},
        {id: 2, name: 'TestData2'}
    ];

    var testDataPaginated = {
        elements: testData,
        totalCount: 4
    };

    var testModelContext = {model: cat.util.test.Model};

    var catConversionService;

    beforeEach(function () {
        angular.module('cat.service.conversion.test', []);

        module('cat.service.conversion');
        module('cat.service.conversion.test');

        inject(function (_catConversionService_) {
            catConversionService = _catConversionService_;
        });
    });

    describe('#toClient', function () {
        it('should return undefined if nothing to convert', function () {
            expect(catConversionService.toClient()).toBeUndefined();
        });

        describe('without context', function () {
            it('should return same object', function () {
                var result = catConversionService.toClient(testData[0]);
                expect(result).toBeDefined();
                expect(result).toEqual(testData[0]);
            });

            it('should return array of same objects', function () {
                var result = catConversionService.toClient(testData);
                expect(result).toBeDefined();
                expect(result).toEqual(testData);
            });

            it('should return paginated object if paginated data is given', function () {
                var result = catConversionService.toClient(testDataPaginated);
                expect(result).toBeDefined();
                expect(result).not.toEqual(testData);
                expect(result.elements).toBeDefined();
                expect(result.elements.length).toBe(2);
                expect(result.totalCount).toBe(4);
            });
        });

        describe('with model context', function () {
            it('should return converted object', function () {
                var result = catConversionService.toClient(testData[0], testModelContext);
                expect(result).toBeDefined();
                cat.util.test.expectToEqualConverted(result, testData[0]);
            });

            it('should return array of converted objects', function () {
                var result = catConversionService.toClient(testData, testModelContext);
                expect(result).toBeDefined();
                cat.util.test.expectToEqualConverted(result, testData);
            });

            it('should return paginated object with converted elements', function () {
                var result = catConversionService.toClient(testDataPaginated, testModelContext);
                expect(result).toBeDefined();
                expect(result).not.toEqual(testData);
                cat.util.test.expectToEqualConverted(result.elements, testData);
                expect(result.totalCount).toBe(4);
            });
        });
    });
});