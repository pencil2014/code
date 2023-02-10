import {
	getDictList,
	basePortList,
	portList,
	basePortListByCodes,
	basePortCityList,
	baseSystemLineList,
	baseShipTermsList,
	baseShippingCarrierList,
	baseCurrencyList,
	feeClassSelectList,
	baseBusinessServiceList,
	businessServiceList,
	packageList,
	vesselList,
	fuzzyVesselList,
	voyageList,
	fuzzyVoyageList,
	supplierAllList,
	getForeignCity,
	getDomesticCity,
	airportList,
	aircarrierList,
	airportSyslineList,
	baseRailPortListByCodes,
	baseRailPortList,
	baseBusinessList,
	serviceSelectList,
	cargoTypeList,
	dictGroupShipLine
} from '@/api/base'
import { queryFeeItemList, querySpecialFeeItemList, feeItemClassList } from '@/api/fin/feeitem'
import { querySettleUnit, bankAccountList } from '@/api/fin/settleUnit'
import { companyBankAccountList } from '@/api/fin/settleUnitBankAcct'
import { acBookList, sceneGroupList, voucherClassList, subjectList } from '@/api/fin/acct'
import { employeeSelectlist } from '@/api/companyResource'
import { supplierList, customerList, orgValidList } from '@/api/crm/supplier'
import { setCamelFormat, getTreeData } from '@/utils/index'
import language from '@/lang/language'
import { orderInfo, orderInfoNoperm, orderJointInfo, bookVesselVoyage, bookVesselTime, bookVesselList, bookVoyageList } from '@/api/order/list'
import { orderInfo as airOrderInfo } from '@/api/airTransport/order'
import { queryFinSupplierList } from '@/api/fin/settleUnit'
import { jobSelectList } from '@/api/companyResource'
import { roleSelectList } from '@/api/permission'
import { dutyDeptList } from '@/api/duty'
import { orderInfo as railOrderInfo } from '@/api/railway/list'
const getDefaultState = () => {
	return {
		// 数据字典
		dictMap: {
			state: [],
			routeType: [], // 航线
			publishStatus: [], // 发布状态
			payMode: [], // 付费方式
			rateUnit: [], // 计费单位
			currency: [], // 币种
			effectiveType: [], // 生效日类别
			feederMatchMode: [], // 驳船匹配方式
			issueWay: [], // 出单方式
			blType: [], // 提单类型
			transferMode: [], // 中转方式
			limitType: [], //限重费类型 选柜费/重柜费
			weightLimitType: [], // 限重费类型
			extraContainerRateUnit: [], // 选柜费收费单位类型
			mainRouteTransferMode: [], // 大船线路中转方式
			shipCarrierCode: {}, // 海司
			sysLineCode: {}, // 系统航线
			shipTerms: [], // 运输条款
			allin: [],
			chargeStructure: [], // 价格类型
			recommendLevel: [
				{ label: '是', value: 'Y' },
				{ label: '否', value: 'N' }
			],
			portAttribute: [], // 港口属性
			businessType: [], // 业务类型
			cargoSource: [], // 货物来源
			serviceType: [], // 服务类型
			boxStatus: {
				boxed: 'boxed',
				unboxed: 'unboxed'
			},
			yesOrNoOptions: [
				{ label: '是', value: 'y' },
				{ label: '否', value: 'n' }
			],
			feeUnit: [], // 费用的计费单位
			receipayType: [], // 费用的应收应付
			prepayType: [], // 费用预付到付
			serviceCode: [], // 服务项下拉查询（根据业务类型，服务类型）
			settleCycle: [], // 结算单位的结算周期
			commodityTypeCodeOptions: [], // 货品类型
			orderFeeBusinessType: '', // 当前订单费用的业务类型
			allServiceCode: [],
			packageType: [],
			dutyDeptList: [],
			// 凭证状态
			voucherStatus: [
				{ label: '已生成', value: 'yes' },
				{ label: '未生成', value: 'no' }
			],
      // 关账状态
      finCloseStatus: [
        { label: '已关账', value: 'yes' },
        { label: '未关账', value: 'no' }
      ],
      // 确认状态
      webConfirmStatus: [
        { label: '已确认', value: 'yes' },
        { label: '未确认', value: 'no' }
      ],
			// 邮件发送状态
			emailStatus: [
				{ label: '已发送', value: 'yes' },
				{ label: '未发送', value: 'no' }
			],
			validCurrency: [],
			validCurrencyNR: [],
      noOriginalCurrency: [],
			// 有无状态
			hasNo: [
        { label: '有', value: 'yes' },
        { label: '无', value: 'no' }
			],
		}
	}
}

const state = getDefaultState()
state.dictMapObj = {}
for (const key in state.dictMap) {
	if (Object.hasOwnProperty.call(state.dictMap, key)) {
		const arr = state.dictMap[key]
		state.dictMapObj[key] = {}
		if (arr.length) {
			arr.forEach(item => {
				state.dictMapObj[key][item.value] = item.label
			})
		}
	}
}

const mutations = {
	SET_DICT: (state, dictList) => {
		let dictValue = {}
		let dictObj = {}
		// 数组转对象
		dictList.forEach(item => {
			let key = ''
			if (item.groupCode === 'all_in') {
				key = item.groupCode.replace('_', '')
			} else if (['domesticCity', 'foreignCity', 'feeitemFinGroup'].includes(item.groupCode)) {
				Object.assign(dictValue, { [item.groupCode]: item.itemList })
				if (item.groupCode !== 'feeitemFinGroup') return
				let obj = {}
				item.itemList.forEach(child => {
					obj[child.value.toLowerCase()] = child.label
					obj[child.value] = child.label
				})
				Object.assign(dictObj, { [item.groupCode]: obj })
				return
			} else {
				key = setCamelFormat(item.groupCode)
			}
			let obj = {}
			let arr = item.itemList.map((child, index) => {
				if (child.itemCode) {
					obj[child.itemCode.toLowerCase()] = child.itemCname
					obj[child.itemCode] = child.itemCname
					console.log
					return {
						label: key === 'airTransportTerm' ? `${child.itemCname}${child.descpt}` : child.itemCname, //空运运输条款需要展示 字典说明
						value: child.itemCode,
						en: child.itemEname,
						parent: child.parent
					}
				} else {
					return {
						label: child.itemCname,
						value: child.itemCode,
						en: child.itemEname,
						parent: child.parent
					}
				}
			})
			Object.assign(dictValue, {
				[key]: arr
			})
			Object.assign(dictObj, { [key]: obj })
		})
		Object.assign(state.dictMap, dictValue)
		Object.assign(state.dictMapObj, dictObj)
		// 多次打印，太占用面板空间，暂利用防抖，上线可去掉防抖和打印
		if (window._settimeout) {
			clearTimeout(window._settimeout)
		}
		window._settimeout = setTimeout(() => {
			window._settimeout = null
			console.log(state.dictMap)
			console.log(state.dictMapObj)
		}, 2000)
		// state.dictMap.state = dictValue.publishStatus
	},
	// 不同场景过滤订单状态
	FILTER_ORDER_STATUS: (state, data) => {
		let orderStatusItem = data.find(item => item.groupCode === 'order_status')
		let orderStatusItemList = orderStatusItem ? orderStatusItem.itemList : []
		// 按操作可查询订单状态过滤
		let opList = orderStatusItemList
			.filter(item => ['pass', 'complete', 'cancel', 'break'].includes(item.itemCode))
			.map(item => {
				return { ...item, label: item.itemCname, value: item.itemCode }
			})
		// 按订单报表可查询状态过滤
		let reportList = orderStatusItemList
			.filter(item => ['pass', 'complete', 'break'].includes(item.itemCode))
			.map(item => {
				return { ...item, label: item.itemCname, value: item.itemCode }
			})
		// 按商务可查询订单状态过滤
		let pricingList = orderStatusItemList
			.filter(item => ['submit', 'pass', 'refuse'].includes(item.itemCode))
			.map(item => {
				return { ...item, label: item.itemCname, value: item.itemCode }
			})
		// 空运按商务可查询订单状态过滤
		let airPricingList = orderStatusItemList
			.filter(item => ['submit', 'pass'].includes(item.itemCode))
			.map(item => {
				return { ...item, label: item.itemCname, value: item.itemCode }
			})
		state.dictMap.opOrderStatus = opList
		state.dictMap.reportOrderStatus = reportList
		state.dictMap.pricingOrderStatus = pricingList
		state.dictMap.pricingOrderStatus = pricingList
		state.dictMap.airPricingOrderStatus = airPricingList
		// console.log('dictMap', state.dictMap.opOrderStatus)
	},
	SET_SHIP_CARRIER: (state, list) => {
		let dictValue = {}
		list.forEach(item => {
			dictValue[item.carrierCode] = item.cname
		})
		state.dictMap.shipCarrierCode = dictValue
	},
	SET_SHIP_TERMS: (state, list) => {
		list.forEach(item => {
			Object.assign(item, {
				label: item.ename,
				value: item.termsCode
			})
		})
		state.dictMap.shipTerms = list
	},
	SET_SYS_LINE_CODE: (state, list) => {
		let dictValue = {}
		list.forEach(item => {
			dictValue[item.employeeId] = item.cname
		})
		state.dictMap.employeeId = dictValue
	},
	SET_EMPLOYEE: (state, list) => {
		let dictValue = {}
		list.forEach(item => {
			dictValue[item.sysLineCode] = item.cname
		})
		state.dictMap.sysLineCode = dictValue
	},
	SET_CURRENCY: (state, list) => {
		let dictValue = {}
		list.forEach(item => {
			dictValue[item.code] = item.code
		})
		state.dictMap.currencyCode = dictValue
		state.dictMap.currency = list
	},
	SET_VALID_CURRENCY: (state, list) => {
		state.dictMap.validCurrency = list
	},
	SET_VALID_CURRENCY_NR: (state, list) => {
		state.dictMap.validCurrencyNR = list
	},
	SET_NO_ORIGINAL_CURRENCY: (state, list) => {
		state.dictMap.noOriginalCurrency = list
	},
	SET_FEE_CLASS: (state, list) => {
		let dictValue = {}
		list.forEach(item => {
			dictValue[item.code] = item.code
		})
		state.dictMap.feeClassCode = dictValue
	},
	SET_SERVICE_CODE: (state, list) => {
		state.dictMap.serviceCode = list
	},
	setOrderFeeBusinessType: (state, value) => {
		state.dictMap.orderFeeBusinessType = value
	},
	SET_ALL_SERVICE_CODE: (state, list) => {
		state.dictMap.allServiceCode = list
	},
	SET_PACKAGETYPE: (state, list) => {
		state.dictMap.packageType = list
	},
	setCommodityTypeCodeOptions(state, value) {
		state.commodityTypeCodeOptions = value
	},
	SET_DUTYDEPT: (state, list) => {
		state.dictMap.dutyDeptList = list
	}
}

const actions = {
	// get dict listAll
	getDictList({ commit, state }) {
		return new Promise((resolve, reject) => {
			getDictList()
				.then(response => {
					const { data } = response
					// 负数类型字典 = 应付负数字典 + 应收负数字典 去重
					let feePayNegativeType = data.find(v => v.groupCode === 'fee_pay_negative_type')
					let feeRecvNegativeType = data.find(v => v.groupCode === 'fee_recv_negative_type')
					if (feePayNegativeType && feeRecvNegativeType) {
						let list = feePayNegativeType.itemList.concat(feeRecvNegativeType.itemList)
						let itemList = [...new Set(list.map(v => v.itemCode))]
						data.push({
							descpt: '负数类型',
							groupCname: '负数类型',
							groupCode: 'negative_type',
							groupEname: 'negative_type',
							itemList: itemList.map(v => list.find(item => item.itemCode === v))
						})
					}
					let blFinAuditStatus = data.find(v => v.groupCode === 'bl_fin_audit_status')
					if (blFinAuditStatus) {
						let itemList = blFinAuditStatus.itemList.map(ele => {
							if (ele.itemCode === 'init') {
								ele.itemCname = '待提交'
							}
							return { ...ele }
						})
						data.push({
							descpt: '提单放单审核状态',
							groupCname: '提单放单审核状态',
							groupCode: 'custom_bl_fin_audit_status',
							groupEname: 'custom_bl_fin_audit_status',
							itemList
						})
					}
					let blFinApplyType = data.find(v => v.groupCode === 'bl_fin_apply_type')
					if (blFinApplyType) {
						let itemList = []
						blFinApplyType.itemList.map(ele => {
							itemList.push({...ele, itemCname: ele.descpt})
						})
						data.push({
							descpt: '提单放单申请原因',
							groupCname: '提单放单申请原因',
							groupCode: 'custom_bl_fin_apply_type',
							groupEname: 'custom_bl_fin_apply_type',
							itemList
						})
					}

					commit('SET_DICT', data)
					// 订单状态
					commit('FILTER_ORDER_STATUS', data)
					// CRM供应商类型、支持业务字典
					supplierAllList({}).then(res => {
						if (res.data) {
							let fn = (itemCode, itemCname, itemEname, parent) => ({ itemCode, itemCname, state: 'valid', parent, itemEname })
							let crmCategoryList = res.data.category.map(item => fn(item.categoryCode, item.cname, '', ''))
							let crmBiztypeList = res.data.biztype.map(item => fn(item.businessType, item.name, '', ''))
							// 结算单位子类型由两个字典构成,客户类型、供应商类型，
							let customer_class = data.find(item => item.groupCode === 'customer_class')
							let itemList2 = customer_class.itemList || []
							commit('SET_DICT', [
								{ groupCode: 'crm_business', itemList: crmBiztypeList },
								// { groupCode: 'crm_business', itemList: res.data.biztype.map(item => fn(item.businessCode, item.cname, '', item.categoryCode)) },
								{ groupCode: 'crm_service', itemList: res.data.service.map(item => fn(item.serviceCode, item.serviceName, '', item.businessType)) },
								{ groupCode: 'crm_category', itemList: crmCategoryList },
								{
									descpt: '结算单位子类型',
									groupCname: '结算单位子类型',
									groupCode: 'settle_unit_sub_type',
									groupEname: 'settle_unit_sub_type',
									itemList: crmCategoryList.concat(itemList2)
								}
							])
						}
					})
					// 国外城市
					getForeignCity({}).then(res => {
						if (res.data) {
							commit('SET_DICT', [{ groupCode: 'foreignCity', itemList: getTreeData(res.data) }])
						}
					})
					// 国内城市
					getDomesticCity({}).then(res => {
						if (res.data) {
							commit('SET_DICT', [{ groupCode: 'domesticCity', itemList: getTreeData(res.data) }])
						}
					})
					// 费用项
					feeItemClassList({}).then(res => {
						if (res.data) {
							let itemList = res.data.map(v => ({ label: v.cname, value: v.feeClassCode, en: v.ename }))
							commit('SET_DICT', [{ groupCode: 'feeitemFinGroup', itemList }])
						}
					})
					// 服务类型
					baseBusinessList({}).then(res => {
						let itemList = []
						res.data.forEach(item => {
							item.serviceTypeList.forEach(a => itemList.push({ itemCname: item.name + '-' + a.name, itemCode: a.serviceType }))
						})
						commit('SET_DICT', [{ groupCode: 'diyServiceType', itemList }])

						// 获取海运服务类型
						let shipItemList = []
						res.data.forEach(item => {
							item.serviceTypeList.forEach(a => item.business === 'ship' && shipItemList.push({ itemCname: item.name + '-' + a.name, itemCode: a.serviceType }))
						})
						// 获取报关单服务类型
						let customsItemList = []
						res.data.forEach(item => {
							item.serviceTypeList.forEach(a => ['ship_customs','ship_export_customs','ship_import_customs'].includes(item.businessType) && customsItemList.push({ itemCname: item.name, itemCode: a.serviceType }))
						})
						let airItemList = []
						res.data.forEach(item => {
							item.serviceTypeList.forEach(a => item.business === 'air' && airItemList.push({ itemCname: item.name + '-' + a.name, itemCode: a.serviceType }))
						})
						commit('SET_DICT', [{ groupCode: 'shipServiceType', itemList: shipItemList }])
						commit('SET_DICT', [{ groupCode: 'customsServiceType', itemList: customsItemList }])
						commit('SET_DICT', [{ groupCode: 'airServiceType', itemList: airItemList }])

						// 海运订单业务类型
						let shipItem = []
						let railItem = []
						let feeListItem = [{ itemCname: '费用单', itemCode: 'finbill' }]
						res.data.forEach(item => {
							if (item.business === 'ship') {
								shipItem.push({ itemCname: item.name, itemCode: item.businessType })
							}
							if (item.business === 'rail') {
								railItem.push({ itemCname: item.name, itemCode: item.businessType })
							}
							feeListItem.push({ itemCname: item.name, itemCode: item.businessType })
						})
						commit('SET_DICT', [{ groupCode: 'shipBusinessType', itemList: shipItem }])
						commit('SET_DICT', [{ groupCode: 'railBusinessType', itemList: railItem }])
						commit('SET_DICT', [{ groupCode: 'feeListBusinessType', itemList: feeListItem }])
					})
					// 系统航线
					baseSystemLineList('', 'valid').then(res => {
						let itemList = (res.data || []).map(v => ({ itemCname: v.cname, itemCode: v.sysLineCode, itemEname: v.ename }))
						commit('SET_DICT', [{ groupCode: 'baseSystemLine', itemList }])
					})
					serviceSelectList({}).then(res => {
						// 过滤掉空运服务项
						let itemNameList = (res.data || []).filter(o => !o.serviceCode.startsWith('air')).map(v => ({ itemCname: v.serviceName, itemCode: v.serviceCode, itemEname: v.serviceEname }))
						let itemList = (res.data || []).map(v => ({ itemCname: v.serviceName, itemCode: v.serviceCode, itemEname: v.serviceEname }))
						commit('SET_DICT', [{ groupCode: 'orderServiceNameList', itemList: itemNameList }])
						commit('SET_DICT', [{ groupCode: 'orderServiceList', itemList }])
					})
					// 大航线
					dictGroupShipLine().then(res => {
						let itemList = (res.data || []).map(v => ({ itemCname: v.sysLineGroupCname, itemCode: v.sysLineGroupCode, itemEname: v.sysLineGroupCode }))
						commit('SET_DICT', [{ groupCode: 'dictGroupShipLine', itemList }])
						console.log('·~~~~~~~~~~~~dictGroupShipLine')
					})
					resolve(data)
				})
				.catch(error => {
					reject(error)
				})
		})
	},

	// 港口下拉
	basePortList({ commit }, param) {
		let { queryString, portAttribute, state, isEn } = param
		return new Promise((resolve, reject) => {
			basePortList(queryString, portAttribute, state)
				.then(response => {
					let results = []
					let list = response.data

					results = list.map(item => {
						// 20211109提单港口下拉只要城市，国家。不显示港口。
						let enValue = `${item.ename}${item.countryEname ? ',' + item.countryEname : ''}`
						return Object.assign(item, {
							key: item.portCode,
							value: isEn ? enValue : `${item.ename}(${item.portCode}, ${item.cname}${item.portCname ? ',' + item.portCname : ''}${item.cityCname ? ',' + item.cityCname : ''}${item.countryName ? ',' + item.countryName : ''})`
						})
						// results.push({
						//   key: item.portCode,
						//   value: `${item.ename}(${item.cname}${item.portCname ? ',' + item.portCname : ''}${item.cityCname ? ',' + item.cityCname : ''}${item.countryName ? ',' + item.countryName : ''})`,
						//   portAttribute: item.portAttribute
						// })
					})
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 铁路站点下拉
	baseRailPortList({ commit }, param) {
		console.log('🚀 ~ param', param)

		let { portName } = param
		return new Promise((resolve, reject) => {
			baseRailPortList(portName)
				.then(response => {
					let results = []
					let list = response.data
					results = list.map(item => {
						return Object.assign(item, {
							value: item.portCode,
							label: `${item.ename} ${item.countryEname}`
						})
					})
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},

	// 港口下拉
	portList({ commit }, param) {
		return new Promise((resolve, reject) => {
			portList(param)
				.then(response => {
					const results = []
					const list = response.data
					list.forEach((item, index) => {
						results.push({
							portId: item.portId,
							key: item.portCode,
							value: `${item.ename}(${item.cname}${item.portCname ? ',' + item.portCname : ''}${item.cityCname ? ',' + item.cityCname : ''}${item.countryName ? ',' + item.countryName : ''})`,
							portAttribute: item.portAttribute
						})
					})
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},

	// 港口城市混合数据下拉
	basePortCityList({ commit }, param) {
		let { queryString, state } = param
		return new Promise((resolve, reject) => {
			basePortCityList(queryString, state)
				.then(response => {
					const results = []
					const list = response.data
					list.forEach((item, index) => {
						results.push({
							key: item.portCode,
							value: `${item.ename}(${item.cname}${item.portCname ? ',' + item.portCname : ''}${item.cityCname ? ',' + item.cityCname : ''}${item.countryName ? ',' + item.countryName : ''})`
						})
					})
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 港口城市混合数据下拉
	newBasePortCityList({ commit }, param) {
		let { queryString, state } = param
		return new Promise((resolve, reject) => {
			basePortCityList(queryString, state)
				.then(response => {
					resolve(response.data || [])
				})
				.catch(error => {
					reject(error)
				})
		})
	},

	// 港口下拉数据回显
	basePortListByCodes({ commit }, param) {
		let { portCodes } = param
		return new Promise((resolve, reject) => {
			basePortListByCodes(portCodes)
				.then(response => {
					const results = []
					const list = response.data
					list.forEach((item, index) => {
						results.push(
							Object.assign(item, {
								value: item.portCode,
								label: `${item.ename}(${item.cname}${item.portCname ? ',' + item.portCname : ''}${item.cityCname ? ',' + item.cityCname : ''}${item.countryName ? ',' + item.countryName : ''})`,
								portAttribute: item.portAttribute
							})
						)
					})
					// console.log(results)
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 铁路站点下拉数据回显
	baseRailPortListByCodes({ commit }, param) {
		let { portCodes } = param
		return new Promise((resolve, reject) => {
			baseRailPortListByCodes(portCodes)
				.then(response => {
					const results = []
					const list = response.data
					list.forEach((item, index) => {
						results.push(
							Object.assign(item, {
								value: item.portCode,
								label: `${item.ename} ${item.countryEname}`
							})
						)
					})
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 船公司下拉
	baseShippingCarrierList({ commit }, query = {}) {
		return new Promise((resolve, reject) => {
			let { name, state } = query
			baseShippingCarrierList(name, state)
				.then(response => {
					const results = []
					const list = response.data

					list.forEach((item, index) => {
						results.push({
							key: item.carrierCode,
							value: item.carrierCode
						})
					})

					commit('SET_SHIP_CARRIER', list)

					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},

	// 系统航线下拉
	baseSystemLineList({ commit }, query) {
		let { name, state, sysLineGroupCode } = query
		return new Promise((resolve, reject) => {
			baseSystemLineList(name, state, sysLineGroupCode)
				.then(response => {
					const results = []
					const list = response.data

					list.forEach((item, index) => {
						if (item.sysLineCode) {
							results.push({
								key: item.sysLineCode,
								value: item.cname
							})
						}
					})

					commit('SET_SYS_LINE_CODE', list)

					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},

	// 运输条款下拉
	baseShipTermsList({ commit }, query) {
		return new Promise((resolve, reject) => {
			baseShipTermsList(query)
				.then(response => {
					const results = []
					const list = response.data

					list.forEach((item, index) => {
						results.push({
							key: item.termsCode,
							value: item.ename
						})
					})
					commit('SET_SHIP_TERMS', list)
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 拿价人下拉
	employeeSelectlist({ commit }, query) {
		return new Promise((resolve, reject) => {
			employeeSelectlist(query)
				.then(response => {
					const results = []
					const list = response.data
					list.forEach((item, index) => {
						results.push({
							key: item.employeeId,
							value: `${item.cname}`
						})
					})
					commit('SET_EMPLOYEE', list)
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 拿价人下拉
	employeelist({ commit }, query) {
		return new Promise((resolve, reject) => {
			employeeSelectlist(query)
				.then(response => {
					const results = []
					const list = response.data
					list.forEach((item, index) => {
						results.push({
							key: item.employeeId,
							value: `${item.cname}` + ' (' + `${item.deptCname}` + ')',
							employeeNo: item.employeeNo
						})
					})
					commit('SET_EMPLOYEE', list)
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 结算单位下拉查询
	// 注意！注意！！注意！！！注意！！！！！！！！！！！！！！！！！！！！！！！！！
	// 费用录入时下拉结算单位一定要设置isForbid为true过滤掉黑名单
	querySettleUnit({ commit }, payload, needAll) {
		let queryString = ''
		let unitTypes = undefined
		let containTemporary = undefined
		let unitCategory = undefined
		let size = undefined
		let containHistoryUnitName = undefined
		let flitByFeeForbid = 'no'
		if (payload instanceof Object) {
			queryString = payload.queryString
			unitTypes = payload.unitTypes
			containTemporary = payload.containTemporary
			unitCategory = payload.unitCategory
			size = payload.size
			// 新增收款登记结算单位设置containHistoryUnitName:'no'
			containHistoryUnitName = payload.containHistoryUnitName || (payload.isAdd ? 'no' : 'yes')
			flitByFeeForbid = payload.isForbid ? 'yes' : 'no'
		} else {
			queryString = payload
		}
		return new Promise((resolve, reject) => {
			let data = {
				name: queryString,
				size: size || 30,
				unitTypes, // 非必选，单位类型（customer:客户 supplier:供应商 company:分公司），多选的时候逗号分隔
				containTemporary, //是否含虚拟客商 在需要查询虚拟客商的地方传yes 不传默认不查
				unitCategory, // 非必选，供应商类型内区分快递公司
				containHistoryUnitName, // 查询的结算单位传'yes'，新增、修改的结算单位传'no'
				flitByFeeForbid // 录入时过滤掉黑名单，搜索条件时为'no'，编辑时'yes'
			}
			querySettleUnit(data)
				.then(res => {
					const results = []
					const list = res.data ? res.data : []
					list.forEach(item => {
						if (needAll) {
							results.push({ ...item, key: item.unitCode, value: item.unitName })
							return
						}
						results.push({
							...item,
							key: item.unitCode,
							value: item.unitName
							// value: item.unitCode,
							// label: item.unitName
						})
					})
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 银行账号信息下拉
	bankAccountList({ commit }, queryObject) {
		return new Promise((resolve, reject) => {
			let data = {
				accountName: queryObject.accountName ? queryObject.accountName : '',
				accountShortName: queryObject.accountShortName ? queryObject.accountShortName : '',
				hasIntrabranch: queryObject.hasIntrabranch ? queryObject.hasIntrabranch : '',
				receipayType: queryObject.receipayType ? queryObject.receipayType : '',
				unitCode: queryObject.unitCode ? queryObject.unitCode : '',
				currency: queryObject.currency ? queryObject.currency : '',
				publicType: queryObject.publicType ? queryObject.publicType : '',
				countryOrgType: queryObject.countryOrgType ? queryObject.countryOrgType : '',
				accountNo: queryObject.accountNo ? queryObject.accountNo : '',
				status: queryObject.status ? queryObject.status : '',
				size: 20
			}
			bankAccountList(data)
				.then(res => {
					const results = []
					const list = res.data ? res.data : []
					list.forEach(item => {
						results.push({
							key: item.unitCode,
							value: item.accountNo,
							...item
						})
					})
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 分公司银行账号信息下拉
	companyBankAccountList({ commit }, queryObject) {
		return new Promise((resolve, reject) => {
			let data = {
				accountName: queryObject.accountName ? queryObject.accountName : '',
				accountShortName: queryObject.accountShortName ? queryObject.accountShortName : '',
				receipayType: queryObject.receipayType ? queryObject.receipayType : '',
				hasIntrabranch: queryObject.hasIntrabranch ? queryObject.hasIntrabranch : '',
				hasChequeAcct: queryObject.hasChequeAcct ? queryObject.hasChequeAcct : '',
				countryOrgType: queryObject.countryOrgType ? queryObject.countryOrgType : '',
				unitCode: queryObject.unitCode ? queryObject.unitCode : '',
				currency: queryObject.currency ? queryObject.currency : '',
				accountNo: queryObject.accountNo ? queryObject.accountNo : '',
				size: 20
			}
			companyBankAccountList(data)
				.then(res => {
					const results = []
					const list = res.data ? res.data : []
					list.forEach(item => {
						results.push({
							key: item.unitCode,
							value: item.accountShortName,

							...item
							// accountNo: item.accountNo,
							// unitCode: item.unitCode,
							// unitName: item.unitName,
							// accountShortName: item.accountShortName,
							// accountName: item.accountName,
							// acountShortName: item.acountShortName,
							// bankCode: item.bankCode,
							// bankName: item.bankName,
							// bankBranch: item.bankBranch,
							// bankBranchCode: item.bankBranchCode,
							// currency: item.currency,
							// receipayType: item.receipayType,
							// remark: item.remark,
							// settleUnitBankAcctId: item.settleUnitBankAcctId,
							// state: item.state
						})
					})
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 凭证--账簿名称下拉查询
	acBookList({ commit }, queryString) {
		return new Promise((resolve, reject) => {
			let data = {
				name: queryString
			}
			acBookList(data)
				.then(res => {
					const results = []
					const list = res.data.list
					list.forEach(item => {
						results.push({
							key: item.acBookId,
							value: item.bookName
						})
					})
					console.log(results)
					resolve(results)
				})
				.catch(error => {
					console.log(error)
					reject(error)
				})
		})
	},
	// 凭证--获取凭证场景分组
	sceneGroupList({ commit }, queryString) {
		return sceneGroupList({ name: queryString }).then(res => {
			return res.data.list.map(item => ({
				key: item.acSceneGroupId,
				value: item.groupName
			}))
		})
	},
	// 凭证--获取凭证字列表
	voucherClassList({ commit }, queryString) {
		return voucherClassList({ name: queryString }).then(res => {
			return res.data.list.map(item => ({
				key: item.code,
				value: item.name
			}))
		})
	},
	// 凭证--获取会计科目列表 凭证配置-》对手科目编码 、现金交易对手科目
	subjectList({ commit }, params, cb) {
		return subjectList({
			currPage: 1,
			pageSize: params.size || 10,
			query: [
				{
					column: 'subjectCode',
					type: 'default',
					value: params.queryString
				}
			]
		}).then(res => {
			return res.data.list.map(item => ({
				key: item.acSubjectId,
				value: item.subjectCode
			}))
		})
	},
	// 凭证--获取费用类别分类
	feeitemFinGroup({ commit }, queryString) {
		return feeItemClassList({}).then(res => {
			return res.data.map(item => ({
				key: item.feeClassCode,
				value: item.cname
			}))
		})
	},
	// 币别下拉，全部获取，存储dictMap
	allCurrencyList({ commit }, query) {
		return new Promise((resolve, reject) => {
			let { code, state } = query
			baseCurrencyList(code, state)
				.then(response => {
					const result = []
					const midArr = []
					const { data } = response
					data &&
						data.map(item => {
							if (item.code == 'CNY') {
								return midArr.unshift({ label: item.code, value: item.code, state: item.state })
							}
							if (item.code == 'USD') {
								return midArr.push({ label: item.code, value: item.code, state: item.state })
							}
							result.push(
								Object.assign(item, {
									label: item.code === 'ORIGINAL' ? '原币别' : item.code,
									value: item.code
								})
							)
						})
					result.unshift(...midArr)
					commit('SET_CURRENCY', result)
					let resultValid = result.filter(item => {
						return item.state === 'valid' || item.code === 'ORIGINAL'
					})
					commit('SET_VALID_CURRENCY', resultValid)
					commit(
						'SET_VALID_CURRENCY_NR',
						resultValid.filter(item => item.code !== 'ORIGINAL')
					)
					commit(
						'SET_NO_ORIGINAL_CURRENCY',
						result.filter(v => v.code !== 'ORIGINAL')
					)
					resolve(result)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 币别搜索下拉，应收应付使用了此接口，valid currency也使用此接口
	currencyList({ commit }, query) {
		return new Promise((resolve, reject) => {
			let { code, state } = query
			baseCurrencyList(code, state)
				.then(response => {
					const result = []
					const midArr = []
					const { data } = response
					data &&
						data.map(item => {
							if (item.code == 'CNY') {
								return midArr.unshift({ label: item.code, value: item.code })
							}
							if (item.code == 'USD') {
								return midArr.push({ label: item.code, value: item.code })
							}
							result.push(
								Object.assign(item, {
									// label: item.cnName,
									label: item.code === 'ORIGINAL' ? '原币别' : item.code,
									value: item.code
								})
							)
						})
					result.unshift(...midArr)
					commit('SET_VALID_CURRENCY', result)
					resolve(result)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 费用类表下拉
	feeClassList({ commit }, query) {
		return new Promise((resolve, reject) => {
			feeClassSelectList(query)
				.then(response => {
					const results = []
					const list = response.data
					list.forEach((item, index) => {
						results.push({
							key: item.code,
							value: item.cname
						})
					})
					commit('SET_FEE_CLASS', list)
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 获取费用分类列表（财务）
	queryFeeClassList({ commit }, queryString) {
		return new Promise((resolve, reject) => {
			let data = {}
			feeItemClassList(data)
				.then(res => {
					resolve(res.data)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 费用项下拉查询
	queryFeeItemList({ commit }, params) {
		return new Promise((resolve, reject) => {
			let data = {
				// bizCode: params.businessType, // 后台废弃
				// "finGroup": "incomecost", // 不需要
				receipayGroup: params.receipayType, // "receivepay",
				orderNo: params.orderNo,
				// serviceCode: params.serviceCode, // 后台废弃
				name: params.queryString,
				size: params.size || 30,
				feeCode: params.feeCode,
				finGroup: params.finGroup,
				excludeSpecialFee: params.excludeSpecialFee
			}
			if (params.bizState !== false) {
				data.bizState = params.bizState || 'valid'
			}
			queryFeeItemList(data)
				.then(res => {
					const results = []
					const list = res.data
					list.forEach(item => {
						if (params.operation === 'add' && item.enabled === 'no') {
							// 未启用的费用项，新增费用时不显示
							return
						}
						results.push(
							Object.assign(item, {
								key: item.feeCode,
								value: item.feeName
							})
						)
					})
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 费用项下拉查询2（用于列表搜索）
	queryFeeItemList2({ commit }, params) {
		return new Promise((resolve, reject) => {
			let data = {
				bizCode: params.businessType,
				// "finGroup": "incomecost", // 不需要
				// "receipayGroup":"receivepay", // 不需要
				serviceCode: params.serviceCode,
				name: params.queryString,
				size: params.size || 30,
				excludeSpecialFee: params.excludeSpecialFee
			}
			queryFeeItemList(data)
				.then(res => {
					const results = []
					const list = res.data
					list.forEach(item => {
						if (params.operation === 'add' && item.enabled === 'no') {
							// 未启用的费用项，新增费用时不显示
							return
						}
						results.push(
							Object.assign(item, {
								label: params.lang === 'en' ? item.feeEnName : item.feeName,
								value: item.feeCode
							})
						)
					})
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 获取专项管理费用项（财务模块提供）
	querySpecialFeeItemList({ commit }, params) {
		return new Promise((resolve, reject) => {
			let data = {
				// bizCode: params.businessType, // 后台废弃---待删
				// "finGroup": "incomecost", // 不需要
				// "receipayGroup":"receivepay", // 不需要
				// serviceCode: params.serviceCode, // 后台废弃---待删
				orderNo: params.orderNo,
				name: params.queryString,
				size: params.size || 30,
				bizState: params.bizState || 'valid'
			}
			querySpecialFeeItemList(data).then(res => {
				const results = []
				const list = res.data
				list.forEach(item => {
					if (params.operation === 'add' && item.enabled === 'no') {
						// 未启用的费用项，新增费用时不显示
						return
					}
					results.push(
						Object.assign(item, {
							key: item.feeCode,
							value: item.feeName
						})
					)
				})
				resolve(results)
			})
		})
	},
	// 订单对应的服务项下拉查询
	queryServiceItemList({ commit }, params) {
		return new Promise((resolve, reject) => {
			let data = {
				//   // businessType: queryString.businessType,
				//   // serviceType: queryString.serviceType,
				orderNo: params.orderNo
			}
			let reqMethod = orderInfoNoperm // orderInfo
			if (params.air) {
				reqMethod = airOrderInfo // 空运其实调海运orderInfo接口返回正常，为区分起见，还是单独调空运接口
			} else if (params.rail) {
				reqMethod = railOrderInfo
			}
			// baseBusinessServiceList(data).then(res => {
			reqMethod(data)
				.then(res => {
					commit('setOrderFeeBusinessType', res.data.businessType)
					const results = []
					const list = res.data ? res.data.serviceInfoList : []
					list.forEach(item => {
						results.push({
							label: item.serviceName,
							value: item.serviceCode
						})
					})
					commit('SET_SERVICE_CODE', results)
					resolve(res.data)
				})
				.catch(error => {
					console.log(error)
					commit('setOrderFeeBusinessType', '')
					commit('SET_SERVICE_CODE', [])
					reject(error)
				})
		})
	},
	// 协同订单对应的服务项下拉查询
	queryJointServiceItemList({ commit }, params) {
		return new Promise((resolve, reject) => {
			let data = {
				// businessType: queryString.businessType,
				// serviceType: queryString.serviceType,
				jointNo: params.jointNo
			}
			let reqMethod = orderJointInfo
			if (params.air) {
				reqMethod = airOrderInfo
				data.orderNo = params.orderNo
			}
			// baseBusinessServiceList(data).then(res => {
			reqMethod(data)
				.then(res => {
					commit('setOrderFeeBusinessType', res.data.businessType)
					const results = []
					const list = res.data ? res.data.serviceInfoList : []
					list.forEach(item => {
						results.push({
							label: item.serviceName,
							value: item.serviceCode
						})
					})
					commit('SET_SERVICE_CODE', results)
					resolve(res.data)
				})
				.catch(error => {
					console.log(error)
					commit('setOrderFeeBusinessType', '')
					commit('SET_SERVICE_CODE', [])
					reject(error)
				})
		})
	},
	// 查询所有业务类型和服务项
	queryBusinessServiceList({ commit }, params) {
		return new Promise((resolve, reject) => {
			let data = {
				businessType: params.businessType // 可选
			}
			businessServiceList(data)
				.then(res => {
					const results = []
					const list = res.data ? res.data : []
					list.forEach(item => {
						item.serviceList.forEach(subItem => {
							if (
								!results.find(result => {
									return result.serviceCode === subItem.serviceCode
								})
							) {
								results.push(
									Object.assign(subItem, {
										label: subItem.serviceName,
										value: subItem.serviceCode
									})
								)
							}
						})
					})
					commit('SET_ALL_SERVICE_CODE', results)
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 查询业务和服务类型的所有服务项
	baseBusinessServiceList({ commit }, params) {
		return new Promise((resolve, reject) => {
			let data = {
				businessType: params.businessType,
				serviceType: params.serviceType
			}
			baseBusinessServiceList(data)
				.then(res => {
					const results = []
					const list = res.data ? res.data : []
					results = list.map(item =>
						results.push(
							Object.assign(item, {
								label: item.serviceName,
								value: item.serviceCode
							})
						)
					)
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// // 费用项下拉查询（财务模块提供）
	// queryFeeCode({ commit }, params) {
	//   return new Promise((resolve, reject) => {
	//     let data = {
	//       // "finGroup": "收入成本",
	//       // "receipayGroup": "receivepay",
	//       "serviceCode": params.serviceCode,
	//       "name": params.queryString,
	//       "size": 20
	//     }
	//     queryFeeCode(data).then(res => {
	//       const results = []
	//       const list = res.data
	//       list.forEach(item => {
	//         results.push(Object.assign(item, {
	//           key: item.feeCode,
	//           value: item.feeName,
	//           // feeEnName: item.feeEnName
	//         }))
	//       })
	//       resolve(results)
	//     })
	//   })
	// },
	// 财务供应商结算单位列表
	queryFinSupplierList({ commit }, param) {
		return new Promise((resolve, reject) => {
			let data = {
				name: param.queryString,
				serviceCode: param.serviceCode,
				feeCode: param.feeCode,
				size: param.size || 20
			}
			queryFinSupplierList(data).then(res => {
				resolve(res.data)
			})
		})
	},
	// 获取供应商信息-铁路
	queryBkgAgentSupplierListRail({ commit }, param) {
		return new Promise((resolve, reject) => {
			let data = {
				currPage: 1,
				pageSize: 50,
				columns: [],
				ascColumns: [],
				descColumns: [],
				query: param.queryString
					? [
							{ column: param.category, type: param.categoryType, value: param.value },
							{ column: 'name', type: 'like', value: param.queryString }
					  ]
					: [{ column: param.category, type: param.categoryType, value: param.value }]
			}
			supplierList(data).then(res => {
				resolve(res.data)
			})
		})
	},
	// 获取供应商信息
	queryBkgAgentSupplierList({ commit }, param) {
		return new Promise((resolve, reject) => {
			let data = {
				currPage: 1,
				pageSize: 50,
				columns: [],
				ascColumns: [],
				descColumns: [],
				query: param.queryString
					? [
							{ column: param.category, type: param.categoryType, value: param.value },
							// { column: 'businessType', type: 'in', value: 'shiping_carrier_export,bkg_agent_export_sea_container,shiping_carrier_import' },
							{ column: 'name', type: 'like', value: param.queryString }
					  ]
					: [
							{ column: param.category, type: param.categoryType, value: param.value }
							// { column: 'businessType', type: 'in', value: 'shiping_carrier_export,bkg_agent_export_sea_container,shiping_carrier_import' }
					  ]
			}
			supplierList(data).then(res => {
				resolve(res.data)
			})
		})
	},
	// 获取供应商信息
	querySupplierList({ commit }, param) {
		return new Promise((resolve, reject) => {
			let data = {
				currPage: 1,
				pageSize: 50,
				columns: [],
				ascColumns: [],
				descColumns: [],
				query: param.queryString
					? [
							{ column: param.category, type: param.categoryType || 'eq', value: param.value },
							{ column: 'name', type: 'like', value: param.queryString }
					  ]
					: [{ column: param.category, type: param.categoryType || 'eq', value: param.value }]
			}
			supplierList(data).then(res => {
				resolve(res.data)
			})
		})
	},
	// 服务项获取海外代理
	querySeviceOverseaList({ commit }, param) {
		return new Promise((resolve, reject) => {
			let data = {
				currPage: 1,
				pageSize: 50,
				columns: [],
				ascColumns: [],
				descColumns: [],
				query: param.queryString
					? [
							{ column: param.category, type: 'eq', value: param.value },
							{ column: 'verifyStatus', type: 'eq', value: 'pass' },
							{ column: 'name', type: 'like', value: param.queryString }
					  ]
					: [
							{ column: param.category, type: 'eq', value: param.value },
							{ column: 'verifyStatus', type: 'eq', value: 'pass' }
					  ]
			}
			supplierList(data).then(res => {
				resolve(res.data)
			})
		})
	},
	// 获取所有的供应商信息
	queryAllSupplierList({ commit }, param) {
		return new Promise((resolve, reject) => {
			let data = {
				currPage: 1,
				pageSize: 50,
				columns: [],
				ascColumns: [],
				descColumns: [],
				query: param.queryString ? [{ column: 'name', type: 'like', value: param.queryString }] : []
			}
			supplierList(data).then(res => {
				resolve(res.data)
			})
		})
	},
	// 获取快递信息
	queryExpressList({ commit }, param) {
		return new Promise((resolve, reject) => {
			let data = {
				currPage: 1,
				pageSize: 50,
				columns: [],
				ascColumns: [],
				descColumns: [],
				query: param.queryString
					? [
							{ column: 'category', type: 'eq', value: param.businessType },
							{ column: 'name', type: 'like', value: param.queryString }
					  ]
					: [{ column: 'category', type: 'eq', value: param.businessType }]
			}
			supplierList(data).then(res => {
				resolve(res.data)
			})
		})
	},
	// 获取客商信息
	queryCustomerList({ commit }, queryString) {
		return new Promise((resolve, reject) => {
			let data = {
				currPage: 1,
				pageSize: 50,
				query: queryString ? [{ column: 'name', type: 'like', value: queryString }] : []
			}
			customerList(data).then(res => {
				resolve(res.data)
			})
		})
	},
	// 获取铁路发货单位信息
	queryRailCustomerList({ commit }, params) {
		return new Promise((resolve, reject) => {
			let data = {
				currPage: 1,
				pageSize: 1000,
				query: params.queryString
					? [
							{ column: 'name', type: 'like', value: params.queryString },
							{ column: 'roleType', type: 'in', value: params.roleType },
							{ column: 'bdEmployeeId', type: 'eq', value: params.bdEmployeeId }
					  ]
					: [
							{ column: 'roleType', type: 'in', value: params.roleType },
							{ column: 'bdEmployeeId', type: 'eq', value: params.bdEmployeeId }
					  ]
			}
			customerList(data).then(res => {
				resolve(res.data)
			})
		})
	},
	// 获取客商信息
	queryOrgValidList({ commit }, queryString) {
		return new Promise((resolve, reject) => {
			let data = {
				currPage: 1,
				pageSize: 50,
				query: queryString ? [{ column: 'name', type: 'like', value: queryString }] : []
			}
			orgValidList(data).then(res => {
				resolve(res.data)
			})
		})
	},
	// 货品分类信息
	queryCommodityTypeCodeOptions(context, queryString) {
		console.log(queryString)
		return new Promise((resolve, reject) => {
			let data = {
				currPage: 1,
				pageSize: 30,
				keyword: queryString
			}
			cargoTypeList(data)
				.then(res => {
					let data =
						res.data &&
						res.data.map(item => {
							return {
								label: item.chapterName,
								value: item.chapterCode
							}
						})
					context.commit('setCommodityTypeCodeOptions', data)
					resolve(data)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 包装类型列表
	queryPackageList({ commit }, param) {
		return new Promise((resolve, reject) => {
			let keywords = param ? param.keywords : ''
			packageList({
				keywords,
				pageSize: 1000
			})
				.then(res => {
					let results = []
					let list = res.data.list ? res.data.list : []
					results = list.map(item => {
						return Object.assign({}, item, {
							key: item.packageCode,
							label: item.packageCode,
							value: item.packageCode
						})
					})
					commit('SET_PACKAGETYPE', results)
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 船名模糊查询 商务费用审核页面
	queryFuzzyVessleList({ commit }, query = {}) {
		return new Promise((resolve, reject) => {
			let { name } = query
			fuzzyVesselList(name)
				.then(response => {
					const results = []
					const list = response.data
					list.forEach((item, index) => {
						results.push({
							key: item,
							value: item
						})
					})
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 船名查询
	queryVessleList({ commit }, query = {}) {
		return new Promise((resolve, reject) => {
			let { name } = query
			let data = name ? [{ column: 'vessel', type: 'rightLike', value: name }] : []
			vesselList({ query: data, pageSize: 20 })
				.then(response => {
					const results = []
					const { list } = response.data
					list.forEach((item, index) => {
						results.push({
							key: item.vessel,
							value: item.vessel
						})
					})
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 航次模糊查询 商务费用审核页面
	queryFuzzyVoyageList({ commit }, query = {}) {
		return new Promise((resolve, reject) => {
			let { name } = query
			fuzzyVoyageList(name)
				.then(response => {
					const results = []
					const list = response.data
					list.forEach((item, index) => {
						results.push({
							key: item,
							value: item
						})
					})
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 航次查询
	queryVoyageList({ commit }, query = {}) {
		return new Promise((resolve, reject) => {
			let { name, vessel } = query
			let data = name ? [{ column: 'voyageOut', type: 'rightLike', value: name }] : []
			if (vessel) {
				data.push({ column: 'vessel', type: 'eq', value: vessel })
			}
			voyageList({ query: data, pageSize: 20 })
				.then(response => {
					const results = []
					const { list } = response.data
					list.forEach((item, index) => {
						results.push({
							key: item.voyageOut,
							value: item.voyageOut
						})
					})
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 空运港口下拉
	airportList({ commit }, param) {
		let { portName, portCodes, state } = param
		return new Promise((resolve, reject) => {
			airportList({ portName, portCodes, state })
				.then(response => {
					let results = []
					let list = response.data
					results = list.map(item => {
						return Object.assign(item, {
							key: item.portCode,
							value: `${item.ename}(${item.cname}${item.portCname ? ',' + item.portCname : ''}${item.cityCname ? ',' + item.cityCname : ''}${item.countryName ? ',' + item.countryName : ''})`
						})
					})

					resolve(list)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 航空公司
	aircarrierList({ commit }, param) {
		let { carrierName } = param
		return new Promise((resolve, reject) => {
			aircarrierList({ carrierName })
				.then(response => {
					let list = response.data
					resolve(list)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 空运航线下拉
	airportSyslineList({ commit }, param) {
		let { value } = param
		return new Promise((resolve, reject) => {
			airportSyslineList({ key: value })
				.then(response => {
					let list = response.data
					resolve(list)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 岗位数据下拉
	queryJobList({ commit }, queryString) {
		return new Promise((resolve, reject) => {
			jobSelectList()
				.then(res => {
					const results = []
					const list = res.data ? res.data : []
					list.forEach(item => {
						results.push({
							key: item.jobCode,
							value: item.jobCname
						})
					})
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 角色数据下拉
	queryRoleList({ commit }, param) {
		return new Promise((resolve, reject) => {
			roleSelectList(param)
				.then(res => {
					const results = []
					const list = res.data ? res.data : []
					list.forEach(item => {
						results.push({
							key: item.roleCode,
							value: item.roleName
						})
					})
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 包装类型列表
	queryDutyDeptList({ commit }, param) {
		return new Promise((resolve, reject) => {
			dutyDeptList()
				.then(res => {
					let results = []
					let list = res.data || []
					results = list.map(item => {
						return Object.assign({}, item, {
							key: item.deptCode,
							label: item.deptCname,
							value: item.deptCode
						})
					})
					commit('SET_DUTYDEPT', results)
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 20211231 查询船名船次暂海运使用
	// 船名查询
	queryBookVessle({ commit }, query = {}) {
		return new Promise((resolve, reject) => {
			let { shipCarrierCode, polPortCode, podPortCode, vessel } = query
			let data = {
				shipCarrierCode,
				polPortCode,
				podPortCode,
				vessel
			}
			bookVesselList(data)
				.then(res => {
					const results = []
					const { data } = res
					data &&
						data.length &&
						data.forEach((item, index) => {
							results.push({
								...item,
								key: item,
								value: item
							})
						})
					resolve(results)
				})
				.catch(error => {
					console.log(error)
					reject(error)
				})
		})
	},
	// 船次查询
	queryBookVoyage({ commit }, query = {}) {
		return new Promise((resolve, reject) => {
			let { shipCarrierCode, polPortCode, podPortCode, vessel, voyage } = query
			let data = {
				shipCarrierCode,
				polPortCode,
				podPortCode,
				vessel,
				voyage
			}
			bookVoyageList(data)
				.then(res => {
					const results = []
					const { data } = res
					data &&
						data.length &&
						data.forEach((item, index) => {
							results.push({
								...item,
								key: item,
								value: item
							})
						})
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 根据船名航次查船期
	queryBookVessleTime({ commit }, query = {}) {
		return new Promise((resolve, reject) => {
			let { shipCarrierCode, polPortCode, podPortCode, vessel, voyage } = query
			let data = {
				shipCarrierCode,
				polPortCode,
				podPortCode,
				vessel,
				voyage
			}
			bookVesselTime(data)
				.then(res => {
					const { data } = res
					resolve(data)
				})
				.catch(error => {
					reject(error)
				})
		})
	}
}

export default {
	namespaced: true,
	state,
	mutations,
	actions
}
