# hi-gulp-sprites
基于gulp.spritesmith的雪碧图工具构建方案     
建议采用gulp4


## 安装
```
npm install hi-gulp-sprites
```

## 测试
```
// node_modules/hi-gulp-sprites/
cd test
gulp test
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
        file: '_sprites.scss', // 生成css文件名
        path: './dist/css', // 生成css目录
        baseUrl: '../images/sprites', // 生成css中图片相对路径
        prefix: 'sp-', // 生成配置类名的前缀
        template: (data) => { // 输出sprites配置模板
            // 生成scss配置
            return `%${data.name}{
                        background-image: url(${data.url});
                        background-position:${data.position.x} ${data.position.y};
                    }`
        }
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
```js
// css 模板
config.outputCss.template = (data) => {
    return `%${data.name}{
                background-image: url(${data.url});
                background-position:${data.position.x} ${data.position.y};
            }`
}
```
```scss
// output
%test-a{ // ...}
%test-b{ // ...}
%test-box-1{ // ...}
%test-box-2{ // ...}
%test-box-x{ // ...}

// use
.sprites-a{
    @extend %test-box-1;
}
```

### postcss
`具体用法参照precss`
```js
// css 模板
config.outputCss.template = (data) => {
    return `@define-mixin $sprite ${data.name}{
                background-image: url(${data.url});
                background-position:${data.position.x} ${data.position.y};
            }`
}
```
```scss
// output
@define-mixin $sprite test-a{ // ... }
@define-mixin $sprite test-b{ // ... }
@define-mixin $sprite test-box-1{ // ... }
@define-mixin $sprite test-box-2{ // ... }
@define-mixin $sprite test-box-x{ // ... }

// use
.sprites-a{
    @mixin $sprite test-a;
}
```
