import store from '@/store'

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string')) {
      if ((/^[0-9]+$/.test(time))) {
        // support "1548221490638"
        time = parseInt(time)
      } else {
        // support safari
        // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }

    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
  if (!search) {
    return {}
  }
  const obj = {}
  const searchArr = search.split('&')
  searchArr.forEach(v => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      const val = v.substring(index + 1, v.length)
      obj[name] = val
    }
  })
  return obj
}

/**
 * 下划线参数转化为驼峰格式
 * @param {string} a_b_c
 * @returns {string} aBC
 */
export function setCamelFormat(value) {
  if (!value) return

  let arr = value.split('_')
  let newStr = ''

  for (let i = 1; i < arr.length; i++) {
    newStr += arr[i].substring(0, 1).toUpperCase() + arr[i].substring(1)
  }

  return newStr = arr[0] + newStr
}

/**
 * 判断token是否过期
 */
export function isTokenExpired() {
  /*从localStorage中取出token过期时间*/
  let expiredTime = localStorage.getItem('expired_time') / 1000
  /*获取本地时间*/
  let nowTime = new Date().getTime() / 1000
  /*获取校验时间差*/
  let diffTime = store.state.user.expiredTime
  /*校验本地时间*/
  nowTime -= diffTime
  /*如果 < 5分钟，则说明即将过期*/
  return (expiredTime - nowTime) < 5 * 60
}

/**
 * 随机生成16位
 */
export function randomString(e) {
  e = e || 16;
  let t = "ABCDEFGHIJKLMNOPQRSTUVWWXYZabcdefghijklmnopqrstuvwwxyz0123456789",
    a = t.length,
    n = "";
  for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n
}

/**
 * 判断数组类型
 */
export function isArray(arr) {
  return Object.prototype.toString.call(arr) === '[object Array]'
}
/**
 * 格式化树结构， 清空空数组为undefined
 */
export function getTreeData(data) {
  for (var i = 0; i < data.length; i++) {
    if (data[i].children.length < 1) {
      data[i].children = undefined
    } else {
      getTreeData(data[i].children)
    }
  }
  return data
}
// 根据属性数组去重
export function unique(arr, prop) {
  let res = new Map();
  return arr.filter(item => !res.has(item[prop]) && res.set(item[prop], 1))
}
//  关闭当前页面
export function closePage() {
  const ua = window.navigator.userAgent
  if (ua.indexOf('MSIE') > 0) {
    if (ua.indexOf('MSIE 6.0') > 0) {
      window.opener = null
      window.close()
    } else {
      window.open('', '_top')
      window.top.close()
    }
  } else {
    window.opener = null
    window.open('', '_self', '')
    window.close()
  }
}
//  判断两个数组是否有重复值
export function arrayHasDuplicateValue(arr1,arr2) {
  let res = arr2.some((x)=>{
    return arr1.includes(x)
  })
  return res
}

//  时间戳转字符串时间格式化
export function formatDate(date) {
  var myyear = date.getFullYear()
  var mymonth = date.getMonth() + 1
  var myweekday = date.getDate()

  if (mymonth < 10) {
    mymonth = '0' + mymonth
  }
  if (myweekday < 10) {
    myweekday = '0' + myweekday
  }
  return myyear + '-' + mymonth + '-' + myweekday
}