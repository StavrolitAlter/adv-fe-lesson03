var destDir = 'bin';
var gulp = require('gulp');
var bower = require('gulp-bower');
var gulpif = require('gulp-if');
var concat = require('gulp-concat');
var less = require('gulp-less');
var argv = require('yargs').argv;
var debug = require('gulp-debug');
var clean = require('gulp-clean');
var livereload = require('gulp-livereload');
var csscomb = require('gulp-csscomb');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var runSequence = require('run-sequence');
var minifyCss = require('gulp-minify-css');
var cssnano = require('gulp-cssnano');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var htmlhint = require("gulp-htmlhint");
var htmlminify = require("gulp-html-minify");
var rename = require("gulp-rename");
var autoprefixer = require('gulp-autoprefixer');
var gitmodified = require('gulp-gitmodified');
var imagemin = require('gulp-imagemin');

// Lection tasks declaration
gulp.task('defaultAlter', ['libs', 'build']);
gulp.task('bower', function() {
	return bower('libs');
});
gulp.task('build', ['copy-static', 'css']);

gulp.task('libs', function() {
	return gulp.src(['libs/**/*.min.js'])
		.pipe(rename({dirname: ''}))
		.pipe(gulp.dest(destDir + '/libs'));
});
gulp.task('images', function() {
	return gulp.src(['**/*.@(png|jpg|svg)', '!**/@(node_modules|libs|bin){,/**}'])
		.pipe(imagemin())
		.pipe(gulp.dest(destDir));
});
gulp.task('html', function() {
	return gulp.src(['**/*.html', '!**/@(node_modules|libs|bin){,/**}'])
		.pipe(gulpif(argv.prod, htmlminify()))
		.pipe(gulp.dest(destDir));
});
gulp.task('css', function() {
	return gulp.src(['**/*.less', '!**/@(node_modules|libs|bin){,/**}'])
		.pipe(gulpif(argv.prod, sourcemaps.init()))
		.pipe(concat('styles.css'))
		.pipe(less())
		.pipe(cssnano())
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(gulpif(argv.prod, sourcemaps.write()))
		.pipe(gulp.dest(destDir + '/static'));
});
gulp.task('clean', function() {
	return gulp.src(destDir + '/*', {
			read: false
		})
		.pipe(clean({
			force: true
		}));
});
gulp.task('watch', function() {
	var livereloadPipe = function(file) {
		gulp
			.src(file.path)
			.pipe(livereload());
	}
	livereload.listen({
		port: 3000,
		host: localhost,
		reloadPage: 'index.html'
	});
	gulp.watch('**/*.@(png|jpg|svg)', ['images']).on('change', livereloadPipe);
	gulp.watch('**/*.html', ['html']).on('change', livereloadPipe);
	gulp.watch('**/*.js', ['js']).on('change', livereloadPipe);
	gulp.watch('**/*.less', ['css']).on('change', livereloadPipe);
});

// Homework tasks declaration
gulp.task('js', function() {
	return gulp.src(['js/*.js'])
		.pipe(gulpif(!argv.prod, sourcemaps.init()))
		.pipe(concat('resourses.js'))
		.pipe(uglify())
		.pipe(gulpif(!argv.prod, sourcemaps.write()))
		.pipe(gulp.dest(destDir));
});

gulp.task('svg', function() {
	return gulp.src(['img/*.svg'])
		.pipe(svgicons2svgfont({
			fontName: 'myfont'
		}))
		.pipe(gulp.dest(destDir + '/fonts'));
});

// CODESTYLE Tasks
gulp.task('csscomb', function() {
	return gulp.src('styles/*.less')
		.pipe(gulpif(!argv.all, gitmodified('modified')))
		.pipe(csscomb())
		.pipe(gulp.dest(function(file) {
			return file.base;
		}));
});
gulp.task('jscs', function() {
	return gulp.src('js/*.js')
		.pipe(jscs({
			fix: true
		}))
		.pipe(gulp.dest('js'));
});
gulp.task('jshint', function() {
	return gulp.src('js/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});
gulp.task('htmlhint', function() {
	return gulp.src('**/*.html')
		.pipe(htmlhint())
		.pipe(jshint.reporter());
});

// Main tasks
gulp.task('style', function() {
	runSequence(
		['csscomb', 'jscs'],
		'jshint',
		'htmlhint'
	);
});
gulp.task('default', ['html', 'css', 'js', 'libs', 'images']);

/**/
function handleError(err) {
	console.log(err.toString());
	this.emit('end');
	return this;
}