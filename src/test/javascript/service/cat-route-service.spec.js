/**
 * Created by Mustafa on 24.07.2015.
 */


describe('CatRouteServiceProvider', function () {
    'use strict';

    beforeEach(function () {

        module('ui.router');
        module('cat.service.route');
    });

    it('returns right URL', function(){
        module(function(catRouteServiceProvider) {
            catRouteServiceProvider.listAndDetailRoute('root', 'Folder');
        });

        inject(function(catRouteService) {});

        inject(function ($state)  {
            var abstractState = $state.get('Folder');
            expect(abstractState).not.toBeNull();
            expect(abstractState.url).toEqual('root/folders');

            var detailState = $state.get('Folder.detail');
            expect(detailState).not.toBeNull();
            expect(detailState.url).toEqual('/:id');
            expect(detailState.templateUrl).toEqual('template/cat-base-detail.tpl.html');
            expect(detailState.controller).toEqual('CatBaseDetailController');

            var listState = $state.get('Folder.list');
            expect(listState).not.toBeNull();
            expect(listState.url).toEqual('');
        });
    });
});
