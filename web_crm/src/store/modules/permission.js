import { asyncRoutes, constantRoutes } from '@/router'
import { getMenu } from '@/api/user'
import Layout from '@/layout/index'
import { allMenuCheckAuth, pagesForAuthHistory } from '@/api/base'
import { assemblePageModuleAuth } from '@/utils/checkAuth'
const defaultSettings = require('../../settings')

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  // console.log('roles', roles, route);
  
  if (route.meta && route.meta.roles) {
    console.log(route.meta.roles);
    console.log(roles.some(role => route.meta.roles.includes(role)))
    if (route.meta.roles.indexOf(roles) > -1) {
      return true
    } else {
      return false
    }
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []
  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: [],
  menuRoutes: [],
  allPageModuleAuth: [],
  pagesForAuthHistory: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  },
  SET_MENU_ROUTES: (state, routes) => {
    state.menuRoutes = constantRoutes.concat(routes)
  },
  SET_allPageModuleAuth: (state, data) => {
    state.allPageModuleAuth = data
  },
  SET_pagesForAuthHistory: (state, data) => {
    state.pagesForAuthHistory = data
  }
}

const actions = {
  // 生成路由
  generateRoutes({ commit }, roles) {
    // 后端没有配角色，这里把roles写死，防止无限循环路由
    if (!roles.length) commit('user/SET_ROLES', roles.concat(['xxx']), {root: true})
    return new Promise(resolve => {
      // let accessedRoutes
      // if (roles.includes('admin')) {
      //   accessedRoutes = asyncRoutes || []
      // } else {
      //   accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      // }
      // commit('SET_ROUTES', accessedRoutes)
      // resolve(accessedRoutes)

      // admin改成同样处理，已返回数据
      // if (roles.includes('admin')) {
      //   commit('SET_ROUTES', asyncRoutes)
      //   commit('SET_MENU_ROUTES', asyncRoutes)
      //   resolve(asyncRoutes)
      // } else {
        allMenuCheckAuth({}).then(res => {
          let effect = defaultSettings.menuAuthEffect, routes // 如暂不启用此功能，在src目录下的settings将menuAuthEffect设为false
          let menusFront = []
          let pagesFront = []
          if (effect) {
            // 配置时，粘贴复制极易出现空格，不易找错，此处强制去掉空格(所有空格，后续如有特殊需求要保留空格，则改为递归去掉resourceCode内空格)
            let str = JSON.stringify(res.data).replace(/\s/g, '')
            res.data = JSON.parse(str)
            let menus = filterMenus(res.data)
            // routes = filterRoutes(asyncRoutes, res.data.menu)
            console.log('resourcemenus', menus)
            menusFront = generateMenusFront(asyncRoutes, menus) // res.data.menu
            console.log('frontmenus:', menusFront)
            let pageModules = filterPageModules(res.data)
            assemblePageModuleAuth(pagesFront, pageModules) // data.pages
            // console.log('frontpages:', pagesFront)
          } else {
            routes = asyncRoutes
            menusFront = asyncRoutes // pagesFront不处理
          }
          commit('SET_ROUTES', asyncRoutes)
          commit('SET_MENU_ROUTES', menusFront) // routes
          commit('SET_allPageModuleAuth', pagesFront)
          resolve(asyncRoutes) // routes
        })
      // }
      // commit('SET_ROUTES', asyncRoutes)
      // resolve(asyncRoutes)
      pagesForAuthHistory({}).then(res => {
        let data = res.data
        if (typeof data === 'string') {
          data = [
            'route-CreateSettlement',
            'route-InvoiceReceivableApply',
            'route-ManualRegistInvoice',
            'route-InvoicePrerevApply',
            'route-SettlementPayApply',
            'route-FinBillListAdd',
            'route-SettlementBillList',
            'route-SettlementBillDetail',
            'route-InvoicePaymentListReg',
            'route-InvoicePaymentListEdit',
            'route-PayPrepayPrint',
            'route-PaySettlePrint',
            'route-PaySettlePrints',
            'route-PayOrderPrint',
            'route-PayOrderPrints',
            'route-PayRefundPrint',
            'route-TotalCloseRecord',
            'route-TotalCloseDetail',
            'route-InvestorPrepayDetail',
            'route-InvestorPrepayDetailMore',
            'route-InvestorPrepayDetailDetail',
            'route-PrerevAccountDetail',
            'route-PrerevAccountDetailMore',
            'route-PrerevAccountDetailDetail',
            'route-AddFeeTemplate',
            'route-FeeTemplateDetail',
            'route-CreateGedging',
            'route-HedgeDetail',
            'route-ConfirmBillDetail',
            'route-SummaryBillDetail',
            'route-BalanceLoss',
            'route-PaymentRequest'
          ]
        }
        data = data.map(item => item.replace('route-', ''))
        commit('SET_pagesForAuthHistory', data)
      })
    })
  }

  // // 向后端请求路由数据
  // generateRoutes({ commit }) {
  //   return new Promise(resolve => {
  //     getMenu().then(res => {
  //       const accessedRoutes = filterAsyncRouter(res.data)
  //       accessedRoutes.push({ path: '*', redirect: '/404', hidden: true })
  //       commit('SET_ROUTES', accessedRoutes)
  //       resolve(accessedRoutes)
  //     })
  //   })
  // }
}

function filterRoutes(routes, menus) {
  menus = menus.filter(menu => {
    return menu.auth === 'yes'
  })
  let routesFilter = []
  menus.forEach((menu, menuIndex) => {
    let routeFind = routes.find(route => {
      if (route.name === menu.menuCode) {
        route.meta.title = menu.menuName
        route.menuIndex = menuIndex
      }
      return route.name === menu.menuCode
    })
    if (routeFind) {
      let routeForMenu = Object.assign({}, routeFind)
      if (menu.subMenu.length > 0) {
        if (routeForMenu.children) {
          routeForMenu.children = filterRoutes(routeForMenu.children, menu.subMenu) // 用routeForMenu，否则children会指向原来routes的子项
        } else {
          console.log(`菜单"${routeForMenu.meta && routeForMenu.meta.title}"配置不正确`)
          routeForMenu.children = []
        }
      } else {
        routeForMenu.children = []
      }
      routesFilter.push(routeForMenu)
    }
  })
  routesFilter = routesFilter.sort(function(a, b) { 
    return a.menuIndex - b.menuIndex
   })
  routes.forEach(item => {
    if (item.hidden) {
      routesFilter.push(item)
    }
  })
  return routesFilter
}

function filterMenus(data) {
  let menus = []
  data.forEach(item => {
    if (item.resourceType === 'menu') {
      item.menuCode = item.resourceCode.startsWith('route-') ? item.resourceCode.replace('route-', '') : item.resourceCode // 兼容后期新增的可能包含route-
      item.menuName = item.resourceName
      if (item.subResource.length) {
        item.subMenu = filterMenus(item.subResource)
      } else {
        item.subMenu = []
      }
      menus.push(item)
    }
  })
  return menus
}

function filterPageModules(data) {
  let pageModules = []
  data.forEach(item => {
    item.moduleCode = item.resourceCode
    item.moduleName = item.resourceName
    item.moduleAuth = item.auth
    if (item.subResource.length) {
      item.modules = filterPageModules(item.subResource)
    } else {
      item.modules = []
    }
    pageModules.push(item)
  })
  return pageModules
}

function generateMenusFront(routes, menus) {
  let routesTiled = []
  generateRoutesTiled(routes, routesTiled)
  return generateMenusFrontSpecific(menus, routesTiled)
}

function generateRoutesTiled(routes, routesTiled) {
  routes.forEach(route => {
    if (route.children) {
      let { path, name, meta } = route
      let obj = { path, name, meta }
      if (route.hasOwnProperty('alwaysShow')) {
        obj.alwaysShow = route.alwaysShow
      }
      if (route.hasOwnProperty('hidden')) {
        obj.hidden = route.hidden
      }
      routesTiled.push(obj)
      generateRoutesTiled(route.children, routesTiled)
    } else {
      routesTiled.push(route)
    }
  })
}

function generateMenusFrontSpecific(menus, routesTiled, isSubMenu) {
  menus = menus.filter(menu => {
    return menu.auth === 'yes'
  })
  let menusFront = []
  menus.forEach(menu => {
    let name = menu.menuCode
    let menuFront = {}
    menuFront = routesTiled.find(item => { return name === item.name })
    if (menuFront) {
      menuFront.meta.title = menu.menuName
      menuFront.meta.icon = isSubMenu ? '' : menuFront.meta.icon
      if (menu.subMenu.length > 0) {
        menuFront.children = generateMenusFrontSpecific(menu.subMenu, routesTiled, true)
      }
      menusFront.push(menuFront)
    } else {
      if (menu.subMenu.length > 0) {
        menuFront = { path: '', name, meta: { title: menu.menuName } }
        menuFront.children = generateMenusFrontSpecific(menu.subMenu, routesTiled)
        menusFront.push(menuFront)
      } else {
        console.log(`菜单"${menu.menuName}, ${menu.menuCode}"无对应的前端页面或录入不正确`)
      }
    }
  })
  return menusFront
}

// // 遍历后台传来的路由字符串，转换为组件对象
// function filterAsyncRouter(asyncRouterMap) {
//   return asyncRouterMap.filter(route => {
//     if (route.component) {
//       // Layout组件特殊处理
//       if (route.component === 'Layout') {
//         route.component = Layout
//       } else {
//         route.component = loadView(route.component)
//       }
//     }
//     if (route.children != null && route.children && route.children.length) {
//       route.children = filterAsyncRouter(route.children)
//     }
//     return true
//   })
// }

export const loadView = (view) => { // 路由懒加载
  return (resolve) =>  require([`@/views/${view}`], resolve)
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
