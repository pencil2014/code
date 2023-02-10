import request from '@/utils/request'

//导入列表
export function routeImportList(data) {
  return request({
    url: '/charge/routeImport/list',
    method: 'post',
    data
  })
}
//导入详情
export function routeImportInfo(data) {
  return request({
    url: '/charge/routeImport/info',
    method: 'post',
    data
  })
}
//运价批量导入列表
export function fileImport(data) {
  return request({
    url: '/charge/file/import',
    method: 'post',
    data
  })
}
//下错错误文件
export function fileExportErrorList(data) {
  return request({
    url: '/charge/file/exportErrorList',
    method: 'post',
    data
  })
}

//删除导入文件
export function fileImportDelete(data) {
  return request({
    url: '/charge/routeImport/delete',
    method: 'post',
    data
  })
}

