/*jslint browser: true, devel: true, node: true, rhino: false, nomen: true,
         regexp: true, unparam: true, indent: 4, maxlen: 80*/

/**
 * @author Tursites / Renan
 *
 * GULP
 * -- HTML
 *    > HTMLHint (https://github.com/yaniswang/HTMLHint/wiki/Rules)
 *    > w3cJS (https://github.com/thomasdavis/w3cjs)
 *    > HTMLMin (https://github.com/kangax/html-minifier)
 * -- CSS
 *    > CSSLint (https://github.com/lazd/gulp-csslint)
 *    > Sourcemaps (https://github.com/floridoo/gulp-sourcemaps)
 *    > PostCSS (https://github.com/postcss/postcss)
 *    > Autoprefixer (https://github.com/postcss/autoprefixer)
 *    > PXtoREM (https://github.com/cuth/postcss-pxtorem)
 *    > CSSComb (https://github.com/koistya/gulp-csscomb)
 *    > CleanCSS (https://github.com/scniro/gulp-clean-css)
 * -- Javascript
 *    > ESLint (https://github.com/karimsa/gulp-jslint)
 *    > Complexity (https://github.com/alexeyraspopov/gulp-complexity)
 *    > Uglify (https://github.com/terinjokes/gulp-uglify)
 */
(function gulpClosure() {
    'use strict';

    // Gulp core.
    var gulp = require('gulp'),

        // Browser sync.
        browserSync = require('browser-sync').create(),
        reload = browserSync.reload,

        // Utils.
        plumber = require('gulp-plumber'),
        rename = require('gulp-rename'),
        cache = require('gulp-cached'),
        gutil = require('gulp-util'),

        // HTML tools.
        htmlhint = require('gulp-htmlhint'),
        htmlmin = require('gulp-htmlmin'),

        // CSS tools.
        csslint = require('gulp-csslint'),
        sourcemaps = require('gulp-sourcemaps'),
        postcss = require('gulp-postcss'),
        autoprefixer = require('autoprefixer'),
        pxtorem = require('postcss-pxtorem'),
        csscomb = require('gulp-csscomb'),
        cleanCSS = require('gulp-clean-css'),

        // Javascript tools.
        eslint = require('gulp-eslint'),
        complexity = require('gulp-complexity'),
        uglify = require('gulp-uglify'),

        // Imaging tools.
        imageMin = require('gulp-imagemin'),
        favicons = require("gulp-favicons"),

        // Configuration.
        config = {
            source: './src',
            build: './dist'
        },
        plumberOpt = {
            handleError: function (err) {
                console.log('Plumber ->', err);
                this.emit('end');
            }
        };

    /**
     * HTML build.
     */
    gulp.task('html-lint', function () {
        return gulp.src(config.source + '/html/**/*.html')
            .pipe(plumber())
            .pipe(htmlhint())
            .pipe(htmlhint.failReporter());
    });
    gulp.task('html', ['html-lint'], function htmlTask() {
        return gulp.src(config.source + '/html/**/*.html')
            .pipe(cache('html'))
            .pipe(plumber(plumberOpt))
            .pipe(htmlmin({collapseWhitespace: true}))
            .pipe(gulp.dest(config.build + '/'))
            .pipe(reload({stream: true}));
    });

    /**
     * CSS build.
     */
    gulp.task('css-lint', function cssTask() {
        return gulp.src(config.source + '/css/**/*.css')
            .pipe(plumber())
            .pipe(csslint('.csslintrc'))
            .pipe(csslint.reporter('compact'))
            .pipe(csslint.failReporter());
    });
    gulp.task('css', ['css-lint'], function cssTask() {
        var processors = [
            autoprefixer({
                browsers: ['> 1%', 'IE 7'],
                cascade: false
            }),
            pxtorem({
                replace: false
            })
        ];
        return gulp.src(config.source + '/css/**/*.css')
            .pipe(cache('css'))
            .pipe(plumber(plumberOpt))
            .pipe(sourcemaps.init())
                .pipe(csscomb())
                .pipe(postcss(processors))
                .pipe(gulp.dest(config.build + '/css/'))
                .pipe(rename({suffix: '.min'}))
                .pipe(cleanCSS())
            .pipe(sourcemaps.write('/maps/'))
            .pipe(gulp.dest(config.build + '/css/'))
            .pipe(reload({stream: true}));
    });

    /**
     * Javascript build.
     */
    gulp.task('js-lint', function () {
        return gulp.src([config.source + '/js/**/*.js'])
            .pipe(plumber())
            .pipe(eslint('.eslintrc'))
            .pipe(eslint.format())
            .pipe(eslint.failAfterError());
    });
    gulp.task('js', ['js-lint'], function jsTask() {
        return gulp.src([config.source + '/js/**/*.js'])
            .pipe(cache('js'))
            .pipe(plumber(plumberOpt))
            .pipe(complexity())
            .pipe(gulp.dest(config.build + '/js/'))
            .pipe(rename({suffix: '.min'}))
            .pipe(uglify())
            .pipe(gulp.dest(config.build + '/js/'))
            .pipe(reload({stream: true}));
    });

    /**
     * Image build.
     */
    gulp.task('img', function () {
        gulp.src([config.source + '/img/*'])
            .pipe(plumber(plumberOpt))
            .pipe(cache(imageMin()))
            .pipe(gulp.dest(config.build + '/img/'));
    });

    /**
     * Favicon build.
     * Not automatic run.
     * To use, type "gulp favicon" on the command line.
     */
    gulp.task('favicon', function () {
        return gulp.src(config.source + '/img/logo.*').pipe(favicons({
            appName: 'Portifolio',
            appDescription: 'Renan Dias Portifolio',
            developerName: 'Renan Dias',
            developerURL: 'http://renandias.io/',
            background: '#1c2e72',
            path: 'favicons/',
            url: 'http://renandias.io/',
            display: 'standalone',
            orientation: 'portrait',
            version: 1.0,
            logging: false,
            online: false,
            html: 'index.html',
            pipeHTML: true,
            replace: true
        }))
            .on('error', gutil.log)
            .pipe(gulp.dest(config.build + '/favicon/'));
    });

    /**
     * Browser sync watch.
     */
    gulp.task('watch', function watchTask() {
        browserSync.init({
            server: config.build
        });

        gulp.watch(config.source + '/html/**/*.html', ['html']);
        gulp.watch(config.source + '/css/**/*.css', ['css']);
        gulp.watch(config.source + '/js/**/*.js', ['js']);
    });

    gulp.task('default', ['html', 'css', 'js', 'img', 'watch']);
}());
