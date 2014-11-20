'use strict';

var gulp = require('gulp'),
    ngHtml2js = require('gulp-ng-html2js'),
    ngAnnotate = require('gulp-ng-annotate'),
    sourcemaps = require('gulp-sourcemaps'),
    jshint = require('gulp-jshint'),
    less = require('gulp-less'),
    uglify = require('gulp-uglify'),
    header = require('gulp-header'),
    footer = require('gulp-footer'),
    clean = require('gulp-clean'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    concat = require('gulp-concat');

var karma_server = require('karma').server;
var lodash = require('lodash');
var lazypipe = require('lazypipe');
var merge = require('merge-stream');

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
        jshintrc: '.jshintrc',
        reporters: {
            dev: 'jshint-stylish'
        }
    },
    karma: require('./karma.conf.js')
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

var test = function (watch) {
    return function (cb) {
        karma_server.start(lodash.assign({}, config.karma, {singleRun: !watch, autoWatch: watch}), cb);
    };
};

var less2css = function () {
    var dest = template('<%= paths.dist %>');
    return gulp.src(['<%= paths.resources %>/styles/*.less'])
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(header(license))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dest));
};

var banner = lazypipe()
    .pipe(header, '(function(window, document, undefined) {\n\'use strict\';\n')
    .pipe(footer, '\n})(window, document);\n');

var _concatenate = function (name) {
    return lazypipe()
        .pipe(ngAnnotate)
        .pipe(concat, name + '.js')
        //.pipe(banner)
        //.pipe(header, license)
        //.pipe(header, license)
        .pipe(sourcemaps.write, '.')
        .pipe(gulp.dest, config.paths.dist)();
};

var _minify = function (name) {
    return lazypipe()
        .pipe(ngAnnotate)
        .pipe(concat, name + '.js')
        //.pipe(banner)
        //.pipe(header, license)
        .pipe(uglify, {preserveComments: 'some', mangle: false})
        .pipe(rename, name + '.min.js')
        .pipe(sourcemaps.write, '.')
        .pipe(gulp.dest, config.paths.dist)();
};

var angularJs = function () {
    var concatenated = gulp.src('<%= paths.src %>/**/*.js')
        .pipe(jshint(config.jshint.jshintrc))
        .pipe(jshint.reporter(config.jshint.reporters.dev))
        .pipe(replace('\'use strict\';', ''))
        .pipe(sourcemaps.init())
        .pipe(_concatenate(config.pkg.name));

    var minified = gulp.src('<%= paths.src %>/**/*.js')
        .pipe(jshint(config.jshint.jshintrc))
        .pipe(jshint.reporter(config.jshint.reporters.dev))
        .pipe(replace('\'use strict\';', ''))
        .pipe(sourcemaps.init())
        .pipe(_minify(config.pkg.name));


    return merge(concatenated, minified);
};

var angularTemplates = function () {
    var concatenated = gulp.src('<%= paths.resources %>/**/*.html')
        .pipe(sourcemaps.init())
        .pipe(ngHtml2js({moduleName: 'cat', stripPrefix: 'resources/'}))
        .pipe(_concatenate(config.pkg.name + '.tpl'));
    var minified = gulp.src('<%= paths.resources %>/**/*.html')
        .pipe(sourcemaps.init())
        .pipe(ngHtml2js({moduleName: 'cat', stripPrefix: 'resources/'}))
        .pipe(_minify(config.pkg.name + '.tpl'));
    return merge(concatenated, minified);
};

var bowerJson = function () {
    return gulp.src(['bower.dist.json'])
        .pipe(rename('bower.json'))
        .pipe(gulp.dest(config.paths.dist));
};

var cleanTask = function () {
    return gulp.src(['<%= paths.dist %>'], {read: false})
        .pipe(clean());
};

gulp.task('watch', ['angular'], watch);
gulp.task('less2css', less2css);
gulp.task('default', ['build']);
gulp.task('bower-json', bowerJson);
gulp.task('build', ['test', 'less2css', 'bower-json']);
gulp.task('test', ['angular'], test(false));
gulp.task('test-watch', ['angular'], test(true));
gulp.task('angular', ['angular-js', 'angular-templates']);
gulp.task('angular-js', angularJs);
gulp.task('angular-templates', angularTemplates);
gulp.task('clean', cleanTask);