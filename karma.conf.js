'use strict';

module.exports = {
    basePath: '',
    frameworks: ['jasmine'],
    files: [
        // libs
        'bower_components/lodash/dist/lodash.js',
        'bower_components/angular/angular.js',
        'bower_components/angular-route/angular-route.js',
        'bower_components/angular-spinner/angular-spinner.js',
        'bower_components/angular-mocks/angular-mocks.js',
        // cat-angular
        'src/main/javascript/module.js',
        'src/main/javascript/**/*.js',
        'src/main/resources/**/*.tpl.html',
        'src/test/javascript/**/*.spec.js'
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
    },
    ngHtml2JsPreprocessor: {
        stripPrefix: 'src/main/resources',
        moduleName: 'cat.template'
    }
};
