    }

    if (!!window.reguire && !!window.require.amd && !!window.define) {
        window.define([
            'jQuery',
            'lodash',
            'angular',
            'angular-spinner',
            'angular-ui-bootstrap'
        ], catAngular);
    } else {
        catAngular(window.angular, window.jQuery, window._);
    }

    catAngular(window.angular, window.jQuery, window._);

})(window);