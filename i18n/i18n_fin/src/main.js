import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI, { Dialog } from 'element-ui'
import './styles/element-variables.scss'
// import 'umy-ui/lib/theme-chalk/index.css';// 引入样式
// import 'element-ui/lib/theme-chalk/index.css'

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import directive from './directive'

import { setToken } from '@/utils/auth'

import i18n from './lang' // internationalization
import language from './lang/language' // 获取当前语言类型
import '@/icons' // icon
import '@/permission' // permission control

import Pagination from "@/components/pagination";
import Print from '@/components/Print'
import NoData from '@/components/Base/noData'
import ColumnTip from '@/views/finance/components/financeColumnTip/columnTip'
import DetailDiv from '@/views/finance/components/detailDiv'
import SettleCorpTypeTags from '@/views/finance/components/detailDiv/settleCorpTypeTags'

import MultiBtn from '@/views/finance/components/multiBtn'
import ResultDialog from '@/views/finance/components/financeDialog/resultDialog'
// import detailAndListArr from './utils/detailAndListArr'
import EllipsisText from '@/components/ellipsis-text'
import resize from "vue-element-resize-detector"
import tableTooltip from '@/components/Base/Table/table-tooltip'
import entrustUnitComp from '@/views/order/order/components/entrustUnitComp'
import elDatePickerLimit from '@/components/Form/elDatePickerLimit'
// import ButtonTip from '@/views/order/order/components/buttonTip'

// filters
import commonFilters from '@/filters/index.js'

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
Vue.use(VXETable)
import { UTableColumn, UTable, UxGrid, UxTableColumn } from 'umy-ui'
Vue.use(UTableColumn);
Vue.use(UTable);
Vue.use(UxGrid);
Vue.use(UxTableColumn);
// 监听元素大小变化
Vue.use(resize)
Vue.prototype.$language = language
Vue.prototype.$lang = language
console.log(ElementUI);
// 上传文件名有特殊字符时，容易引起预览失败，此处可全局拦截
// ElementUI.Upload.components.Upload.methods.handleChange = function (ev) {
//   const files = ev.target.files;
//   if (!files) return;
//   let file = files[files.length - 1]
//   // 特殊字符的正则匹配
//   if (/(\{|\})/ig.test(file.name)) {
//     ElementUI.Message({ type: 'warning', message: '文件名称包含特殊字符‘{’‘}’，可能会预览失败！', showClose: true, duration: 3000 })
//     return
//   }
//   this.uploadFiles(files);
// }
// 上传文件名有特殊字符时，容易引起预览失败，此方法只是提示，不会拦截，
// ElementUI.Upload.mixins.push({
//   watch: {
//     fileList(val) {
//       if(val && val.length){
//         let file = val[val.length - 1]
//         console.log(file.name, /(\{|\})/ig.test(file.name))
//         // 特殊字符的正则匹配
//         if (/(\{|\})/ig.test(file.name)){
//           ElementUI.Message({ type: 'warning', message: '文件名称包含特殊字符‘{’‘}’，可能会预览失败！', showClose: true, duration: 3000 })
//         }
//       }
//       // console.log(val)
//     },
//   },
// })
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
// input和textarea框最大输入字符数,打到长度添加提示
// ElementUI.Input.mixins.push({
//   watch: {
//     textLength(val) {
//       if (val >= this.upperLimit) {
//         //需要在长度后一位提示
//         // ElementUI.Message.warning(`输入长度已达最大值${this.upperLimit}`)
//       }
//     },
//   },
// })
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
let afterLeave = ElementUI.Dialog.methods.afterLeave
// Dialog消失，要么回调afterLeave方法，要么运行钩子函数beforeDestroy
// 预防bug，移至1115迭代
ElementUI.Dialog.methods.afterLeave = function () {
  
  afterLeave.call(this)
  if (this.$attrs.noModalClose || this.customClass === 'noModalClose') return
  let VMODAL = document.querySelector('body > .v-modal')
  if (VMODAL) {
    VMODAL.style.display = 'none'
  }
}
ElementUI.Dialog.mixins.push({
  beforeDestroy() {
    
    if (this.$attrs.noModalClose || this.customClass === 'noModalClose') return
    let VMODAL = document.querySelector('body > .v-modal')
    if (VMODAL) {
      VMODAL.style.display = 'none'
    }
  }
})
// this.$attrs.noModalClose || this.customClass === 'noModalClose' 用于对话框内的对话框关闭时modal直接消失的问题
ElementUI.Dialog.mixins[0].methods.doAfterClose = function () {
  doAfterClose.call(this)
  if (this.$attrs.noModalClose || this.customClass === 'noModalClose') return
  let VMODAL = document.querySelector('body > .v-modal')
  if (VMODAL) {
    VMODAL.style.display = 'none'
  }
}
ElementUI.Dialog.methods.handleClose = function () {
  handleClose.call(this)
  if (this.$attrs.noModalClose || this.customClass === 'noModalClose') return
  let VMODAL = document.querySelector('body > .v-modal')
  if (VMODAL) {
    VMODAL.style.display = 'none'
  }
}
// let visible = ElementUI.Dialog.watch.visible
// ElementUI.Dialog.watch.visible = function (val) {
//   visible.call(this, val)
//   if (!val) {
//     let VMODAL = document.querySelector('body > .v-modal')
//     if (VMODAL) {
//       VMODAL.style.display = 'none'
//     }
//   }
// }
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
  confirmButtonText: message.confirm || i18n.t('Common.sure'),
  cancelButtonText: message.cancel || i18n.t('Common.cancel'),
  type: 'warning',
  customClass: message.customClass || '',
}).then((val) => val && callback()).catch(() => { callback2 && callback2() })

console.log(process.env);

// test环境已启用比较久的时间，可提测
let objectAssign = function(target) {
  for (let i = 1, j = arguments.length; i < j; i++) {
    let source = arguments[i] || {};
    for (let prop in source) {
      if (source.hasOwnProperty(prop)) {
        let value = source[prop];
        if (value !== undefined) {
          target[prop] = value;
        }
      }
    }
  }
  return target;
}

let __timeout__ = null
ElementUI.Form.methods.validate = function (callback) {
  if (!this.model) {
    console.warn('[Element Warn][Form]model is required for validate to work!');
    return;
  }

  let promise;
  // if no callback, return promise
  if (typeof callback !== 'function' && window.Promise) {
    promise = new window.Promise((resolve, reject) => {
      callback = function (valid) {
        valid ? resolve(valid) : reject(valid);
      };
    });
  }

  let valid = true;
  let count = 0;
  // 如果需要验证的fields为空，调用验证时立刻返回callback
  if (this.fields.length === 0 && callback) {
    callback(true);
  }
  let invalidFields = {};
  this.fields.forEach(field => {
    field.validate('', (message, field) => {
      if (message) {
        valid = false;
      }
      invalidFields = objectAssign({}, invalidFields, field);
      if (typeof callback === 'function' && ++count === this.fields.length) {
        if (valid === false && !__timeout__ && location.href.indexOf('/#/finance/')>-1){
          __timeout__ = true
          ElementUI.Message({ type: 'error', message: i18n.t('Collect.requiredTips'), showClose: true, onClose:()=>{
            __timeout__ = null
          } })
        }
        callback(valid, invalidFields);
      }
    });
  });

  if (promise) {
    return promise;
  }
}
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
// 财务的组件
Vue.component('ColumnTip', ColumnTip)
// 详情页冒号对齐显示组件
Vue.component('DetailDiv', DetailDiv)
Vue.component('SettleCorpTypeTags', SettleCorpTypeTags)
// 详情页一个字段多个button
Vue.component('MultiBtn', MultiBtn)
// 自定义操作结果弹窗
Vue.component('ResultDialog', ResultDialog)
// 自定义显示tooltip组件
Vue.component('EllipsisText', EllipsisText)
// 表格tableTooltip，可复制
Vue.component('tableTooltip', tableTooltip)
// 委托单位
Vue.component('entrustUnitComp', entrustUnitComp)
// 日期
Vue.component('elDatePickerLimit', elDatePickerLimit)
// 订单按钮置灰时显示提示
// Vue.component('ButtonTip', ButtonTip)
// 详情页返回列表页不刷新的情况
// Vue.prototype.detailAndListArr = detailAndListArr
// 根据fileNo获取下载路径  部分文件名会有一些特殊字符被服务器拦截，不再使用文件名
// 打标记方便后面改回来,  nameToSowollForViewImg
// Vue.prototype.getDownloadPath = (fileNo, fileName) => `/base/fileView/preview/${fileNo}/${fileName || 'sowoll'}`
Vue.prototype.getDownloadPath = (fileNo, fileName) => `/base/fileView/preview/${fileNo}/sowoll`
Vue.prototype.vmShowAttachment = (fileNo) => window.open(`/base/fileView/preview/${fileNo}/sowoll`)
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
// 弃用
/********************** 全局添加窗口大小变化事件，表格自动更改最大高度 begin **********************/
/*在financeTable组件created，activated钩子中将实例赋值给Vue.prototype.__table__ ，使用financeTable组件时，添加属性autoMax为true即可*/
// let __timeout__ = null
// // 一些详情页面会直接用到字典内的validCurrency, 有可能出现币种接口还未执行完的情况， 如果未执行完则延迟加载详情页
// router.beforeEach((to, from, next) => {
//   if (store.state.dict.dictMap.validCurrency){
//     next()
//   } else {
//     let errCount = 0
//     let hasCurrency = setInterval(() => {
//       errCount++
//       if (store.state.dict.dictMap.validCurrency || errCount >= 1000) {
//         if (errCount >= 1000) console.warn('币种接口请求异常！')
//         clearInterval(hasCurrency)
//         next()
//       }
//     })
//   }
// })
// router.afterEach((to, from) => computedTableHeight(100))
// function computedTableHeight(delay) {
//   clearTimeout(__timeout__)
//   __timeout__ = setTimeout(() => {
//     let maxTable = document.querySelector('.max__height__table')
//     if (!maxTable) return
//     let OFFSETTOP = maxTable.getBoundingClientRect().top
//     let BODYHEIGHT = document.body.clientHeight
//     // console.log(BODYHEIGHT, OFFSETTOP);
//     let vm = Vue.prototype.__table__
//     vm.option.maxHeight = BODYHEIGHT - OFFSETTOP - 80
//     // vm.$nextTick(()=>vm.$refs.tableLayout_finance.doLayout())
//   }, delay)
// }
// window.addEventListener('resize', () => computedTableHeight(40))
/********************** 全局添加窗口大小变化事件，表格自动更改最大高度 end **********************/

// 设置全局变量，CRM普通输入框限制长度60，备注类限制200，如有变化再次变更
Vue.prototype.CRM60 = 60
Vue.prototype.CRM200 = 200
//基础数据，中文20字，英文50字
Vue.prototype.LEN20 = 20
Vue.prototype.LEN50 = 50

Vue.prototype.$EventBus = new Vue();

// 全局设置加载配置(如果详情页未引入orderFee的mixin，则需手动设置以下属性，全局设置则无需引入mixin)
const mixin = {
  data() {
    return {
      lsLoading: false,
      eLoadingText: i18n.t('OrderFee.eLoadingText'),
      eLoadingSpinner: 'el-icon-loading',
      eLoadingBackground: 'rgba(255, 255, 255, 0.9)',
      btnLoading: false,
      btnLoading1: false,
      btnLoading2: false,
    }
  }
}
Vue.mixin(mixin)

// 向基座路由添加标签
router.beforeEach((to, from, next) => {
  let {name, fullPath, meta: { title }} = to
  let noPushRoutes = ['/404','/login','/finance/settlement/orderFee'] //不添加标签的路由
  let sta = noPushRoutes.some(item => fullPath.startsWith(item))
  if (!sta && name && title && fullPath) {
    let tag = {
      title,
      code: name,
      url: fullPath,
      activeMenu: 'Finance'
    }
    actions.addGlobalTag(tag)
  }
  next()
})

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
}
export async function mount(props) {
  console.log('[vue] props from main framework', props);
  let state = props.getGlobalState()
  // sessionStorage.setItem(`${props.name}-routes`, JSON.stringify(asyncRoutes))
  // state.subRouters[props.name] = asyncRoutes
	setToken(state.token)
	store.dispatch('user/setToken', state.token)
	store.dispatch('user/setUserInfo', state.userInfo)
	render(props)
  

  // 修复第一次加载 步骤router.beforeEach问题
  let {name, fullPath, meta: { title }} = router.history?.current
  if (name && fullPath && title) {
    let noPushRoutes = ['/404','/login'] //不添加标签的路由
    let sta = noPushRoutes.some(item => fullPath.startsWith(item))
    if (!sta) {
      let tag = {
        title,
        code: name,
        url: fullPath,
        activeMenu: 'Finance'
      }
      props.addGlobalTag(tag)
    }
  }
}
export async function unmount() {
  instance.$destroy();
  instance.$el.innerHTML = '';
  instance = null;
  // router = null;
}

localStorage.setItem('_sw_heartbeat_time', new Date().getTime())
setInterval(() => {
  localStorage.setItem('_sw_heartbeat_time', new Date().getTime())
}, 12000)

getJumpRouteFromToList()
window.onbeforeunload = function () {
  // 不保存该数据
  // let saveJumpRouteWhenRf = store.state.finance.saveJumpRouteWhenRf
  // if (saveJumpRouteWhenRf && Vue.prototype.jumpRouteFromToList && Vue.prototype.jumpRouteFromToList.length > 0) {
  //   saveJumpRouteFromToList(Vue.prototype.jumpRouteFromToList)
  // }
  localStorage.removeItem('jumpRouteFromToListStr')
  sessionStorage.removeItem('routeDialInfoList')
  // 说一直打开page体验不好，不做
  // // for refresh
  // let mainCurrPath = location.href.split('#')[1]
  // let mainVisitedViews = store.state.tagsView.visitedViews.map(item => {
  //   let { fullPath, hash, meta, name, params, path, query } = item
  //   return { fullPath, hash, meta, name, params, path, query }
  // })
  // sessionStorage.setItem('mainCurrPath', mainCurrPath ? mainCurrPath : '')
  // sessionStorage.setItem('mainVisitedViews', JSON.stringify(mainVisitedViews))
}
function getJumpRouteFromToList() {
  let jumpRouteFromToListStr = window.localStorage.getItem('jumpRouteFromToListStr')
  let jumpRouteFromToList = jumpRouteFromToListStr ? JSON.parse(jumpRouteFromToListStr) : []
  jumpRouteFromToList.forEach(item => {
    Vue.prototype.jumpRouteFromToList.push(item)
  })
}
function saveJumpRouteFromToList(jumpRouteFromToList) {
  // 不拆解会报错
  jumpRouteFromToList = jumpRouteFromToList.map(item => {
    let from, to
    {
      let { fullPath, hash, meta, name, params, path, query } = item.from
      from = { fullPath, hash, meta, name, params, path, query }
    }
    {
      let { fullPath, hash, meta, name, params, path, query } = item.to
      to = { fullPath, hash, meta, name, params, path, query }
    }
    return { from, to, ts: item.ts }
  })
  let jumpRouteFromToListStr = JSON.stringify(jumpRouteFromToList)
  window.localStorage.setItem('jumpRouteFromToListStr', jumpRouteFromToListStr)
}


Number.prototype.fixed = function (len) {
  len = isNaN(len) ? 0 : len
  var num = Math.pow(10, len)
  return Math.round(this * num) / num
}
