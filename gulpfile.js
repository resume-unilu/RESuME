var gulp  = require('gulp'),
    pkg   = require('./package.json'),
    _     = require('lodash'),

    // files = require('./src/files').development,
    $     = require('gulp-load-plugins')({
              rename: {
                'gulp-angular-templatecache': 'templatecache',
                'gulp-clean-css': 'cleanCSS'
              }
            });
// console.log(files)
// Files
var banner = '/* resume - Version: ' + pkg.version + ' - Author: danieleguido (Daniele Guido) */\n';




gulp.task('templates', function () {
  return gulp.src('./src/templates/**/*.html')
    .pipe($.templatecache({
      module: 'miller',
      transformUrl: function(url) {
        return '/static/templates/' + url;
      }
    }))
    .pipe(gulp.dest('./src/js'))
    .pipe($.size({templates: 'js'}))
});


gulp.task('libs', function() {
  return gulp.src([
    './src/js/lib/jquery-3.1.1.min.js',
    './src/js/lib/md5.js',
    './src/js/lib/lodash.custom.min.js',
    // './src/js/lib/marked.min.js',
    './src/js/lib/markdown-it.min.js',
    './src/js/lib/markdown-it-footnote.min.js',
    './src/js/lib/markdown-it-container.min.js',
    './src/js/lib/markdown-it-attrs.min.js',
    // './src/js/lib/simplemde.min.js',
    // './src/js/lib/bibtexParse.js',
    './src/js/lib/reconnecting-websocket.min.js',

    './src/js/lib/angular.min.js',
    './src/js/lib/angular-route.min.js',
    './src/js/lib/angular-resource.min.js',
    './src/js/lib/angular-cookies.min.js',
    './src/js/lib/angular-sanitize.min.js',

    // './src/js/lib/angular-disqus.min.js',
    // './src/js/lib/angular-debounce.js',
    './src/js/lib/angular-load.min.js',
    // './src/js/lib/angular-animate.min.js',
    './src/js/lib/angular-socialshare.min.js',
    './src/js/lib/angular-ui-router.min.js',
    './src/js/lib/angular-strap.min.js',
    './src/js/lib/angular-strap.tpl.min.js',
    './src/js/lib/angular-elastic.js',
    // './src/js/lib/angular-embedly.min.js',
    // './src/js/lib/angular-embed.min.js',

    './src/js/lib/angular-local-storage.min.js',
    './src/js/lib/angular-translate.min.js',
    './src/js/lib/angular-translate-loader-static-files.min.js',
    './src/js/lib/ng-tags-input.min.js',
    './src/js/lib/ng-file-upload.min.js',

    './src/js/lib/angular-lazy-img.min.js'
  ])
    .pipe($.concat('scripts.lib.min.js'))
    .pipe($.uglify())
    // Output files
    .pipe(gulp.dest('./src/js'))
    .pipe($.size({title: 'js'}))
});

gulp.task('scripts', function() {
  return gulp.src([
      './src/js/app.js',
      './src/js/filters.js',
      './src/js/services.js',
      './src/js/controllers/**/*.js',
      './src/js/directives/*.js',
      './src/js/templates.js',

    ])
    .pipe($.concat('scripts.min.js'))
    .pipe($.uglify({mangle: false}))


    // Output files
    .pipe(gulp.dest('./src/js'))
    .pipe($.size({title: 'js'}))
});


gulp.task('scripts.rangy', function() {
  return gulp.src([
      './src/js/rangy/rangy-core.min.js',
      './src/js/rangy/rangy-textrange.min.js',
      './src/js/rangy/rangy-classapplier.min.js',
      './src/js/rangy/rangy-highlighter.js'

    ])
    .pipe($.concat('scripts.rangy.min.js'))
    // Output files
    .pipe(gulp.dest('./src/js'))
    .pipe($.size({title: 'scripts.rangy'}))
});


gulp.task('styles', function() {
  return gulp.src([
      './src/css/bootstrap.css',
      './src/css/simplemde.min.css',
      './src/css/style.css'
    ])
    .pipe($.concat('styles.min.css'))
    .pipe($.cssnano())
    .pipe(gulp.dest('./src/css'))
    .pipe($.size({title: 'css'}))

})


// Lint Javascript
gulp.task('jshint', function() {
  return gulp.src([
      './src/js/app.js',
      './src/js/filters.js',
      './src/js/services.js',
      './src/js/templates.js',
      './src/js/controllers/*.js',
      './src/js/directives/*.js',
    ])
    // .pipe($.uglify({mangle: false}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
});

gulp.task('watch', ['templates'], function() {
  gulp.watch('./src/templates/**/*.html', ['templates']);
})

// Lint rangy Javascript
gulp.task('jshint.rangy', function() {
  return gulp.src([
      './src/js/rangy/rangy-core.js',
      './src/js/rangy/rangy-classapplier.js',
      './src/js/rangy/rangy-highlighter.js'
    ])
    // .pipe($.uglify({mangle: false}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
});
// // copy and optimize stylesheet
// gulp.task('styles', function() {
//   return gulp.src('./client/src/css/*')
//     .pipe($.if('*.css', $.minifyCss()))
//       // Output files
//     .pipe(gulp.dest('./client/dist/css'))
//     .pipe($.size({title: 'styles'}));
// });

// // Optimize images
// gulp.task('images', function() {
//   return gulp.src('./client/src/images/*')
//     .pipe(gulp.dest('./client/dist/images'))
//     .pipe($.size({title: 'images'}));
// });

// // Copy web fonts to dist
// gulp.task('fonts', function() {
//   return gulp.src(['./client/src/fonts/**'])
//     .pipe(gulp.dest('./client/dist/fonts'))
//     .pipe($.size({title: 'fonts'}));
// });

// // copy (compress) locale to dist
// gulp.task('locale', function() {
//   return gulp.src(['./client/src/locale/*.json'])
//     .pipe($.jsonminify())
//     .pipe(gulp.dest('./client/dist/locale'))
//     .pipe($.size({title: 'locale'}));
// });
// // Build
// gulp.task('build', function() {

// });

// Default
gulp.task('default', ['templates', 'libs', 'scripts', 'styles']);



