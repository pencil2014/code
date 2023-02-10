import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/common.scss'
import 'default-passive-events'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './i18n'
import {
  registerMicroApps,
  start,
  setDefaultMountApp,
  runAfterFirstMounted,
  addGlobalUncaughtErrorHandler,
} from 'qiankun'
import microApps from './micro-app'
import { getToken, getLanguage } from '@/utils'
import '@/icons'

Vue.use(ElementUI, { size: 'mini', zIndex: 3000, i18n: (key, value) => i18n.t(key, value) })
Vue.config.productionTip = false

const instance = new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount('#app')

// 取缓存数据
let data = sessionStorage.getItem('store')
if (data) {
  store.setGlobalState(JSON.parse(data))
} else {
  // 没有缓存数据设置默认值
  let tags = { title: i18n.t('tags.home'), code: 'Home', activeMenu: 'Home', url: '/home' }
  store.setGlobalState({
    tags: [tags],
    activeTag: tags,
    locale: localStorage.getItem('locale') || 'en-US',
  })
}

function loader(loading) {
  if (instance && instance.$children) {
    // instance.$children[0] 是App.vue，此时直接改动App.vue的isLoading
    instance.$children[0].isLoading = loading
  }
}

// 给子应用配置加上loader方法
const apps = microApps.map((item) => {
  return {
    ...item,
    loader,
  }
})

// 添加全局的未捕获异常处理器。
addGlobalUncaughtErrorHandler((event) => {
  instance.$children[0].isLoading = false
})

registerMicroApps(apps, {
  beforeLoad: (app) => {
    console.log('before load app.name====>>>>>', app.name)
  },
  beforeMount: [
    (app) => {
      console.log('[LifeCycle] before mount %c%s', 'color: green;', app.name)
    },
  ],
  afterMount: [
    (app) => {
      console.log('[LifeCycle] after mount %c%s', 'color: green;', app.name)
    },
  ],
  afterUnmount: [
    (app) => {
      console.log('[LifeCycle] after unmount %c%s', 'color: green;', app.name)
    },
  ],
})
let token = getToken()
if (!token) {
  router.push({ name: 'Login' })
}
router.beforeEach((to, from, next) => {
  if(to.name ==='Login'){
    instance.$children[0].isLoading = false
  }
  next()
})
setDefaultMountApp('#/home')
start({
  prefetch: false,
  sandbox: {
    speedy: true
  }
})
// 第一个微应用 mount 后
// runAfterFirstMounted(()=>{})
