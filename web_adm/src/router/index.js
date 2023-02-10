import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Permission from './modules/permission'
import CompanyResource from './modules/companyResource'
import BaseData from './modules/baseData'
import Notice from './modules/notice'
export const constantRoutes = [
	{
		path: '/404',
		component: () => import('@/views/404'),
		hidden: true
	},
  {
		path: '/',
		redirect: '/companyResource/department',
		children: [
		]
  } 
]

export const asyncRoutes = [
	Permission,
	CompanyResource,
	BaseData,
  Notice,
	{ path: '*', redirect: '/404', hidden: true }
]

const createRouter = () =>
	new Router({
		// mode: 'history', // require service support
    base: '/adm',
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
