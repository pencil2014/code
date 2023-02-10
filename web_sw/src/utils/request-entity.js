import axios from 'axios'
import { MessageBox, Message, Loading } from 'element-ui'
import store from '@/store'
import { getToken, setToken } from '@/utils/auth'
import { parseTime, randomString } from '@/utils'

// 是否有请求正在刷新token
window.isRefreshing = false
// 被挂起的请求数组
let refreshSubscribers = []
let loading = null

// push所有请求到数组中
function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb)
}

// 刷新token
function refreshToken() {
  return new Promise((resolve, reject) => {
    axios
      .post('base/common/session/refreshToken', {
        data: {
          fromSystem: 'web_h5',
          toSystem: 'mng_base_server',
          reqId: randomString(),
          reqTime: parseTime(new Date().getTime())
        },
        headers: {
          authorization: getToken()
        }
      })
      .then(response => {
        let res = response.data
        if (res.code == 0) {
          let expTime = new Date().getTime()
          // 重新存储token和失效时间
          setToken(res.data.token)
          localStorage.setItem('expired_time', expTime)
          resolve()
        } else {
          reject()
        }
      })
      .catch(error => {
        reject()
      })
  })
}
console.log('process.env', process.env)
// create an axios instance
const service = axios.create({
  // 外网地址，baseURL暂使用域名
  baseURL: process.env.NODE_ENV === 'production' ? location.origin + '/' : process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 50 * 1000 // request timeout
  // timeout: 5 // 强制超时，用来测试
})

// 处理pageSize
function savePageSize(key, value) {
  let obj = JSON.parse(localStorage.getItem('finUrlPageSize') || '{}')
  obj[key] = value
  localStorage.setItem('finUrlPageSize', JSON.stringify(obj))
}
function getPageSize(key) {
  let obj = JSON.parse(localStorage.getItem('finUrlPageSize') || '{}')
  return obj[key]
}

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    let moduleArr = ['/ord', '/msg', '/fin', '/crm', '/cha', '/bas', '/swm'] // bas为基础数据
    if (moduleArr.includes(config.url.slice(0, 4))) {
      // config.data.currPage != 10000 是为了过滤掉对冲核销打印时获取所有数据
      // 对冲核销打印接口与列表接口共用一个
      if (config.data && config.data.currPage && config.data.pageSize != 10000) {
        if (config.data.pageSize == -1) {
          let size = +getPageSize(config.url)
          config.data.pageSize = size ? size : 10
        }
        savePageSize(config.url, config.data.pageSize)
      }
    }
    // 对于财务模块外，用了财务table组件的，需要处理pagesize
    // pagesize重新修改为默认10， 默认10未能区分是默认还是点击，改为-1
    if(config.data && config.data.pageSize !== undefined && config.data.pageSize == -1){
      config.data.pageSize = 10
    }
    // 登录状态
    // let isLogin = localStorage.getItem('isLogin');

    const token = getToken()
    // let each request carry token
    // ['X-Token'] is a custom headers key
    // please modify it according to the actual situation
    // config.headers['Content-Type'] = 'application/json'
    config.headers['Authorization'] = token
    // 用于上传文件
    if (config.headers['Content-Type'] === 'multipart/form-data') {
      return config
    }

    if (config.url.includes('list/export')) {
      // 导出接口统一加loading效果
      loading = Loading.service({
        lock: true,
        text: '数据导出中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
    }
    // let isExpired = checkToken();

    // 增加统一传参
    const defaultParams = {
      fromSystem: 'web_H5',
      toSystem: 'mng_base_server', //---必填，通过网关转发系统时会校验
      reqId: new Date().getTime(), // 改成时间戳
      // 'reqId': 'nisdf12312bdsfaslfj23243241',  // 16位随机字符串
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
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    // 文件下载时，response.data为blob格式，无code
    if (response.config.responseType === 'blob') {
      return new Blob([response.data])
    }
    const res = response.data
    if (response.config.url.includes('list/export')) {
      // 导出接口统一加loading效果
      loading.close()
    }
    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 0) {
      // 单独处理提单保存验证返回的code 避免抛出错误提示
      if (res.code === 122087) {
        return Promise.resolve({ code: 122087, msg: res.msg })
      }
      // 单独处理用户没有访问单个服务项页面的费用的/fee/orderFeeList的权限返回的code 避免抛出错误提示
      if (res.code === 110010) {
        if (response.config.url === '/fin/fee/orderFeeList') {
          return Promise.resolve({ code: 110010, msg: res.msg })
        } else {
          res.msg = '当前用户没有该权限，请联系管理员进行配置'
        }
      }
      // 单独处理付款申请前确认已确认的结算单，避免抛出错误提示
      if (res.code === 150000) {
        if (res.msg && res.msg.includes('结算单已经被确认')) {
          return Promise.resolve({ code: 150000, msg: res.msg })
        }
      }
      // 单独处理新增跟进记录时 【跟进记录新增成功，但还未配置部门管理者，请联系管理员进行配置】的情况
      if (res.code === 160000) {
        return Promise.resolve({ code: 160000, msg: res.msg })
      }
      Message({
        message: res.msg || 'Error',
        type: 'error',
        // duration: 5 * 1000,
        showClose: true
      })

      // token验证失败，失效
      if (res.code === 100004 || res.code === 100005) {
        // to re-login
        MessageBox.confirm('请重新登录', '提示', {
          confirmButtonText: '去登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.msg || 'Error'))
    } else {
      return res
    }
  },
  error => {
    if (error.message && error.message === 'Network Error') {
      return Promise.reject(error)
    } else {
      console.error(error) // for debug
      if (error.message && error.message.indexOf('timeout') > -1) {
        error = { msg: '请求超时！' }
      }
      Message({
        message: error.msg || error.message,
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(error)
    }
  }
)

export default service
