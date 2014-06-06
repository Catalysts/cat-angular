window.cat = {};

angular.module('cat.service', ['angularSpinner']);
angular.module('cat.directives', ['ui.select2']);
angular.module('cat.controller', []);
angular.module('cat.template', []);
angular.module('cat.api', []);
angular.module('cat', [
    'cat.api',
    'cat.service',
    'cat.template',
    'cat.directives',
    'cat.controller'
]);
