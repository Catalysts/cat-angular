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
gulp.concat = require('gulp-concat');
gulp.bower = require('gulp-bower');
gulp.ngdocs = require('gulp-ngdocs');
gulp.bump = require('gulp-bump');
gulp.git = require('gulp-git');
gulp.util = require('gulp-util');
gulp.header = require('gulp-header');

var q = require('q');
var prettyTime = require('pretty-hrtime');
var path = require('path');
var mergeStream = require('merge-stream');
var karma_server = require('karma').server;
var lodash = require('lodash');
var lazypipe = require('lazypipe');
var rimraf = require('rimraf');
var request = require('request');
var PusherClient = require('pusher-client');

var license = '/*!\n ' +
    '* Copyright 2014-2015 the original author or authors.\n ' +
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

function getVersion() {
    return require('./' + config.paths.dist + '/bower.json').version;
}

function getVersionTag() {
    return 'v' + getVersion();
}

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
    gulp.util.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
};

var watch = function () {
    gulp.util.log(template('Watching <%= paths.src %>/**/*'));
    gulp.watch(template('<%= paths.src %>/**/*'), ['angular-js']).on('change', watchLog);

    gulp.util.log(template('Watching <%= paths.resources %>/**/*.html'));
    gulp.watch(template('<%= paths.resources %>/**/*.html'), ['angular-templates']).on('change', watchLog);

    gulp.util.log(template('Watching <%= paths.resources %>/**/*.less'));
    gulp.watch(template('<%= paths.resources %>/**/*.less'), ['less2css']).on('change', watchLog);
};

var test = function (watch, production) {
    return function (cb) {
        var options = {};
        if (production === true) {
            options.plugins = [
                'karma-junit-reporter',
                'karma-jasmine',
                'karma-coverage',
                'karma-phantomjs-launcher'
            ];

            options.reporters = [
                'progress',
                'coverage',
                'junit'
            ];

            options.junitReporter = {
                outputFile: 'test-results.xml',
                suite: ''
            };
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

var _concatenateAndUglify = function (name) {
    var jsFilter = gulp.filter('**/*.js');

    function applyJsFilter() {
        return jsFilter;
    }

    return lazypipe()
        .pipe(applyJsFilter) // filter out '*.js.tpl' files
        .pipe(gulp.ngAnnotate, {gulpWarnings: false})
        .pipe(jsFilter.restore) // restore all files
        .pipe(gulp.concat, name + '.js')
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
    var defaultJs = gulp.src(['src/main/util/js-header.js.tpl', '<%= paths.src %>/**/*.js', 'src/main/util/js-footer.js.tpl'])
        .pipe(gulp.sourcemaps.init())
        .pipe(_concatenateAndUglify(config.pkg.name));

    var requireJs = gulp.src(['src/main/util/js-header-require.js.tpl', '<%= paths.src %>/**/*.js', 'src/main/util/js-footer-require.js.tpl'])
        .pipe(gulp.sourcemaps.init())
        .pipe(_concatenateAndUglify(config.pkg.name+'-require'));

    return mergeStream(defaultJs, requireJs);
};

var angularTemplates = function () {
    var htmlFilter = gulp.filter('**/*.html');
    var defaultJs =  gulp.src(['src/main/util/tpl-header.js.tpl', '<%= paths.resources %>/**/*.html', 'src/main/util/tpl-footer.js.tpl'])
        .pipe(gulp.sourcemaps.init())
        .pipe(htmlFilter)
        .pipe(gulp.ngHtml2js({moduleName: 'cat.template', stripPrefix: 'resources/', declareModule: false}))
        .pipe(htmlFilter.restore())
        .pipe(_concatenateAndUglify(config.pkg.name + '.tpl'));

    var htmlFilter2 = gulp.filter('**/*.html');
    var requireJs = gulp.src(['src/main/util/tpl-header-require.js.tpl', '<%= paths.resources %>/**/*.html', 'src/main/util/tpl-footer-require.js.tpl'])
        .pipe(gulp.sourcemaps.init())
        .pipe(htmlFilter2)
        .pipe(gulp.ngHtml2js({moduleName: 'cat.template', stripPrefix: 'resources/', declareModule: false}))
        .pipe(htmlFilter2.restore())
        .pipe(_concatenateAndUglify(config.pkg.name+'-require.tpl'));

    return mergeStream(defaultJs, requireJs);
};

var bowerJson = function () {
    return gulp.src(['bower.dist.json'])
        .pipe(gulp.rename('bower.json'))
        .pipe(gulp.dest(config.paths.dist));
};

var cleanTask = function (cb) {
    rimraf(config.paths.dist, cb);
};

var bowerInstall = function () {
    return gulp.bower();
};

function jshint(src) {
    return function () {
        return gulp.src(src)
            .pipe(gulp.jshint())
            .pipe(gulp.jshint.reporter(config.jshint.reporters.dev));
    };
}

gulp.task('jshint-main', jshint('<%= paths.src %>/**/*.js'));
gulp.task('jshint-test', jshint('<%= paths.test %>/**/*.js'));
gulp.task('jshint', ['jshint-main', 'jshint-test']);
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
gulp.task('angular-js', ['jshint'], angularJs);
gulp.task('angular-templates', angularTemplates);
gulp.task('clean', cleanTask);


// npm install -g http-server
// gulp docs && http-server docs/ -c -1 -p 8091

// ERROR:
// [TypeError: Cannot read property 'replace' of undefined]
// Solution:
// @name is missing in documentation?

gulp.task('docs', [], function () {
    var options = {
        html5Mode: false,
        startPage: '/api',
        title: config.pkg.name,
        titleLink: '/api'
    };
    return gulp.ngdocs
        .sections({
            api: {
                glob: [
                    'src/main/javascript/**/*.js'
                ],
                api: true,
                title: 'API Documentation'
            }
        })
        .pipe(gulp.ngdocs.process(options))
        .pipe(gulp.dest('./docs'));
});

gulp.task('watchDocs', ['docs'], function () {
    gulp.util.log(template('Watching <%= paths.src %>/**/*'));
    gulp
        .watch(template([
            '<%= paths.src %>/**/*',
            'gulpfile.js'
        ]), ['docs'])
        .on('change', watchLog);
});

function bumpVersion(type) {
    return gulp.src(['./package.json', 'bower.dist.json'])
        .pipe(gulp.bump({type: type}))
        .pipe(gulp.dest('./'));
}

gulp.task('bump-patch', function () {
    return bumpVersion('patch');
});

function preRelease(cb) {
    gulp.git.tag('pre-release', 'pre-release', {args: '-f'}, cb);
}

function releaseTag(cb) {
    var version = getVersionTag();
    gulp.git.tag(version, version, function (err) {
        if (!!err) {
            cb(err);
        } else {
            gulp.git.tag(version, version, {cwd: config.paths.dist}, cb);
        }
    });
}

gulp.task('pre-release', [], preRelease);
gulp.task('release-tag', [], releaseTag);

gulp.task('release-commit-dist', function () {
    return gulp.src('./*', {cwd: config.paths.dist})
        .pipe(gulp.git.commit(getVersionTag(), {cwd: config.paths.dist}));
});

gulp.task('release-commit', ['release-commit-dist'], function () {
    return gulp.src(['./*.json', 'dist'])
        .pipe(gulp.git.commit(getVersionTag()));
});

gulp.task('release-push-dist', function (cb) {
    gulp.git.push('origin', 'master', {cwd: config.paths.dist}, function (err) {
        if (!!err) {
            cb(err);
        } else {
            gulp.git.push('origin', getVersionTag(), {cwd: config.paths.dist}, cb);
        }
    });
});

gulp.task('release-push', ['release-push-dist'], function (cb) {
    gulp.git.push('origin', 'master', function (err) {
        if (!!err) {
            cb(err);
        } else {
            gulp.git.push('origin', getVersionTag(), cb);
        }
    });
});

var webjarPusherKey = '4a4afe0fcb8715518169';

gulp.task('release-webjar', [], function (cb) {
    var pusherClient = new PusherClient(webjarPusherKey);
    var channelId = 'cat-angular-' + getVersion() + '_' + new Date().getTime();
    var channel = pusherClient.subscribe(channelId);
    channel.bind('update', function (data) {
        gulp.util.log(data);
    });
    channel.bind('success', function (data) {
        gulp.util.log(data);
        channel.unbind();
        cb();
    });
    channel.bind('failure', function (data) {
        gulp.util.log('Received failure during webjar deploy!');
        channel.unbind();
        cb(data);
    });

    gulp.util.log('Starting webjar deploy');

    request.post('http://www.webjars.org/deploy/bower/cat-angular/' + getVersion() + '?channelId=' + channelId,
        function (error) {
            if (!!error) {
                gulp.util.log('Post request for webjar deploy failed!');
                cb(error);
            }
        });
});

function runTaskFunction(task) {
    return function () {
        var deferred = q.defer();


        var start = process.hrtime();


        var onTaskErr = function (err) {
            deferred.reject(err);
        };
        var onTaskStop = function (e) {
            if (e.task === task) {
                gulp.removeListener('task_stop', onTaskStop);
                gulp.removeListener('task_err', onTaskErr);

                var time = prettyTime(process.hrtime(start));
                gulp.util.log(
                    'Finished', '\'' + gulp.util.colors.cyan(task) + '\' with dependencies',
                    'after', gulp.util.colors.magenta(time)
                );

                deferred.resolve(e);
            }
        };

        gulp.on('task_stop', onTaskStop);
        gulp.on('task_err', onTaskErr);
        gulp.util.log('Starting \'' + gulp.util.colors.cyan(task) + '\' with dependencies');
        gulp.start(task);

        return deferred.promise;
    };
}

function release(type) {
    return runTaskFunction('pre-release')()
        .then(runTaskFunction('bump-' + type))
        .then(runTaskFunction('build'))
        .then(runTaskFunction('release-commit'))
        .then(runTaskFunction('release-tag'))
        .then(runTaskFunction('release-push'))
        .then(runTaskFunction('release-webjar'));
}

gulp.task('release-patch', [], function () {
    return release('patch');
});

gulp.task('release-minor', [], function () {
    return release('minor');
});

gulp.task('release-major', [], function () {
    return release('major');
});