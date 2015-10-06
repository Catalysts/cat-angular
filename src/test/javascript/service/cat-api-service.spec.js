// actual spec
describe('Api Service', function () {
    'use strict';

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
                model: cat.util.test.Model
            });

            catApiServiceProvider.endpoint('user', {
                url: 'user',
                model: cat.util.test.Model
            }).child('friend', {
                url: 'friend',
                model: cat.util.test.Model
            });
        });

        module('cat.service.api');
        module('cat.service.api.test');

        inject(function (_$httpBackend_, _catConversionService_, _catApiService_) {
            $httpBackend = _$httpBackend_;
            catApiService = _catApiService_;
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should return a converted object', function () {
        $httpBackend.expectGET('api/test/' + testData[0].id).respond(testData[0]);
        catApiService.test.get(testData[0].id).then(function (result) {
            expect(result).toBeDefined();
            cat.util.test.expectToEqualConverted(result, testData[0]);
        });
        $httpBackend.flush();
    });

    it('should return a paginated result if a PagedResultDTO is returned by the server', function () {
        var serverData = {totalCount: 2, elements: testData};
        $httpBackend.expectGET('api/test?page=0&size=100').respond(serverData);
        catApiService.test.list(new window.cat.SearchRequest()).then(function (result) {
            expect(result).toBeDefined();
            expect(result.totalCount).toBe(2);
            expect(result.elements.length).toBe(2);
            cat.util.test.expectToEqualConverted(result.elements, testData);
        });
        $httpBackend.flush();
    });

    it('should return a list of objects if the server response is not paginated', function () {
        $httpBackend.expectGET('api/test').respond(testData);
        catApiService.test.list().then(function (result) {
            expect(result).toBeDefined();
            expect(result.length).toBe(2);
            cat.util.test.expectToEqualConverted(result, testData);
        });
        $httpBackend.flush();
    });

    it('should post an object without id', function () {
        var clientData = {name: 'NewTestObject'};
        var serverData = {id: 100, name: 'NewTestObject'};
        $httpBackend.expectPOST('api/test', clientData).respond(serverData);
        catApiService.test.save(clientData).then(function (result) {
            cat.util.test.expectToEqualConverted(result, new cat.util.test.Model(serverData));
        });
        $httpBackend.flush();
    });

    it('should update an object with id', function () {
        var data = {id: 100, name: 'NewTestObject'};
        $httpBackend.expectPUT('api/test/100', data).respond(data);
        catApiService.test.save(data).then(function (result) {
            cat.util.test.expectToEqualConverted(result, data);
        });
        $httpBackend.flush();
    });

    it('should delete an object', function () {
        $httpBackend.expectDELETE('api/test/100').respond(200);
        catApiService.test.remove(100).then(function (response) {
            expect(response.status).toBe(200);
        });
        $httpBackend.flush();
    });

    it('should call custom GET url', function () {
        $httpBackend.expectGET('api/test/customGET').respond(200);
        catApiService.test.custom.get('customGET').then(function (response) {
            expect(response.status).toBe(200);
        });
        $httpBackend.flush();
    });

    it('should call custom GET url with search request', function () {
        $httpBackend.expectGET('api/test/customGET?page=0&size=100').respond(200);
        catApiService.test.custom.get('customGET', new window.cat.SearchRequest()).then(function (response) {
            expect(response.status).toBe(200);
        });
        $httpBackend.flush();
    });

    it('should call custom POST url', function () {
        $httpBackend.expectPOST('api/test/customPOST', {name: 'NewTestObject'}).respond(200);
        catApiService.test.custom.post('customPOST', {name: 'NewTestObject'}).then(function (response) {
            expect(response.status).toBe(200);
        });
        $httpBackend.flush();
    });

    it('should call custom PUT url', function () {
        $httpBackend.expectPUT('api/test/customPUT', {id: 100, name: 'NewTestObject'}).respond(200);
        catApiService.test.custom.put('customPUT', {id: 100, name: 'NewTestObject'}).then(function (response) {
            expect(response.status).toBe(200);
        });
        $httpBackend.flush();
    });

    it('should allow defining a dynamic endpoint', function () {
        var endpoint1 = catApiService.dynamicEndpoint({
            url: 'test',
            model: cat.util.test.Model
        });

        var endpoint2 = catApiService.dynamicEndpoint('test');
        expect(endpoint1).toBe(endpoint2);

        // test dynamic endpoint functionality
        $httpBackend.expectGET('api/test/' + testData[0].id).respond(testData[0]);
        endpoint2.get(testData[0].id).then(function (result) {
            expect(result).toBeDefined();
            cat.util.test.expectToEqualConverted(result, testData[0]);
        });
        $httpBackend.flush();
    });

    it('should allow endpoint children', function () {
        var user2 = catApiService.user.res(2);

        $httpBackend.expectGET('api/user/2/friend').respond(testData);
        user2.friend.list().then(function (result) {
            expect(result).toBeDefined();
            expect(result.length).toBe(2);
            cat.util.test.expectToEqualConverted(result, testData);
        });
        $httpBackend.flush();
    });

});