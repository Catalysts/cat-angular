/**
 * Created by tscheinecker on 05.12.2014.
 */

// actual spec
describe('CatBreadcrumbsService', function () {
    'use strict';

    var catBreadcrumbsService;
    var catBreadcrumbs;

    beforeEach(function () {
        angular.module('cat.service.breadcrumbs.test', []);

        module('ui.router');
        module('cat.service.breadcrumbs');
        module('cat.service.breadcrumbs.test');

        inject(function (_catBreadcrumbsService_, _catBreadcrumbs_) {
            catBreadcrumbsService = _catBreadcrumbsService_;
            catBreadcrumbs = _catBreadcrumbs_;
        });
    });

    afterEach(function () {
        // clear the underlying breadcrumbs data
        catBreadcrumbs.length = 0;
    });

    function initWith0to9() {
        for (var i = 0; i < 10; i++) {
            catBreadcrumbsService.push(i);
        }
    }

    function expectBreadcrumbToBe(idx, breadcrumb) {
        expect(catBreadcrumbsService.get()[idx]).toBe(breadcrumb);
    }


    it('should be an array initially', function () {
        var breadCrumbs = catBreadcrumbsService.get();
        expect(breadCrumbs).toBeDefined();
        expect(_.isArray(breadCrumbs)).toBe(true);
    });

    it('should be empty initially', function () {
        expect(catBreadcrumbsService.length()).toBe(0);
    });

    it('should add elements in order', function () {
        initWith0to9();

        expect(catBreadcrumbsService.length()).toBe(10);

        for (var i = 0; i < 10; i++) {
            expectBreadcrumbToBe(i, i);
        }
    });

    it('should add elements in reverse order', function () {
        for (var i = 0; i < 10; i++) {
            catBreadcrumbsService.addFirst(i);
        }

        expect(catBreadcrumbsService.length()).toBe(10);

        for (i = 0; i < 10; i++) {
            expectBreadcrumbToBe(i, 9-i);
        }
    });

    it('should be able to contain arbitrary objects', function () {
        var numberBreadcrumb = 0;
        var stringBreadcrumb = '1';
        var arrayBreadcrumb = [2];
        var objectBreadcrumb = {3: 3};

        catBreadcrumbsService.push(numberBreadcrumb);
        catBreadcrumbsService.push(stringBreadcrumb);
        catBreadcrumbsService.push(arrayBreadcrumb);
        catBreadcrumbsService.push(objectBreadcrumb);

        expectBreadcrumbToBe(0, numberBreadcrumb);
        expectBreadcrumbToBe(1, stringBreadcrumb);
        expectBreadcrumbToBe(2, arrayBreadcrumb);
        expectBreadcrumbToBe(3, objectBreadcrumb);
    });

    it('should replace the last object', function () {
        initWith0to9();

        catBreadcrumbsService.replaceLast('last');

        expectBreadcrumbToBe(9, 'last');
    });

    it('should remove the last', function () {
        initWith0to9();

        catBreadcrumbsService.pop();

        expect(catBreadcrumbsService.length()).toBe(9);
        expectBreadcrumbToBe(0, 0);
    });

    it('should remove the first', function () {
        initWith0to9();

        catBreadcrumbsService.removeFirst();

        expect(catBreadcrumbsService.length()).toBe(9);
        expectBreadcrumbToBe(0, 1);
    });
});