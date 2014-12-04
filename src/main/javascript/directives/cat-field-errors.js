/**
 * Created by tscheinecker on 05.05.2014.
 */
'use strict';

angular.module('cat.directives.fieldErrors')
    .directive('catFieldErrors', function CatFieldErrorsDirective() {
        return {
            replace: 'true',
            restrict: 'E',
            scope: {
                errors: '=',
                name: '@'
            },
            template: '<div class="label label-danger" ng-if="errors[name]"><ul><li ng-repeat="error in errors[name]">{{error}}</li></ul></div>'
        };
    });