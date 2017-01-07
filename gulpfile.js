// gulp
var gulp = require('gulp');
// gulp-if
var gulpif = require('gulp-if');
// gulp-imagemin
var imagemin = require('gulp-imagemin');
// jshint
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
// uglify
var uglify = require('gulp-uglify');
// concat
var concat = require('gulp-concat');
// css
var css = require('gulp-css');
// csslint
var csslint = require('gulp-csslint');
// gutil
var gutil = require('gulp-util');
// zip
var zip = require('gulp-zip');
// unzip
var unzip = require('gulp-unzip');
// htmlmin
var htmlmin = require('gulp-htmlmin');
// sequence
var sequence = require('gulp-sequence');
// print
var print = require('gulp-print');

var path = require('path');

// init params
var gulpParams = {};
process.argv[2].replace(/^-+/, '').split(',').forEach(function (e) {
        gulpParams[e.split('=')[0]] = e.split('=')[1]
    }
);

// 源资源
var fileName = gulpParams.fileName
    , paths = {
        archive: 'source/' + fileName + '.zip',
        scripts: 'dist/' + fileName + '/**/*.js',
        images: [
            'dist/' + fileName + '/**/*.jpg',
            'dist/' + fileName + '/**/*.gif',
            'dist/' + fileName + '/**/*.png',
            'dist/' + fileName + '/**/*.svg'
        ],
        css: 'dist/' + fileName + '/**/*.css',
        html: 'dist/' + fileName + '/**/*.html',
        distRoot: 'dist',
        dist: 'dist/' + fileName,
        zip: 'dist/' + fileName + '/**/*.*'
    };

// 压缩图片任务
gulp.task('images', function () {
    return gulp.src(paths.images)
        .pipe(imagemin({
            progressive: true,
            optimizationLevel:3,
            svgoPlugins: [{
                removeViewBox: false
            }]
        }))
        .pipe(gulp.dest(paths.dist))
        .pipe(print(function (filepath) {
            return "image:" + filepath + " is compressed.";
        }));
    //.pipe(notify({message: 'image <%= file.relative %> is compressed.'}));
});

// 压缩 js 文件
gulp.task('scripts', function () {
    return gulp.src(paths.scripts)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))//default
        .pipe(uglify())
        .pipe(gulp.dest(paths.dist))
        .pipe(print(function (filepath) {
            return "script:" + filepath + " is compressed.";
        }));
    //.pipe(notify({message: 'script <%= file.relative %> is compressed.'}));
});

// 压缩 css 文件
gulp.task('css', function () {
    return gulp.src(paths.css)
        .pipe(csslint())
        .pipe(csslint.reporter('text'))//compact
        .pipe(css())
        .pipe(gulp.dest(paths.dist))
        .pipe(print(function (filepath) {
            return "css:" + filepath + " is compressed.";
        }));
});

// 压缩html
gulp.task('html', function () {
    return gulp.src(paths.html)
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(paths.dist))
        .pipe(print(function (filepath) {
            return "html:" + filepath + " is compressed.";
        }));
});

// 解压缩zip包
gulp.task('unzip', function () {
    return gulp.src(paths.archive)
        .pipe(unzip())
        .pipe(gulp.dest(paths.dist));
});

// 压缩zip包
gulp.task('zip', ['images', 'scripts', 'css', 'html'], function () {
    return gulp.src(paths.zip)
        .pipe(zip(fileName + '.min.zip'))
        .pipe(gulp.dest(paths.distRoot))
        .pipe(print(function (filepath) {
            return "zip:" + filepath + " is created.";
        }));
});

// 默认执行
gulp.task('default', sequence(['unzip'], ['zip']));