import requestEntity from '@/utils/request-entity'

/**
 * 原来的request.js迁移到request-entity.js，用法保持不变
 * 
 */
function request(data) {
  // pageSizeUrl通过列表接口方法获取，再变更地址时不用更换列表页的pageSizeUrl
  if(data && data.data === 'geturl'){
    return data.url
  }
  return new Promise((resolve, reject) => {
    requestEntity(data).then(res => {
      resolve(res)
    }).catch(error => {
      console.error(error)
      if (error.message && error.message === 'Network Error') {
        requestEntity(data).then(res => {
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      } else {
        reject(error)
      }
    })
  })
}

export default request