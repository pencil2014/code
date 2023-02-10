// import './public-path'
import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI, { Table } from 'element-ui'
import './styles/element-variables.scss'
// import 'element-ui/lib/theme-chalk/index.css'
import { Loading } from 'element-ui'

Vue.use(Loading) // 使用服务方式的话，只安装Loading即可

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router, { asyncRoutes } from './router'
import directive from './directive'

import { setToken } from '@/utils/auth'

import i18n from './lang' // internationalization
import language from './lang/language' // 获取当前语言类型
import '@/icons' // icon
import '@/permission' // permission control

import Pagination from '@/components/pagination'
import Print from '@/components/Print'
import resize from 'vue-element-resize-detector'

import actions from './action'

/******************************* 全局添加浮点数值计算插件 -- begin *******************************/
// 原插件遇到空、undefined、null的计算结果为NaN, 除法运算时除数默认为1,进行容错处理;添加获取值的属性写法；
import LSnum from '@/utils/bignum'
window.LSnum = LSnum
// 全局设置 浮点数据0 ， 使用的页面不再引入bignumber.js，不再重现创建对象0， 只需计算后转化为普通字符串方法valueOf()
window.BIGZERO = new LSnum(0)
/******************************* 全局添加浮点数值计算插件 -- end *******************************/

import 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'

// 解决 ElTable 自动宽度高度导致的「ResizeObserver loop limit exceeded」问题
const fixElTableErr = (table) => {
  const oldResizeListener = table.methods.resizeListener;
  table.methods.resizeListener = function () {
      window.requestAnimationFrame(oldResizeListener.bind(this));
  };
};
// 一定要在Vue.use之前执行此函数
fixElTableErr(Table)

Vue.use(VXETable)
// 监听元素大小变化
Vue.use(resize)
Vue.prototype.$language = language

// 全局配置dialog弹框点击遮罩层不会关闭
ElementUI.Dialog.props.closeOnClickModal.default = false
ElementUI.Dialog.mixins.push({
	mounted() {
		let el = this.$el
		let vnode = this
		let _isDown = false
		let dragDom = el.querySelector('.el-dialog')
		let dragDomHeader = el.querySelector('.el-dialog__header')
		let wrapper = el
		wrapper.style.overflow = 'hidden'
		dragDomHeader.style.cursor = 'move'

		dragDom.style.cssText += ';top:0px'
		let getStyle = (function () {
			if (window.document.currentStyle) {
				return (dom, attr) => dom.currentStyle[attr]
			} else {
				return (dom, attr) => getComputedStyle(dom, false)[attr]
			}
		})()
		dragDomHeader.onmousedown = e => {
			_isDown = true
			const disX = e.clientX - dragDomHeader.offsetLeft
			const disY = e.clientY - dragDomHeader.offsetTop

			const dragDomWidth = dragDom.offsetWidth
			const dragDomHeight = dragDom.offsetHeight

			const screenWidth = wrapper.offsetWidth
			const screenHeight = wrapper.offsetHeight

			const minDragDomLeft = dragDom.offsetLeft
			const maxDragDomLeft = screenWidth - dragDom.offsetLeft - dragDomWidth

			const minDragDomTop = dragDom.offsetTop
			const maxDragDomTop = screenHeight - dragDom.offsetTop - dragDomHeight

			let styL = getStyle(dragDom, 'left')
			let styT = getStyle(dragDom, 'top')
			if (styL.includes('%')) {
				styL = +document.body.clientWidth * (styL.replace(/%/g, '') / 100)
				styT = +document.body.clientHeight * (styT.replace(/%/g, '') / 100)
			} else {
				styL = +styL.replace(/px/g, '')
				styT = +styT.replace(/px/g, '')
			}
			document.onmousemove = e => {
				if (_isDown) {
					let left = e.clientX - disX
					let top = e.clientY - disY
					if (-left > minDragDomLeft) {
						left = -minDragDomLeft
					} else if (left > maxDragDomLeft) {
						left = maxDragDomLeft
					}
					if (-top > minDragDomTop) {
						top = -minDragDomTop
					} else if (top > maxDragDomTop) {
						top = maxDragDomTop
					}

					dragDom.style.cssText += `;left:${left + styL}px;top:${top + styT}px;`
				}
			}
			document.onmouseup = () => {
				_isDown = false
			}
		}
	}
})

// select remote为真是，mounted钩子内执行remoteMethod方法,解决首次点击下拉框内容为空问题
// 不再初始化，修改为每次visible为true时触发
// 恢复初始化，下拉框出现前，如果有值，会显示value而不是label
// 下拉框 修改elmentUI默认点击事件，如果下拉框为显示状态，点击输入框不会消失
ElementUI.Select.methods.toggleMenu = function (e) {
	if (e && e.target && e.target.tagName === 'INPUT' && this.visible) {
		return
	}
	if (!this.selectDisabled) {
		if (this.menuVisibleOnFocus) {
			this.menuVisibleOnFocus = false
		} else {
			this.visible = !this.visible
		}
		if (this.visible) {
			;(this.$refs.input || this.$refs.reference).focus()
		}
	}
}
// 取消自动搜索，需长时间验证是否有问题，单独分支暂不发布
ElementUI.Select.mixins.push({
	mounted() {
		this.$attrs && !this.$attrs.noRemote && this.remote && this.remoteMethod && this.remoteMethod()
	}
})
// datePicker显示clear图标时隐藏日期图标，此监听要立即执行，否则clear图标会占位
ElementUI.DatePicker.mixins.push({
	watch: {
		showClose: {
			handler(val) {
				this.$nextTick(() => {
					let el = this.$el
					if (el && (this.type === 'daterange' || this.type === 'datetimerange' || this.type === 'monthrange')) {
						el.querySelector('.el-range__icon').style.display = val ? 'none' : 'inline-block'
						el.querySelector('.el-range__close-icon').style.display = !val ? 'none' : 'inline-block'
					}
				})
			},
			immediate: true
		}
	}
})
let doAfterClose = ElementUI.Dialog.mixins[0].methods.doAfterClose
let handleClose = ElementUI.Dialog.methods.handleClose
ElementUI.Dialog.mixins[0].methods.doAfterClose = function () {
	doAfterClose.call(this)
	let VMODAL = document.querySelector('body > .v-modal')
	if (VMODAL) {
		VMODAL.style.display = 'none'
	}
}
ElementUI.Dialog.methods.handleClose = function () {
	handleClose.call(this)
	let VMODAL = document.querySelector('body > .v-modal')
	if (VMODAL) {
		VMODAL.style.display = 'none'
	}
}

// 解决bug
// 当autocomplete有值，光标处于值的中间，点击清除图标后仍处于focus状态，但是下拉框不出现，此时需要触发blur再次focus才能出现下拉框
let originClearFn = ElementUI.Autocomplete.methods.handleClear
ElementUI.Autocomplete.methods.handleClear = function () {
	originClearFn.call(this)
	this.$refs['input'].blur()
}
// 全局配置Message dangerouslyUseHTMLString默认为true可利用标签，配合后端返回有格式的内容
const Message = ElementUI.Message
// 之前修改未添加Message静态方法，使用静态方法会报错
const mObj = {}
const mFnArr = ['success', 'warning', 'info', 'error', 'close', 'closeAll']
mFnArr.forEach(key => (mObj[key] = Message[key]))
// console.log(Message)
ElementUI.Message = function (options) {
	options = {
		dangerouslyUseHTMLString: true,
		...options
	}
	return Message(options)
}
mFnArr.forEach(key => (ElementUI.Message[key] = mObj[key]))
Vue.prototype.$msgSucClose = (message, duration) => ElementUI.Message({ type: 'success', message, showClose: true, duration: duration || 3000 })
Vue.prototype.$msgErrClose = (message, duration) => ElementUI.Message({ type: 'error', message, showClose: true, duration: duration || 3000 })
Vue.prototype.$msgWarnClose = (message, duration) => ElementUI.Message({ type: 'warning', message, showClose: true, duration: duration || 3000 })
Vue.prototype.$confirmWarn = (message, callback, callback2) =>
	ElementUI.MessageBox.confirm(message.body || message, message.title || '', {
		confirmButtonText: message.confirm || '确定',
		cancelButtonText: message.cancel || '取消',
		type: 'warning'
	})
		.then(val => val && callback())
		.catch(() => {
			callback2 && callback2()
		})


Vue.use(ElementUI, {
	i18n: (key, value) => i18n.t(key, value)
})
// 分页组件
Vue.component('Pagination', Pagination)
// 自定义指令
Vue.use(directive)
// print插件
Vue.use(Print)
// 路由缓存
Vue.prototype.jumpRouteFromToList = []

Vue.prototype.getDownloadPath = (fileNo, fileName) => `/base/fileView/preview/${fileNo}/sowoll`
Vue.prototype.aTagClick = (path, name) => {
	let link = document.createElement('a')
	link.href = path
	link.download = name
	link.click()
}

Vue.config.productionTip = false

Vue.prototype.$EventBus = new Vue()

// 全局设置加载配置(如果详情页未引入orderFee的mixin，则需手动设置以下属性，全局设置则无需引入mixin)
const mixin = {
	data() {
		return {
			lsLoading: false,
			eLoadingText: '正在加载中',
			eLoadingSpinner: 'el-icon-loading',
			eLoadingBackground: 'rgba(255, 255, 255, 0.9)',
			btnLoading: false,
			btnLoading1: false,
			btnLoading2: false
		}
	}
}
Vue.mixin(mixin)

// new Vue({
//   el: '#app',
//   router,
//   store,
//   i18n,
//   render: h => h(App)
// })

let instance = null
function render(props = {}) {
	const { container } = props
	if (container) {
		actions.setActions(props)
	}
	instance = new Vue({
		router,
		store,
		i18n,
		render: h => h(App)
	}).$mount(container ? container.querySelector('#app') : '#app')
}

// 独立运行时
if (!window.__POWERED_BY_QIANKUN__) {
	render()
}

export async function bootstrap() {
	console.log('[vue] vue app bootstraped')
	// window.loading = Loading.service({
	// 	lock: true,
	// 	text: 'Loading',
	// 	spinner: 'el-icon-loading',
	// 	background: 'rgba(0, 0, 0, 0.2)'
	// })
	// setTimeout(() => {
	// 	loading.close()
	// }, 2000)
}
export async function mount(props) {
	let state = props.getGlobalState()
  sessionStorage.setItem(`${props.name}-routes`, JSON.stringify(asyncRoutes))
  // state.subRouters[props.name] = asyncRoutes
	setToken(state.token)
	store.dispatch('user/setToken', state.token)
	store.dispatch('user/setUserInfo', state.userInfo)
	render(props)
}
export async function unmount() {
	instance.$destroy()
	instance.$el.innerHTML = ''
	instance = null
	// router = null;
}

Number.prototype.fixed = function (len) {
	len = isNaN(len) ? 0 : len
	var num = Math.pow(10, len)
	return Math.round(this * num) / num
}
