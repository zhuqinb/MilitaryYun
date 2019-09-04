var gulp = require('gulp');
var path = require('path')

var electron = require('electron-connect').server.create();

var ROOT_PATH = path.resolve(__dirname);

gulp.task('default', function () {

    electron.start();

    gulp.watch(['./main.js'], electron.restart);
    gulp.watch(['./assets/*.{html,js,css,json}', './index.html'], electron.reload);

})