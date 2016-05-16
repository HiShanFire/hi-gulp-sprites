var fs = require('fs'),
    path = require('path'),
    gulp = require('gulp'),
    spritesmith = require('gulp.spritesmith'),
    buffer = require('vinyl-buffer'),
    merge = require("merge-stream"),
    concatCss = require('gulp-concat-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant')
;

var renderTemplate = (template, data) => {
        if(template == 'postcss'){
            return `@define-mixin ${data.name} $imgUrl:$(spriteUrl){
                        background-image: url($(imgUrl)${data.img});
                        background-position:${data.position.x} ${data.position.y};
                    }`
        }
        if(template == 'scss'){
            return `@mixin ${data.name}($imgUrl:$spriteUrl){
                        background-image: url(#{$imgUrl}${data.img});
                        background-position:${data.position.x} ${data.position.y};
                    }`
        }
        return template(data)
}

module.exports = {
    init : (options) => () => {
        var opts = Object.assign({}, {
            source: './src/images/sprites', // sprite图片源目录
            outputImg: {
                commonFile: 'common.min', // 通用sprite名
                path: './dist/images/sprites' // sprites生成目录
            },
            outputCss: {
                fileName: '_sprites', // 生成css文件名
                fileType: 'scss',
                path: './dist/css', // 生成css目录
                prefix: 'sp-', // 生成类名的前缀
                template: 'scss' // 默认scss，postcss模板，支持传入function
            }
        }, options)
        if(!fs.existsSync(opts.source)){
            return gulp.src('./')
        }
        var _files = fs.readdirSync(opts.source);
        if(_files.length === 0){
            return gulp.src('./')
        }
        // 默认一个通用sprite设置
        var spritesArr = [{ path:opts.source, name:opts.outputImg.commonFile}];
        _files.forEach( (file) => {
            var pathName = path.join(opts.source, file);
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
                    cssName: '_'+row.name+'.'+opts.outputCss.fileType,
                    // cssTemplate : '$gulp/handlebarsStr.css.handlebars'
                    cssTemplate: (data) => {
                        var tpl = [];
                        data.sprites.forEach( (row) => {
                            var cssName = opts.outputCss.prefix;
                            // 获取图片分组
                            var arr = path.relative(opts.source, row.source_image).split(path.sep);

                            if(arr.length>1){
                                // 非通用目录，加分组名字
                                cssName += arr[0] + '-' + row.name;
                            }else{
                                cssName += row.name;
                            }

                            tpl.push(renderTemplate(opts.outputCss.template, {
                                name: cssName,
                                img: row.escaped_image,
                                position:{
                                    x: row.px.offset_x,
                                    y: row.px.offset_y
                                }
                            }))
                        })
                        return tpl.join('')
                    }
                }))

            cssStreamArr.push(rowStream.css)
            rowStream.css.pipe(gulp.dest(opts.outputCss.path))

            rowStream.img
                .pipe(buffer())
                .pipe(imagemin({
                    progressive: false,
                    use: [pngquant()]
                }))
                .pipe(gulp.dest(opts.outputImg.path))
        })

        return merge.apply(this, cssStreamArr).pipe(concatCss(opts.outputCss.fileName+'.'+opts.outputCss.fileType)).pipe(gulp.dest(opts.outputCss.path))
    }
}
