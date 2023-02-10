import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import { checkAuth } from '@/utils/checkAuth'
import { setDialStyAmend } from '@/utils/setAboutDial'
const defaultSettings = require('./settings')

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/forget'] // no redirect whitelist
let ISCHROMIUM = navigator.userAgent.includes('AppleWebKit')
const hasToken = getToken()

router.beforeEach(async (to, from, next) => {
	console.log('🚀 ~ from', from)
	console.log('🚀 ~ to', to)
	NProgress.start()
	if (to.path === '/404') {
		NProgress.done()
		if (ISCHROMIUM) {
			next()
		}
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
				if (effect) {
					let isEffectModule = modules.some(item => {
						return to.path.startsWith('/' + item.toLowerCase())
					})
					if (isEffectModule && !checkAuth(to.name)) {
						NProgress.done()
						Message({
							message: '无权限访问',
							type: 'error',
							duration: 2000
						})
						return
					}
				}

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
					routeDialInfoList.forEach(item => {
						item.ZI = ZI
					})
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
					let time = 300 // moreTArr.includes(from.name) ? 300 : 280
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
					//const roles = ['admin']
					await store.dispatch('dict/getDictList')

					// 根据roles权限生成可访问的路由表
					const accessRoutes = await store.dispatch('permission/generateRoutes', roleCodes)
					// 动态添加可访问路由
					router.addRoutes(accessRoutes)

					// 页面模块权限
					// await store.dispatch('user/allPageModuleCheckAuth')

					// hack方法 确保addRoutes已完成
					next({ ...to, replace: true })
				} catch (error) {
					// remove token and go to login page to re-login
					await store.dispatch('user/resetToken')
					Message({
						message: error || 'Has Error',
						type: 'error',
						duration: 2000
					})
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
							VMODAL.style.display = 'block'
						}
					}
				} else {
					if (VMODAL) {
						VMODAL.style.display = 'none'
					}
				}
			}, 30)
		} else {
			if (VMODAL) {
				VMODAL.style.display = 'none'
			}
		}
	} else {
		if (VMODAL) {
			VMODAL.style.display = 'none'
		}
	}
})
