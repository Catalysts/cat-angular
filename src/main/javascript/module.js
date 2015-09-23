angular.module('cat.filters.replaceText', []);
angular.module('cat.filters', ['cat.filters.replaceText']);

angular.module('cat.service', [
    'cat.service.conversion',
    'cat.service.api',
    'cat.service.breadcrumbs',
    'cat.service.elementVisibility',
    'cat.service.i18n',
    'cat.service.listDataLoading',
    'cat.service.route',
    'cat.service.selectConfig',
    'cat.service.view',
    'cat.service.loading',
    'cat.service.httpIntercept',
    'cat.service.menu',
    'cat.service.message',
    'cat.service.search'
]);

angular.module('cat.controller', ['cat.controller.base.detail', 'cat.controller.base.list']);

angular.module('cat.directives.validation', ['cat.service.validation']);


angular.module('cat.directives', [
    'cat.directives.autofocus',
    'cat.directives.checkbox',
    'cat.directives.confirmClick',
    'cat.directives.elementVisible',
    'cat.directives.fieldErrors',
    'cat.directives.input',
    'cat.directives.inputGroup',
    'cat.directives.loadMore',
    'cat.directives.menu',
    'cat.directives.select',
    'cat.directives.i18n',
    'cat.directives.paginated',
    'cat.directives.facets',
    'cat.directives.sortable',
    'cat.directives.form',
    'cat.directives.numbersOnly',
    'cat.directives.breadcrumbs'
]);

angular.module('cat', [
    'cat.service',
    'cat.directives',
    'cat.filters',
    'cat.controller',
    'ui.bootstrap'
]);
