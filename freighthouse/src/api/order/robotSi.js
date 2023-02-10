import request from '@/utils/request'

// 获取补料信息详情 /ext/ai/si/info/get
export function getSiInfo(data) {
  return request({
    url: '/ext/ai/si/info/get',
    method: 'post',
    data
  })
}

// WHL新增保存 /ext/ai/si/whl/info/save
export function saveSiInfoWhl(data) {
  return request({
    url: '/ext/ai/si/whl/info/save',
    method: 'post',
    data
  })
}

// 编辑保存 /ext/ai/si/whl/info/update
export function updateSiInfoWhl(data) {
  return request({
    url: '/ext/ai/si/whl/info/update',
    method: 'post',
    data
  })
}

// YML新增保存 /ext/ai/si/yml/info/save
export function saveSiInfoYml(data) {
  return request({
    url: '/ext/ai/si/yml/info/save',
    method: 'post',
    data
  })
}

// 编辑保存 /ext/ai/si/yml/info/update
export function updateSiInfoYml(data) {
  return request({
    url: '/ext/ai/si/yml/info/update',
    method: 'post',
    data
  })
}

// hmm船司新增保存 /ext/ai/si/hmm/info/save
export function saveSiInfoHmm(data) {
  return request({
    url: '/ext/ai/si/hmm/info/save',
    method: 'post',
    data
  })
}

// hmm船司编辑保存 /ext/ai/si/hmm/info/update
export function updateSiInfoHmm(data) {
  return request({
    url: '/ext/ai/si/hmm/info/update',
    method: 'post',
    data
  })
}

// ONE船司新增保存 /ext/ai/si/one/info/save
export function saveSiInfoOne(data) {
  return request({
    url: '/ext/ai/si/one/info/save',
    method: 'post',
    data
  })
}

// ONE船司编辑保存 /ext/ai/si/one/info/update
export function updateSiInfoOne(data) {
  return request({
    url: '/ext/ai/si/one/info/update',
    method: 'post',
    data
  })
} 

// TSL船司新增保存 /ext/ai/si/tsl/info/save
export function saveSiInfoTsl(data) {
  return request({
    url: '/ext/ai/si/tsl/info/save',
    method: 'post',
    data
  })
}

// TSL船司编辑保存 /ext/ai/si/tsl/info/update
export function updateSiInfoTsl(data) {
  return request({
    url: '/ext/ai/si/tsl/info/update',
    method: 'post',
    data
  })
}

// PIL船司新增保存 /ext/ai/si/pil/info/save
export function saveSiInfoPil(data) {
  return request({
    url: '/ext/ai/si/pil/info/save',
    method: 'post',
    data
  })
}

// PIL船司编辑保存 /ext/ai/si/pil/info/update
export function updateSiInfoPil(data) {
  return request({
    url: '/ext/ai/si/pil/info/update',
    method: 'post',
    data
  })
}

// COSCO船司新增保存 /ext/ai/si/cosco/info/save
export function saveSiInfoCosco(data) {
  return request({
    url: '/ext/ai/si/cosco/info/save',
    method: 'post',
    data
  })
}

// COSCO船司编辑保存 /ext/ai/si/cosco/info/update
export function updateSiInfoCosco(data) {
  return request({
    url: '/ext/ai/si/cosco/info/update',
    method: 'post',
    data
  })
}

// OOCL船司新增保存 /ext/ai/si/oocl/info/save
export function saveSiInfoOocl(data) {
  return request({
    url: '/ext/ai/si/oocl/info/save',
    method: 'post',
    data
  })
}

// OOCL船司编辑保存 /ext/ai/si/oocl/info/update
export function updateSiInfoOocl(data) {
  return request({
    url: '/ext/ai/si/oocl/info/update',
    method: 'post',
    data
  })
}

// CMA船司新增保存 /ext/ai/si/cma/info/save
export function saveSiInfoCma(data) {
  return request({
    url: '/ext/ai/si/cma/info/save',
    method: 'post',
    data
  })
}

// CMA船司编辑保存 /ext/ai/si/cma/info/update
export function updateSiInfoCma(data) {
  return request({
    url: '/ext/ai/si/cma/info/update',
    method: 'post',
    data
  })
}
// 字段规则限制 /ext/ai/si/config/field/get
export function getFieldConfig(data) {
  return request({
    url: '/ext/ai/si/config/field/get',
    method: 'post',
    data
  })
}

// 启动自动化补料任务 /ext/ai/si/task/start
export function startSiTask(data) {
  return request({
    url: '/ext/ai/si/task/start',
    method: 'post',
    data
  })
}

// 取消自动化补料任务 /ext/ai/si/task/cancel
export function cancelSiTask(data) {
  return request({
    url: '/ext/ai/si/task/cancel',
    method: 'post',
    data
  })
}

// 补料任务列表 /ext/ai/si/task/list
export function getSiTaskList(data) {
  return request({
    url: '/ext/ai/si/task/list',
    method: 'post',
    data
  })
}

// RPA 补料信息接口 /ai/si/info/list
export function getSiInfoList(data) {
  return request({
    url: '/ext/ai/si/info/list',
    method: 'post',
    data
  })
}

// 删除 /ai/si/info/delete
export function deleteSiInfo(data) {
  return request({
    url: '/ext/ai/si/info/delete',
    method: 'post',
    data
  })
}

// 校验是否可以进行机器人补料 /ai/si/info/checkAuth
export function checkAuthInfo(data) {
  return request({
    url: '/ext/ai/si/info/checkAuth',
    method: 'post',
    data
  })
}

// 包装单位 /ai/si/package/list
export function getPackageList(data) {
  return request({
    url: '/ext/ai/si/package/list',
    method: 'post',
    data
  })
}

// 查询船司数据 /ai/si/info/carrier/list
export function getCarrierList(data) {
  return request({
    url: '/ext/ai/si/info/carrier/list',
    method: 'post',
    data
  })
}

// 城市列表/ai/si/city/list
export function getCityList(data) {
  return request({
    url: '/ext/ai/si/city/list',
    method: 'post',
    data
  })
}