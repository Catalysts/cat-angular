'use strict';

/**
 * @ngdoc directive
 * @name cat.directives.confirmClick:catConfirmClick
 * @cat-i18n-params cat-i18n-params will be parsed as an angular expression. $parse constructs a function which I call to return the i18n params.
 */
angular.module('cat.directives.confirmClick', [])
    .directive('catConfirmClick', function CatConfirmClickDirective(catI18nService, $parse) {
        return {
            restrict: 'A',
            link: function CatConfirmClickLink(scope, element, attr) {
                var msg = attr.catConfirmClick || 'Are you sure?';
                var clickAction = attr.catOnConfirm;
                var params = undefined;
                if (!!attr.catI18nParams) {
                    params = $parse(attr.catI18nParams)();
                }
                element.bind('click', function (event) {
                    function dialog(dialogMessage) {
                        if (window.confirm(dialogMessage)) {
                            scope.$eval(clickAction);
                        }
                    }

                    catI18nService.translate(msg, params).then(
                        function (message) {
                            dialog(message);
                        }, function (reason) {
                            dialog(msg);
                        }
                    );
                });
            }
        };
    });
