window.cat = {};

angular.module('cat.directives', ['ui.select2']);
angular.module('cat.controller', []);
angular.module('cat.template', []);
angular.module('cat.service.api', []);
angular.module('cat.service', ['angularSpinner', 'ngRoute', 'cat.service.api']);
angular.module('cat', [
    'cat.service',
    'cat.template',
    'cat.directives',
    'cat.controller'
]);
