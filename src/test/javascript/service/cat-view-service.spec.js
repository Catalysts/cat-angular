/**
 * Created by Mustafa on 29.07.2015.
 */

describe('CatViewServiceProvider', function () {
    'use strict';

    var result;

    beforeEach(function () {
        module('cat.service.view');
    });

    it('returns right URL', function () {
        module(function (catViewServiceProvider) {
            catViewServiceProvider.listAndDetailView('baseUrl', 'name', 'config');
            result = catViewServiceProvider.$get();
        });

        inject(function (catViewService) {
        });

        inject(function (catViewService, catApiService) {

            expect(catApiService).toBeDefined();
            expect(result.views[0]).toBe('name');
            expect(result.endpoints[0]).toBe('name');
        });

    });
});