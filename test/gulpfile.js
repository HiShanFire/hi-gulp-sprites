var gulp = require('gulp');

var $sprite = require('../index');
var exam = $sprite.init({
    source: './src/sprites',
    outputImg: {
        commonFile: 'common.min',
        path: './dist/images/sprites'
    },
    outputCss: {
        file: '_mixin.sprites.css',
        path: './dist/css',
        baseUrl: '../images/sprites',
        prefix: 'exam-',
        template: (data) => {
            return `@define-mixin $sprite ${data.name}{
                        background-image: url(${data.url});
                        background-position:${data.position.x} ${data.position.y};
                    }`
        }
    }
})

gulp.task('test', exam)
