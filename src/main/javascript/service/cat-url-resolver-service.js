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


    this.getTabControllerName = function(tab, endpoint){

      if(!!tab.controller){
          return tab.controller;
      }else{

          var name = window.cat.util.capitalize(endpoint.getEndpointName());
          var parentEndpoint = endpoint.parentEndpoint;

          while (parentEndpoint) {
              name = window.cat.util.capitalize(parentEndpoint.getEndpointName()) + name;
              parentEndpoint = parentEndpoint.parentEndpoint;
          }
          return name + window.cat.util.capitalize(tab.name) + 'Controller';
      }
    };


    this.isTabActive = function (tab, $scope,$stateParams) {
        if (tab.name === $scope.tabNames[0] && _.isUndefined($stateParams.tab)) {
            // first tab is active if no parameter is given
            return true;
        }
        return $stateParams.tab === tab.name;
    };

});

