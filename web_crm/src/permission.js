import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import { checkAuth } from '@/utils/checkAuth'
import notRouteBeforeRouteLeave from '@/views/finance/utils/notRouteBeforeRouteLeave'
import { setDialStyAmend } from '@/utils/setAboutDial'
const defaultSettings = require('./settings')

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/forget'] // no redirect whitelist
let ISCHROMIUM = navigator.userAgent.includes('AppleWebKit')
const hasToken = getToken()
if (hasToken) {
  let _sw_heartbeat_time = localStorage.getItem('_sw_heartbeat_time')
  if (location.host.indexOf('localhost') === -1 && new Date().getTime() - _sw_heartbeat_time > 15000) {
    store.dispatch('user/resetToken').then(() => {
    })
    router.push({ name: 'Login' })
  }
}

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  if (to.path === '/404') {
    NProgress.done()
    if (ISCHROMIUM) { next() }
    return
  }
  if (!ISCHROMIUM) {
    next({ path: '/404' })
    NProgress.done()
    window.alert('请使用谷歌Chrome浏览器或微软Edge浏览器！')
    return
  }
  // 设置title
  document.title = getPageTitle(to.meta.title)
  // 订单详情是新开浏览器窗口打开的，titie要显示订单号
  // console.log('to.path', to)
  let isOrder = to.path.startsWith('/order')||to.path.startsWith('/airTransport')||to.path.startsWith('/railway') || to.name === 'OrderFee'
  if (isOrder) {
    if (to.query.orderNo) {
      document.title = getPageTitle(to.query.orderNo)
      if (to.name === 'BookDetail') {
        document.title = getPageTitle('订舱 - '+to.query.orderNo)
      }
      if (to.name === 'OrderDetail') {
        document.title = getPageTitle('订单 - '+to.query.orderNo)
      }
    } else if (to.query.bkgReqNo) {
      document.title = getPageTitle(to.query.bkgReqNo)
    } else {
    }
  }

  // 判断是否登录
  const hasToken = getToken()
  if (hasToken) {
    if (to.path === '/login') {
      // login，跳转默认首页
      next({ path: '/' })
      NProgress.done()
    } else {
      // 获取用户权限
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        let effect = defaultSettings.pageAuthEffect // 如暂不启用此功能，在src目录下的settings将pageAuthEffect设为false
        let modules = defaultSettings.pageAuthEffectModules
        if (effect && to.path !== '/dashboard') {
          let isEffectModule = modules.some(item => {
            return to.path.startsWith('/' + item.toLowerCase())
          })
          // CRM前端有限制列表进入详情页面跳转，暂不使用页面权限控制
          let isCRM = to.path && to.path.match(/\/crm\//)
          if (isEffectModule && !checkAuth(to.name) && !isCRM) {
            NProgress.done()
            // Message.error('无权限访问')
            // 上面这个测试环境报错了，暂时没找到原因，改用下面这个方式
            Message({
              message: '无权限访问',
              type: 'error',
              duration: 2000
            })
            return
          }
        }
        notRouteBeforeRouteLeave(to, from)
        let routeDialInfoList = sessionStorage.getItem('routeDialInfoList')
        routeDialInfoList = routeDialInfoList ? JSON.parse(routeDialInfoList) : []
        let VMODAL = document.querySelector('body > .v-modal')
        let ELMSGBOXWRAP = document.querySelector('body > .el-message-box__wrapper')
        if (VMODAL && VMODAL.style.display !== 'none') {
          let ZI = VMODAL.style.zIndex
          let f = routeDialInfoList.find(item => item.name === from.name)
          if (f) {
            f.VM = true
            f.ZI = ZI
          } else {
            routeDialInfoList.push({
              name: from.name,
              VM: true,
              ZI
            })
          }
          routeDialInfoList.forEach(item => { item.ZI = ZI })
        } else {
          let f = routeDialInfoList.find(item => item.name === from.name)
          if (f) {
            f.VM = false
          } else {
            routeDialInfoList.push({
              name: from.name,
              VM: false
            })
          }
        }
        sessionStorage.setItem('routeDialInfoList', JSON.stringify(routeDialInfoList))
        setTimeout(() => {
          setDialStyAmend(to)
        }, 20)
        if (ELMSGBOXWRAP && ELMSGBOXWRAP.style.display !== 'none') {
          // let moreTArr = ['AddFeeTemplate', 'FeeTemplateDetail']
          let time = 350 // moreTArr.includes(from.name) ? 300 : 280
          setTimeout(() => {
            if (ELMSGBOXWRAP && ELMSGBOXWRAP.style.display !== 'none') {
              Message({
                type: 'error',
                message: '请完成取消或确定操作，再切换页面',
                showClose: true,
                duration: 5000
              })
              NProgress.done()
            } else {
              next()
              NProgress.done()
            }
          }, time)
        } else {
          next()
          NProgress.done()
        }
      } else {
        try {
          const { roleCodes } = await store.dispatch('user/getInfo')
          //动态生成菜单路由  调用store.dispatch('user/getMenu')
          //const roles = ['admin']
          await store.dispatch('dict/getDictList')
          await store.dispatch('dict/queryPackageList')
          // await store.dispatch('dict/baseShippingCarrierList')
          await store.dispatch('dict/baseShipTermsList')
          // await store.dispatch('dict/baseSystemLineList', {name: '', state: ''})
          // 根据roles权限生成可访问的路由表
          const accessRoutes = await store.dispatch('permission/generateRoutes', roleCodes)
          console.log('accessRoutes:', accessRoutes)

          // 动态添加可访问路由
          router.addRoutes(accessRoutes)

          // 说一直打开page体验不好，不做
          // // for refresh
          // let mainCurrPath = sessionStorage.getItem('mainCurrPath')
          // let mainVisitedViews = sessionStorage.getItem('mainVisitedViews')
          // let realCurrPath = location.href.split('#')[1]
          // realCurrPath = realCurrPath ? realCurrPath : ''
          // if (mainVisitedViews && mainCurrPath && realCurrPath === mainCurrPath) {
          //   mainVisitedViews = JSON.parse(mainVisitedViews)
          //   let i = 0
          //   let timer1 = setInterval(() => {
          //     if (i >= mainVisitedViews.length) {
          //       mainVisitedViews.forEach((item) => {
          //         if (store.state.tagsView.visitedViews.every(subItem => {
          //           return subItem.name !== item.name
          //         })) {
          //           router.push({ // 打开没有打开的页面
          //             name: item.name,
          //             query: item.query,
          //             params: item.params,
          //           })
          //         }
          //       })
          //       let realCurrPath2 = location.href.split('#')[1]
          //       realCurrPath2 = realCurrPath2 ? realCurrPath2 : ''
          //       if (!realCurrPath2.includes(mainCurrPath)) {
          //         router.push(mainCurrPath) // 处理完其他页面，再处理当前页面
          //       }
          //       return
          //     }
          //     let item = mainVisitedViews[i]
          //     if (mainCurrPath === item.fullPath) {
          //       item = mainVisitedViews[++i]
          //     }
          //     console.log('i: ', i)
          //     if (i++ < mainVisitedViews.length) {
          //       // console.log('mainCurrPath: ', mainCurrPath)
          //       // console.log('item.fullPath: ', item.fullPath)
          //       // console.log('item: ', item)
          //       console.log('item.name: ', item.name)
          //       console.log('first date: ', new Date().getTime())
          //       router.push({
          //         name: item.name,
          //         query: item.query,
          //         params: item.params,
          //       })
          //     }
          //   }, 900)
          //   let timer2 = setTimeout(() => {
          //     console.log('mainCurrPath: ', mainCurrPath)
          //     console.log('mainVisitedViews.length: ', mainVisitedViews.length)
          //     console.log('second date:', new Date().getTime())
          //     // router.push(mainCurrPath) // 移到上面
          //     clearInterval(timer1)
          //     // mainVisitedViews.forEach(item => {
          //     //   if (item.timer) {
          //     //     clearTimeout(item.timer)
          //     //   }
          //     // })
          //     clearTimeout(timer2)
          //   }, mainVisitedViews.length * 900 + 900)
          // }

          // 页面模块权限
          // await store.dispatch('user/allPageModuleCheckAuth')

          if (to.path.includes('/finance')) {
            await store.dispatch('dict/allCurrencyList', { code: '', state: '' })
            // await store.dispatch('dict/currencyList', {code: '', state: 'valid'}) // 改成在allCurrencyList处理
          } else {
            store.dispatch('dict/allCurrencyList', { code: '', state: '' }) // await 
            // store.dispatch('dict/currencyList', {code: '', state: 'valid'}) // await
          }

          notRouteBeforeRouteLeave(to, from)

          // hack方法 确保addRoutes已完成
          next({ ...to, replace: true })
        } catch (error) {
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          // Message.error(error || 'Has Error')
          Message({
            message: error || 'Has Error',
            type: 'error',
            duration: 2000
          })

          // next(`/login?redirect=${to.path}`)
          next('/login')
          NProgress.done()
        }
      }
    }
  } else {
    // 未登录
    if (whiteList.indexOf(to.path) !== -1) {
      // 免登陆白名单内，直接进入
      next()
    } else {
      // 否则全部重定向到登录页
      // next(`/login?redirect=${to.path}`)
      next('/login')
      NProgress.done()
    }
  }
})

router.afterEach((to, from) => {
  NProgress.done()
  let routeDialInfoList = sessionStorage.getItem('routeDialInfoList')
  routeDialInfoList = routeDialInfoList ? JSON.parse(routeDialInfoList) : []
  let f = routeDialInfoList.find(item => item.name === to.name)
  let VMODAL = document.querySelector('body > .v-modal')
  if (f) {
    if (f.VM) {
      setTimeout(() => {
        let ELDIALOGWRAPPERS = document.querySelectorAll('.app-main .el-dialog__wrapper')
        let bool = false
        ELDIALOGWRAPPERS.forEach(item => {
          if (item.style.display !== 'none') {
            bool = true
          }
        })
        if (bool) {
          if (!VMODAL) {
            VMODAL = document.createElement('div')
            VMODAL.className = 'v-modal'
            VMODAL.style.zIndex = f.ZI
            VMODAL.setAttribute('tabindex', 0)
            document.body.appendChild(VMODAL)
          } else {
            if (VMODAL.style.display === 'none') {
              VMODAL.style.display = 'block';
            }
          }
        } else {
          if (VMODAL) {
            VMODAL.style.display = 'none';
          }
        }
      }, 30)
    } else {
      if (VMODAL) {
        VMODAL.style.display = 'none';
      }
    }
  } else {
    if (VMODAL) {
      VMODAL.style.display = 'none';
    }
  }
})
