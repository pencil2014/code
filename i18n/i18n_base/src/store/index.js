import Vue from 'vue'
import { initGlobalState } from 'qiankun'

// 父应用的初始state
// Vue.observable是为了让initialState变成可响应：https://cn.vuejs.org/v2/api/#Vue-observable。
const initialState = Vue.observable({
  userInfo: {},
  token: '',
  expireTimes: 30 * 60 * 1000, // token有效期30分钟
  tags: [],
  appName: 'home',
  activeTag: {},
  locale: 'en-US',
  codes: []
})

const actions = initGlobalState(initialState)

actions.setGlobalState(initialState)

actions.onGlobalStateChange((state, prev) => {
  // state: 变更后的状态; prev 变更前的状态
  for (const key in state) {
    initialState[key] = state[key]
  }
  if (initialState.token) {
    sessionStorage.setItem('store', JSON.stringify(initialState))
  }
})

actions.getGlobalState = key => {
  return key ? initialState[key] : initialState
}

actions.addGlobalTag = tag => {
  // 不添加标签的路由
  let noTagsRote = [
    '/finance/settlement/orderFee', //财务费用
    '/login',
    '/forget',
    '/order/order/containerList', // 以下为订单页面
    '/order/order/orderDetail',
    '/order/order/blList',
    '/order/order/fileList',
    '/order/order/childOrderList',
    '/order/order/jointOrderDetail',
    '/order/book/bookDetail',
    '/order/order/orderBook',
    '/order/order/shippingTruck',
    '/order/order/polLtl',
    '/order/order/clearance',
    '/order/order/warehouse',
    '/order/order/yardBox',
    '/order/order/fume',
    '/order/order/inspectionAndDetection',
    '/order/order/podChangeDoc',
    '/order/order/podCommClearance',
    '/order/order/podFclDelivery',
    '/order/order/podLtlDelivery',
    '/order/order/podWarehouseIng',
    '/order/order/behalfRecordManifest',
    '/order/order/dischargeRelease',
    '/order/order/MakePackingList',
    '/order/order/lclWhBook',
    '/order/order/insurance',
    '/order/order/hblPrint',
    '/order/order/lclOrderDetail',
  ]
  if (noTagsRote.some(item => tag.url.startsWith(item))) {
    return 
  }
  if (initialState.codes.length !== initialState.tags.length) {
    initialState.codes = initialState.tags.map(ele => ele.code)
  }
  if (!initialState.codes.includes(tag.code)) {
    initialState.tags.push(tag)
    initialState.codes.push(tag.code)
    actions.setGlobalState({
      tags: initialState.tags,
      codes: initialState.codes,
      activeTag: tag
    })
  } else {
    let find = initialState.tags.find(ele => ele.code === tag.code)
    find = tag
    actions.setGlobalState({
      tags: initialState.tags,
      activeTag: find
    })
  }
}
actions.delGlobalTag = tag => {
  let { code, title, url } = tag
  let index = initialState.tags.findIndex(
    ele => ele.code === code || ele.title === title || ele.url === url
  )
  if (index !== -1) {
    initialState.tags.splice(index, 1)
    actions.setGlobalState({
      tags: initialState.tags
    })
  }
}

export default actions