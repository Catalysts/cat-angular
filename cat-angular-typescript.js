'use strict';

var gulp = require('gulp');
gulp.typescript = require('gulp-typescript');
gulp.concat = require('gulp-concat');
gulp.sourcemaps = require('gulp-sourcemaps');

var mergeStream = require('merge-stream');

var typescriptProject = gulp.typescript.createProject('src/main/typescript/tsconfig.json', {sortOutput: true});
gulp.task('typescript', function () {
    var tsResult = typescriptProject.src()
        .pipe(gulp.sourcemaps.init())
        .pipe(gulp.typescript(typescriptProject));

    var tsJs = tsResult.js
        .pipe(gulp.dest('src/main/javascript'))
        .pipe(gulp.concat('cat-angular.js'))
        .pipe(gulp.sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));

    var tsd = tsResult.dts
        .pipe(gulp.dest('dist/typings'))
        .pipe(gulp.concat('cat-angular.d.ts'))
        .pipe(gulp.dest('dist'));

    return mergeStream(tsJs, tsd);
});