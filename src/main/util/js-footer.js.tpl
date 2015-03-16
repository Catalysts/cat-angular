        return 'cat';
    }

    if (!!window.require && !!window.define) {
        window.define([
            'jQuery',
            'lodash',
            'angular',
            'angular-spinner',
            'angular-ui-select2',
            'angular-ui-router',
            'angular-ui-bootstrap',
            './cat-angular.tpl.min'
        ], catAngular);
    } else {
        catAngular(window.jQuery, window._, window.angular);
    }
})(window);