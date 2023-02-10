import store from '@/store'
import language from '@/lang/language'
export function sleep(ms = 1000) {
	return new Promise((resolve, reject) => {
		setTimeout(() => resolve(), ms)
	})
}

export function objToForm(params) {
	const formData = new FormData()
	for (let key in params) {
		formData.append(key, params[key])
	}
	console.log('formData:', formData)
	return formData
}

// 删除弹窗
export function deleteAlert(ele, fun1, fun1Data, fun2, fun2Data, text, msg) {
	ele
		.$confirm(`是否${text || '删除'}此条信息?${msg ? msg : ''}`, {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning'
		})
		.then(() => {
			return fun1(fun1Data)
		})
		.then(response => {
			fun2(fun2Data)
			ele.$message({ message: `${text || '删除'}成功`, type: 'success' })
		})
		.catch(() => {})
}
//生成随机字符串
export function randomString(len) {
	len = len || 32
	/****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
	var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
	var maxLen = $chars.length
	var str = ''
	for (let i = 0; i < len; i++) {
		str += $chars.charAt(Math.floor(Math.random() * maxLen))
	}
	return str
}

// 获取字典下拉数组
export function getDictMap(dict) {
	let dictMap = store.state.dict.dictMap[dict]
	return dictMap
}
// 根据key获取字典value值
export function getDictLabel(dict, value) {
	let label = ''
	let dictMap = store.state.dict.dictMap[dict]
	if (dictMap && dictMap.length > 0) {
		let item = dictMap.filter(item => item.value == value)
		label = item.length > 0 ? item[0].label : ''
	}
	return label
}
// 获取字典下拉数组转换为对象
export function getDictMapToObj(dict) {
	let dictMap = store.state.dict.dictMap[dict]
	let result = {}
	if (dictMap && dictMap.length) {
		dictMap.map(item => {
			Object.assign(result, {
				[item.value]: item.label
			})
		})
	}
}

// 根据父component获取子服务项的内容
export function getServicChilds(parentComponent, serviceList, serviceInfoList) {
	let serviceListStr = sessionStorage.getItem('serviceListStr')
	console.log(serviceListStr)
	let serviceInfoListStr = sessionStorage.getItem('serviceInfoListStr')
	if (!serviceList) serviceList = JSON.parse(serviceListStr)
	if (!serviceInfoList) serviceInfoList = JSON.parse(serviceInfoListStr)
	console.log('allServicesMenu', store.state.order.allServicesMenu)
	let allServicesMenu = JSON.parse(JSON.stringify(store.state.order.allServicesMenu))
	let child = []
	if (serviceList && serviceList.length) {
		child = allServicesMenu.filter(item => item.component === parentComponent)[0] && allServicesMenu.filter(item => item.component === parentComponent)[0].child
		// 子服务项按返回的serviceList数组过滤
		child = child.filter(item => serviceList.includes(item.code))
		child.map(item => {
			let serviceItem = serviceInfoList.filter(ele => ele.serviceCode === item.code)
			item.value = language == 'en' ? item.ename : item.cname
			item.key = item.component
			item.isCancelApply = serviceItem[0].cancelApplyStatus === 'applied'
			item.isJoint = serviceItem[0].isJoint === 'y'
		})
	}
	return child
}
// 根据父component获取空运子服务项的内容
export function getAirServicChilds(parentComponent, serviceList, serviceInfoList) {
	let serviceListStr = sessionStorage.getItem('serviceListStr')
	console.log(serviceListStr)
	let serviceInfoListStr = sessionStorage.getItem('serviceInfoListStr')
	if (!serviceList) serviceList = JSON.parse(serviceListStr)
	if (!serviceInfoList) serviceInfoList = JSON.parse(serviceInfoListStr)
	let allServicesMenu = JSON.parse(JSON.stringify(store.state.airTransport.allServicesMenu))
	let child = []
	if (serviceList && serviceList.length) {
		child = allServicesMenu.filter(item => item.component === parentComponent)[0] && allServicesMenu.filter(item => item.component === parentComponent)[0].child
		// 子服务项按返回的serviceList数组过滤
		child = child.filter(item => serviceList.includes(item.code))
		child.map(item => {
			let serviceItem = serviceInfoList.filter(ele => ele.serviceCode === item.code)
			item.value = language == 'en' ? item.ename : item.cname
			item.key = item.component
			item.isCancelApply = serviceItem[0].cancelApplyStatus === 'applied'
			item.isJoint = serviceItem[0].isJoint === 'y'
		})
	}
	return child
}
// 根据serviceCode获取服务项名称
export function getServiceName(code) {
	let serviceName = ''
	let allServicesMenu = JSON.parse(JSON.stringify(store.state.order.allServicesMenu))
	allServicesMenu.map(item => {
		if (item.code) {
			if (item.code === code) return (serviceName = language === 'en' ? item.ename : item.cname)
		} else {
			item.child.map(ele => {
				if (ele.code === code) return (serviceName = language === 'en' ? ele.ename : ele.cname)
			})
		}
	})
	return serviceName
}

// 根据组件名称获取服务项code
export function getServiceCode(component, serviceList) {
	let serviceCode = ''
	let allServicesMenu = JSON.parse(JSON.stringify(store.state.order.allServicesMenu))
	let sItem = allServicesMenu.find(item => item.component === component)
	if (sItem) {
		// 有code直接取
		if (sItem.code) {
			serviceCode = sItem.code
		}
		// 存在子服务项取数组第一个code
		if (sItem.child) {
			let child = sItem.child.filter(item => serviceList.includes(item.code))
			serviceCode = child[0]?child[0].code:''
		}
	}
	return serviceCode
}
// 根据组件名称获取服务项code
export function getRailServiceCode(component, serviceList) {
	let serviceCode = ''
	let allServicesMenu = JSON.parse(JSON.stringify(store.state.railway.allServicesMenu))
	let sItem = allServicesMenu.find(item => item.component === component)
	if (sItem) {
		// 有code直接取
		if (sItem.code) {
			serviceCode = sItem.code
		}
		// 存在子服务项取数组第一个code
		if (sItem.child) {
			let child = sItem.child.filter(item => serviceList.includes(item.code))
			serviceCode = child[0]?child[0].code:''
		}
	}
	return serviceCode
}
// 根据组件名称获取空运服务项code
export function getAirServiceCode(component, serviceList) {
  console.log("🚀 ~ component", component)
	let serviceCode = ''
	let allServicesMenu = JSON.parse(JSON.stringify(store.state.airTransport.allServicesMenu))
  console.log("🚀 ~ allServicesMenu", allServicesMenu)
	let sItem = allServicesMenu.find(item => item.component === component)
	if (sItem) {
		// 有code直接取
		if (sItem.code) {
			serviceCode = sItem.code
		}
		// 存在子服务项取数组第一个code
		if (sItem.child) {
			let child = sItem.child.filter(item => serviceList.includes(item.code))
			serviceCode = child[0].code
		}
	}
	return serviceCode
}

// 深拷贝数组对象
export function copyArry(obj) {
	if (!obj) return obj
	var newobj = obj.constructor === Array ? [] : {}
	if (typeof obj !== 'object') {
		return
	}
	for (var i in obj) {
		newobj[i] = typeof obj[i] === 'object' ? copyArry(obj[i]) : obj[i]
	}
	return newobj
}

// 过滤清空对象内为空的值
export function filterEmpty(data) {
	for (let i in data) {
		if (data[i] === undefined || data[i] === null || data[i] === 'undefined' || data[i] === 'null' || data[i] === '') {
			delete data[i]
		}
	}
	return data
}

// 乘法函数
export function accMul(arg1, arg2) {
	var m = 0,
		s1 = arg1.toString(),
		s2 = arg2.toString()
	try {
		m += s1.split('.')[1].length
	} catch (e) {}
	try {
		m += s2.split('.')[1].length
	} catch (e) {}
	return (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) / Math.pow(10, m)
}
// 加法函数
export function accAdd(arg1, arg2) {
	var r1, r2, m
	try {
		r1 = arg1.toString().split('.')[1].length
	} catch (e) {
		r1 = 0
	}
	try {
		r2 = arg2.toString().split('.')[1].length
	} catch (e) {
		r2 = 0
	}
	m = Math.pow(10, Math.max(r1, r2))
	return (arg1 * m + arg2 * m) / m
}

export function newAccAdd(arg1, arg2) {
	var r1, r2, m, c
	try {
		r1 = arg1.toString().split('.')[1].length
	} catch (e) {
		r1 = 0
	}
	try {
		r2 = arg2.toString().split('.')[1].length
	} catch (e) {
		r2 = 0
	}
	c = Math.abs(r1 - r2)
	m = Math.pow(10, Math.max(r1, r2))
	if (c > 0) {
		var cm = Math.pow(10, c)
		if (r1 > r2) {
			arg1 = Number(arg1.toString().replace('.', ''))
			arg2 = Number(arg2.toString().replace('.', '')) * cm
		} else {
			arg1 = Number(arg1.toString().replace('.', '')) * cm
			arg2 = Number(arg2.toString().replace('.', ''))
		}
	} else {
		arg1 = Number(arg1.toString().replace('.', ''))
		arg2 = Number(arg2.toString().replace('.', ''))
	}
	return (arg1 + arg2) / m
}

// 获取文字一行需要多长的长度才能展示完
export function getTextSize(fontSize, text) {
	const span = document.createElement('span')
	let width = span.offsetWidth
	span.style.visibility = 'hidden'
	span.style.fontSize = fontSize
	span.style.lineHeight = '16px'
	span.style.display = 'inline-block'
	document.body.appendChild(span)
	if ('undefined' != typeof span.textContent) {
		span.textContent = text
	} else {
		span.innerText = text
	}
	width = Math.ceil(span.clientWidth)
	document.body.removeChild(span)
	return width
}
