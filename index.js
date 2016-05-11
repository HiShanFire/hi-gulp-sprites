var fs = require('fs'),
    path = require('path'),
    gulp = require('gulp'),
    spritesmith = require('gulp.spritesmith'),
    buffer = require('vinyl-buffer'),
    merge = require("merge-stream"),
    concatCss = require('gulp-concat-css')
;

module.exports = {
    /**
    @opts = {
        sourcePath : path.join($path.dev, 'sprites'), // sprite图片源目录
        imgDist : path.join($path.dev_server, 'images/sprites'), // sprite图片生成目录
        defaultImgNameDist : 'common.min', // 通用sprite图片名称
        cssDist : path.join($path.dev, 'css/sprites'), // 生成css目录
        cssNameDist : '_mixin.sprite.css', // 生成css的文件名称
        relativePath : '../images/sprites', // 生成css中的图片相对路径
        mixinPrefix : 'sp_' // 生成css中mixin的前缀
    }
    */
    init : (options) => () => {
        var opts = Object.assign({}, {
            defaultImgNameDist : 'common.min',
            cssNameDist : '_mixin.sprite.css',
            relativePath : '../images/sprites',
            mixinPrefix : 'sp-',
            cssTemplate : null
        }, options)
        var _files = fs.readdirSync(opts.sourcePath);
        // 默认一个通用sprite设置
        var spritesArr = [{ path:opts.sourcePath, name:opts.defaultImgNameDist}];
        _files.forEach( (file) => {
            var pathName = path.join(opts.sourcePath, file);
            // 存在分组目录
            if(fs.statSync(pathName).isDirectory()){
                spritesArr.push({
                    path: pathName,
                    name: file
                })
            }
        })

        var cssStreamArr = [];

        spritesArr.forEach( (row, index) => {
            var src = row.path;
            // 分组目录遍历所有后代
            if(index === 0){
                src += '/*.{jpg,png}'
            }else{
                src += '/**/*.{jpg,png}'
            }

            var rowStream = gulp.src(src)
                .pipe(spritesmith({
                    imgName: row.name+'.png',
                    cssName: '_'+row.name+'.css',
                    // cssTemplate : '$gulp/handlebarsStr.css.handlebars'
                    cssTemplate: (data) => {
                        var tpl = [];
                        data.sprites.forEach( (row) => {
                            var cssName = opts.mixinPrefix;
                            // 获取图片分组
                            var arr = path.relative(opts.sourcePath, row.source_image).split(path.sep);

                            if(arr.length>1){
                                // 非通用目录，加分组名字
                                cssName += row.name + '-' + arr[0];
                            }else{
                                cssName += row.name;
                            }
                            var _innerStr = '';
                            if(!opts.cssTemplate){
                                _innerStr = `@define-mixin $sprite ${cssName}{
                                                background-image: url( ${path.join(opts.relativePath, row.escaped_image)});
                                                background-position:${row.px.offset_x} ${row.px.offset_y};
                                            }`;
                            }else{
                                _innerStr = opts.cssTemplate({
                                    name: cssName,
                                    url: path.join(opts.relativePath, row.escaped_image),
                                    position:{
                                        x: row.px.offset_x,
                                        y: row.px.offset_y
                                    }
                                })
                            }

                            tpl.push(_innerStr)
                        })
                        return tpl.join('')
                    }
                }))

            cssStreamArr.push(rowStream.css)
            rowStream.css.pipe(gulp.dest(opts.cssDist))

            rowStream.img
                .pipe(buffer())
                // .pipe()mini
                .pipe(gulp.dest(opts.imgDist))
        })

        return merge.apply(this, cssStreamArr).pipe(concatCss(opts.cssNameDist)).pipe(gulp.dest(opts.cssDist))
    }
}
