/**
 * Created by agerstmayr on 30.07.2015.
 */

describe('CatSelectConfigService', function () {
    'use strict';

    var catSelectConfigService;

    beforeEach(function () {
        angular.module('cat.service.selectConfig.test', []).config(function (catSelectConfigServiceProvider) {
            catSelectConfigServiceProvider.config('select1', {
                size: 10,
                url: '/api/names'
            });

            catSelectConfigServiceProvider.config('select2', {
                size: 10,
                endpoint: {
                    name: 'test',
                    count: 10
                }
            });
        });

        module('cat.service.selectConfig');
        module('cat.service.selectConfig.test');

        inject(function (_catSelectConfigService_) {
            catSelectConfigService = _catSelectConfigService_;
        });
    });

    it('should save configs', function () {
        expect(catSelectConfigService.getConfig('select2').size).toBe(10);
    });

    it('should support deep copy of defaults', function () {
        var defaults = {
            endpoint: {
                sort: 'desc'
            }
        };

        expect(catSelectConfigService.getConfig('select2', defaults).endpoint).toEqual({
            name: 'test',
            count: 10,
            sort: 'desc'
        });
    });

});
