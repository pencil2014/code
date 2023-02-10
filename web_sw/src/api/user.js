import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/base/webapi/sysUser/info',
    method: 'post',
    data: {} // { token }
  })
}

// 获取 当前登录人所属的公司信息 /webapi/company/user/company/info
export function getUserCompanyInfo(data) {
  return request({
    url: '/base/webapi/company/user/company/info',
    method: 'post',
    data
  })
}

export function changePwd(data) {
  return request({
    url: '/user/change-pwd',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export function getMenu() {
  return request({
    url: '/base/webapi/menu/nav',
    method: 'post'
  })
}
