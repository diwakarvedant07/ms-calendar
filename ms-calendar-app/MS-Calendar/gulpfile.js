var gulp = require("gulp");
var sass = require("gulp-sass")(require("sass"));
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var uglifycss = require("gulp-uglifycss");
var autoprefixer = require("gulp-autoprefixer");
var plumber = require("gulp-plumber");
var browserSync = require("browser-sync").create();
var sourcemaps = require("gulp-sourcemaps");

paths = {
  bundles: "./app/assets/bundles",
};

function scss() {
  return gulp
    .src(["scss/**/*.scss", "scss/*.scss"])
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(sourcemaps.write({ includeContent: false }))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("app/assets/css/"));
}

//Copy, compile, minify all scripts
function scripts(done) {
  gulp
    .src([
      paths.bundles + "/jquery.min.js",
      paths.bundles + "/popper.js",
      paths.bundles + "/tooltip.js",
      paths.bundles + "/bootstrap/js/bootstrap.min.js",
      paths.bundles + "/nicescroll/jquery.nicescroll.min.js",
      paths.bundles + "/moment.min.js",
      paths.bundles + "/feather-icons/dist/feather.min.js",
    ])
    .pipe(plumber())
    .pipe(concat("app.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest("./app/assets/js/"));
  done();
}

function styles(done) {
  return gulp
    .src([
      paths.bundles + "/bootstrap/css/bootstrap.min.css",
      paths.bundles + "/fontawesome/css/all.min.css",
      paths.bundles + "/material-icons/material-icons.css",
    ])
    .pipe(concat("app.min.css"))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 2 versions"],
        cascade: false,
      })
    )
    .pipe(uglifycss())
    .pipe(gulp.dest("./app/assets/css/"));
  done();
}

function watch() {
  browserSync.init({
    server: {
      baseDir: "./app",
    },
  });
  gulp.watch("scss/**/*.scss", scss);
  gulp.watch("scss/*.scss", scss);
  gulp.watch("app/*.html").on("change", browserSync.reload);
  gulp
    .watch(["app/assets/js/**/*.js", "app/assets/js/*.js"])
    .on("change", browserSync.reload);
}

gulp.task("scss", scss);
gulp.task("scripts", scripts);
gulp.task("style", styles);
gulp.task("watch", watch);

gulp.task("default", gulp.series(scss, scripts, styles));
