import axios from 'axios'
import { parseTime, randomString } from '@/utils'
import { getToken } from '@/utils/auth'
import { orderConfigString } from '@/api/order/contract'
import {
  unreadCount
} from '@/api/charge'
const state = {
	// 海运价-大船
	mainRoute: {
		// 默认表头
		defaultColumns: [
			'polEname',
			'podEname',
			'shipCarrierCode',
			'sysLineCname',
			'schedule',
			'effectiveType',
			'beginDate',
			'endDate',
			'feederPolCode',
			'feederPolCityCname',
			'cutoffDate',
			'priceGp20',
			'priceGp40',
			'priceHq40',
			'priceHq45',
			'priceNor20',
			'priceNor40',
			'surchargeList',
			'podCountryCname',
			'unloadingPortCode',
			'attention',
			'shipTerms',
			'pricerName',
			'surchargeDesc',
			'bkgAgentId',
			'bkgAgent',
			'carrierLineName',
			'carrierService',
			'cargoLimited',
			'sailingDate',
			'issueWay',
			'blType',
			'allin',
			'internalDesc',
			'freeTimeDesc',
			'guidanceDesc',
			'issueWayDesc',
			'podChargeDesc',
			'mainRouteTransferMode',
			'transitPort1Code',
			'maintainerId',
			'blankSailing',
			'publishTime',
			'invalidDate'
		],

		// 自定义表头特殊处理
		specialColumns: {
			polCode: ['polCode', 'polEname', 'polCname', 'podCode', 'podEname', 'podCname'],
			unloadingPortCode: ['unloadingPortCode', 'unloadingPortEname', 'unloadingPortCname'],
			feederPolCode: ['feederPolCode', 'feederPolEname', 'feederPolCname'],
			priceGp20: ['priceGp20', 'currency', 'weightCurrency', 'weightPriceGp20'],
			priceGp40: ['priceGp40', 'currency', 'weightCurrency', 'weightPriceGp40'],
			priceHq40: ['priceHq40', 'currency', 'weightCurrency', 'weightPriceHq40'],
			priceHq45: ['priceHq45', 'currency', 'weightCurrency', 'weightPriceHq45'],
			priceNor20: ['priceNor20', 'currency', 'weightCurrency', 'weightPriceNor45'],
			priceNor40: ['priceNor40', 'currency', 'weightCurrency', 'weightPriceNor40'],
			beginDate: ['beginDate', 'endDate'],
			maintainerId: ['maintainerId', 'maintainerName'],
			bkgAgentId: ['bkgAgentId', 'bkgAgent'],
			transitPort1Code: ['transitPort1Code', 'transitPort1Ename', 'transitPort1Cname', 'transitPort2Code', 'transitPort2Ename', 'transitPort2Cname', 'transitPort3Code', 'transitPort3Ename', 'transitPort3Cname']
		},

		// 表头库
		columnsBase: [
			{ label: '大船起运港', key: 'polEname' },
			{ label: '目的港', key: 'podEname' },
			{ label: '船司', key: 'shipCarrierCode', disabled: false },
			{ label: '系统航线', key: 'sysLineCname', disabled: false },
			{ label: '船期', key: 'schedule', disabled: false },
			{ label: '有效类别	', key: 'effectiveType', disabled: false },
			{ label: '有效期(开始)', key: 'beginDate', disabled: false },
			{ label: '有效期(结束)', key: 'endDate', disabled: false },
			{ label: '驳船收货地', key: 'feederPolCode', disabled: false },
			{ label: '驳船收货地城市', key: 'feederPolCityCname', disabled: false },
			{ label: '截文件', key: 'cutoffDate', disabled: false },
			{ label: '20GP', key: 'priceGp20', disabled: false },
			{ label: '40GP', key: 'priceGp40', disabled: false },
			{ label: '40HQ', key: 'priceHq40', disabled: false },
			{ label: '45HQ', key: 'priceHq45', disabled: false },
			{ label: '20NOR', key: 'priceNor20', disabled: false },
			{ label: '40NOR', key: 'priceNor40', disabled: false },
			{ label: '附加费', key: 'surchargeList', disabled: false },
			{ label: '特别提醒', key: 'attention', disabled: false },
			{ label: '中转港', key: 'transitPort1Code', disabled: false },
			{ label: '卸货港', key: 'unloadingPortCode', disabled: false },
			{ label: '目的港国家', key: 'podCountryCname' },
			{ label: '驳船匹配', key: 'feederMatchMode', disabled: false },
			// {label: '中转天数', key: 'transitVoyage', disabled: false},
			{ label: '订舱代理', key: 'bkgAgentId', disabled: false },
			// {label: '发布状态', key: 'publishStatus', disabled: false},
			{ label: '内部备注', key: 'internalDesc', disabled: false },
			{ label: '收货指引', key: 'guidanceDesc', disabled: false },
			{ label: '出单方式备注', key: 'issueWayDesc', disabled: false },
			{ label: '目的港收费标准参考', key: 'podChargeDesc', disabled: false },
			{ label: '航线代码', key: 'carrierService', disabled: false },
			{ label: '航程', key: 'voyage', disabled: false },
			{ label: '运输条款', key: 'shipTerms', disabled: false },
			{ label: '拿价人', key: 'pricerName', disabled: false },
			{ label: '附加费说明	', key: 'surchargeDesc', disabled: false },
			{ label: '限重说明', key: 'weightDesc', disabled: false },
			{ label: '承运人航线', key: 'carrierLineName', disabled: false },
			{ label: '限定货物	', key: 'cargoLimited', disabled: false },
			{ label: '开航日', key: 'sailingDate', disabled: false },
			{ label: '出单方式', key: 'issueWay', disabled: false },
			{ label: '提单类型', key: 'blType', disabled: false },
			{ label: '是否ALLIN', key: 'allin', disabled: false },
			{ label: '免用免堆', key: 'freeTimeDesc', disabled: false },
			{ label: '中转方式', key: 'mainRouteTransferMode', disabled: false },
			{ label: '维护人', key: 'maintainerId', disabled: false },
			{ label: '是否停航', key: 'blankSailing', disabled: false },
			{ label: '发布时间', key: 'publishTime', disabled: false },
			{ label: '失效时间', key: 'invalidDate', disabled: false },
		]
	},
	// 空运
	airMainRoute: {
		// 默认表头
		defaultColumns: [
			'polPortCode',
			'potPortCode',
			'podPortCode',
			'airLine',
			'countryCname',
			'currency',
			'priceCargoType',
			'priceMin',
			'priceKg45',
			'priceKg100',
			'priceKg300',
			'priceKg500',
			'priceKg1000',
			'priceKg2000',
			'surcharge',
			'packageInfo',
			'flightRate',
			'beginDate',
			'prescription',
			'status',
			'maintainerName',
			'createdTime',
			'updatedTime',
			'updatedName',
			'publishTime'
		],

		// 自定义表头特殊处理
		specialColumns: {
			beginDate: ['beginDate', 'endDate'],
			maintainerId: ['maintainerId', 'maintainerName']
		},

		// 表头库
		columnsBase: [
			{ label: '起运港', key: 'polPortCode' },
			{ label: '中转港', key: 'potPortCode' },
			{ label: '目的地', key: 'podPortCode' },
			// { label: '国家', key: 'countryCname' },
			{ label: '起运国', key: 'polCountryCname' },
			{ label: '目的国', key: 'podCountryCname' },
			{ label: '航空公司', key: 'airLine' },
			{ label: '币别', key: 'currency' },
			{ label: '货物类型', key: 'priceCargoType' },
			{ label: '最低收费', key: 'priceMin' },
			{ label: '+45KG', key: 'priceKg45' },
			{ label: '+100KG', key: 'priceKg100' },
			{ label: '+300KG', key: 'priceKg300' },
			{ label: '+500KG', key: 'priceKg500' },
			{ label: '+1000KG', key: 'priceKg1000' },
			{ label: '+2000KG', key: 'priceKg2000' },
			{ label: '附加费', key: 'surcharge' },
			{ label: '包装', key: 'packageInfo' },
			{ label: '航班频率', key: 'flightRate' },
			{ label: '有效日期', key: 'beginDate' },
			{ label: '时效', key: 'prescription' },
			{ label: '发布状态', key: 'status' },
			{ label: '维护人', key: 'maintainerName' },
			{ label: '创建时间', key: 'createdTime' },
			{ label: '发布时间', key: 'publishTime' },
			{ label: '更新人', key: 'updatedName' },
			{ label: '更新时间', key: 'updatedTime' },
		]
	},
	feederRoute: {
		// 默认表头
		defaultColumns: [
			'polCode',
			'podCode',
			'shipCarrierCode',
			'sysLineCname',
			'priceGp20',
			'priceGp40',
			'priceHq40',
			'priceHq45',
			'priceNor20',
			'priceNor40',
			'surchargeList',
			'receiptArea',
			'effectiveType',
			'remark',
			'beginDate',
			'feederSchedule',
			'maintainerName',
			'publishTime',
			'invalidDate'
		],

		// 自定义表头特殊处理
		specialColumns: {
			polCode: ['feederPolCode', 'feederPolEname', 'feederPolCname', 'polCode', 'polEname', 'polCname'],
			podCode: ['podCode', 'podEname', 'podCname'],
			beginDate: ['beginDate', 'endDate']
		},

		// 表头库
		columnsBase: [
			{ label: '收货地/大船起运港', key: 'polCode', disabled: false },
			{ label: '目的港', key: 'podCode', disabled: false },
			{ label: '船司', key: 'shipCarrierCode', disabled: false },
			{ label: '系统航线', key: 'sysLineCname', disabled: false },
			{ label: '20GP', key: 'priceGp20', disabled: false },
			{ label: '40GP', key: 'priceGp40', disabled: false },
			{ label: '40HQ', key: 'priceHq40', disabled: false },
			{ label: '45HQ', key: 'priceHq45', disabled: false },
			{ label: '20NOR', key: 'priceNor20', disabled: false },
			{ label: '40NOR', key: 'priceNor40', disabled: false },
			{ label: '附加费', key: 'surchargeList', disabled: false },
			{ label: '收货区域', key: 'receiptArea', disabled: false },
			{ label: '船期', key: 'feederSchedule', disabled: false },
			{ label: '备注说明', key: 'remark', disabled: false },
			{ label: '生效日期', key: 'beginDate', disabled: false },
			{ label: '维护人', key: 'maintainerName', disabled: false },
			{ label: '发布时间', key: 'publishTime', disabled: false },
			{ label: '失效时间', key: 'invalidDate', disabled: false },
		]
	},
	// 运价查询自定义表头
	routeQuery: {
		// 默认表头
		defaultColumns: [
			'polEname',
			'podEname',
			'shipCarrierCode',
			'sysLineCname',
			'schedule',
			'feederPolCode',
			'effectiveType',
			'beginDate',
			'endDate',
			'priceGp20',
			'priceGp40',
			'priceHq40',
			'priceHq45',
			'priceNor20',
			'priceNor40',
			'surchargeList',
			'podCountryName',
			'unloadingPortCode',
			'cutoffDate',
			'attention',
			'shipTerms',
			'pricerName',
			'surchargeDesc',
			'weightDesc',
			'bkgAgent',
			'carrierLineName',
			'carrierService',
			'cargoLimited',
			'sailingDate',
			'issueWay',
			'blType',
			'allin',
			'internalDesc',
			'freeTimeDesc',
			'guidanceDesc',
			'issueWayDesc',
			'podChargeDesc',
			'mainRouteTransferMode',
			'transitPort1Code',
			'weightDesc',
			'blankSailing',
			'publishTime',
			'invalidDate'
		],

		// 自定义表头特殊处理
		specialColumns: {
			polCode: ['polCode', 'polEname', 'polCname', 'podCode', 'podEname', 'podCname'],
			unloadingPortCode: ['unloadingPortCode', 'unloadingPortEname', 'unloadingPortCname'],
			feederPolCode: ['feederPolCode', 'feederPolEname', 'feederPolCname'],
			priceGp20: ['priceGp20', 'currency', 'weightCurrency', 'weightPriceGp20'],
			priceGp40: ['priceGp40', 'currency', 'weightCurrency', 'weightPriceGp40'],
			priceHq40: ['priceHq40', 'currency', 'weightCurrency', 'weightPriceHq40'],
			priceHq45: ['priceHq45', 'currency', 'weightCurrency', 'weightPriceHq45'],
			priceNor20: ['priceNor20', 'currency', 'weightCurrency', 'weightPriceNor45'],
			priceNor40: ['priceNor40', 'currency', 'weightCurrency', 'weightPriceNor40'],
			beginDate: ['beginDate', 'endDate'],
			transitPort1Code: ['transitPort1Code', 'transitPort1Ename', 'transitPort1Cname', 'transitPort2Code', 'transitPort2Ename', 'transitPort2Cname', 'transitPort3Code', 'transitPort3Ename', 'transitPort3Cname'],
			feederBeginDate: ['feederBeginDate', 'feederEndDate'],
			// schedule: ['polEname', 'schedule', 'carrierService', 'voyage']
		},

		// 表头库
		columnsBase: [
			{ label: '大船起运港', key: 'polEname', disabled: false },
			{ label: '目的港', key: 'podEname', disabled: false },
			{ label: '船司', key: 'shipCarrierCode', disabled: false },
			{ label: '系统航线', key: 'sysLineCname', disabled: false },
			{ label: '船期', key: 'schedule', disabled: false },
			{ label: '驳船收货地', key: 'feederPolCode', disabled: false },
			{ label: '有效类别	', key: 'effectiveType', disabled: false },
			{ label: '有效期(开始)', key: 'beginDate', disabled: false },
			{ label: '有效期(结束)', key: 'endDate', disabled: false },
			{ label: '20GP', key: 'priceGp20', disabled: false },
			{ label: '40GP', key: 'priceGp40', disabled: false },
			{ label: '40HQ', key: 'priceHq40', disabled: false },
			{ label: '45HQ', key: 'priceHq45', disabled: false },
			{ label: '20NOR', key: 'priceNor20', disabled: false },
			{ label: '40NOR', key: 'priceNor40', disabled: false },
			{ label: '附加费', key: 'surchargeList', disabled: false },
			{ label: '截文件', key: 'cutoffDate', disabled: false },
			{ label: '特别提醒', key: 'attention', disabled: false },
			{ label: '中转港', key: 'transitPort1Code', disabled: false },
			{ label: '卸货港', key: 'unloadingPortCode', disabled: false },
			{ label: '目的港国家', key: 'podCountryName' },
			{ label: '驳船有效期', key: 'feederBeginDate', disabled: false },
			{ label: '驳船匹配', key: 'feederMatchMode', disabled: false },
			// {label: '中转天数', key: 'transitVoyage', disabled: false},
			{ label: '订舱代理', key: 'bkgAgent', disabled: false },
			// {label: '发布状态', key: 'publishStatus', disabled: false},
			{ label: '内部备注', key: 'internalDesc', disabled: false },
			{ label: '出单方式备注', key: 'issueWayDesc', disabled: false },
			{ label: '目的港收费标准参考', key: 'podChargeDesc', disabled: false },
			{ label: '航线代码', key: 'carrierService', disabled: false },
			{ label: '航程', key: 'voyage', disabled: false },
			{ label: '运输条款', key: 'shipTerms', disabled: false },
			{ label: '拿价人', key: 'pricerName', disabled: false },
			{ label: '附加费说明	', key: 'surchargeDesc', disabled: false },
			{ label: '承运人航线', key: 'carrierLineName', disabled: false },
			{ label: '限定货物	', key: 'cargoLimited', disabled: false },
			{ label: '开航日', key: 'sailingDate', disabled: false },
			{ label: '出单方式', key: 'issueWay', disabled: false },
			{ label: '提单类型', key: 'blType', disabled: false },
			{ label: '是否ALLIN', key: 'allin', disabled: false },
			{ label: '免用免堆', key: 'freeTimeDesc', disabled: false },
			{ label: '收货指引', key: 'guidanceDesc', disabled: false },
			{ label: '中转方式', key: 'mainRouteTransferMode', disabled: false },
			{ label: '限重说明', key: 'weightDesc', disabled: false },
			{ label: '是否停航', key: 'blankSailing', disabled: false },
			{ label: '发布时间', key: 'publishTime', disabled: false },
			{ label: '失效时间', key: 'invalidDate', disabled: false },
		]
	},
	// 运价查询自定义表头-大掌柜数据v1.0
	cargoGmRouteQuery: {
		// 默认表头
		defaultColumns: [
			'loadport',
			'loadportcity',
			'recaddressEnname',
			'dischargeport',
			'country',
			'transferport',
			'massaddress',
			'quoteorg',
			'carrier',
			'searouteCnname',
			'searouteCode',
			'cycle',
			'begindate',
			'validdate',
			'validType',
			'publishdate',
			// 'ispublish',
			'iscommend',
			'signflag',
			'ownerName',
			'baseprice1',
			'baseprice2',
			'baseprice3',
			'sellprice1',
			'sellprice2',
			'sellprice3',
			'internetsellprice1',
			'internetsellprice2',
			'internetsellprice3',
			'baseprice4',
			'sellprice4',
			'internetsellprice4',
			'volumerange',
			'rakeoff',
			'plusfeedesc',
			'linkinfo',
			'remark',
			// 'employeeRemark',
			'sendtype',
			'suspendShippingService',
			'sailingDate',
			'expectedRise',
			'carrierRoute',
			'sailtime',
			'effectiveDate',
			'invalidDate',
			'transitClause',
			'transferSailtime',
			'inlandTransferMode',
			// 'transferSailtime1',
			'priceHolder',
			'priceHolderOrgName',
			'cutWeek',
			'freeTime',
			'bargeCycle',
			'transferport2',
			'transferport3',
			'addfee',
			'billType',
			// 'businessRemark',
			// 'modifyby',
		],

		// 自定义表头特殊处理
		specialColumns: {
		},

		// 表头库
		columnsBase: [
			{ label: '起运港', key: 'loadport', disabled: false },
			{ label: '起运港城市', key: 'loadportcity', disabled: false },
			{ label: '驳船收货地', key: 'recaddressEnname', disabled: false },
			{ label: '目的港', key: 'dischargeport', disabled: false },
			{ label: '国家', key: 'country', disabled: false },
			{ label: '中转港', key: 'transferport', disabled: false },
			{ label: '港区', key: 'massaddress', disabled: false },
			{ label: '订舱代理', key: 'quoteorg', disabled: false },
			{ label: '船公司', key: 'carrier', disabled: false },
			{ label: '航线', key: 'searouteCnname', disabled: false },
			{ label: '航线代码', key: 'searouteCode', disabled: false },
			{ label: '船期', key: 'cycle', disabled: false },
			{ label: '航程(天)', key: 'sailtime', disabled: false },
			{ label: '有效期(开始)', key: 'begindate', disabled: false },
			{ label: '有效期(结束)', key: 'validdate', disabled: false },
			{ label: '有效类别', key: 'validType', disabled: false },
			{ label: '发布时间', key: 'publishdate', disabled: false },
			// { label: '发布状态', key: 'ispublish', disabled: false },
			{ label: '推荐', key: 'iscommend', disabled: false },
			{ label: '符号', key: 'signflag', disabled: false },
			{ label: '维护人', key: 'ownerName', disabled: false },
			{ label: `20'GP箱型底价`, key: 'baseprice1', disabled: false },
			{ label: `40'GP箱型底价`, key: 'baseprice2', disabled: false },
			{ label: `40'HQ箱型底价`, key: 'baseprice3', disabled: false },
			{ label: `20'GP箱型成本价`, key: 'sellprice1', disabled: false },
			{ label: `40'GP箱型成本价`, key: 'sellprice2', disabled: false },
			{ label: `40'HQ箱型成本价`, key: 'sellprice3', disabled: false },
			{ label: `20'GP箱型标准报价`, key: 'internetsellprice1', disabled: false },
			{ label: `40'GP箱型标准报价`, key: 'internetsellprice2', disabled: false },
			{ label: `40'HQ箱型标准报价`, key: 'internetsellprice3', disabled: false },
			{ label: `45'HQ箱型底价`, key: 'baseprice4', disabled: false },
			{ label: `45'HQ箱型成本价`, key: 'sellprice4', disabled: false },
			{ label: `45'HQ箱型报价`, key: 'internetsellprice4', disabled: false },
			{ label: '限重', key: 'volumerange', disabled: false },
			{ label: '佣金', key: 'rakeoff', disabled: false },
			{ label: '附加费', key: 'plusfeedesc', disabled: false },
			{ label: '联系方式', key: 'linkinfo', disabled: false },
			{ label: '外部备注', key: 'remark', disabled: false },
			// { label: '内部备注', key: 'employeeRemark', disabled: false },
			{ label: '出单方式', key: 'sendtype', disabled: false },
			{ label: '停航', key: 'suspendShippingService', disabled: false },
			{ label: '开航日', key: 'sailingDate', disabled: false },
			{ label: '预计上涨', key: 'expectedRise', disabled: false },
			{ label: '承运人航线', key: 'carrierRoute', disabled: false },
			{ label: '驳船航程', key: 'sailtime', disabled: false },
			{ label: '驳船有效期(开始)', key: 'effectiveDate', disabled: false },
			{ label: '驳船有效期(结束)', key: 'invalidDate', disabled: false },
			{ label: '运输条款', key: 'transitClause', disabled: false },
			{ label: '中转航程', key: 'transferSailtime', disabled: false },
			{ label: '中转方式', key: 'inlandTransferMode', disabled: false },
			// { label: 'ALL IN', key: 'transferSailtime1', disabled: false },
			{ label: '拿价人', key: 'priceHolder', disabled: false },
			{ label: '拿价公司', key: 'priceHolderOrgName', disabled: false },
			{ label: '截文件', key: 'cutWeek', disabled: false },
			{ label: '免用免堆', key: 'freeTime', disabled: false },
			{ label: '驳船船期', key: 'bargeCycle', disabled: false },
			{ label: '中转港2', key: 'transferport2', disabled: false },
			{ label: '中转港3', key: 'transferport3', disabled: false },
			{ label: '附加费说明', key: 'addfee', disabled: false },
			{ label: '提单类型', key: 'billType', disabled: false },
			// { label: '收货指引', key: 'businessRemark', disabled: false },
			// { label: '修改人', key: 'modifyby', disabled: false },
		]
	},
	// 运价查询自定义表头-大掌柜数据v2.0
	dzgRouteQuery: {
		// 默认表头
		defaultColumns: [
			'loadport',
			'loadportcity',
			'recaddressEnname',
			'dischargeport',
			'country',
			'transferport',
			'massaddress',
			'quoteorg',
			'carrier',
			'searoute',
			'searouteCode',
			'cycle',
			'begindate',
			'validdate',
			'validType',
			'publishdate',
			'ispublish',
			'iscommend',
			'signflag',
			'ownerName',
			'baseprice1',
			'baseprice2',
			'baseprice3',
			'sellprice1',
			'sellprice2',
			'sellprice3',
			'internetsellprice1',
			'internetsellprice2',
			'internetsellprice3',
			'baseprice4',
			'sellprice4',
			'internetsellprice4',
			'volumerange',
			'rakeoff',
			'plusfeedesc',
			'linkinfo',
			'remark',
			'employeeRemark',
			'sendtype',
			'suspendShippingService',
			'sailingDate',
			'expectedRise',
			'carrierRoute',
			'sailtime',
			'transportDays',
			'effectiveDate',
			'invalidDate',
			'transitClause',
			'transferSailtime',
			'inlandTransferMode',
			'transferFeeMode',
			'priceHolder',
			'priceHolderOrgName',
			'cutTime',
			'freeTime',
			'bargeCycle',
			'transferport2',
			'transferport3',
			'addfee',
			'billType',
			'businessRemark',
			'modifyby',
		],

		// 自定义表头特殊处理
		specialColumns: {
		},

		// 表头库
		columnsBase: [
			{ label: '起运港', key: 'loadport', disabled: false },
			{ label: '起运港城市', key: 'loadportcity', disabled: false },
			{ label: '驳船收货地', key: 'recaddressEnname', disabled: false },
			{ label: '目的港', key: 'dischargeport', disabled: false },
			{ label: '国家', key: 'country', disabled: false },
			{ label: '中转港', key: 'transferport', disabled: false },
			{ label: '港区', key: 'massaddress', disabled: false },
			{ label: '订舱代理', key: 'quoteorg', disabled: false },
			{ label: '船公司', key: 'carrier', disabled: false },
			{ label: '航线', key: 'searoute', disabled: false },
			{ label: '航线代码', key: 'searouteCode', disabled: false },
			{ label: '船期', key: 'cycle', disabled: false },
			{ label: '航程(天)', key: 'sailtime', disabled: false },
			{ label: '有效期(开始)', key: 'begindate', disabled: false },
			{ label: '有效期(结束)', key: 'validdate', disabled: false },
			{ label: '有效类别', key: 'validType', disabled: false },
			{ label: '发布时间', key: 'publishdate', disabled: false },
			{ label: '发布状态', key: 'ispublish', disabled: false },
			{ label: '推荐', key: 'iscommend', disabled: false },
			{ label: '符号', key: 'signflag', disabled: false },
			{ label: '维护人', key: 'ownerName', disabled: false },
			{ label: `20'GP箱型底价`, key: 'baseprice1', disabled: false },
			{ label: `40'GP箱型底价`, key: 'baseprice2', disabled: false },
			{ label: `40'HQ箱型底价`, key: 'baseprice3', disabled: false },
			{ label: `20'GP箱型成本价`, key: 'sellprice1', disabled: false },
			{ label: `40'GP箱型成本价`, key: 'sellprice2', disabled: false },
			{ label: `40'HQ箱型成本价`, key: 'sellprice3', disabled: false },
			{ label: `20'GP箱型标准报价`, key: 'internetsellprice1', disabled: false },
			{ label: `40'GP箱型标准报价`, key: 'internetsellprice2', disabled: false },
			{ label: `40'HQ箱型标准报价`, key: 'internetsellprice3', disabled: false },
			{ label: `45'HQ箱型底价`, key: 'baseprice4', disabled: false },
			{ label: `45'HQ箱型成本价`, key: 'sellprice4', disabled: false },
			{ label: `45'HQ箱型报价`, key: 'internetsellprice4', disabled: false },
			{ label: '限重', key: 'volumerange', disabled: false },
			{ label: '佣金', key: 'rakeoff', disabled: false },
			{ label: '附加费', key: 'plusfeedesc', disabled: false },
			{ label: '联系方式', key: 'linkinfo', disabled: false },
			{ label: '外部备注', key: 'remark', disabled: false },
			{ label: '内部备注', key: 'employeeRemark', disabled: false },
			{ label: '出单方式', key: 'sendtype', disabled: false },
			{ label: '停航', key: 'suspendShippingService', disabled: false },
			{ label: '开航日', key: 'sailingDate', disabled: false },
			{ label: '预计上涨', key: 'expectedRise', disabled: false },
			{ label: '承运人航线', key: 'carrierRoute', disabled: false },
			{ label: '驳船航程', key: 'transportDays', disabled: false },
			{ label: '驳船有效期(开始)', key: 'effectiveDate', disabled: false },
			{ label: '驳船有效期(结束)', key: 'invalidDate', disabled: false },
			{ label: '运输条款', key: 'transitClause', disabled: false },
			{ label: '中转航程', key: 'transferSailtime', disabled: false },
			{ label: '中转方式', key: 'inlandTransferMode', disabled: false },
			{ label: 'ALL IN', key: 'transferFeeMode', disabled: false },
			{ label: '拿价人', key: 'priceHolder', disabled: false },
			{ label: '拿价公司', key: 'priceHolderOrgName', disabled: false },
			{ label: '截文件', key: 'cutTime', disabled: false },
			{ label: '免用免堆', key: 'freeTime', disabled: false },
			{ label: '驳船船期', key: 'bargeCycle', disabled: false },
			{ label: '中转港2', key: 'transferport2', disabled: false },
			{ label: '中转港3', key: 'transferport3', disabled: false },
			{ label: '附加费说明', key: 'addfee', disabled: false },
			{ label: '提单类型', key: 'billType', disabled: false },
			{ label: '收货指引', key: 'businessRemark', disabled: false },
			{ label: '修改人', key: 'modifyby', disabled: false },
		]
	},
	overseasFreight:{
		unReadCount:''
	},
	// 运价查询自定义表头
	knowledgeBaseClassList: {
		// 默认表头
		defaultColumns: [
			'className',
			'fileNos',
			'status',
			'createdName',
			'createdTime',
			'updatedName',
			'updatedTime'
		],
		// 自定义表头特殊处理
		specialColumns: {},
		// 表头库
		columnsBase: [
			{ label: 'className', key: 'className', disabled: false },
			{ label: 'fileNos', key: 'fileNos', disabled: false },
			{ label: 'status', key: 'status', disabled: false },
			{ label: 'createdName', key: 'createdName', disabled: false },
			{ label: 'createdTime', key: 'createdTime', disabled: false },
			{ label: 'updatedName', key: 'updatedName', disabled: false },
			{ label: 'updatedTime', key: 'updatedTime', disabled: false },
		]
	},
	// 询价文本框是否限制只能输入英文、数字、特殊符号；
	overseasFreightIsOnlyEnchars: false
}

const mutations = {
	setOverseasFreightIsOnlyEnchars(state, value) {
		if(!value || value === 'Y'){
			state.overseasFreightIsOnlyEnchars = true
		}else {
			state.overseasFreightIsOnlyEnchars = false
		}
		
	},
	getValueByKeys(state, value) {
		if(value>0){
			if(value>99){
				state.overseasFreight.unReadCount= '99+'
			}else{
				state.overseasFreight.unReadCount= value
			}
		}else{
			state.overseasFreight.unReadCount= ''
		}
	},
}

const actions = {
	// 询价文本框是否限制只能输入英文、数字、特殊符号；
	setPolAllowFinCloseInput(context) {
		orderConfigString({ key: 'ENQUIRY_ONLY_EN_INPUT' }).then(res => {
			console.log('询价文本框是否限制只能输入英文、数字、特殊符号',res.data)
			context.commit('setOverseasFreightIsOnlyEnchars', res.data)
		})
	},
	// 请求下载blob流文件
	downloadBlobFile({ state }, { uri, params }) {
		return new Promise((resolve, reject) => {
			let token = getToken()
			Object.assign(params, {
				fromSystem: 'web_H5',
				toSystem: 'mng_charge_server',
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
	// 海外询价未读信息
	getValueByKeys(context) {
		unreadCount()
			.then( res=> {
				console.log(res.data)
				context.commit('getValueByKeys', res.data)
			})
			.catch(error => {
			})
	},
}

export default {
	namespaced: true,
	state,
	mutations,
	actions
}
