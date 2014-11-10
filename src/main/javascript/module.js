window.cat = {};

angular.module('cat.controller.base.list', []);
angular.module('cat.controller.base.tabs', []);
angular.module('cat.controller.base.detail', ['cat.controller.base.tabs']);
angular.module('cat.controller', ['cat.controller.base.detail', 'cat.controller.base.list']);

angular.module('cat.template', ['ui.bootstrap.tpls']);

angular.module('cat.service.api', []);
angular.module('cat.service.i18n', []);
angular.module('cat.service', ['angularSpinner', 'ngRoute', 'cat.service.api', 'cat.service.i18n']);

angular.module('cat.directives.i18n', ['cat.service.i18n']);
angular.module('cat.directives', ['cat.directives.i18n', 'ui.select2', 'ui.bootstrap.pagination']);

angular.module('cat', [
    'cat.service',
    'cat.template',
    'cat.directives',
    'cat.controller'
]);
