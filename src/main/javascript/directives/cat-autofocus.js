'use strict';
angular.module('cat')
    .directive('catAutofocus', function CatAutofocusDirective($timeout) {
        return {
            restrict: 'A',
            link: function CatAutofocusLink(scope, element) {
                $timeout(function () {
                    if (!_.isUndefined(element.data('select2'))) {
                        element.select2('open');
                    } else {
                        element[0].focus();
                    }
                }, 100);
            }
        };
    });
