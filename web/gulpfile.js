var gulp       = require("gulp"),
  sass         = require("gulp-sass"),
  autoprefixer = require("gulp-autoprefixer"),
  hash         = require("gulp-hash"),
  concat       = require("gulp-concat"),
  uglify       = require("gulp-uglify"),
  del          = require("del");
  
// Compile SCSS files to CSS
gulp.task("scss", function () {
  del(["static/css/**/*"]);
  gulp.src("src_static/scss/*.scss")
    .pipe(sass({
      outputStyle : "compressed"
    }))
    .pipe(autoprefixer({browsers : ["last 20 versions"]}))
    // .pipe(hash())
    .pipe(gulp.dest("public/css"))
    .pipe(gulp.dest("static/css"))
    .pipe(hash.manifest("hash.json"))
    .pipe(gulp.dest("data/css"));
});

// Hash javascript
gulp.task("js", function () {
  del(["static/js/**/*"]);
  gulp.src("src_static/js/main/**/*")
    .pipe(concat('main.js'))
    // .pipe(hash())
    .pipe(gulp.dest("static/js"))
    .pipe(uglify())
    .pipe(hash.manifest("hash.json"))
    .pipe(gulp.dest("data/js"));
  gulp.src("src_static/js/vendor/**/*")
    .pipe(concat('vendor.js'))
    // .pipe(hash())
    .pipe(gulp.dest("static/js"))
    .pipe(uglify())
    .pipe(hash.manifest("hash.json"))
    .pipe(gulp.dest("data/js"));
});

// Watch asset folder for changes
gulp.task("watch", ["scss", "js", "fonts"], function () {
  gulp.watch("src_static/scss/**/*", ["scss"]);
  gulp.watch("src_static/js/**/*", ["js"]);
  gulp.watch("src_static/fonts/**/*", ["fonts"]);
});

gulp.task('fonts', function() {
  del(["static/fonts/**/*"]);
  gulp.src(['node_modules/font-awesome/fonts/fontawesome-webfont.*',"src_static/fonts/**/*"])
    .pipe(gulp.dest('static/fonts/'));
});

gulp.task("default", ["watch"])

gulp.task("build", ["scss", "js", "fonts"] )