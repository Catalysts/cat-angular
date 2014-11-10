'use strict';

// test model class

function Test(data) {
    this.isTestObject = true;
    this.id = data.id;
    this.name = data.name;
}

Test.prototype.equals = function (data) {
    return data.id === this.id && data.name === this.name;
};

// actual spec
describe('Api Service', function () {

    var testData = [
        {id: 1, name: 'TestData1'},
        {id: 2, name: 'TestData2'}
    ];

    var $httpBackend;
    var catApiService;

    beforeEach(function () {

        angular.module('cat.service.api.test', []).config(function (catApiServiceProvider) {
            catApiServiceProvider.endpoint('test', {
                url: 'test',
                model: Test
            });
        });

        module('cat.service.api');
        module('cat.service.api.test');

        inject(function (_$httpBackend_, _catApiService_) {
            $httpBackend = _$httpBackend_;
            catApiService = _catApiService_;
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should return a paginated result if a PagedResultDTO is returned by the server', function () {
        $httpBackend.expectGET('/api/test?page=0&size=100').respond({totalCount: 2, elements: testData});
        catApiService.test.list(new window.cat.SearchRequest()).then(function (result) {
            expect(result.totalCount).toBe(2);
            expect(result.elements.length).toBe(2);
            expect(result.elements[0].isTestObject).toBe(true);
            expect(result.elements[0].id).toBe(1);
            expect(result.elements[1].isTestObject).toBe(true);
            expect(result.elements[1].id).toBe(2);
        });
        $httpBackend.flush();
    });

    it('should return a list of objects if the server response is not paginated', function () {
        $httpBackend.expectGET('/api/test').respond(testData);
        catApiService.test.list().then(function (result) {
            expect(result.length).toBe(2);
            expect(result[0].isTestObject).toBe(true);
            expect(result[0].id).toBe(1);
            expect(result[1].isTestObject).toBe(true);
            expect(result[1].id).toBe(2);
        });
        $httpBackend.flush();
    });

    it('should post an object without id', function () {
        $httpBackend.expectPOST('/api/test', {name: 'NewTestObject'}).respond({id: 100, name: 'NewTestObject'});
        catApiService.test.save({name: 'NewTestObject'}).then(function (result) {
            expect(result.isTestObject).toBe(true);
            expect(result.id).toBe(100);
            expect(result.name).toBe('NewTestObject');
        });
        $httpBackend.flush();
    });

    it('should update an object with id', function () {
        $httpBackend.expectPUT('/api/test/100', {id: 100, name: 'NewTestObject'}).respond({id: 100, name: 'NewTestObject'});
        catApiService.test.save({id: 100, name: 'NewTestObject'}).then(function (result) {
            expect(result.isTestObject).toBe(true);
            expect(result.id).toBe(100);
            expect(result.name).toBe('NewTestObject');
        });
        $httpBackend.flush();
    });

    it('should delete an object', function () {
        $httpBackend.expectDELETE('/api/test/100').respond(200);
        catApiService.test.remove(100).then(function (response) {
            expect(response.status).toBe(200);
        });
        $httpBackend.flush();
    });

    it('should call custom GET url', function () {
        $httpBackend.expectGET('/api/test/customGET').respond(200);
        catApiService.test.custom.get('customGET').then(function (response) {
            expect(response.status).toBe(200);
        });
        $httpBackend.flush();
    });

    it('should call custom GET url with search request', function () {
        $httpBackend.expectGET('/api/test/customGET?page=0&size=100').respond(200);
        catApiService.test.custom.get('customGET', new window.cat.SearchRequest()).then(function (response) {
            expect(response.status).toBe(200);
        });
        $httpBackend.flush();
    });

    it('should call custom POST url', function () {
        $httpBackend.expectPOST('/api/test/customPOST', {name: 'NewTestObject'}).respond(200);
        catApiService.test.custom.post('customPOST', {name: 'NewTestObject'}).then(function (response) {
            expect(response.status).toBe(200);
        });
        $httpBackend.flush();
    });

    it('should call custom PUT url', function () {
        $httpBackend.expectPUT('/api/test/customPUT', {id: 100, name: 'NewTestObject'}).respond(200);
        catApiService.test.custom.put('customPUT', {id: 100, name: 'NewTestObject'}).then(function (response) {
            expect(response.status).toBe(200);
        });
        $httpBackend.flush();
    });
});