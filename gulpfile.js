var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');
var fs = require('fs');
var gutil = require('gulp-util');

function compile(watch) {
    var bundler = watchify(
        browserify(
            './js/main.js', {debug: true}
        ).transform(babel),
        {
            poll: true
        }
    );

    function rebundle() {
        bundler.bundle()
            .on('error', function (err) {
                console.error(err);
                this.emit('end');
            })
            .pipe(source('build.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./build'));
    }

    if (watch) {
        bundler.on('update', function () {
            console.log('-> bundling... [' + new Date() + ']');
            rebundle();
        });
    }

    rebundle();
}

function watch() {
    return compile(true);
}

gulp.task('create-config', function(cb) {
    fs.writeFile('./js/config.json', JSON.stringify({
        env: gutil.env.env,
        tacos: 'delicious'
    }), cb);
});

gulp.task('build', ['create-config'], function () {
    return compile();
});
gulp.task('watch', ['create-config'], function () {
    return watch();
});
gulp.task('test', function () {
    return watchify();
});

gulp.task('default', ['watch']);