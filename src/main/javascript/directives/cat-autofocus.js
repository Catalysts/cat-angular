'use strict';
angular.module('cat')
    .directive('catAutofocus', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                $timeout(function () {
                    element[0].focus();
                }, 100);
            }
        };
    });
