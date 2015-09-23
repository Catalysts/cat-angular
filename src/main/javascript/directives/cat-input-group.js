'use strict';

angular.module('cat.directives.inputGroup', [])

/**
 * @ngdoc directive
 * @name cat.directives.inputs:catInputGroup
 */
    .directive('catInputGroup', function CatInputGroupDirective(catValidationService) {
        return {
            restrict: 'A',
            transclude: true,
            scope: {
                label: '@',
                name: '@',
                labelI18n: '@'
            },
            require: '?^^catValidationGroup',
            link: function CatInputGroupLink(scope, element, attr, catValidationGroupCtrl) {
                if (!!catValidationGroupCtrl && !!catValidationService) {
                    var validations = catValidationService.getValidations(catValidationGroupCtrl.getContext());

                    if (!!validations) {
                        var knownFields = validations.knownFields;

                        if (_.indexOf(knownFields, scope.name) === -1) {
                            knownFields.push(scope.name);
                        }
                    }
                }

                element.addClass('form-group');
            },
            templateUrl: 'template/cat-input.tpl.html'
        };
    });