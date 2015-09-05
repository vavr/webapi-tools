var gulp = require('gulp');

var source = require('vinyl-source-stream');
var browserify = require('browserify');
var tsify = require('tsify');

gulp.task('default', function() {
    var bundler = browserify({basedir: './src'})
        .add('main.ts')
        .plugin(tsify);

    return bundler.bundle()
        .pipe(source('main.js'))
        .pipe(gulp.dest('./build'));
});