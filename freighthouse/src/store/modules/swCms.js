import axios from 'axios'
import { getToken } from '@/utils/auth'
import { parseTime, randomString } from '@/utils'
const actions = {
    // 图片预览
    previewFile({ state }, params) {
        console.log(params)
        let { fileNo, fileName, officePreviewType } = params
        officePreviewType = officePreviewType || 'pdf'
        if (!fileNo || !fileName) return
        let reg = /(.*)\.(xls|XLS|xlsx|XLSX|doc|DOC|docx|DOCX|PPT|PPTX|ppt|pptx)$/ //office后缀正则
        let locationHref = window.location.href
        let onlinePreview = locationHref.includes('oss.longsailing.net') || locationHref.includes('81.71.10.108') //线上域名、IP检测
        if (onlinePreview && reg.test(fileName)) {
            let href = `https://oss.longsailing.net/base/fileView/preview/${fileNo}/${fileName}`
            window.open(`http://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(href)}&officePreviewType=${officePreviewType}`, '_blank')
        } else {
            let nameArr = fileName.split('.')
            let name = nameArr[nameArr.length - 1]
            name = name.toLowerCase()
            let fileUrl = `${window.location.origin}/base/fileView/preview/${fileNo}/${fileNo}.${name}`
            // let href = `/file/onlinePreview?url=${encodeURIComponent(fileUrl)}&officePreviewType=${officePreviewType}`
            // pdf格式直接用浏览器打开
            window.open(fileUrl)
        }
    },
    // 请求下载blob流文件
	downloadBlobFile({ state }, { uri, params }) {
		return new Promise((resolve, reject) => {
			let token = getToken()
			Object.assign(params, {
				fromSystem: 'web_H5',
				toSystem: 'mng_base_server',
				reqId: randomString(),
				reqTime: parseTime(new Date().getTime())
			})
			axios({
				method: 'get',
				url: uri,
				params: params,
				headers: {
					Authorization: token
				},
				responseType: 'blob'
			})
				.then(res => {
					console.log(res)
					// let blob = new Blob([res.data], {type: "application/vnd.ms-excel"});
					let blob = new Blob([res.data])
					resolve(blob)
				})
				.catch(err => {
					reject(err)
					console.log(err)
				})
		})
	},
}

export default {
	namespaced: true,
	actions
}