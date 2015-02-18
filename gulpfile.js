'use strict';

var gulp = require('gulp');
gulp.ngHtml2js = require('gulp-ng-html2js');
gulp.ngAnnotate = require('gulp-ng-annotate');
gulp.sourcemaps = require('gulp-sourcemaps');
gulp.jshint = require('gulp-jshint');
gulp.less = require('gulp-less');
gulp.uglify = require('gulp-uglify');
gulp.header = require('gulp-header');
gulp.footer = require('gulp-footer');
gulp.filter = require('gulp-filter');
gulp.rename = require('gulp-rename');
gulp.replace = require('gulp-replace');
gulp.concat = require('gulp-concat');
gulp.bower = require('gulp-bower');

var path = require('path');
var karma_server = require('karma').server;
var lodash = require('lodash');
var lazypipe = require('lazypipe');
var merge = require('merge-stream');
var rimraf = require('rimraf');

var license = '/*!\n ' +
    '* Copyright 2014 the original author or authors.\n ' +
    '*\n ' +
    '* Licensed under the Apache License, Version 2.0 (the "License");\n ' +
    '* you may not use this file except in compliance with the License.\n ' +
    '* You may obtain a copy of the License at\n ' +
    '*\n ' +
    '*      http://www.apache.org/licenses/LICENSE-2.0\n ' +
    '*\n ' +
    '* Unless required by applicable law or agreed to in writing, software\n ' +
    '* distributed under the License is distributed on an "AS IS" BASIS,\n ' +
    '* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n ' +
    '* See the License for the specific language governing permissions and\n ' +
    '* limitations under the License.\n ' +
    '*/\n';


var config = {
    pkg: require('./bower.json'),
    paths: {
        // configurable paths
        src: 'src/main/javascript',
        resources: 'src/main/resources',
        test: 'src/test/javascript',
        dist: 'dist'
    },
    jshint: {
        reporters: {
            dev: 'jshint-stylish'
        }
    },
    karma: {
        configFile: path.resolve('./karma.conf.js')
    }
};

function template(templateString, data) {
    var options = data || config;
    if (lodash.isArray(templateString)) {
        return lodash.map(templateString, function (temp) {
            return template(temp, options);
        });
    }
    return lodash.template(templateString, options);
}

// add support for lodash templates
var gulpSrc = gulp.src;
gulp.src = function (glob, options) {
    return gulpSrc(template(glob), options);
};
var gulpWatch = gulp.watch;
gulp.watch = function (glob, opt, fn) {
    return gulpWatch.apply(this, [template(glob), opt, fn]);
};
var gulpDest = gulp.dest;
gulp.dest = function (glob) {
    return gulpDest(template(glob));
};

var watchLog = function (event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
};

var watch = function () {
    console.log(template('Watching <%= paths.src %>/**/*'));
    gulp.watch(template('<%= paths.src %>/**/*'), ['angular-js']).on('change', watchLog);

    console.log(template('Watching <%= paths.resources %>/**/*.html'));
    gulp.watch(template('<%= paths.resources %>/**/*.html'), ['angular-templates']).on('change', watchLog);

    console.log(template('Watching <%= paths.resources %>/**/*.less'));
    gulp.watch(template('<%= paths.resources %>/**/*.less'), ['less2css']).on('change', watchLog);
};

var test = function (watch, production) {
    return function (cb) {
        var options = {};
        if (production === true) {
            options.plugins = [
                'karma-teamcity-reporter',
                'karma-jasmine',
                'karma-coverage',
                'karma-phantomjs-launcher'
            ];

            options.reporters = [
                'progress',
                'coverage',
                'teamcity'
            ];
        }
        karma_server.start(lodash.assign(options, config.karma, {singleRun: !watch, autoWatch: watch}), cb);
    };
};

var less2css = function () {
    var dest = template('<%= paths.dist %>');
    return gulp.src(['<%= paths.resources %>/styles/*.less'])
        .pipe(gulp.sourcemaps.init())
        .pipe(gulp.less())
        .pipe(gulp.header(license))
        .pipe(gulp.sourcemaps.write('.', {sourceRoot: 'src'}))
        .pipe(gulp.dest(dest));
};

var banner = lazypipe()
    .pipe(gulp.header, '(function(window, document, undefined) {\n\'use strict\';\n')
    .pipe(gulp.footer, '\n})(window, document);\n');

var _concatenateAndUglify = function (name) {
    return lazypipe()
        .pipe(gulp.ngAnnotate)
        .pipe(gulp.concat, name + '.js')
        //.pipe(banner)
        //.pipe(header, license)
        //.pipe(header, license)
        .pipe(gulp.sourcemaps.write, '.', {sourceRoot: 'src'})
        .pipe(gulp.dest, config.paths.dist)
        .pipe(gulp.filter, ['**/*.js'])
        .pipe(gulp.uglify, {preserveComments: 'some', mangle: false})
        .pipe(gulp.rename, name + '.min.js')
        .pipe(gulp.sourcemaps.write, '.', {sourceRoot: 'src/../'})
        .pipe(gulp.dest, config.paths.dist)
    ();
};

var angularJs = function () {
    return gulp.src('<%= paths.src %>/**/*.js')
        .pipe(gulp.jshint())
        .pipe(gulp.jshint.reporter(config.jshint.reporters.dev))
        .pipe(gulp.replace('\'use strict\';', ''))
        .pipe(gulp.sourcemaps.init())
        .pipe(_concatenateAndUglify(config.pkg.name));
};

var angularTemplates = function () {
    return gulp.src('<%= paths.resources %>/**/*.html')
        .pipe(gulp.sourcemaps.init())
        .pipe(gulp.ngHtml2js({moduleName: 'cat.template', stripPrefix: 'resources/'}))
        .pipe(_concatenateAndUglify(config.pkg.name + '.tpl'));
};

var bowerJson = function () {
    return gulp.src(['bower.dist.json'])
        .pipe(gulp.rename('bower.json'))
        .pipe(gulp.dest(config.paths.dist));
};

var cleanTask = function (cb) {
    rimraf(config.paths.dist, cb);
};

var bowerInstall = function() {
    return gulp.bower();
};

gulp.task('bower-install', bowerInstall);
gulp.task('watch', ['angular'], watch);
gulp.task('less2css', less2css);
gulp.task('default', ['build']);
gulp.task('bower-json', bowerJson);
gulp.task('build', ['test', 'less2css', 'bower-json']);
gulp.task('build-production', ['test-production', 'less2css', 'bower-json']);
gulp.task('test', ['angular', 'bower-install'], test(false));
gulp.task('test-production', ['angular', 'bower-install'], test(false, true));
gulp.task('test-watch', ['angular', 'bower-install'], test(true));
gulp.task('angular', ['angular-js', 'angular-templates']);
gulp.task('angular-js', angularJs);
gulp.task('angular-templates', angularTemplates);
gulp.task('clean', cleanTask);