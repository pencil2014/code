import request from '@/utils/request'
// import { valid } from 'mockjs'

// // 自定义表头保存模板
// export function listColumnConfigSave(data) {
// 	return request({
// 		url: '/base/webapi/listColumnConfig/save',
// 		method: 'post',
// 		data
// 	})
// }
// 自定义表头查询模板
export function listColumnConfigTempList(data) {
	return request({
		url: '/base/webapi/listColumnConfig/temp/list',
		method: 'post',
		data
	})
}
// 自定义表头模板删除
export function listColumnConfigTempDelete(data) {
	return request({
		url: '/base/webapi/listColumnConfig/temp/delete',
		method: 'post',
		data
	})
}
// 登录
export function login(data) {
	return request({
		url: '/base/common/login',
		method: 'post',
		data
	})
}

// 刷新token
export function refreshToken(data) {
	return request({
		url: '/base/common/session/refreshToken',
		method: 'post',
		data
	})
}

// 退出
export function logout(data) {
	return request({
		url: '/base/common/logout',
		method: 'post',
		data
	})
}

// 系统菜单
export function allMenuCheckAuth(data) {
	return request({
		url: '/base/webapi/menu/allMenuCheckAuth',
		method: 'post',
		data
	})
}

// 页面和模块
export function allPageModuleCheckAuth(data) {
	return request({
		url: '/base/webapi/pageResource/allPageModuleCheckAuth',
		method: 'post',
		data
	})
}

// 数据字典
export function getDictList(data) {
	return request({
		url: '/base/webapi/dict/list',
		method: 'post',
		data
	})
}
// 港口下拉
export function basePortList(portName, portAttribute, state) {
	state = state || ''
	return request({
		url: '/base/webapi/port/portList',
		method: 'post',
		data: { portName, portAttribute, state }
	})
}
// 铁路站点下拉
export function baseRailPortList(portName) {
	return request({
		url: '/base/webapi/railport/list',
		method: 'post',
		data: { portName }
	})
}
// 港口下拉
export function portList(data) {
	return request({
		url: '/base/webapi/port/portList',
		method: 'post',
		data: data
	})
}
// 港口城市混合数据下拉
export function basePortCityList(portName, state) {
	state = state || ''
	return request({
		url: '/base/webapi/port/portCityList',
		method: 'post',
		data: { portName, state }
	})
}
// 港口回显数据查询
export function basePortListByCodes(portCodes) {
	return request({
		url: '/base/webapi/port/portList',
		method: 'post',
		data: { portCodes }
	})
}
// 站点回显数据查询
export function baseRailPortListByCodes(portCodes) {
	return request({
		url: '/base/webapi/railport/list',
		method: 'post',
		data: { portCodes }
	})
}

// 港口航线信息
export function portSystemLineInfo(portCode) {
	return request({
		url: '/base/webapi/systemLine/portSystemLine',
		method: 'post',
		data: { portCode }
	})
}
// 铁路系统航线
export function railportSystemLineInfo(portCode) {
	return request({
		url: '/base/webapi/railport/sysline/list',
		method: 'post',
		data: { portCode }
	})
}
// 航线下拉搜索
export function baseSystemLineList(systemLineName, state, sysLineGroupCode) {
	state = state || ''
	return request({
		url: '/base/webapi/systemLine/dictList',
		method: 'post',
		data: { systemLineName, state, sysLineGroupCode }
	})
}
// 空运航线下拉搜索
export function airportBaseSystemLineList(systemLineName, state) {
	state = state || ''
	return request({
		url: '/base/webapi/airport/sysline/list',
		method: 'post',
		data: { systemLineName, state }
	})
}
// 铁路航线下拉搜索
export function railportBaseSystemLineList(systemLineName, state) {
	state = state || ''
	return request({
		url: '/base/webapi/railport/sysline/list',
		method: 'post',
		data: { systemLineName, state }
	})
}
// 系统航线详情
export function baseSystemLineInfo(data) {
	return request({
		url: '/base/webapi/systemLine/info',
		method: 'post',
		data
	})
}
//系统航线列表查询
export function lienGroupManager(data) {
	return request({
		url: '/base/webapi/systemLine/lienGroupManager',
		method: 'post',
		data
	})
}
//大航线经理保存
export function systemLineManagerSave(data) {
	return request({
		url: '/base/webapi/systemLine/systemLineManagerSave',
		method: 'post',
		data
	})
}
//员工代班列表
export function dutyListPage(data) {
	return request({
		url: '/base/webapi/employee/replace/duty/listPage',
		method: 'post',
		data
	})
}
//员工代班列表保存
export function replaceDutySave(data) {
	return request({
		url: '/base/webapi/employee/replace/duty/save',
		method: 'post',
		data
	})
}
// 员工代班删除
export function replaceDutyDelete(data) {
	return request({
		url: '/base/webapi/employee/replace/duty/delete',
		method: 'post',
		data
	})
}
// 船司下拉搜索
export function baseShippingCarrierList(shippingCarrierName, state) {
	state = state || ''
	return request({
		url: '/base/webapi/shippingCarrier/shippingCarrierList',
		method: 'post',
		data: { shippingCarrierName, state }
	})
}
// 船司详情
export function shippingCarrierInfo(data) {
	return request({
		url: '/base/webapi/shippingCarrier/info',
		method: 'post',
		data
	})
}
// 运输条款
export function baseShipTermsList(data) {
	return request({
		url: '/base/webapi/shipTerms/dictList',
		method: 'post',
		data: data
	})
}
// 币别下拉搜索
export function baseCurrencyList(code, state, sourceType) {
	code = code || ''
	state = state || ''
	return request({
		url: '/base/webapi/currency/currencyList',
		method: 'post',
		data: { code, state, sourceType }
	})
}
// 获取今日结算汇率
export function actualExchangeRate(data) {
	return request({
		url: '/base/webapi/currency/actualExchangeRate',
		method: 'post',
		data
	})
}
// 查询当前汇率（结算汇率返回当天结算汇率，记账汇率返回当月记账汇率）
export function getCurrentExchangeRate(data) {
	return request({
		url: '/base/webapi/currency/getCurrentExchangeRate',
		method: 'post',
		data
	})
}
// 获取当月记账汇率
export function acctExchangeRate(data) {
	return request({
		url: '/base/webapi/currency/acctExchangeRate',
		method: 'post',
		data
	})
}
// 费用项下拉搜索
export function baseFeeItemList(name, state) {
	state = state || ''
	let size = 20
	return request({
		url: '/fin/feeitem/feeItemList',
		method: 'post',
		data: { name, state, size }
	})
}

//业务类型
export function baseBusinessList(data) {
	return request({
		url: '/base/webapi/business/list',
		method: 'post',
		data
	})
}

//服务项
export function baseBusinessServiceList(data) {
	return request({
		url: '/base/webapi/business/service/list',
		method: 'post',
		data
	})
}
//查询所有业务类型及服务项
export function businessServiceList(data) {
	return request({
		url: '/base/webapi/business/businessServiceList',
		method: 'post',
		data
	})
}

//获取员工
export function baseEmployeeList(data) {
	return request({
		url: '/base/webapi/dept/employee/list',
		method: 'post',
		data
	})
}

//模糊搜索获取员工
export function baseEmployeeListName(data) {
	return request({
		url: '/base/webapi/dept/employee/list/name',
		method: 'post',
		data
	})
}

// 模糊搜索h单取单人 order/blPaperTransfer/getTakeEmployee
export function getTakeEmployee(data) {
  return request({
		url: '/order/blPaperTransfer/getTakeEmployee',
		method: 'post',
		data
	})
}

//模糊搜索放单申请人
export function finApplyEmployeeList(data) {
	return request({
		url: '/order/fin/applyEmployee/list',
		method: 'post',
		data
	})
}

//所有公司
export function baseCompanyList(data) {
	return request({
		url: '/base/webapi/dept/company/list',
		method: 'post',
		data
	})
}

//所有公司(用于协同公司结算)
export function baseCompanySettleList(data) {
	return request({
		url: '/base/webapi/dept/company/settle/list',
		method: 'post',
		data
	})
}
//所有员工详情
export function deptEmployeeInfo(data) {
	return request({
		url: '/base/webapi/dept/employee/info',
		method: 'post',
		data
	})
}
//所有员工详情
export function deptEmployeeHistoryList(data) {
	return request({
		url: '/base/webapi/dept/employee/history/list',
		method: 'post',
		data
	})
}

//所有公司
export function baseSupplierList(data) {
	return request({
		url: '/base/webapi/supplier/list',
		method: 'post',
		data
	})
}

//费用类别下拉框列表
export function feeClassSelectList(data) {
	return request({
		url: '/fin/feeclass/selectList',
		method: 'post',
		data
	})
}

//服务项下拉框列表
export function serviceSelectList(data) {
	return request({
		url: '/base/webapi/business/serviceSelectList',
		method: 'post',
		data
	})
}

//服务项状态修改
export function workServiceUpdateStatus(data) {
	return request({
		url: '/order/shipping/workService/updateStatus',
		method: 'post',
		data
	})
}
//国家下拉框列表
export function countrySelectList(data) {
	return request({
		url: '/base/webapi/country/countryList',
		method: 'post',
		data
	})
}
//城市下拉框列表
export function citySelectList(data) {
	return request({
		url: '/base/webapi/city/cityList',
		method: 'post',
		data
	})
}

//hscode模糊查询
export function specialFeeItemList(data) {
	return request({
		url: '/fin/feeitem/specialList',
		method: 'post',
		data
	})
}
//海运进口目的港委托清关货物信息列表 hscode模糊查询
export function customsClearanceGetOrderCargoInfo(data) {
	return request({
		url: '/order/shipping/customsClearance/getOrderCargoInfo',
		method: 'post',
		data
	})
}
//空运目的港委托清关货物信息列表 hscode模糊查询
export function airCustomsClearanceGetOrderCargoInfo(data) {
	return request({
		url: '/order/shipping/customsClearance/getAirOrderCargoInfo',
		method: 'post',
		data
	})
}
//hscode模糊查询
export function cargoHscodeList(data) {
	return request({
		url: '/base/webapi/cargo/hscode/list',
		method: 'post',
		data
	})
}
//货品分类
export function cargoTypeList(data) {
	return request({
		url: '/base/webapi/cargo/type/list',
		method: 'post',
		data
	})
}
//国际危险品编码
export function cargoUnnoList(data) {
	return request({
		url: '/base/webapi/cargo/unno/list',
		method: 'post',
		data
	})
}
//贸易方式
export function shipTradeModeList(data) {
	return request({
		url: '/base/webapi/shipTradeMode/list',
		method: 'post',
		data
	})
}
//获取文件类型大类
export function fileClassList(data) {
	return request({
		url: '/base/webapi/file/class/list',
		method: 'post',
		data
	})
}
//获取文件类型大类-20211216
export function fileClassListBusiness(data) {
	return request({
		url: '/base/webapi/file/class/list/business',
		method: 'post',
		data
	})
}
//获取文件类型小类
export function fileTypeList(data) {
	return request({
		url: '/base/webapi/file/type/list',
		method: 'post',
		data
	})
}
//顺丰价格
export function getPrice(data) {
	return request({
		url: '/base/express/price/query',
		method: 'post',
		data
	})
}
//国内外省市区
export function getForeignAll(data) {
	return request({
		url: '/base/region/all',
		method: 'post',
		data
	})
}
//国外城市列表
export function getForeignCity(data) {
	return request({
		url: '/base/region/foreign',
		method: 'post',
		data
	})
}
//国内外城市列表 /base/region/all
export function getRegionAll(data) {
	return request({
		url: '/base/region/all',
		method: 'post',
		data
	})
}
//国内城市列表
export function getDomesticCity(data) {
	return request({
		url: '/base/region/domestic',
		method: 'post',
		data
	})
}
//根据起运港是国内或者国外返回地址
export function fclTruckIntrustRegion(data) {
	return request({
		url: '/order/address/region',
		method: 'post',
		data
	})
}
//分公司列表
export function companyPageList(data) {
	return request({
		url: '/base/webapi/company/pageList',
		method: 'post',
		data
	})
}
//自定义搜索保存
export function searchConditionSave(data) {
	return request({
		url: '/base/webapi/search/condition/save',
		method: 'post',
		data
	})
}
//自定义搜索查询
export function searchConditionInfo(data) {
	return request({
		url: '/base/webapi/search/condition/info',
		method: 'post',
		data
	})
}
//自定义搜索删除
export function searchConditionDelete(data) {
	return request({
		url: '/base/webapi/search/condition/delete',
		method: 'post',
		data
	})
}
// 获取开户行列表
export function bankList(data) {
	return request({
		url: '/base/webapi/bank/list',
		method: 'post',
		data
	})
}

// 开户行列表获取开户行列表
export function bankPageList(data) {
  return request({
    url: '/base/webapi/bank/pageList',
    method: 'post',
    data
  })
}

// 开户行详情
export function bankDetail(data) {
  return request({
    url: '/base/webapi/bank/detail',
    method: 'post',
    data
  })
}
// 开户行失效
export function bankActived(data) {
  return request({
    url: '/base/webapi/bank/actived',
    method: 'post',
    data
  })
}
// 开户行保存
export function bankSave(data) {
  return request({
    url: '/base/webapi/bank/save',
    method: 'post',
    data
  })
}
// 跟进角色获取员工列表
export function listByRole(data) {
	return request({
		url: '/base/webapi/role/employees/listByRole',
		method: 'post',
		data
	})
}
// 包装
export function packageList(data) {
	return request({
		url: '/base/package/list',
		method: 'post',
		data
	})
}
// 忘记密码-发送邮件
export function sendResetPasswordEmail(data) {
	return request({
		url: '/base/common/fgpw/sendResetPasswordEmail',
		method: 'post',
		data
	})
}
// 船名模糊查询 用于商务费用审核列表搜索查询 /internal/spider/api/fuzzyVesselName
export function fuzzyVesselList(data) {
	return request({
		url: '/order/spider/api/fuzzyVesselName',
		method: 'post',
		data
	})
}
// 船名查询
export function vesselList(data) {
	return request({
		url: '/base/shipInfo/vessel/list',
		method: 'post',
		data
	})
}
// 忘记密码-重置密码提交
export function resetPasswordByEmail(data) {
	return request({
		url: '/base/common/fgpw/resetPasswordByEmail',
		method: 'post',
		data
	})
}
// 航次模糊查询 用于商务费用审核列表查询 /internal/spider/api/fuzzyVoyage
export function fuzzyVoyageList(data) {
	return request({
		url: '/order/spider/api/fuzzyVoyage',
		method: 'post',
		data
	})
}
// 航次查询
export function voyageList(data) {
	return request({
		url: '/base/shipInfo/voyage/list',
		method: 'post',
		data
	})
}
// 修改密码
export function updatePassWord(data) {
	return request({
		url: '/base/webapi/sysUser/updatePassWord',
		method: 'post',
		data
	})
}
// 供应商类型，支持业务类型，服务项类型
export function supplierAllList(data) {
	return request({
		url: '/base/webapi/supplier/category/allList',
		method: 'get',
		data,
		params: {}
	})
}
// 获取用户联系方式等
export function employeeInfo(data) {
	return request({
		url: '/base/webapi/sysUser/employee/info',
		method: 'post',
		data
	})
}
// 获取协同公司
export function baseDeptSettleList(data) {
	return request({
		url: '/base/webapi/dept/settle/list',
		method: 'post',
		data
	})
}
// 获取参与人列表
export function baseDeptParticipants(data, showAll) {
	console.log('参与人入参数据:', data)
	const { name } = data
	return new Promise((resolve, reject) => {
		if (name || showAll) {
			request({
				url: '/base/webapi/dept/participants',
				method: 'post',
				data
			})
				.then(res => {
					resolve(res)
				})
				.catch(() => {
					reject('error')
				})
		} else {
			resolve({ data: [] })
		}
	})
}
// 获取配置的铁路部门code
export function railDeptCode(data) {
	return request({
		url: '/order/rail/order/config/deptCode',
		method: 'post',
		data
	})
}
// 获取打印发票地址
export function getInvoicePrintUrlConfig(data) {
	return request({
		url: '/base/webapi/baseConfig/getInvoicePrintUrlConfig',
		method: 'post',
		data
	})
}

// 根据用户ID获取详细信息
export function getEmployeeInfo(data) {
	return request({
		url: '/base/webapi/sysUser/employee/info',
		method: 'post',
		data
	})
}
// 空运港口
export function airportList(data) {
	return request({
		url: '/base/webapi/airport/list',
		method: 'post',
		data
	})
}
// 航司
export function aircarrierList(data) {
	return request({
		url: '/base/webapi/aircarrier/list',
		method: 'post',
		data
	})
}
// 登录人所属分公司公共部门员工查询
export function getCompanyPubDeptEmp(data) {
	return request({
		url: '/base/webapi/dept/getCompanyPubDeptEmp',
		method: 'post',
		data
	})
}
// 空运系统航线列表
export function airportSyslineList(data) {
	return request({
		url: '/base/webapi/airport/sysline/list',
		method: 'post',
		data
	})
}
// 获取订单所有参与人信息
export function workAssign(data) {
	return request({
		url: '/order/main/work/assign',
		method: 'post',
		data
	})
}
// 自定义列宽查询
export function columnWidthConfigInfo(data) {
	return request({
		url: '/base/webapi/column/width/config/info',
		method: 'post',
		data
	})
}
// 自定义列宽保存
export function columnWidthConfigSave(data) {
	return request({
		url: '/base/webapi/column/width/config/save',
		method: 'post',
		data
	})
}
// 切换分公司信息
export function switchCompany(data) {
	return request({
		url: '/base/webapi/sysUser/switchCompany ',
		method: 'post',
		data
	})
}
// 修改个人信息
export function updateInfo(data) {
	return request({
		url: '/base/webapi/sysUser/updateInfo ',
		method: 'post',
		data
	})
}
// 根据岗位角色编号获取员工列表
export function listByDeptRole(data) {
	return request({
		url: '/base/webapi/deptRole/employees/listByDeptRole',
		method: 'post',
		data
	})
}
// 获取自定义表头
export function listColumnConfigGet(data) {
	return request({
		url: '/base/webapi/listColumnConfig/get',
		method: 'post',
		data
	})
}
// 设置自定义表头
export function listColumnConfigSave(data) {
	return request({
		url: '/base/webapi/listColumnConfig/save',
		method: 'post',
		data
	})
}
// 校验激活码有效期
export function checkCodeExpired(data) {
	return request({
		url: '/base/common/fgpw/checkCodeExpired',
		method: 'post',
		data
	})
}
// 查询value
export function getValueByKey(data) {
	return request({
		url: '/base/webapi/baseConfig/getValueByKey',
		method: 'post',
		data
	})
}
// 航线分页查询获取航线经理
export function SystemLineManager(data) {
	return request({
		url: '/base/webapi/systemLine/listPage',
		method: 'post',
		data
	})
}
// 行业类型
export function industryList(data) {
	return request({
		url: '/base/industry/list',
		method: 'post',
		data
	})
}
// 船公司官网
export function baseShipCarrierInfo(data) {
	return request({
		url: '/base/webapi/shippingCarrier/info',
		method: 'post',
		data
	})
}
// 兼容不返回auth no改造
export function pagesForAuthHistory(data) {
	return request({
		url: '/base/webapi/menu/pageDetailList',
		method: 'post',
		data
	})
}
// 行业数据二级
export function industryRelation(data) {
	return request({
		url: '/base/industry/relation/list',
		method: 'post',
		data
	})
}

// 大航线
export function dictGroupShipLine(data) {
	return request({
		url: '/base/webapi/systemLine/dictGroupShipLine',
		method: 'post',
		data
	})
}
export function deleteSysLineManager(data) {
	return request({
		url: '/base/webapi/systemLine/deleteSysLineManager',
		method: 'post',
		data
	})
}
// 查询当前财务月份的最开始一天 /order/main/fin/date/limit
export function getFinDateLimit(data) {
	return request({
		url: '/order/main/fin/date/limit',
		method: 'post',
		data
	})
}
