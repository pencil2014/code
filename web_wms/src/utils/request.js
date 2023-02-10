import requestEntity from '@/utils/request-entity'

/**
 * 原来的request.js迁移到request-entity.js，用法保持不变
 * 
 */
function request(data) {
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