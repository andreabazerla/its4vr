const gulp = require('gulp');
// const concat = require('gulp-concat');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
// const clean = require('gulp-clean-css');
const cssmin = require('gulp-cssmin');
const babelify = require('babelify');
const uglify = require('gulp-uglify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserSync = require('browser-sync').create();
const nodemon = require('gulp-nodemon');

gulp.task('style', () => {
  gulp.src('app/scss/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('app/css/'))
    .pipe(cssmin())
    .pipe(rename({
      basename: 'style',
      suffix: '.min',
      extname: '.css',
    }))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream());
});

gulp.task('script', () => {
  browserify({
    entries: ['./app/js/main.js'],
  })
  .transform(babelify.configure({
    presets: ['es2015'],
  }))
  .bundle()
  .pipe(source('script.min.js'))
  .pipe(buffer())
  .pipe(uglify())
  .pipe(gulp.dest('./dist'))
  .pipe(browserSync.stream());
});

gulp.task('watch', () => {
  browserSync.init({
    proxy: '127.0.0.1/its4vr/',
    injectChanges: true,
    notify: false,
    port: 8080,
  });

  gulp.watch(['./*.html', './*.php']).on('change', browserSync.reload);
  gulp.watch('app/scss/**/*.scss', ['style']);
  gulp.watch('app/js/**/*.js', ['script']);
  gulp.watch('app/php/**/*.php').on('change', browserSync.reload);
});

gulp.task('develop', () => {
  nodemon({
    script: './app/js/_xml2js.js',
  });
});

gulp.task('default', ['style', 'script', 'watch']);
