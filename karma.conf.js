'use strict';

module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        files: [
            // libs
            'bower_components/jquery/dist/jquery.js',
            'bower_components/lodash/lodash.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-ui-router/release/angular-ui-router.js',
            'bower_components/angular-spinner/angular-spinner.js',
            'bower_components/angular-mocks/angular-mocks.js',
            // test util
            'src/test/javascript/test-utils.js',
            // cat-angular
            'src/main/javascript/module.js',
            'src/main/javascript/**/*.js',
            'dist/cat-angular.tpl.js',
            // tests
            'src/test/javascript/*/**/*.spec.js'
        ],
        plugins: [
            'karma-jasmine',
            'karma-coverage',
            'karma-phantomjs-launcher',
            'karma-ng-html2js-preprocessor'
        ],
        reporters: ['progress', 'coverage'],
        browsers: ['PhantomJS'],
        preprocessors: {
            'src/main/javascript/**/*.js': 'coverage',
            'src/main/resources/**/*.tpl.html': ['ng-html2js']
        },
        coverageReporter: {
            reporters: [
                {type: 'lcov', dir: 'build/coverage/'},
                {type: 'text-summary', dir: 'build/coverage/'}
            ]
        }
    });
};
