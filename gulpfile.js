var gulp = require('gulp'),
plumber = require('gulp-plumber'),
rename = require('gulp-rename'),
autoprefixer = require('autoprefixer'),
concat = require('gulp-concat'),
uglify = require('gulp-uglify'),
imagemin = require('gulp-imagemin'),
cache = require('gulp-cache'),
minifycss = require('gulp-minify-css'),
sass = require('gulp-sass'),
postcss = require('gulp-postcss'),
jshint = require('gulp-jshint'),
browserSync = require('browser-sync'),
del = require('del'),
runSequence = require('run-sequence'),
render = require('gulp-nunjucks-render'),
modernizr = require('gulp-modernizr');

// Add custom modernizr file
gulp.task('modernizr', function() {
  gulp.src('master/js/*.js')
  .pipe(modernizr('modernizr-custom.js'))
  .pipe(uglify())
  .pipe(gulp.dest("dist/js/"))
});

// Deletes the dist folder
gulp.task('clean', function() {
  return del.sync('dist');
})

// Templating Engine
gulp.task('nj', function() {
  return gulp.src('master/html/pages/**/*.html')
  .pipe(render({
    path: ['master/html/templates']
  }))
  .pipe(gulp.dest(''))
});

// Process images
gulp.task('images', function(){
  gulp.src('master/img/*')
  .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
  .pipe(gulp.dest('dist/img/'));
});

// Process sass to css
gulp.task('css', function(){
  gulp.src(['master/sass/**/*.scss'])
  .pipe(plumber({
    errorHandler: function (error) {
      console.log(error.message);
      this.emit('end');
    }}))
  .pipe(sass())
  .pipe(postcss([ autoprefixer() ]))
  .pipe(gulp.dest('dist/css/'))
  .pipe(rename({suffix: '.min'}))
  .pipe(minifycss())
  .pipe(gulp.dest('dist/css/'))
});

// Process javascripts
gulp.task('scripts', function(){
  return gulp.src('master/js/**/*.js')
  .pipe(plumber({
    errorHandler: function (error) {
      console.log(error.message);
      this.emit('end');
    }}))
  .pipe(jshint())
  .pipe(jshint.reporter('default'))
  .pipe(gulp.dest('dist/js/'))
  .pipe(concat('main.js'))
  .pipe(gulp.dest('dist/js/compiled/'))
  .pipe(rename({suffix: '.min'}))
  .pipe(uglify())
  .pipe(gulp.dest('dist/js/compiled/'))
});

// Watch all files for Browser Sync
gulp.task('default', ['live'], function(){
  gulp.watch("master/html/**/*.html", ['nj']);
  gulp.watch("master/sass/**/*.scss", ['css']);
  gulp.watch("master/js/**/*.js", ['scripts']);
  gulp.watch("master/img/*", ['images']);
});

// Build task - Cleans, processes sass and then processes scripts and images
gulp.task('build', function(callback) {
  runSequence(
    'clean', // Deleted all dist files
    'css', // SASS to CSS, Autoprefixr. Saves regular and minified
    // 'nj', This is the template builder
    'modernizr', // Creates custom modernizr file
    ['scripts', 'images'], // Runs JSHint, Concatenate & Minify. Saves regular and minified. Optimizes Images.
    callback
    )
})

// Browser sync
gulp.task('live', function () {
 var files = [
 '*.html',
 'dist/css/**/*.css',
 'dist/img/**/*.png',
 'dist/js/**/*.js'
 ];

 browserSync.init(files, {
  server: {
   baseDir: './'
 }
});
});