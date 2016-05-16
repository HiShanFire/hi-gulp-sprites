# hi-gulp-sprites
基于gulp.spritesmith的雪碧图工具构建方案     
建议采用gulp4

## 安装
```
// node_modules/
cd
npm install hi-gulp-sprites
```

## 测试
```
// node_modules/hi-gulp-sprites/
cd test
gulp postcss
gulp scss
```

## 基础设置
```js
// 项目根目录/gulpfile.js
var gulp = require('gulp'),
    $sprite = require('hi-gulp-sprites');

var config = {
    source: './src/sprites', // sprite图片源目录
    outputImg: {
        commonFile: 'common.min', // 通用sprite名
        path: './dist/images/sprites' // sprites生成目录
    },
    outputCss: {
        fileName: '_sprites.scss', // 生成的文件名
        fileType: 'scss', // 生成的文件格式
        path: './dist/css', // 生成css目录
        prefix: 'sp-', // 生成配置类名的前缀
        template: 'scss' // 预设scss、postcss模板，支持自定义模板(function)
    }
};

gulp.task('sprites', $sprite.init(config))
```

## 打包策略图示
![sprites](https://cloud.githubusercontent.com/assets/3962259/15205493/58628638-184a-11e6-8bb7-59e2be0e752e.png)    

- 默认将`source`路径`(不遍历二级目录)`下的图片合并生成通用sprite`(commonFile为文件名)`     
- 默认将`source`路径的二级目录为分组`(分组目录下的所有图片都会被合并)`，目录名即为分组名    
- `分组下不建议再建子目录`（若分组内存在同名的图片，则会生成同名的css配置，最后写入的配置会覆盖之前的）  

**exam**   

```js
// source
src/sprites/
-- a.png
-- b.png
-- box/
    -- 1.png
    -- 2.png
    -- sub/
        -- x.png
        -- y.png
-- foo/
    -- m.png
    -- n.png

// output
dist/imgages/sprites/
-- common.min.png // [a.png, b.png]
-- box.png // [box/1.png, box/2.png, box/sub/x.png, box/sub/y.png]
-- foo.png // [foo/m.png, foo/n.png]

dist/css/
-- _sprites.scss
```

## 生成css配置
生成css/scss配置的默认格式为 *prefix-[groupname]-filename*     
**exam**    
设置前缀为'test-' `(config.outputCss.prefix = 'test-')`

### SASS
[Sass在线工具](http://www.sassmeister.com/)
```js
// css 模板
config.outputCss.template = (data) => {
    return `@mixin ${data.name}($imgUrl:$spriteUrl){
                background-image: url(#{$imgUrl}${data.img});
                background-position:${data.position.x} ${data.position.y};
            }`
}
```
```scss
// template output
@mixin test-a($imgUrl:$spriteUrl){ // ...}
@mixin test-b($imgUrl:$spriteUrl){ // ...}
@mixin test-box-1($imgUrl:$spriteUrl){ // ...}
@mixin test-box-2($imgUrl:$spriteUrl){ // ...}
@mixin test-box-x($imgUrl:$spriteUrl){ // ...}

// use
$spriteUrl:'../images/sprites/';
.sprites-a{
    @include test-a();
}
.sprites-b{
    @include test-a($spriteUrl);
}
.sprites-c{
    @include test-a('../images/foo/');
}
```

### postcss
语法参照[Precss](https://github.com/jonathantneal/precss)    
*[在线工具](http://jonathantneal.github.io/precss/)*
```js
// css 模板
config.outputCss.template = (data) => {
    return `@define-mixin ${data.name} $imgUrl:$(spriteUrl){
                background-image: url($(imgUrl)${data.img});
                background-position:${data.position.x} ${data.position.y};
            }`
}
```
```postcss
// template output
@define-mixin test-a $imgUrl:$(spriteUrl){ // ... }
@define-mixin test-b $imgUrl:$(spriteUrl){ // ... }
@define-mixin test-box-1 $imgUrl:$(spriteUrl){ // ... }
@define-mixin test-box-2 $imgUrl:$(spriteUrl){ // ... }
@define-mixin test-box-x $imgUrl:$(spriteUrl){ // ... }

// use
$spriteUrl: ../images/sprite/;
.sprites-a{
    @mixin test-a;
}
.sprites-b{
    @mixin test-b $(spriteUrl);
}
.sprites-c{
    @mixin test-b ../foo/;
}
```
