/**
 * Created by Mustafa on 05.08.2015.
 */


describe('CatGlobalMessages', function () {
    'use strict';

    var urlResolverService;
    var config = {
        endpoint: {
            getEndpointName: function() {
                return 'endpoint';
            },
            parentEndpoint: {
                getEndpointName: function() {
                    return 'parentEndpoint';
                }
            }
        }
    };


    beforeEach(function () {
        angular.module('cat.url.resolver.service.test', []);
        module('cat.url.resolver.service');
        module('cat.url.resolver.service.test');

        inject(function (_urlResolverService_) {
            urlResolverService = _urlResolverService_;
        });

    });

    describe('getTabTemplateTestWithoutParents', function () {

        it('has to return correct tabTemplate', function(){
           var result = urlResolverService.getTabTemplate('tab',config);
            expect(result).toBeDefined();

        });

    });

    describe('getTabTemplateTestWithParents', function () {

        it('has to return correct tabTemplate', function(){
            var result = urlResolverService.getTabTemplate('tab',config);
            expect(result).toBeDefined();

        });

    });

});