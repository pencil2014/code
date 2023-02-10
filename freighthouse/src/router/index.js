import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'
import ChargeRoute from './modules/charge'
import Order from './modules/order'
import Railway from './modules/railway'
import Take from './modules/take'
import Put from './modules/put'
import Finance from './modules/finance'
import Permission from './modules/permission'
import CompanyResource from './modules/companyResource'
import BaseData from './modules/baseData'
import Crm from './modules/crm'
import SwCms from './modules/swCms'
import Cosco from './modules/exec/cosco'
import Oocl from './modules/exec/oocl'
import Booking from './modules/exec/booking'
import Bkg from './modules/bkg.js'
import airTransport from './modules/airTransport'
import Plan from './modules/plan'
import Notice from './modules/notice'
// import Duty from './modules/duty'
import OrderDetail from './modules/orderDetail'
import OrderDetailRail from './modules/orderDetailRail'
import OrderFee from './modules/orderFee'
import DutyManagement from './modules/dutyManagement'
import airTransportDetail from './modules/airTransportDetail'
import CustomsDeclaration from './modules/customsDeclaration'
import KnowledgeBase from './modules/knowledgeBase'
/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/changePassword',
    component: () => import('@/views/login/changePassword'),
    hidden: true
  },
  {
    path: '/forget',
    component: () => import('@/views/forget/index'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index'),
        meta: { title: '首页', icon: 'el-icon-dashboard' }
      },
      {
        path: 'userInfo',
        name: 'UserInfo',
        component: () => import('@/views/login/userInfo'),
        meta: { title: '个人信息', icon: '' },
        hidden: true
      }
    ]
  },
  ...OrderDetail,
  ...OrderDetailRail,
  ...airTransportDetail
]

export const asyncRoutes = [
	/** When your routing table is too long, you can split it into small modules**/
	ChargeRoute,
	Order,
	Railway,
	Take,
	Put,
	airTransport,
	Finance,
	Crm,
  SwCms,
	Permission,
	CompanyResource,
	BaseData,
	Cosco,
  Oocl,
  Booking,
	Bkg,
	Plan,
	Notice,
	// Duty,
	DutyManagement,
	...OrderFee,
  CustomsDeclaration,
  KnowledgeBase,
	// 404 page must be placed at the end !!!
	{ path: '*', redirect: '/404', hidden: true }
]

const createRouter = () =>
	new Router({
		// mode: 'history', // require service support
		scrollBehavior: () => ({ y: 0 }),
		routes: constantRoutes
	})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
	const newRouter = createRouter()
	router.matcher = newRouter.matcher // reset router
}

export default router
