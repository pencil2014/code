import axios from 'axios'
import { getToken, parseTime, logOut, getLanguage } from '@/utils'
import { MessageBox, Message } from 'element-ui'
// token 是否过期
// let expired_time = localStorage.getItem('expired_time')
// if (expired_time && expired_time < Date.now()) {
//     MessageBox.confirm('请重新登录', '提示', {
//       showCancelButton: false,
//       confirmButtonText: '去登录',
//       type: 'warning'
//     }).then(res => {
//       logOut()
//     })
// }

// create an axios instance
const service = axios.create({
  timeout: 60 * 1000 //超时时间
})

// request interceptor
service.interceptors.request.use(
  (config) => {
    const token = getToken()
    config.headers['Authorization'] = token
    config.headers['Accept-Language'] = localStorage.getItem('locale') || 'en-US'
    const defaultParams = {
      fromSystem: 'web_H5',
      toSystem: 'mng_base_server', //---必填，通过网关转发系统时会校验
      reqId: new Date().getTime(), // 改成时间戳
      reqTime: parseTime(new Date().getTime()) // 时间格式 yyyy-mm-dd hh:mm:ss
    }
    if (config.method === 'post') {
      config.data = Object.assign(defaultParams, { data: config.data })
    }
    if (config.method === 'get') {
      Object.assign(config.params, defaultParams)
    }
    return config
  },
  (error) => {
    // do something with request error
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 0) {
      // 防止多次弹框
      var el_message_box = document.querySelector('.el-message-box__wrapper')
      var v_modal = document.querySelector('.v-modal')
      if(el_message_box && v_modal){
        el_message_box.parentNode.removeChild(el_message_box)
        v_modal.parentNode.removeChild(v_modal)
      }
      // token验证失败，失效 
      let isLogin = location.hash === '#/login'
      if ([100004, 100005].includes(res.code) && !isLogin) {
        MessageBox.confirm('请重新登录', '提示', {
          showCancelButton: false,
          confirmButtonText: '去登录',
          // cancelButtonText: '取消',
          type: 'warning'
        }).then(res => {
          logOut()
        })  
      } else {
        Message({
          message: res.msg,
          type: 'error'
        })
      }
      return Promise.reject(new Error(res.msg || 'Error'))
    } else {
      return res
    }
  },
  (error) => {
    if (error.message && error.message === 'Network Error') {
      return Promise.reject(error)
    } else {
      if (error.message && error.message.indexOf('timeout') > -1) {
        error = { msg: '请求超时！' }
      }
      Message({
        message: error.msg || error.message,
        type: 'error'
      })
      return Promise.reject(error)
    }
  }
)
export default service