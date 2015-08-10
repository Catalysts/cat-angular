/**
 * Created by Mustafa on 30.07.2015.
 */
/*

describe('catSearchService', function () {
    'use strict';

    var catSearchService;

    beforeEach(function () {

        angular.module('cat.service.search.test', []);
        module('cat.service.search');
        module('cat.service.search.test');


        inject(function (_catSearchService_) {
            catSearchService = _catSearchService_;
        });

    });

    it('should do something', function() {

        var result = catSearchService.encodeAsUrl('url');
        expect(result).toBeDefined();
    });

});
    */


describe('catUrlEncodingService', function () {
    'use strict';

    var catUrlEncodingService;

    beforeEach(function () {

        angular.module('cat.service.search.test', []);
        module('cat.service.search');
        module('cat.service.search.test');


        inject(function (_catUrlEncodingService_) {
            catUrlEncodingService = _catUrlEncodingService_;
        });

    });


    it('should do something', function() {

        var result = catUrlEncodingService.encodeAsUrl('url');
        expect(result).toBeDefined();


    });


});