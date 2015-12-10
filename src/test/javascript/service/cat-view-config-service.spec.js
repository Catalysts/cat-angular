/**
 * Created by Mustafa on 27.07.2015.
 */

describe('CatViewConfigService', function () {
    'use strict';

    var catViewConfigService;
    var $rootScope;

    var mockEndpoint;
    var childMockeEndpoint;

    beforeEach(function () {

        angular.module('cat.service.view.config.test', ['cat.service.view.config'])
            .service('catListDataLoadingService', function ($q) {
                this.resolve = function (endpointName, defaultSort) {
                    return $q.when({
                        endpointName: endpointName,
                        defaultSort: defaultSort
                    });
                };
            })
            .factory('catApiService', function ($q) {
                mockEndpoint = {
                    get: function (id) {
                        return $q.when(id);
                    }
                };

                childMockeEndpoint = {
                    parent: 'parent2',
                    get: function (id) {
                        return $q.when(id);
                    }
                };

                return {
                    test: {
                        get: function (id) {
                            return $q.when(id);
                        }
                    },
                    endpoint: mockEndpoint,
                    endpointname: mockEndpoint,
                    parent1: {
                        res: function () {
                            return {
                                parent2: {
                                    res: function () {
                                        return {
                                            endpointname: childMockeEndpoint
                                        };
                                    }
                                }
                            };
                        }
                    }
                };
            });

        module('cat.service.view.config.test');

        inject(function (_catViewConfigService_, _$rootScope_) {
            catViewConfigService = _catViewConfigService_;
            $rootScope = _$rootScope_;
        });
    });


    function testListConfig(config, successCallback) {
        var configPromise = catViewConfigService.getListConfig(config);

        expect(configPromise).toBeDefined();
        expect(configPromise.then).toBeDefined();

        configPromise.then(successCallback);

        $rootScope.$digest();
    }

    function testDetailConfig(config, $stateParams, successCallback) {

        var configPromise = catViewConfigService.getDetailConfig(config, $stateParams);

        expect(configPromise).toBeDefined();
        expect(configPromise.then).toBeDefined();

        configPromise.then(successCallback);

        $rootScope.$digest();
    }


    describe('.getDetailConfig', function () {

        it('should correctly initialize name and model', function () {
            testDetailConfig({name: 'Test', model: 'model'}, {id: 42}, function (config) {
                expect(config.Model).toEqual('model');
                expect(config.name).toEqual('Test');
            });
        });

        it('should correctly apply controller', function () {
            testDetailConfig({name: 'Test', model: 'model', controller: 'CTRL'}, {id: 42}, function (config) {
                expect(config.controller).toEqual('CTRL');
            });
        });

        it('should correctly apply default controller', function () {
            testDetailConfig({name: 'Test', model: 'model'}, {id: 42}, function (config) {
                expect(config.controller).toEqual('TestDetailsController');
            });
        });

        it('should apply correct endpoint', function () {
            testDetailConfig({name: 'Test', model: 'model', endpoint: 'endpoint'}, {id: 42}, function (config) {
                expect(config.endpoint).toEqual(mockEndpoint);
            });
        });


        it('should apply correct endpoint', function () {
            testDetailConfig({
                name: 'Test',
                model: 'model',
                endpoint: {
                    name: 'endpointname'
                }
            }, {id: 42}, function (config) {
                expect(config.endpoint).toEqual(mockEndpoint);
            });
        });


        it('should apply correct endpoint with parents', function () {
            testDetailConfig({
                name: 'Test',
                model: 'model',
                endpoint: {
                    name: 'endpointname',
                    parents: ['parent1', 'parent2']
                }
            }, {
                id: 42,
                parent1Id: 1,
                parent2Id: 2
            }, function (config) {
                expect(config.endpoint).toEqual(childMockeEndpoint);
            });
        });


        it('should return correct templateUrls ', function () {

            var resultObj = {
                edit: 'endpoint/endpoint-details-edit.tpl.html',
                view: 'endpoint/endpoint-details-view.tpl.html'
            };

            testDetailConfig({name: 'Test', model: 'model', endpoint: 'endpoint'}, {id: 42}, function (config) {
                expect(config.templateUrls.view).toBe(resultObj.view);
                expect(config.templateUrls.edit).toBe(resultObj.edit);
            });
        });


        it('should return correct tabs ', function () {

            var resultObj = {
                edit: 'endpoint/endpoint-details-edit.tpl.html',
                view: 'endpoint/endpoint-details-view.tpl.html'
            };

            testDetailConfig({
                name: 'Test',
                model: 'model',
                endpoint: 'endpoint',
                additionalViewTemplate: true
            }, {
                id: 42
            }, function (config) {
                expect(config.templateUrls.view.main).toBe(resultObj.view);
            });

            testDetailConfig({
                name: 'Test',
                model: 'model',
                endpoint: 'endpoint',
                additionalViewTemplate: 'tabs',
                additionalViewTemplateTabs: 'result'
            }, {
                id: 42
            }, function (config) {
                expect(config.tabs).toBe('result');
            });
        });
    });


    describe('.getListConfig', function () {

        it('should correctly transfer name', function () {
            testListConfig({name: 'Test'}, function (config) {
                expect(config.name).toEqual('Test');
            });
        });

        it('should use correct default controller', function () {
            testListConfig({name: 'Test'}, function (config) {
                expect(config.controller).toEqual('TestController');
            });
        });

        it('should override the controller correctly', function () {
            testListConfig({controller: 'Override'}, function (config) {
                expect(config.controller).toEqual('Override');
            });
        });

        it('should use correct viewdata', function () {
            testListConfig({name: 'Test', viewData: 'viewData'}, function (config) {
                expect(config.viewData).toEqual('viewData');
            });
        });

        it('should pluralize title correctly', function () {
            testListConfig({name: 'Test'}, function (config) {
                expect(config.title).toEqual('Tests');
            });
        });

        it('should set searchProps correctly', function () {
            testListConfig({name: 'Test', searchProps: 'properties'}, function (config) {
                expect(config.searchProps).toEqual('properties');
            });
        });

        it('should set searchProps to defaultListSearchProps', function () {
            testListConfig({name: 'Test'}, function (config) {
                expect(config.searchProps).not.toBeDefined();
            });
        });

        it('should use correct listTemplateUrl', function () {
            testListConfig({name: 'test', listTemplateUrl: 'url'}, function (config) {
                expect(config.listTemplateUrl).toEqual('url');
            });
        });

        it('should use correct default listTemplateUrl', function () {
            testListConfig({name: 'test'}, function (config) {
                expect(config.listTemplateUrl).toEqual('test/test-list.tpl.html');
            });
        });

        it('should use correct default listdata', function () {
            testListConfig({name: 'test'}, function (config) {
                expect(config.listData.endpointName).toEqual('test');
            });
        });

        it('should use the default undefined value of defaultSort', function () {
            testListConfig({name: 'test'}, function (config) {
                expect(config.listData.defaultSort).not.toBeDefined();
            });
        });

        it('should override defaultSort correctly', function () {
            testListConfig({name: 'test', defaultSort: 'defaultSort'}, function (config) {
                expect(config.listData.defaultSort).toEqual('defaultSort');
            });
        });


        it('should use correct override of endpoint ', function () {
            testListConfig({name: 'test', endpoint: 'endpoint'}, function (config) {
                expect(config.listData.endpointName).toEqual('endpoint');
            });
        });

    });
});


