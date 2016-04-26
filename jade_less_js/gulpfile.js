/*jslint browser: true, devel: true, node: true, rhino: false, nomen: true,
         regexp: true, unparam: true, indent: 4, maxlen: 80*/

// Polyfill
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        'use strict';
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}

/**
 * @author Tursites / Renan
 *
 * GULP
 * -- HTML
 *    > Jade
 *    > Jade lint
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
 * -- Images
 *    > ImageMin
 * -- Favicons
 *    > Favicons
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
        data = require('gulp-data'),
        path = require('path'),

        // HTML tools.
        jade = require('gulp-jade'),
        marked = require('marked'),
        jadelint = require('gulp-jadelint'),

        // CSS tools.
        lesshint = require('gulp-lesshint'),
        sourcemaps = require('gulp-sourcemaps'),
        less = require('gulp-less'),
        LessPluginCleanCSS = require('less-plugin-clean-css'),
        LessPluginAutoPrefix = require('less-plugin-autoprefix'),
        LessPluginCSScomb = require('less-plugin-csscomb'),
        cleancss = new LessPluginCleanCSS({advanced: true}),
        autoprefix = new LessPluginAutoPrefix({browsers: ["last 2 versions"]}),
        csscomb = new LessPluginCSScomb("zen"),

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
    gulp.task('jade-lint', function () {
        return gulp.src(config.source + '/jade/**/*.jade')
            .pipe(plumber())
            .pipe(jadelint());
    });
    gulp.task('jade', ['jade-lint'], function htmlTask() {
        return gulp.src([
            config.source + '/jade/**/*.jade',
            '!' + config.source + '/jade/layouts/**/*.jade'
        ])
            .pipe(plumber(plumberOpt))
            .pipe(data(function (file) {
                var filename = path.basename(file.path);
                if (filename.startsWith('_')) {
                    return {};
                }
                return require(config.source + '/jade/data/' +
                    filename + '.json');
            }))
            .pipe(jade())
            .pipe(gulp.dest(config.build + '/'))
            .pipe(reload({stream: true}));
    });

    /**
     * CSS build.
     */
    gulp.task('less-lint', function cssTask() {
        return gulp.src(config.source + '/less/**/*.less')
            .pipe(plumber())
            .pipe(lesshint({
                // Options
            }))
            .pipe(lesshint.reporter())
            .on('error', function () {
                gutil.log('Less lint error');
            });
    });
    gulp.task('less', ['less-lint'], function cssTask() {
        return gulp.src(config.source + '/less/style.less')
            .pipe(plumber(plumberOpt))
            .pipe(sourcemaps.init())
            .pipe(less({
                plugins: [autoprefix, csscomb, cleancss]
            }))
            .pipe(rename({suffix: '.min'}))
            .pipe(sourcemaps.write())
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

        gulp.watch(config.source + '/jade/**/*.jade', ['jade']);
        gulp.watch(config.source + '/less/**/*.less', ['less']);
        gulp.watch(config.source + '/js/**/*.js', ['js']);
    });

    gulp.task('default', ['jade', 'less', 'js', 'img', 'watch']);
}());
