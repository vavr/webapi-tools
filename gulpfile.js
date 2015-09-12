var gulp = require('gulp');
var argv = require('yargs').argv;

var source = require('vinyl-source-stream');
var browserify = require('browserify');
var tsify = require('tsify');
var zip = require('gulp-zip');

var gulpReplace = require('gulp-replace');

function gulpIf(stream, condition, task) {
    return condition ? stream.pipe(task) : stream;
}

gulp.task('build', function() {
    var dgisApiKey = argv["dgis-key"];
    
    var bundler = browserify({basedir: './src'})
        .add('main.ts')
        .plugin(tsify);

    var stream = bundler.bundle().pipe(source('main.js'));
    
    return gulpIf(stream, dgisApiKey, gulpReplace('2GIS_API_KEY', dgisApiKey))
        .pipe(gulp.dest('./build'));
});
 
gulp.task('pack', function () {
    return gulp.src(['build/*', 'static/*', 'manifest.json'])
        .pipe(zip('extension.zip'))
        .pipe(gulp.dest('./'));
});