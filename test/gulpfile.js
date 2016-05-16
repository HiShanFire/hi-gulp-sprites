var gulp = require('gulp'),
    $sprite = require('../index') // require('hi-gulp-sprites')
;
var postcss = $sprite.init({
    source: './src/sprites',
    outputImg: {
        commonFile: 'common.min',
        path: './dist/images/sprites'
    },
    outputCss: {
        fileName: '_postcss.sprites',
        fileType: 'css',
        path: './dist/css/postcss',
        prefix: 'sp-',
        template: 'postcss'
    }
})

var scss = $sprite.init({
    source: './src/sprites',
    outputImg: {
        commonFile: 'common.min',
        path: './dist/images/sprites'
    },
    outputCss: {
        fileName: '_scss.sprites',
        fileType: 'scss',
        path: './dist/css/scss',
        prefix: 'sp-',
        template: 'scss'
    }
})

gulp.task('postcss', postcss)
gulp.task('scss', scss)
