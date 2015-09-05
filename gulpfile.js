var gulp = require('gulp');
var argv = require('yargs').argv;

var source = require('vinyl-source-stream');
var browserify = require('browserify');
var tsify = require('tsify');

var gulpIf = require('gulp-if');
var gulpReplace = require('gulp-replace');


gulp.task('default', function() {
    var dgisApiKey = argv["dgis-key"];
    
    var bundler = browserify({basedir: './src'})
        .add('main.ts')
        .plugin(tsify);

    return bundler.bundle()
        .pipe(source('main.js'))
        .pipe(gulpIf(dgisApiKey, gulpReplace('2GIS_API_KEY', dgisApiKey)))
        .pipe(gulp.dest('./build'));
});