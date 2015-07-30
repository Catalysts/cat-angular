/**
 * Created by agerstmayr on 30.07.2015.
 */

describe('Facet', function () {
    'use strict';

    it('should store facets', function () {
        var f = new window.cat.Facet({
            name: 'Facets',
            facets: [
                {id: 1, name: 'children', count: 2},
                {id: 2, name: 'parents', count: 4}
            ]
        });

        expect(f.terms[1].count).toBe(4);
    });

});
