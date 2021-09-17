var gulp = require("gulp");
var babel = require("gulp-babel");
var uglify = require("gulp-uglify");
var webpack = require("gulp-webpack");
var ts = require("gulp-typescript");
var sourcemaps = require("gulp-sourcemaps");
var tsProject = ts.createProject("tsconfig.json");

gulp.task("default", () => {
    return tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .js.pipe(sourcemaps.write(".", {sourceRoot: '', includeContent: false}))
        .pipe(gulp.dest('dist'))
})

gulp.task("release", () => {
    tsProject.options["declaration"] = false;
    return tsProject.src()
        .pipe(tsProject())
        .pipe(babel({
            presets: ['es2015']
        }))
        // .pipe(uglify())
        .pipe(gulp.dest('release'))
})

gulp.task("watch", () => {
    gulp.watch("src/**/*.ts", ['default'], function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    })
})