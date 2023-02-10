import request from '@/utils/request'
// 根据大类ID获取小类
export function getTypeByParentId(data) {
	return request({
		url: '/base/webapi/exceptionType/getTypeByParentId',
		method: 'post',
		data
	})
}
// 小类列表
export function reasonPageList(data) {
	return request({
		url: '/base/webapi/exceptionType/reasonPageList',
		method: 'post',
		data
	})
}
// 大类列表
export function typeList(data) {
	return request({
		url: '/base/webapi/exceptionType/typeList',
		method: 'post',
		data
	})
}
// 新增/编辑异常小类
export function saveReason(data) {
	return request({
		url: '/base/webapi/exceptionType/saveReason',
		method: 'post',
		data
	})
}
// 禁用小类
export function reasonInvalid(data) {
	return request({
		url: '/base/webapi/exceptionType/reasonInvalid',
		method: 'post',
		data
	})
}
// 禁用大类
export function typeInvalid(data) {
	return request({
		url: '/base/webapi/exceptionType/typeInvalid',
		method: 'post',
		data
	})
}
// 新增/编辑异常大类
export function saveType(data) {
	return request({
		url: '/base/webapi/exceptionType/saveType',
		method: 'post',
		data
	})
}

//币别列表
export function currencyList(data) {
	return request({
		url: '/base/webapi/currency/list',
		method: 'post',
		data
	})
}

//币别列表
export function currencySave(data) {
	return request({
		url: '/base/webapi/currency/currencySave',
		method: 'post',
		data
	})
}

//员工下拉列表
export function employeeSelectlist(data) {
	return request({
		url: '/base/webapi/dept/employeeSelectlist',
		method: 'post',
		data
	})
}

//删除币别信息
export function currencyDelete(data) {
	return request({
		url: '/base/webapi/currency/currencyDelete',
		method: 'post',
		data
	})
}

//费用项列表
export function feeItemList(data) {
	return request({
		url: '/fin/feeitem/list',
		method: 'post',
		data
	})
}

//费用项保存
export function feeItemSave(data) {
	return request({
		url: '/fin/feeitem/save',
		method: 'post',
		data
	})
}

//费用项查询
export function feeItemInfo(data) {
	return request({
		url: '/fin/feeitem/feeItemInfo',
		method: 'post',
		data
	})
}

//费用类别列表
export function feeClassList(data) {
	return request({
		url: '/fin/feeclass/list',
		method: 'post',
		data
	})
}

//费用类别保存
export function feeClassSave(data) {
	return request({
		url: '/fin/feeclass/save',
		method: 'post',
		data
	})
}

//费用税率查询接口
export function exchangeRateList(data) {
	return request({
		url: '/base/webapi/currency/exchangeRatelist',
		method: 'post',
		data
	})
}

//费用税率修改接口
export function exchangeRateSave(data) {
	return request({
		url: '/base/webapi/currency/exchangeRateSave',
		method: 'post',
		data
	})
}
export function finExchangeRateSave(data) {
	return request({
		url: '/fin/exchangeRate/save',
		method: 'post',
		data
	})
}

export function currencyExportExchangeRate(data) {
	return request({
		url: '/base/webapi/currency/exportExchangeRate',
		method: 'post',
		data
	})
}

//汇率配置
export function exchangeRateConfigList(data) {
	return request({
		url: '/base/webapi/currency/rateConfigList',
		method: 'post',
		data
	})
}

//汇率配置保存
export function exchangeRateConfigSave(data) {
	return request({
		url: '/base/webapi/currency/rateConfigSave',
		method: 'post',
		data
	})
}

//汇率配置保存
export function exchangeRateConfigDelete(data) {
	return request({
		url: '/base/webapi/currency/rateConfigDelete',
		method: 'post',
		data
	})
}

//港口下拉列表数据
export function portList(data) {
	return request({
		url: '/base/webapi/port/listPage',
		method: 'post',
		data
	})
}
//空运港口下拉列表数据
export function airportList(data) {
	return request({
		url: '/base/webapi/airport/listPage',
		method: 'post',
		data
	})
}
//铁路站点下拉列表数据
export function railPortList(data) {
	return request({
		url: '/base/webapi/railport/listPage',
		method: 'post',
		data
	})
}

//保存港口数据
export function portSave(data) {
	return request({
		url: '/base/webapi/port/portSave',
		method: 'post',
		data
	})
}
//空运保存港口数据
export function airportSave(data) {
	return request({
		url: '/base/webapi/airport/portSave',
		method: 'post',
		data
	})
}
//铁路保存站点数据
export function railportSave(data) {
	return request({
		url: '/base/webapi/railport/portSave',
		method: 'post',
		data
	})
}

//系统航线列表
export function systemLineList(data) {
	return request({
		url: '/base/webapi/systemLine/listPage',
		method: 'post',
		data
	})
}
//保存航线列表
export function systemLineSave(data) {
	return request({
		url: '/base/webapi/systemLine/systemLineSave',
		method: 'post',
		data
	})
}

//船司列表
export function shippingCarrierList(data) {
	return request({
		url: '/base/webapi/shippingCarrier/listPage',
		method: 'post',
		data
	})
}

//保存船司
export function shippingCarrierSave(data) {
	return request({
		url: '/base/webapi/shippingCarrier/shippingCarrierSave',
		method: 'post',
		data
	})
}

//运输条款列表
export function shipTermsList(data) {
	return request({
		url: '/base/webapi/shipTerms/listPage',
		method: 'post',
		data
	})
}

//保存船司
export function shipTermsSave(data) {
	return request({
		url: '/base/webapi/shipTerms/shipTermsSave',
		method: 'post',
		data
	})
}

//国家列表
export function countryList(data) {
	return request({
		url: '/base/webapi/country/listPage',
		method: 'post',
		data
	})
}

//国家保存
export function countrySave(data) {
	return request({
		url: '/base/webapi/country/countrySave',
		method: 'post',
		data
	})
}

//城市列表
export function cityList(data) {
	return request({
		url: '/base/webapi/city/listPage',
		method: 'post',
		data
	})
}

//城市保存
export function citySave(data) {
	return request({
		url: '/base/webapi/city/citySave',
		method: 'post',
		data
	})
}

//专项费用列表
export function specialLimitList(data) {
	return request({
		url: '/fin/feeitem/specialLimitList',
		method: 'post',
		data
	})
}

//专项费用保存
export function specialLimitSave(data) {
	return request({
		url: '/fin/feeitem/specialLimitSave',
		method: 'post',
		data
	})
}

//专项费用保存
export function specialLimitDelete(data) {
	return request({
		url: '/fin/feeitem/specialLimitDelete',
		method: 'post',
		data
	})
}

//数据字典列表
export function dictDefineList(data) {
	return request({
		url: '/base/webapi/dict/listPage',
		method: 'post',
		data
	})
}

//数据字典删除
export function dictDelete(data) {
	return request({
		url: '/base/webapi/dict/dictDelete',
		method: 'post',
		data
	})
}

//数据字典保存
export function dictSave(data) {
	return request({
		url: '/base/webapi/dict/dictSave',
		method: 'post',
		data
	})
}

//数据字典item列表
export function dictItemList(data) {
	return request({
		url: '/base/webapi/dict/dictItemList',
		method: 'post',
		data
	})
}

//节假日查询列表
export function holidayList(data) {
	return request({
		url: '/base/webapi/holiday/listPage',
		method: 'post',
		data
	})
}

//系统配置项列表
export function baseConfigList(data) {
	return request({
		url: '/base/webapi/baseConfig/listPage',
		method: 'post',
		data
	})
}

//系统配置项删除
export function baseConfigDelete(data) {
	return request({
		url: '/base/webapi/baseConfig/configDelete',
		method: 'post',
		data
	})
}

//系统配置项保存
export function baseConfigSave(data) {
	return request({
		url: '/base/webapi/baseConfig/configSave',
		method: 'post',
		data
	})
}

const COMPANY = {}
const COMPANYBANKACCT = {}
const baseArr = [
	{
		// 分公司银行账户信息
		key: 'companyBankAcct',
		value: COMPANYBANKACCT,
		arr: [
			'pageList', // 分页查询
			'save', // 增加
			'update', // 修改
			'info', // 详情
			'enabled' // 启用/禁用
		]
	},
	{
		// 分公司列表
		key: 'company',
		value: COMPANY,
		arr: [
			'pageList', // 分页查询
			'update', // 修改
			'info' // 详情
		]
	}
]
baseArr.forEach(item => {
	item.arr.forEach(api => {
		item.value[api] = function (data) {
			return request({
				url: `/base/webapi/${item.key}/${api}`,
				method: 'post',
				data
			})
		}
	})
})
export default {
	COMPANYBANKACCT,
	COMPANY
}
