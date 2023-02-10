# i18n-base
> 海外版本前端的代码仓库已经建好了，i18n-base、i18n-crm、i18n-fin、i18n-order分别对应各个子系统，
技术栈继续采用 vue + element + vue-i18n（注意加入element组件的国际化），系统国际化采用vue-i18n接入。
国际化语言的接入部分，代码放在i18n-base子系统里面i18n文件夹，其中的en.js 和zh.js 分别对应语言的翻译，详见base子系统。
***
主要文件依赖版本如下：
+ "axios": "^1.1.3",
+ "core-js": "^3.8.3",
+ "element-ui": "^2.15.10",
+ "js-cookie": "^3.0.1",
+ "js-sha256": "^0.9.0",
+ "qiankun": "^2.8.4",
+ "quill": "^1.3.7",
+ "vue": "^2.6.14",
+ "vue-i18n": "^6.1.3",
+ "vue-router": "^3.5.1",
+ "vuex": "^3.6.2"

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
