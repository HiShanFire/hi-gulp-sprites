var gulp = require('gulp');


var $sprite = require('../index');
var exam = $sprite.init({
    sourcePath : './src/sprites',
    cssDist : './dist/css',
    imgDist : './dist/images/sprites',
    cssNameDist : '_mixin.sprite.css',
    relativePath : '../images/sprites',
    mixinPrefix : 'test-',
    cssTemplate : function(opts){
        return `@define-mixin $exam ${opts.name}{
                        background-image: url( ${opts.url});
                        background-position:${opts.position.x} ${opts.position.y};
                    }`
    }
})

gulp.task('test', exam)
