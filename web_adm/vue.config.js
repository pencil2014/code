'use strict'
const { TRUE } = require('node-sass')
const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const defaultSettings = require('./src/settings.js')
const Timestamp = new Date().getTime();

function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = defaultSettings.title || '后台管理系统' // page title

const publicPathObj = {
  'development': '/',
  'staging': '/web-adm/',
  'test': '/web-adm/',
  'production': '//cdnrs.longsailing.net/web-adm/'
}
// If your port is set to 80,
// use administrator privileges to execute the command line.
// For example, Mac: sudo npm run
// You can change the port by the following methods:
// port = 7700 npm run dev OR npm run dev --port = 7700
const port = process.env.port || process.env.npm_config_port || 7700 // dev port

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
  /**
	 * You will need to set publicPath if you plan to deploy your site under a sub path,
	 * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
	 * then publicPath should be set to "/bar/".
	 * In most cases please use '/' !!!
	 * Detail: https://cli.vuejs.org/config/#publicpath
	 */
  publicPath: publicPathObj[process.env.VUE_APP_TITLE] || '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV === 'development',
  // TODO
  // TODO
  // TODO
  // TODO 用于开发环境和测试环境源码的查看，上线时需改为false
  // productionSourceMap: true,
  productionSourceMap: false,
  devServer: {
    host: '0.0.0.0',
    port: port,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: process.env.DIY
      ? require('./.env.local.js')
      : {
        // detail: https://cli.vuejs.org/config/#devserver-proxy
        // local: http://127.0.0.1:7701/admin/api/v1
        // 联调：http://192.168.0.15:80
        // staging: http://ls.com
        // test: http://lstest.com

        // '/order': {
        //   target: `http://192.168.2.86:8081/`,       // 安亮http://192.168.2.86:8081/    http://192.168.2.83:8081
        //   changeOrigin: true,
        //   pathRewrite: {
        //     '^/order': ''
        //   }
        // },
        // '/fin': {
        //   target: `http://192.168.2.243:8083`, // 192.168.2.243坤才192.168.3.193
        //   changeOrigin: true,
        //   pathRewrite: {
        //     '^/fin': ''
        //   }
        // },
        '/': {
          target: `http://lstest.com`,
          // target: `http://192.168.11.68:8080/`,
          // target: `http://81.71.10.108:8080/`,
          // target: `http://ls.com/`,
          // target: `http://218.18.53.97:8688`,
          // target: `http://192.168.3.193:8080`,
          // target: `http://127.0.0.1:7701/admin/api/v1`,
          changeOrigin: true,
          pathRewrite: {
            '^/': ''
          }
        }
        // '/fin': {
        // 	// target: `http://lstest.com`,
        // 	// target: `http://ls.com`,
        // 	// target: `http://218.18.53.97:8688`,
        // 	// target: `http://192.168.3.193:8080`,
        // 	target: `http://127.0.0.1:7701/admin/api/v1`,
        // 	changeOrigin: true,
        // 	pathRewrite: {
        // 		// '^/': ''
        // 	}
        // },
        // '/base': {
        // 	// target: `http://lstest.com`,
        // 	// target: `http://ls.com`,
        // 	// target: `http://218.18.53.97:8688`,
        // 	// target: `http://192.168.3.193:8080`,
        // 	target: `http://127.0.0.1:7701/admin/api/v1`,
        // 	changeOrigin: true,
        // 	pathRewrite: {
        // 		// '^/': ''
        // 	}
        // },
      },
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
  },
  configureWebpack: {
    output: {
			library: `adm`,
			libraryTarget: 'umd', // 把微应用打包成 umd 库格式
			jsonpFunction: `webpackJsonp_adm`
		},
    // 关闭webpack性能提示
    performance: {
      hints: false
    },
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: name,
    resolve: {
      alias: {
        '@': resolve('src')
      }
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              warnings: false
            }
          },
          parallel: true // 多进程打包
        })
      ]
    }
  },
  chainWebpack(config) {
    config.cache(true)
    // 添加本地变量控制打印，websocket打印太频繁，影响本地开发
    config.plugin('define').tap((args) => {
      const name = 'process.env'
      args[0][name] = Object.assign({}, args[0][name], { DIY: !!process.env.DIY })
      return args
    })
    // it can improve the speed of the first screen, it is recommended to turn on preload
    config.plugin('preload').tap(() => [
      {
        rel: 'preload',
        // to ignore runtime.js
        // https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-service/lib/config/app.js#L171
        fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
        include: 'initial'
      }
    ])

    // when there are many pages, it will cause too many meaningless requests
    config.plugins.delete('prefetch')

    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
    config.module.rule('fonts').use('url-loader').loader('url-loader').options({}).end()
		config.module.rule('images').use('url-loader').loader('url-loader').options({}).end()

    config.when(process.env.NODE_ENV !== 'development', config => {
      config
        .plugin('ScriptExtHtmlWebpackPlugin')
        .after('html')
        .use('script-ext-html-webpack-plugin', [
          {
            // `runtime` must same as runtimeChunk name. default is `runtime`
            inline: /runtime\..*\.js$/
          }
        ])
        .end()
      config.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          libs: {
            name: 'chunk-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial' // only package third parties that are initially dependent
          },
          elementUI: {
            name: 'chunk-elementUI', // split elementUI into a single package
            priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
          },
          commons: {
            name: 'chunk-commons',
            test: resolve('src/components'), // can customize your rules
            minChunks: 3, //  minimum common number
            priority: 5,
            reuseExistingChunk: true
          }
        }
      })
      // https:// webpack.js.org/configuration/optimization/#optimizationruntimechunk
      config.optimization.runtimeChunk('single')
    })
  },
  css: {
    extract: { ignoreOrder: true },
  },
}
