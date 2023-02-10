// import './public-path'
import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI, {Table} from 'element-ui'
import './styles/element-variables.scss'
// import 'element-ui/lib/theme-chalk/index.css'

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
import { Loading } from 'element-ui'

import Pagination from "@/components/pagination";
import Print from '@/components/Print'
import NoData from '@/components/Base/noData'
// import detailAndListArr from './utils/detailAndListArr'
import EllipsisText from '@/components/ellipsis-text'
import resize from "vue-element-resize-detector"
import tableTooltip from '@/components/Base/Table/table-tooltip'
import elDatePickerLimit from '@/components/Form/elDatePickerLimit'
import DetailDiv from '@/views/finance/components/detailDiv'

// filters
import commonFilters from '@/filters/index.js'

import actions from './action'

import 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
Vue.use(VXETable)
// 监听元素大小变化
Vue.use(resize)
Vue.prototype.$language = language
console.log(ElementUI);
// 全局配置dialog弹框点击遮罩层不会关闭
ElementUI.Dialog.props.closeOnClickModal.default = false;
ElementUI.Dialog.mixins.push({
  mounted() {
    // bind(el, binding, vnode) {
    let el = this.$el
    let vnode = this
    let _isDown = false
    let dragDom = el.querySelector('.el-dialog');
    let dragDomHeader = el.querySelector('.el-dialog__header');
    let wrapper = el
    wrapper.style.overflow = 'hidden';
    dragDomHeader.style.cursor = 'move';

    dragDom.style.cssText += ';top:0px'
    let getStyle = (function () {
      if (window.document.currentStyle) {
        return (dom, attr) => dom.currentStyle[attr]
      } else {
        return (dom, attr) => getComputedStyle(dom, false)[attr]
      }
    })()
    dragDomHeader.onmousedown = (e) => {
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
      document.onmousemove = (e) => {
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
      };
      document.onmouseup = () => {
        _isDown = false
      };
    }
  }
  // },
})
// 下拉框 修改elmentUI默认点击事件，如果下拉框为显示状态，点击输入框不会消失
ElementUI.Select.methods.toggleMenu = function (e) {
  if (e && e.target && e.target.tagName === 'INPUT' && this.visible) {
    return
  }
  if (!this.selectDisabled) {
    if (this.menuVisibleOnFocus) {
      this.menuVisibleOnFocus = false;
    } else {
      this.visible = !this.visible;
    }
    if (this.visible) {
      (this.$refs.input || this.$refs.reference).focus();
    }
  }
}
// 取消自动搜索，需长时间验证是否有问题，单独分支暂不发布
ElementUI.Select.mixins.push({
  mounted() {
    // console.log(this);
    this.$attrs && !this.$attrs.noRemote && this.remote && this.remoteMethod && this.remoteMethod()
  },
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
          // if (el && (this.type === 'date' && el.parentElement.className.indexOf("ls_daterange") > -1)) {
          //   el.querySelector('.el-input__prefix').style.opacity = val ? '0' : '1'
          //   el.querySelector('.el-input__suffix').style.display = !val ? 'none' : 'inline-block'
          // }
        })
      },
      immediate: true
    },
  },
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
mFnArr.forEach(key => mObj[key] = Message[key])
// console.log(Message)
ElementUI.Message = function (options) {
  options = {
    dangerouslyUseHTMLString: true,
    ...options
  }
  return Message(options)
}
mFnArr.forEach(key => ElementUI.Message[key] = mObj[key])
Vue.prototype.$msgSucClose = (message, duration) => ElementUI.Message({ type: 'success', message, showClose: true, duration: duration || 3000 })
Vue.prototype.$msgErrClose = (message, duration) => ElementUI.Message({ type: 'error', message, showClose: true, duration: duration || 3000 })
Vue.prototype.$msgWarnClose = (message, duration) => ElementUI.Message({ type: 'warning', message, showClose: true, duration: duration || 3000 })
Vue.prototype.$confirmWarn = (message, callback, callback2) => ElementUI.MessageBox.confirm(message.body || message, message.title || '', {
  confirmButtonText: message.confirm || '确定',
  cancelButtonText: message.cancel || '取消',
  type: 'warning',
}).then((val) => val && callback()).catch(() => { callback2 && callback2() })

console.log(process.env);
// 解决 ElTable 自动宽度高度导致的「ResizeObserver loop limit exceeded」问题
const fixElTableErr = table => {
  const oldResizeListener = table.methods.resizeListener
  table.methods.resizeListener = function () {
    window.requestAnimationFrame(oldResizeListener.bind(this))
  }
}
// 一定要在Vue.use之前执行此函数
fixElTableErr(Table)


Vue.use(ElementUI, {
  i18n: (key, value) => i18n.t(key, value)
})
// console.log(ElementUI);
// 分页组件
Vue.component('Pagination', Pagination)
// 自定义指令
Vue.use(directive)
// print插件
Vue.use(Print);
// 路由缓存
Vue.prototype.jumpRouteFromToList = []
// 暂无数据
Vue.component('NoData', NoData)
// 详情页冒号对齐显示组件
Vue.component('DetailDiv', DetailDiv)

// 自定义显示tooltip组件
Vue.component('EllipsisText', EllipsisText)
// 表格tableTooltip，可复制
Vue.component('tableTooltip', tableTooltip)

// 日期
Vue.component('elDatePickerLimit', elDatePickerLimit)
// 详情页返回列表页不刷新的情况
// Vue.prototype.detailAndListArr = detailAndListArr
// 根据fileNo获取下载路径  部分文件名会有一些特殊字符被服务器拦截，不再使用文件名
// 打标记方便后面改回来,  nameToSowollForViewImg
// Vue.prototype.getDownloadPath = (fileNo, fileName) => `/base/fileView/preview/${fileNo}/${fileName || 'sowoll'}`
Vue.prototype.getDownloadPath = (fileNo, fileName) => `/base/fileView/preview/${fileNo}/sowoll`
Vue.prototype.aTagClick = (path, name) => {
  let link = document.createElement('a')
  link.href = path
  link.download = name
  link.click()
}
for (let key in commonFilters) {
  Vue.filter(key, commonFilters[key])
}
Vue.config.productionTip = false


Vue.prototype.$EventBus = new Vue();

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
      btnLoading2: false,
    }
  }
}
Vue.mixin(mixin)

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
  render();
}

export async function bootstrap() {
  console.log('[vue] vue app bootstraped');
  // let loading = Loading.service({
	// 	lock: true,
	// 	text: '正在加载中',
	// 	spinner: 'el-icon-loading',
	// 	background: 'rgba(0, 0, 0, 0.1)'
	// })
	// setTimeout(() => {
	// 	loading.close()
	// }, 1000)
}
export async function mount(props) {
  console.log('[vue] props from main framework', props);
  let state = props.getGlobalState()
  sessionStorage.setItem(`${props.name}-routes`, JSON.stringify(asyncRoutes))
  // state.subRouters[props.name] = asyncRoutes
	setToken(state.token)
	store.dispatch('user/setToken', state.token)
	store.dispatch('user/setUserInfo', state.userInfo)
	render(props)
}
export async function unmount() {
  instance.$destroy();
  instance.$el.innerHTML = '';
  instance = null;
  // router = null;
}

Number.prototype.fixed = function (len) {
  len = isNaN(len) ? 0 : len
  var num = Math.pow(10, len)
  return Math.round(this * num) / num
}
