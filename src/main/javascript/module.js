window.cat = {};

angular.module('cat.filters.replaceText', []);
angular.module('cat.filters', ['cat.filters.replaceText']);

angular.module('cat.template', ['ui.bootstrap.tpls']);

angular.module('cat.service.api', []);
angular.module('cat.service.breadcrumbs', []);
angular.module('cat.service.i18n', []);
angular.module('cat.service.listDataLoading', ['cat.service.api']);
angular.module('cat.service.route', ['ngRoute']);
angular.module('cat.service.selectConfig', []);
angular.module('cat.service.view', ['cat.service.api', 'cat.service.route']);
angular.module('cat.service.loading', ['angularSpinner']);
angular.module('cat.service.message', []);
angular.module('cat.service.httpIntercept', ['cat.service.loading', 'cat.service.message']);
angular.module('cat.service.menu', []);
angular.module('cat.service', [
    'cat.service.api',
    'cat.service.breadcrumbs',
    'cat.service.i18n',
    'cat.service.listDataLoading',
    'cat.service.route',
    'cat.service.selectConfig',
    'cat.service.view',
    'cat.service.loading',
    'cat.service.httpIntercept',
    'cat.service.menu',
    'cat.service.message'
]);

angular.module('cat.directives.autofocus', []);
angular.module('cat.directives.checkbox', []);
angular.module('cat.directives.confirmClick', []);
angular.module('cat.directives.fieldErrors', []);
angular.module('cat.directives.inputs', []);
angular.module('cat.directives.loadMore', []);
angular.module('cat.directives.menu', ['cat.service.menu']);
angular.module('cat.directives.select', ['ui.select2', 'cat.service.api', 'cat.service.selectConfig']);

angular.module('cat.directives.i18n', ['cat.service.i18n']);

angular.module('cat.directives.paginated', [
    'ui.bootstrap.pagination',
    'cat.service.listDataLoading',
    'cat.service.i18n'
]);
angular.module('cat.directives.facets', ['cat.directives.paginated']);
angular.module('cat.directives.sortable', ['cat.directives.paginated']);

angular.module('cat.directives.form', []);
angular.module('cat.directives.numbersOnly', []);

angular.module('cat.controller.base.list', ['cat.service.breadcrumbs']);
angular.module('cat.controller.base.tabs', []);
angular.module('cat.controller.base.detail', ['cat.service.breadcrumbs', 'cat.controller.base.tabs']);
angular.module('cat.controller', ['cat.controller.base.detail', 'cat.controller.base.list']);

angular.module('cat.directives', [
    'cat.template',
    'cat.directives.autofocus',
    'cat.directives.checkbox',
    'cat.directives.confirmClick',
    'cat.directives.fieldErrors',
    'cat.directives.inputs',
    'cat.directives.loadMore',
    'cat.directives.menu',
    'cat.directives.select',
    'cat.directives.i18n',
    'cat.directives.paginated',
    'cat.directives.facets',
    'cat.directives.sortable',
    'cat.directives.form',
    'cat.directives.numbersOnly'
]);

angular.module('cat', [
    'cat.service',
    'cat.template',
    'cat.directives',
    'cat.filters',
    'cat.controller'
]);
