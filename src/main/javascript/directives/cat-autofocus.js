'use strict';
angular.module('cat')
    .directive('catAutofocus', function CatAutofocusDirective($timeout) {
        return {
            restrict: 'A',
            link: function CatAutofocusLink(scope, element) {
                $timeout(function () {
                    element[0].focus();
                }, 100);
            }
        };
    });
