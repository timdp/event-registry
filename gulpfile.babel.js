'use strict'

import gulp from 'gulp'
import loadPlugins from 'gulp-load-plugins'
import {Instrumenter} from 'isparta'
import del from 'del'
import seq from 'run-sequence'

const $ = loadPlugins()

const plumb = () => $.plumber({
  errorHandler: $.notify.onError('<%= error.message %>')
})

const test = () => {
  return gulp.src(['test/lib/setup.js', 'test/unit/**/*.js'], {read: false})
    .pipe($.mocha({reporter: 'dot'}))
}

gulp.task('clean', () => del('lib'))

gulp.task('build', ['test'], () => {
  return gulp.src('src/**/*.js')
    .pipe(plumb())
    .pipe($.babel())
    .pipe(gulp.dest('lib'))
})

gulp.task('cleanbuild', (cb) => seq('clean', 'build', cb))

gulp.task('coverage', (cb) => {
  gulp.src('src/**/*.js')
    .pipe($.istanbul({instrumenter: Instrumenter}))
    .pipe($.istanbul.hookRequire())
    .on('finish', () => test().pipe($.istanbul.writeReports()).on('end', cb))
})

gulp.task('coveralls', ['coverage'], () => {
  return gulp.src('coverage/lcov.info')
    .pipe($.coveralls())
})

gulp.task('test', test)

gulp.task('watch', () => gulp.watch('{src,test}/**/*', ['cleanbuild']))

gulp.task('default', ['cleanbuild'], () => gulp.start('watch'))
