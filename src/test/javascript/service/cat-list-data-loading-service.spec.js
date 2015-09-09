/**
 * Created by agerstmayr on 29.07.2015.
 */

describe('CatListDataLoadingService', function () {
    'use strict';

    var testData = [
        {id: 1, name: 'TestData1'},
        {id: 2, name: 'TestData2'}
    ];

    var $httpBackend;
    var catApiService;
    var catListDataLoadingService;

    beforeEach(function () {
        angular.module('cat.service.listDataLoading.test', []).config(function (catApiServiceProvider) {
            catApiServiceProvider.endpoint('test', {
                url: 'test',
                model: cat.util.test.Model
            });
        });

        module('cat.service.listDataLoading');
        module('cat.service.listDataLoading.test');

        inject(function (_$httpBackend_, _catApiService_, _catListDataLoadingService_) {
            $httpBackend = _$httpBackend_;
            catApiService = _catApiService_;
            catListDataLoadingService = _catListDataLoadingService_;
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should update the properties', function () {
        var paginatedTestData = {totalCount: 2, elements: testData};
        $httpBackend.expectGET('/api/test?page=0&size=100').respond(paginatedTestData);
        catListDataLoadingService.load(catApiService.test, new window.cat.SearchRequest()).then(function (result) {
            expect(result.count).toBe(2);
            expect(result.firstResult).toBe(1);
            expect(result.lastResult).toBe(2);
        }, function (err) {
            throw err;
        });

        $httpBackend.flush();
    });

    it('should update the properties and use sorting settings', function () {
        var paginatedTestData = {totalCount: 2, elements: testData};
        $httpBackend.expectGET('/api/test?page=0&size=100&sort=name:desc').respond(paginatedTestData);
        catListDataLoadingService.resolve('test', {property: 'name', isDesc: true}).then(function (result) {
            expect(result.count).toBe(2);
            expect(result.firstResult).toBe(1);
            expect(result.lastResult).toBe(2);
        }, function (err) {
            throw err;
        });

        $httpBackend.flush();
    });

});
