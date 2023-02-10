import {
	planExportReview
} from '@/api/order/list'
import router from '@/router'

function getParamsValue(params) {
	// 获取url中的指定参数
	let href = window.location.href
	let str1 = href.split('?')[1]
	if(str1) {
		let arr1 = str1.split('&')
		let arr2 = []
		let len = arr1.length
		let obj = {}
		for(let i = 0; i < len; i++) {
           arr2 = arr1[i].split('=')
		   obj[arr2[0]] = arr2[1]
		}
		return obj[params]
	} else {
		return ''
	}
    
}
export function handleExportPlanCommon(orderNo) {
	let params = {
		orderNo: orderNo || getParamsValue('orderNo'),
		docType: 'pdf'
	}
	planExportReview(params).then(res => {
		let { fileNo, name } = res.data
		name = name.substring(0, name.lastIndexOf('.'))
		console.log('res', res)
		let routeUrl = router.resolve({
			name: 'PlanPrint',
			query: {
				fileNo: fileNo,
				fileName: name
			}
		})
		window.open(routeUrl.href, '_blank')
	})
}