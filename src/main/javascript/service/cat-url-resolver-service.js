/**
 * Created by Mustafa on 05.08.2015.
 */
angular.module('cat.url.resolver.service', []).service('urlResolverService', function(){

    'use strict';

    this.getTabTemplate = function(tab, config){

        var parentUrl = config.endpoint.getEndpointName();
        var parentTemplateNamePrefix = config.endpoint.getEndpointName();
        var currentEndpoint = config.endpoint;

        while (!_.isUndefined(currentEndpoint.parentEndpoint)) {
            currentEndpoint = config.endpoint.parentEndpoint;
            var parentEndpointName = currentEndpoint.getEndpointName();

            parentUrl = parentEndpointName + '/' + parentUrl;

            parentTemplateNamePrefix = parentEndpointName + '-' + parentTemplateNamePrefix;
        }
        return parentUrl + '/' + tab + '/' + parentTemplateNamePrefix + '-' + tab + '-list.tpl.html';
    };
});

