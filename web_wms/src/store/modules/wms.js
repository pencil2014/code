import axios from 'axios'
import store from '@/store'
import { MessageBox, Message, Loading } from 'element-ui'
import { getToken } from '@/utils/auth'
import { parseTime, randomString, isArray } from '@/utils'
const actions = {
  // 输出pdf，xls,doc
	exportBlobFile({ state }, { uri, data, isPreview }) {
		return new Promise((resolve, reject) => {
			const loading = Loading.service({
				lock: true,
				text: 'Loading',
				spinner: 'el-icon-loading',
				background: 'rgba(0, 0, 0, 0.5)'
			})
			let token = getToken()
			let query = Object.assign(
				{ data: data },
				{
					fromSystem: 'web_H5',
					toSystem: 'mng_base_server',
					reqId: randomString(),
					reqTime: parseTime(new Date().getTime())
				}
			)
			axios({
				method: 'post',
				url: uri,
				data: query,
				headers: {
					Authorization: token
				},
				responseType: 'blob'
			})
				.then(res => {
					// console.log('res', res)
					loading.close()
					if (res.data.type === 'application/json') {
						const reader = new FileReader()
						reader.onload = function() {
							const message = JSON.parse(reader.result).msg
							Message({
								type: 'error',
								message: message
							})
							// Message.error(message) // 将错误信息显示出来
						}
						reader.readAsText(res.data)
						return
					}
					if (isPreview) {
						resolve(res.data)
					}
					// let blob = new Blob([res.data], {type: "application/vnd.ms-excel"});
					let blob = new Blob([res.data])
					resolve(blob)
				})
				.catch(err => {
					reject(err)
					loading.close()
					console.log(err)
				})
		})
	},
}
export default {
	namespaced: true,
	actions
}
