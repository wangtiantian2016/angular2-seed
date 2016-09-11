'use strict';

var merge = require('merge');
var autoprefixer = require('autoprefixer');
var doiuse = require('doiuse');
var plugins = require('gulp-load-plugins')();

var defaultOptions = {
  source: ['./src/pages/index.scss'],
  injectSource: [
    './src/pages/**/*.scss',
    '!./src/pages/index.scss'
  ],
  target: './www/css',
  sassLint: {
    rules: {
      indentation: {
        size: 4
      }
    }
  },
  postcssOptions: [
    autoprefixer({
      browsers: [
        'last 2 versions',
        'iOS >= 7',
        'Android >= 4',
        'Explorer >= 10',
        'ExplorerMobile >= 11'
      ],
      cascade: false
    }),
    doiuse({
      browsers: ['ie >= 9', '> 1%'],
      ignore: ['rem'], // an optional array of features to ignore
      ignoreFiles: [], // an optional array of file globs to match against original source file path, to ignore
      onFeatureUsage: function (usageInfo) {
        console.log(usageInfo.message);
      }
    })
  ],
  onError: function (err) {
    console.error(err.message);
    this.emit('end'); // Don't kill watch tasks - https://github.com/gulpjs/gulp/issues/259
  }
};

module.exports = function (gulp, browserSync, options) {
  return function () {
    options = merge(defaultOptions, options);
    return gulp.src(options.source)
      .pipe(plugins.inject(
        gulp.src(options.injectSource)
          .pipe(plugins.sassLint(options.sassLint))
          .pipe(plugins.sassLint.format()), {
          relative: true,
          removeTags: true
        })
      )
      .pipe(plugins.plumber())
      .pipe(plugins.sass({
        outputStyle: 'expanded'
      }))
      .on('error', defaultOptions.onError)
      .pipe(plugins.postcss(defaultOptions.postcssOptions))
      .pipe(gulp.dest(options.target))
      .pipe(browserSync.stream());
  }
};