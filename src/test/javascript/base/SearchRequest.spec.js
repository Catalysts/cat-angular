/**
 * Created by agerstmayr on 30.07.2015.
 */

describe('SearchRequest', function () {
    'use strict';

    it('should store search requests', function () {
        var r = new window.cat.SearchRequest({
            page: 1,
            sort: 'name',
            'search.datefrom': '2015-1-1'
        });

        expect(r.pagination()).toEqual({page: 1, size: 100});
        expect(r.search()).toEqual({datefrom: '2015-1-1'});
        expect(r.isDirty()).toBe(false);

        r.search({user: 'andi'});
        r.pagination({page: 2, size: 100});
        expect(r.search()).toEqual({user: 'andi'});
        expect(r.pagination()).toEqual({page: 2, size: 100});
        expect(r.isDirty()).toBe(true);
    });

});
