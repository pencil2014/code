import ElementUI, { Message } from 'element-ui'
/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
	return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
	const valid_map = ['admin', 'editor', 'sunny']
	return valid_map.indexOf(str.trim()) >= 0
}

// 校验数字和小数点
export function validateNumPoint() {
	return (rule, value, callback) => {
		let reg = /^\d+(?=\.{0,1}\d+$|$)/
		if (!value) {
			callback(new Error('请输入'))
		} else if (!reg.test(value)) {
			callback(new Error('请输入正确的数字'))
		} else {
			callback()
		}
	}
}

// 纯数字
export function validateNum() {
	return (rule, value, callback) => {
		if (!Number.isInteger(Number(value))) {
			callback(new Error('请输入数字值'))
		} else {
			if (value <= 0) {
				callback(new Error('请输入正整数'))
			} else {
				callback()
			}
		}
	}
}

/**
 * @param {Array} values
 * @returns {Boolean}
 */
export function validateBox(values, canShowNullParamsList = []) {
	// canShowNullParamsList 为可不填字段数组，比如quantity可不填时，传入格式为 ['quantity']
	let reg = /^\d+(\.\d+)?$/,
		numberReg = /^[0-9]+$/
	if (!canShowNullParamsList.includes('cname') && values.some(item => !item.cname)) {
		ElementUI.Message({ type: 'error', message: '缺少品名' })
		return false
	}
	if (canShowNullParamsList.includes('quantity')) {
		if (values.some(item => !numberReg.test(item.quantity) && ![undefined, null, ''].includes(item.quantity))) {
			ElementUI.Message({ type: 'error', message: '请输入正确的件数' })
			return false
		}
		if (values.some(item => item.quantity < 1  && ![undefined, null, ''].includes(item.quantity))) {
			ElementUI.Message({ type: 'error', message: '件数不能小于1' })
			return false
		}
	} else {
		if (values.some(item => !numberReg.test(item.quantity))) {
			ElementUI.Message({ type: 'error', message: '请输入正确的件数' })
			return false
		}
		if (values.some(item => item.quantity < 1)) {
			ElementUI.Message({ type: 'error', message: '件数不能小于1' })
			return false
		}
	}

	// if (values.some(item => !reg.test(item.weight))) {
	//   ElementUI.Message({type: 'error', message: '请输入正确的毛重'})
	//   return false
	// }
	// if (values.some(item => !reg.test(item.volume))) {
	//   ElementUI.Message({type: 'error', message: '请输入正确的体积'})
	//   return false
	// }
	if (!canShowNullParamsList.includes('packageType') && values.some(item => !item.packageType)) {
		ElementUI.Message({ type: 'error', message: '包装不能为空' })
		return false
	}
	return true
}

/**
 * @param {Array} values
 * @returns {Boolean}
 */

export function validatePhone(values) {
	let reg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/
	let message = ''
	if (
		values.some(item => {
			message = item.message
			return !reg.test(item.value)
		})
	) {
		ElementUI.Message({ type: 'error', message: message })
		return false
	}
	return true
}
// 校验毛重，体积 大于0的数字&&小于999999,三位小数
export function checkQuantityWeightVolume(max = 999999) {
	return (rule, value, callback) => {
		let reg = /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,3}|[1-9][0-9]*\.\d{1,3})))$/
		if (value) {
			if (!reg.test(value)) {
				callback(new Error(`请输入不大于${max}的数字`))
			} else if (value > max) {
				callback(new Error(`请输入不大于${max}的数字`))
			} else {
				callback()
			}
		} else {
			callback()
		}
	}
}

// 长宽高：校验数字和小数点,最多两位小数，最大999999。不校验必填,两位小数
export function validateNumPointEmpty(max = 999999) {
	return (rule, value, callback) => {
		let reg = /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/
		if (value) {
			if (!reg.test(value) || value > max) {
				callback(new Error(`请输入不大于${max}的数字`))
			} else {
				callback()
			}
		} else {
			callback()
		}
	}
}

// 中文和数字-中文品名
export function validateCntextAndNum() {
	return (rule, value, callback) => {
		let reg = /^[\u4e00-\u9fa50-9]+$/
		if (value) {
			let result = value.replace(/\s+/g, '')
			if (!reg.test(result)) {
				callback(new Error('请输入中文和数字'))
			} else {
				callback()
			}
		} else {
			callback()
		}
	}
}
// 英文，数字和英文符号-英文品名
export function validateEntextAndNum() {
	return (rule, value, callback) => {
		let reg = /^[a-z_A-Z0-9-\.!@#\$%\\\^&\*\)\(\+=\{\}\[\]\/",'<>~\·`\?:;|]+$/
		if (value) {
			let result = value.replace(/\s+/g, '')
			if (!reg.test(result)) {
				callback(new Error('请输入英文，数字和英文符号'))
			} else {
				callback()
			}
		} else {
			callback()
		}
	}
}

// 零和非零开头的数字
export function validateInteger() {
	return (rule, value, callback) => {
		let reg = /^(0|[1-9][0-9]*)$/
		if (value) {
			if (!reg.test(value)) {
				callback(new Error('请输入大于0的整数'))
			} else {
				callback()
			}
		} else {
			callback()
		}
	}
}
// 件数:正整数, 不能大于999999
export function validateIntegerQuantity() {
	return (rule, value, callback) => {
		let reg = /^([1-9][0-9]*)$/
		if (value) {
			if (!reg.test(value) || value > 999999) {
				callback(new Error('请输入0-999999的整数数字'))
			} else {
				callback()
			}
		} else {
			callback()
		}
	}
}
// 分单数:整数；包括0；小于999999
export function validatebillSplitNum(max=999) {
	return (rule, value, callback) => {
		let reg = /^([1-9]\d*|[0]{1,1})$/
		if (value) {
			if (!reg.test(value) || value > max) {
				callback(new Error(`请输入0-${max}的整数数字`))
			} else {
				callback()
			}
		} else {
			callback()
		}
	}
}
// 重泡差
export function checkCalBubbleWeight(max = 999999, min = -999999) {
	return (rule, value, callback) => {
		let reg = /^\-?(([1-9][0-9]*)|([0])|(([0]\.\d{1,3}|[1-9][0-9]*\.\d{1,3})))$/
		if (value) {
			if (!reg.test(value)) {
				callback(new Error(`请输入不大于${max},不小于${min}的数字`))
			} else if (value > max || value < min) {
				callback(new Error(`请输入不大于${max},不小于${min}的数字`))
			} else {
				callback()
			}
		} else {
			callback()
		}
	}
}
// 提单校验收发通每行最大字数和最大行数
export function validateContact(values, validateParam) {
	let { row, col } = validateParam
	let shipperArr = values['shipper'].split(/[\r\n]/g)
	let consigneeArr = values['consignee'].split(/[\r\n]/g)
	let notifyArr = values['notify1'].split(/[\r\n]/g)
	let alsoNotifyArr = values['notify2'].split(/[\r\n]/g)
	// console.log('shipperArr', shipperArr);
	// console.log('consigneeArr', consigneeArr);
	// console.log('notifyArr', notifyArr);
	let msgArr = []
	if (shipperArr.length > row) {
		msgArr.push(`发货人超过最大行数${row}`)
	}
	shipperArr.map((item, index) => {
		if (index < row && item.length > col) {
			msgArr.push(`发货人第${index + 1}行超过最大字符数数${col},请换行!`)
		}
	})
	if (consigneeArr.length > row) {
		msgArr.push(`收货人超过最大行数${row}`)
	}
	consigneeArr.map((item, index) => {
		if (index < row && item.length > col) {
			msgArr.push(`收货人第${index + 1}行超过最大字符数${col},请换行!`)
		}
	})
	if (notifyArr.length > row) {
		msgArr.push(`Notify Party通知人超过最大行数${row}`)
	}
	notifyArr.map((item, index) => {
		if (index < row && item.length > col) {
			msgArr.push(`Notify Party通知人第${index + 1}行超过最大字符数${col},请换行!`)
		}
	})
	if (alsoNotifyArr.length > row) {
		msgArr.push(`Also Notify Party超过最大行数${row}`)
	}
	alsoNotifyArr.map((item, index) => {
		if (index < row && item.length > col) {
			msgArr.push(`Also Notify Party第${index + 1}行超过最大字符数${col},请换行!`)
		}
	})
	if (msgArr.length) {
		let txt = msgArr.join('<br>')
		ElementUI.Message({ type: 'error', dangerouslyUseHTMLString: true, message: txt })
		return false
	}
	return true
}
// 提单校验
export function validateChinese(values, validateParam) {
	let shipperArr = values['shipper']
	let consigneeArr = values['consignee']
	let notifyArr = values['notify1']
	let alsoNotifyArr = values['notify2']

	return true
}
