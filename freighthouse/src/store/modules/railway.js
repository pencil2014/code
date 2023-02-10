import axios from 'axios'
import store from '@/store'
import { MessageBox, Message } from 'element-ui'
import { parseTime, randomString, isArray } from '@/utils'
import { getDictLabel } from '@/utils/tools'
import { getToken } from '@/utils/auth'
import ColumnTip from '@/views/railway/order/components/columnTip.vue'
import CustNameShow from '@/views/order/order/components/custNameShow.vue'
import CloumnFileShow from '@/views/railway/order/components/CloumnFileShow.vue'
import { basePortListByCodes } from '@/api/base'
import { getValueByKeys } from '@/api/order/list'
import ColumnJointTip from '@/views/order/order/components/columnJointTip.vue'

const orderList = {
	// 默认表头
	defaultColumns: [
		'orderNo',
		'bdEmployeeName',
		'bdDeptName',
		'orderStatus',
		'bkgStatus',
		'custid',
		'custName',
		'intrustRemark',
		'auditRemark',
		'bkgRemark',
		'prefinCloseStatus',
		'finCloseStatus',
		'businessType',
		'createdTime',
		'bizDate',
		'custid',
		'serviceType',
		'bkgAgentSupplierId',
		'porPortCode',
		'polPortCode',
		'podPortCode',
		'lclStatus',
		'fclOrderNo',
		'vessel',
		'voyage',
		'cyCutOff',
		'carrierLineName',
		'containerInfo',
		'cn',
		'sn',
		'blType',
		'blNo',
		'receiveFeeCleanStatus',
		'payFeeCleanStatus',
		'receiveInvoiceStatus',
		'payFeeApplyStatus',
		'bargeEtdTime',
		'tdTime',
		'destinationArea',
		'siCutOff'
	],
	// 自定义表头特殊处理
	specialColumns: {
		porPortCode: ['porPortCode', 'porPortName'],
		polPortCode: ['polPortCode', 'polPortName'],
		transitPortCode: ['transitPortCode', 'transitPortName'],
		podPortCode: ['podPortCode', 'podPortName'],
		unloadingPortCode: ['unloadingPortCode', 'unloadingPortName']
	},
	// 表头库
	columnsBase(handleOrderNoInfo) {
		return [
			{
				label: '工作号',
				key: 'orderNo',
				prop: 'orderNo',
				minWidth: '200',
				disabled: false,
				type: 'text',
				align: 'right',
				popoverComponent: ColumnTip,
				method: row => {
					handleOrderNoInfo(row)
				}
			},
			{ label: '销售', key: 'bdEmployeeName', prop: 'bdEmployeeName', disabled: false, minWidth: '120' },
			{ label: '商务', key: 'bdEmployeeName', prop: 'bdEmployeeName', disabled: false, minWidth: '120' },
			{ label: '操作', key: 'bdEmployeeName', prop: 'bdEmployeeName', disabled: false, minWidth: '120' },
			{
				label: '订单状态',
				key: 'orderStatus',
				prop: 'orderStatus',
				disabled: false,
				minWidth: '80',
				formatter: (row, column) => {
					let result = getDictLabel('orderStatus', row.orderStatus)
					let color = ''
					// 操作中状态特殊处理
					if (row.orderStatus === 'pass' && row.isOpHandle === 'y') {
						result = '操作中'
					}
					// 待审核
					if (['submit'].includes(row.orderStatus)) {
						color = 'yellow'
					}
					// 审核通过，已完成
					if (row.orderStatus === 'complete' || (row.orderStatus === 'pass' && row.isOpHandle !== 'y')) {
						color = 'green'
					}
					//已拒绝，已取消，已终止
					if (['refuse', 'cancel', 'break'].includes(row.orderStatus)) {
						color = 'red'
					}
					return `<span class="${color}">${result}</span>`
				}
			},
			{
				label: '订舱状态',
				key: 'bkgStatus',
				prop: 'bkgStatus',
				disabled: false,
				minWidth: '80',
				formatter: (row, column) => {
					let str = ''
					str = getDictLabel('bkgStatus', row.bkgStatus)
					if (['draft', 'submit'].includes(row.bkgStatus)) str = ''
					return str
				}
			},
			{ label: '委托单位', key: 'custName', prop: 'custName', disabled: false, minWidth: '180' },

			{ label: '委托备注', key: 'intrustRemark', prop: 'intrustRemark', disabled: false, minWidth: '150' },
			{ label: '商务备注', key: 'auditRemark', prop: 'auditRemark', disabled: false, minWidth: '150' },
			{ label: '订舱备注', key: 'bkgRemark', prop: 'bkgRemark', disabled: false, minWidth: '150' },
			{
				label: '预关账状态',
				key: 'prefinCloseStatus',
				prop: 'prefinCloseStatus',
				minWidth: '100',
				disabled: false,
				formatter: (row, column) => {
					return row.prefinCloseStatus === 'yes' ? '已关账' : '未关账'
				}
			},
			{
				label: '关账状态',
				key: 'finCloseStatus',
				prop: 'finCloseStatus',
				disabled: false,
				minWidth: '80',
				formatter: (row, column) => {
					return row.finCloseStatus === 'yes' ? '已关账' : '未关账'
				}
			},

			{
				label: '业务类型',
				key: 'businessType',
				prop: 'businessType',
				disabled: false,
				width: 100,
				minWidth: '100',
				formatter: (row, column) => {
					return row.businessTypeCn
				}
			},
			{ label: '订单创建时间', key: 'createdTime', prop: 'createdTime', minWidth: '150', disabled: false, sortable: 'custom' },
			{ label: '业务日期', key: 'bizDate', prop: 'bizDate', minWidth: '100', disabled: false, sortable: 'custom' },
			{ label: '入仓单号', key: 'custid', prop: 'custid', minWidth: '100', disabled: false },
			{ label: '入仓编号', key: 'custid', prop: 'custid', minWidth: '100', disabled: false },
			{
				label: '服务类型',
				key: 'serviceType',
				prop: 'serviceType',
				disabled: false,
				minWidth: '150',
				formatter: (row, column) => {
					return row.serviceTypeName
				}
			},
			{ label: '订舱代理', key: 'bkgAgentSupplierId', prop: 'bkgAgentSupplierId', disabled: false },
			{
				label: '收货地',
				key: 'porPortCode',
				prop: 'porPortCode',
				disabled: false,
				minWidth: '150',
				formatter: (row, column) => {
					return row.porPortName
				}
			},
			{
				label: '起运站',
				key: 'polPortCode',
				prop: 'polPortCode',
				minWidth: '150',
				disabled: false,
				formatter: (row, column) => {
					return row.polPortName
				}
			},
			{
				label: '目的站',
				key: 'podPortCode',
				prop: 'podPortCode',
				minWidth: '150',
				disabled: false,
				formatter: (row, column) => {
					return row.podPortName
				}
			},
			{
				label: '最终目的站',
				key: 'podPortCode',
				prop: 'podPortCode',
				minWidth: '150',
				disabled: false,
				formatter: (row, column) => {
					return row.podPortName
				}
			},
			{
				label: '是否自拼',
				key: 'lclStatus',
				prop: 'lclStatus',
				minWidth: '80',
				disabled: false,
				formatter: (row, column) => {
					return getDictLabel('lclStatus', row.lclStatus)
				}
			},
			{
				label: '拼箱状态',
				key: 'lclStatus',
				prop: 'lclStatus',
				minWidth: '80',
				disabled: false,
				formatter: (row, column) => {
					return getDictLabel('lclStatus', row.lclStatus)
				}
			},
			{ label: '拼箱后的整柜单号', key: 'fclOrderNo', prop: 'fclOrderNo', minWidth: '130', disabled: false },
			{ label: '班列', key: 'vessel', prop: 'vessel', disabled: false, minWidth: '120' },
			{ label: '班次', key: 'voyage', prop: 'voyage', disabled: false, minWidth: '120' },
			{ label: '截仓时间', key: 'cyCutOff', prop: 'cyCutOff', disabled: false, sortable: 'custom', minWidth: '120' },
			{ label: '系统航线', key: 'carrierLineName', prop: 'carrierLineName', disabled: false, minWidth: '120' },
			{ label: '箱型箱量', key: 'containerInfo', prop: 'containerInfo', disabled: false, minWidth: '150' },
			{ label: '箱号', key: 'cn', prop: 'cn', disabled: false, minWidth: '150' },
			{ label: '封号', key: 'sn', prop: 'sn', disabled: false, minWidth: '150' },
			{
				label: '提单类型',
				key: 'blType',
				prop: 'blType',
				disabled: false,
				minWidth: '100',
				formatter: (row, column) => {
					return getDictLabel('blType', row.blType)
				}
			},
			{ label: '提单号', key: 'blNo', prop: 'blNo', disabled: false },
			{
				label: '应收费用结清状态',
				key: 'receiveFeeCleanStatus',
				prop: 'receiveFeeCleanStatus',
				disabled: false,
				minWidth: '140',
				formatter: (row, column) => {
					return getDictLabel('feeSettleStatus', row.receiveFeeCleanStatus)
				}
			},
			{
				label: '应付费用结清状态',
				key: 'payFeeCleanStatus',
				prop: 'payFeeCleanStatus',
				disabled: false,
				minWidth: '140',
				formatter: (row, column) => {
					return getDictLabel('feeSettleStatus', row.payFeeCleanStatus)
				}
			},
			// { label: '应收发票状态', key: 'receiveInvoiceStatus', prop: 'receiveInvoiceStatus', disabled: false, minWidth: '120' },
			{ label: '请款状态', key: 'payFeeApplyStatus', prop: 'payFeeApplyStatus', disabled: false, minWidth: '100' },
			{ label: '贸易条款', key: 'payFeeApplyStatus', prop: 'payFeeApplyStatus', disabled: false, minWidth: '100' },
			{ label: '运输条款', key: 'payFeeApplyStatus', prop: 'payFeeApplyStatus', disabled: false, minWidth: '100' },
			{ label: '预计发车时间', key: 'bargeEtdTime', prop: 'bargeEtdTime', disabled: false, sortable: 'custom', minWidth: '150' },
			{ label: '实际发车时间', key: 'tdTime', prop: 'tdTime', disabled: false, sortable: 'custom', minWidth: '150' },
			{ label: '出境口岸', key: 'destinationArea', prop: 'destinationArea', minWidth: '150', disabled: false },
			{ label: '货好时间', key: 'siCutOff', prop: 'siCutOff', disabled: false, sortable: 'custom', minWidth: '150' }
		]
	}
}
const jointList = {
	// 默认表头
	defaultColumns: [
		'jointNo',
		'orderNo',
		'bdEmployeeName',
		'bdDeptName',
		'orderStatus',
		'bkgStatus',
		'mainCompDeptCode',
		'mainCompDeptName',
		'intrustRemark',
		'auditRemark',
		'bkgRemark',
		'prefinCloseStatus',
		'finCloseStatus',
		'businessType',
		'createdTime',
		'bizDate',
		'serviceType',
		'bkgAgentSupplierId',
		'porPortCode',
		'polPortCode',
		'podPortCode',
		'lclStatus',
		'fclOrderNo',
		'vessel',
		'voyage',
		'cyCutOff',
		'carrierLineName',
		'containerInfo',
		'cn',
		'sn',
		'blType',
		'blNo',
		'receiveFeeCleanStatus',
		'payFeeCleanStatus',
		'receiveInvoiceStatus',
		'payFeeApplyStatus',
		'bargeEtdTime',
		'tdTime',
		'destinationArea',
		'siCutOff'
	],
	// 自定义表头特殊处理
	specialColumns: {
		porPortCode: ['porPortCode', 'porPortName'],
		polPortCode: ['polPortCode', 'polPortName'],
		transitPortCode: ['transitPortCode', 'transitPortName'],
		podPortCode: ['podPortCode', 'podPortName'],
		unloadingPortCode: ['unloadingPortCode', 'unloadingPortName']
	},
	// 表头库
	columnsBase(handleOrderNoInfo) {
		return [
			{
				label: '协同单号',
				key: 'jointNo',
				prop: 'jointNo',
				width: '220',
				minWidth: '220',
				disabled: false,
				// fixed: true,
				type: 'text',
				align: 'left',
				popoverComponent: ColumnJointTip
			},
			{
				label: '工作号',
				key: 'orderNo',
				prop: 'orderNo',
				minWidth: '200',
				disabled: false,
				type: 'text',
				align: 'right',
				popoverComponent: ColumnTip,
				method: row => {
					handleOrderNoInfo(row)
				}
			},
			{ label: '销售', key: 'bdEmployeeName', prop: 'bdEmployeeName', disabled: false, minWidth: '120' },
			{ label: '商务', key: 'bdEmployeeName', prop: 'bdEmployeeName', disabled: false, minWidth: '120' },
			{ label: '操作', key: 'bdEmployeeName', prop: 'bdEmployeeName', disabled: false, minWidth: '120' },
			{
				label: '订单状态',
				key: 'orderStatus',
				prop: 'orderStatus',
				disabled: false,
				minWidth: '80',
				formatter: (row, column) => {
					let result = getDictLabel('orderStatus', row.orderStatus)
					let color = ''
					// 操作中状态特殊处理
					if (row.orderStatus === 'pass' && row.isOpHandle === 'y') {
						result = '操作中'
					}
					// 待审核
					if (['submit'].includes(row.orderStatus)) {
						color = 'yellow'
					}
					// 审核通过，已完成
					if (row.orderStatus === 'complete' || (row.orderStatus === 'pass' && row.isOpHandle !== 'y')) {
						color = 'green'
					}
					//已拒绝，已取消，已终止
					if (['refuse', 'cancel', 'break'].includes(row.orderStatus)) {
						color = 'red'
					}
					return `<span class="${color}">${result}</span>`
				}
			},
			{
				label: '订舱状态',
				key: 'bkgStatus',
				prop: 'bkgStatus',
				disabled: false,
				minWidth: '80',
				formatter: (row, column) => {
					let str = ''
					str = getDictLabel('bkgStatus', row.bkgStatus)
					if (['draft', 'submit'].includes(row.bkgStatus)) str = ''
					return str
				}
			},
			{ label: '委托单位', key: 'mainCompDeptName', prop: 'mainCompDeptName', disabled: false, minWidth: '180' },

			{ label: '委托备注', key: 'intrustRemark', prop: 'intrustRemark', disabled: false, minWidth: '150' },
			{ label: '商务备注', key: 'auditRemark', prop: 'auditRemark', disabled: false, minWidth: '150' },
			{ label: '订舱备注', key: 'bkgRemark', prop: 'bkgRemark', disabled: false, minWidth: '150' },
			{
				label: '预关账状态',
				key: 'prefinCloseStatus',
				prop: 'prefinCloseStatus',
				minWidth: '100',
				disabled: false,
				formatter: (row, column) => {
					return row.prefinCloseStatus === 'yes' ? '已关账' : '未关账'
				}
			},
			{
				label: '关账状态',
				key: 'finCloseStatus',
				prop: 'finCloseStatus',
				disabled: false,
				minWidth: '80',
				formatter: (row, column) => {
					return row.finCloseStatus === 'yes' ? '已关账' : '未关账'
				}
			},

			{
				label: '业务类型',
				key: 'businessType',
				prop: 'businessType',
				disabled: false,
				width: 100,
				minWidth: '100',
				formatter: (row, column) => {
					return row.businessTypeCn
				}
			},
			{ label: '订单创建时间', key: 'createdTime', prop: 'createdTime', minWidth: '150', disabled: false, sortable: 'custom' },
			{ label: '业务日期', key: 'bizDate', prop: 'bizDate', minWidth: '100', disabled: false, sortable: 'custom' },
			{ label: '入仓单号', key: 'custid', prop: 'custid', minWidth: '100', disabled: false },
			{ label: '入仓编号', key: 'custid', prop: 'custid', minWidth: '100', disabled: false },
			{
				label: '服务类型',
				key: 'serviceType',
				prop: 'serviceType',
				disabled: false,
				minWidth: '150',
				formatter: (row, column) => {
					return row.serviceTypeName
				}
			},
			{ label: '订舱代理', key: 'bkgAgentSupplierId', prop: 'bkgAgentSupplierId', disabled: false },
			{
				label: '收货地',
				key: 'porPortCode',
				prop: 'porPortCode',
				disabled: false,
				minWidth: '150',
				formatter: (row, column) => {
					return row.porPortName
				}
			},
			{
				label: '起运站',
				key: 'polPortCode',
				prop: 'polPortCode',
				minWidth: '150',
				disabled: false,
				formatter: (row, column) => {
					return row.polPortName
				}
			},
			{
				label: '目的站',
				key: 'podPortCode',
				prop: 'podPortCode',
				minWidth: '150',
				disabled: false,
				formatter: (row, column) => {
					return row.podPortName
				}
			},
			{
				label: '最终目的站',
				key: 'podPortCode',
				prop: 'podPortCode',
				minWidth: '150',
				disabled: false,
				formatter: (row, column) => {
					return row.podPortName
				}
			},
			{
				label: '是否自拼',
				key: 'lclStatus',
				prop: 'lclStatus',
				minWidth: '80',
				disabled: false,
				formatter: (row, column) => {
					return getDictLabel('lclStatus', row.lclStatus)
				}
			},
			{
				label: '拼箱状态',
				key: 'lclStatus',
				prop: 'lclStatus',
				minWidth: '80',
				disabled: false,
				formatter: (row, column) => {
					return getDictLabel('lclStatus', row.lclStatus)
				}
			},
			{ label: '拼箱后的整柜单号', key: 'fclOrderNo', prop: 'fclOrderNo', minWidth: '130', disabled: false },
			{ label: '班列', key: 'vessel', prop: 'vessel', disabled: false, minWidth: '120' },
			{ label: '班次', key: 'voyage', prop: 'voyage', disabled: false, minWidth: '120' },
			{ label: '截仓时间', key: 'cyCutOff', prop: 'cyCutOff', disabled: false, sortable: 'custom', minWidth: '120' },
			{ label: '系统航线', key: 'carrierLineName', prop: 'carrierLineName', disabled: false, minWidth: '120' },
			{ label: '箱型箱量', key: 'containerInfo', prop: 'containerInfo', disabled: false, minWidth: '150' },
			{ label: '箱号', key: 'cn', prop: 'cn', disabled: false, minWidth: '150' },
			{ label: '封号', key: 'sn', prop: 'sn', disabled: false, minWidth: '150' },
			{
				label: '提单类型',
				key: 'blType',
				prop: 'blType',
				disabled: false,
				minWidth: '100',
				formatter: (row, column) => {
					return getDictLabel('blType', row.blType)
				}
			},
			{ label: '提单号', key: 'blNo', prop: 'blNo', disabled: false },
			{
				label: '应收费用结清状态',
				key: 'receiveFeeCleanStatus',
				prop: 'receiveFeeCleanStatus',
				disabled: false,
				minWidth: '140',
				formatter: (row, column) => {
					return getDictLabel('feeSettleStatus', row.receiveFeeCleanStatus)
				}
			},
			{
				label: '应付费用结清状态',
				key: 'payFeeCleanStatus',
				prop: 'payFeeCleanStatus',
				disabled: false,
				minWidth: '140',
				formatter: (row, column) => {
					return getDictLabel('feeSettleStatus', row.payFeeCleanStatus)
				}
			},
			// { label: '应收发票状态', key: 'receiveInvoiceStatus', prop: 'receiveInvoiceStatus', disabled: false, minWidth: '120' },
			{ label: '请款状态', key: 'payFeeApplyStatus', prop: 'payFeeApplyStatus', disabled: false, minWidth: '100' },
			{ label: '贸易条款', key: 'payFeeApplyStatus', prop: 'payFeeApplyStatus', disabled: false, minWidth: '100' },
			{ label: '运输条款', key: 'payFeeApplyStatus', prop: 'payFeeApplyStatus', disabled: false, minWidth: '100' },
			{ label: '预计发车时间', key: 'bargeEtdTime', prop: 'bargeEtdTime', disabled: false, sortable: 'custom', minWidth: '150' },
			{ label: '实际发车时间', key: 'tdTime', prop: 'tdTime', disabled: false, sortable: 'custom', minWidth: '150' },
			{ label: '出境口岸', key: 'destinationArea', prop: 'destinationArea', minWidth: '150', disabled: false },
			{ label: '货好时间', key: 'siCutOff', prop: 'siCutOff', disabled: false, sortable: 'custom', minWidth: '150' }
		]
	}
}

const state = {
	isOrderFeeCount: false, // 是否有费用
	isCanModify: true,
	overseasTipMsg: '',
	orderInfoDataObj: {},
	ordDetRole: '',
	userEditRoles: [],
	railCurRole: '',
	isSoUpdate: 'N',
	dropBdCheckStatus: null,
	dropOpStatus: null,
	orderNo: '',
	custid: '',
	custName: '',
	bkgStatus: '',
	serviceList: [],
	serviceInfoList: [], // 服务项信息，code,id,申请取消状态等
	serviceCode: '', // 服务项code
	orderInfoData: {},
	allServicesMenu: [
		{
			cname: '目的站委托清关',
			ename: 'Commissioned clearance',
			component: 'RailPodCommClearance',
			code: 'pod_comm_clearance'
		},
		{
			cname: '目的站拖柜派送',
			ename: 'FCL delivery',
			component: 'RailPodFclDelivery',
			code: 'pod_fcl_delivery'
		},
		{
			cname: '目的站散车派送',
			ename: 'LTL delivery',
			component: 'RailPodLtlDelivery',
			code: 'pod_ltl_delivery'
		},
		{ cname: '熏蒸', ename: 'fumigation', code: 'fume', component: 'RailFume' },
		{
			cname: '目的站仓储',
			ename: 'POD Warehousing',
			component: 'RailPodWarehouseIng',
			child: [
				{
					cname: '目的站仓储',
					ename: 'warehousing',
					code: 'pod_warehouse',
					component: 'PodWarehouse'
				}
			]
		}
	],
	// 铁路
	orderList: {
		defaultColumns: orderList.defaultColumns,
		specialColumns: orderList.specialColumns,
		columnsBase: orderList.columnsBase,
		createItem: {
			bkgEmployeeId: '',
			orderNo: '', // 工作号
			businessType: '', // 业务类型
			serviceType: '', // 服务类型
			submitType: '', // 保存提交类型（draft、audit）

			serviceList: [], // 服务项
			main: {
				auditRemark: '',
				intrustRemark: '',
				overseasServiceType: '',
				overseasCompanyCode: '',
				overseasCompanyName: '',
				overseasFirstAgentId: null,
				overseasFirstAgentName: '',
				overseasSecondAgentId: null,
				overseasSecondAgentName: ''
			},
			overseasAgentIds: [],
			// 站点信息
			rail: {
				bkgStatus: 'INIT',
				bdRemark: '', // 备注
				vesselVoyage: '',
				porPortCode: '',
				polPortCode: '',
				podPortCode: '',
				podCountryCode: '',
				finalPodPortCode: '',
				outboundPortCode: '',
				outboundPortName: '',
				sysLineCode: '',
				sysLineName: '',
				bookFileNo: '',
				etdTime: '',
				tdTime: '',
				inCutOffTime: '',
				blType: '',
				blMode: '',
				payMode: '',
				bkgAgentSupplierId: '',
				isExternal: '',
				bkgRemark: ''
			},
			shipperList: [
				{
					shipperCustid: '',
					shipperCustName: '',
					quantity: '',
					weight: '',
					volume: '',
					cargoList: [
						{
							oid: '',
							commodityTypeCode: '',
							hscode: '',
							cname: '',
							ename: '',
							boxRemark: ''
						}
					]
				}
			],
			containerList: [
				{
					oid: '',
					containerType: '',
					cn: '',
					sn: '',
					po: '',
					packageInfo: '',
					quantity: '',
					weight: '',
					volume: '',
					unitWeight: ''
				}
			],

			transport: {
				// 货运信息
				tradeTermsCode: '', // 贸易条款
				transportTerm: '', // 运输条款
				cargoReadyTime: '',
				customsType: '',
				shipper: '', // 发货人
				consignee: '', // 收货人
				notify1: '', // 通知人1
				notify2: '', // 通知人2
				notify3: '' // 通知人3
			},
			workAssign: [] // 工作项分配jobCode:工作岗位code,employeeId:员工id
		},
		opCargoItem: {
			oid: '',
			quantity: '件数',
			packageInfo: '包装',
			shortCname: '货品简称',
			mark: '唛头',
			shipperCustid: '发货单位',
			commodityDesc: '货品描述',
			volume: '总体积',
			weight: '总毛重',
			length: '长',
			width: '宽',
			height: '高'
		},
		opSizeItem: {
			sizeBefore: '',
			sizeAfter: '',
			sizeLeft: '',
			sizeRight: ''
		},
		finCloseStatus: [
			{ label: '未关账', value: 'no' },
			{ label: '已关账', value: 'yes' }
		],
		// 订单列表所有角色集合
		roleCodesOptions: [
			{ label: '业务', value: 'bd' },
			{ label: '操作', value: 'op' },
			{ label: '文件', value: 'doc' },
			// {label: '放货', value: 'rc'},
			{ label: '财务', value: 'ac' },
			{ label: '商务', value: 'pricing' }
		],
		// 订单详情可写入角色集合
		allEditRoleArr: ['bd', 'obd', 'asst', 'op', 'op_truck', 'doc', 'ac', 'ecs', 'epricing'],
		// 登录用户具有的可写入角色集合，含有两种以上需要做角色切换
		userEditRoles: [],
		ordDetRole: '' // 进入订单详情后设置的当前角色
	},
	// 铁路协同列表
	jointList: {
		defaultColumns: jointList.defaultColumns,
		specialColumns: jointList.specialColumns,
		columnsBase: jointList.columnsBase,
		createItem: {
			bkgEmployeeId: '',
			orderNo: '', // 工作号
			businessType: '', // 业务类型
			serviceType: '', // 服务类型
			submitType: '', // 保存提交类型（draft、audit）

			serviceList: [], // 服务项
			main: {
				auditRemark: '',
				intrustRemark: ''
			},
			// 站点信息
			rail: {
				bkgStatus: 'INIT',
				bdRemark: '', // 备注
				vesselVoyage: '',
				porPortCode: '',
				polPortCode: '',
				podPortCode: '',
				podCountryCode: '',
				finalPodPortCode: '',
				outboundPortCode: '',
				outboundPortName: '',
				sysLineCode: '',
				sysLineName: '',
				bookFileNo: '',
				etdTime: '',
				tdTime: '',
				inCutOffTime: '',
				blType: '',
				blMode: '',
				payMode: '',
				bkgAgentSupplierId: '',
				isExternal: '',
				bkgRemark: ''
			},
			shipperList: [
				{
					shipperCustid: '',
					shipperCustName: '',
					quantity: '',
					weight: '',
					volume: '',
					cargoList: [
						{
							oid: '',
							commodityTypeCode: '',
							hscode: '',
							cname: '',
							ename: '',
							boxRemark: ''
						}
					]
				}
			],
			containerList: [
				{
					oid: '',
					containerType: '',
					cn: '',
					sn: '',
					po: '',
					packageInfo: '',
					quantity: '',
					weight: '',
					volume: '',
					unitWeight: ''
				}
			],

			transport: {
				// 货运信息
				tradeTermsCode: '', // 贸易条款
				transportTerm: '', // 运输条款
				cargoReadyTime: '',
				customsType: '',
				shipper: '', // 发货人
				consignee: '', // 收货人
				notify1: '', // 通知人1
				notify2: '', // 通知人2
				notify3: '' // 通知人3
			},
			workAssign: [] // 工作项分配jobCode:工作岗位code,employeeId:员工id
		},
		opCargoItem: {
			oid: '',
			quantity: '件数',
			packageInfo: '包装',
			shortCname: '货品简称',
			mark: '唛头',
			shipperCustid: '发货单位',
			commodityDesc: '货品描述',
			volume: '总体积',
			weight: '总毛重',
			length: '长',
			width: '宽',
			height: '高'
		},
		opSizeItem: {
			sizeBefore: '',
			sizeAfter: '',
			sizeLeft: '',
			sizeRight: ''
		},
		finCloseStatus: [
			{ label: '未关账', value: 'no' },
			{ label: '已关账', value: 'yes' }
		],
		// 订单列表所有角色集合
		roleCodesOptions: [
			{ label: '业务', value: 'bd' },
			{ label: '操作', value: 'op' },
			{ label: '文件', value: 'doc' },
			// {label: '放货', value: 'rc'},
			{ label: '财务', value: 'ac' },
			{ label: '商务', value: 'pricing' }
		],
		// 订单详情可写入角色集合
		allEditRoleArr: ['bd', 'obd', 'asst', 'op', 'op_truck', 'doc', 'ac'],
		// 登录用户具有的可写入角色集合，含有两种以上需要做角色切换
		userEditRoles: [],
		ordDetRole: '' // 进入订单详情后设置的当前角色
	},

	// 散货订仓列表
	lclRelateList: {
		defaultColumns: ['orderNo', 'hblNo', 'custName', 'porPortName', 'polPortCode', 'podPortCode', 'bdEmployeeId', 'createdTime', 'bizDate', 'quantity', 'weight', 'volume', 'hscode', 'cname', 'ename'],
		specialColumns: [],
		// 表头库
		columnsBase(handleOrderNoInfo) {
			return [
				{
					label: '工作号',
					key: 'orderNo',
					prop: 'orderNo',
					width: '180',
					disabled: false,
					fixed: true,
					type: 'text',
					align: 'right',
					formatter: (row, column) => {
						let str = ''
						if (row.orderStatus === 'cancel' || row.orderStatus === 'break') str = `<i class="icon-tip icon-cancel">取</i>`
						return `<el-button type="text" class="underline">${str}${row.orderNo}</el-button>`
					},
					method: (index, row) => {
						handleOrderNoInfo(index, row)
					}
				},
				{ label: 'HBL单号', key: 'hblNo', prop: 'hblNo', disabled: false, width: '150' },
				{ label: '委托单位', key: 'custName', prop: 'custName', disabled: false, width: '150' },
				{
					label: '收货站',
					key: 'porPortName',
					prop: 'porPortName',
					width: '150',
					disabled: false,
					formatter: (row, column) => {
						return row.porPortName
					}
				},
				{
					label: '起运站',
					key: 'polPortCode',
					prop: 'polPortCode',
					width: '150',
					disabled: false,
					formatter: (row, column) => {
						return row.polPortName
					}
				},
				{
					label: '目的地',
					key: 'podPortCode',
					prop: 'podPortCode',
					width: '150',
					disabled: false,
					formatter: (row, column) => {
						return row.podPortName
					}
				},
				{
					label: '销售',
					key: 'bdEmployeeId',
					prop: 'bdEmployeeId',
					disabled: false,
					formatter: (row, column) => {
						return row.bdEmployeeName
					},
					width: '150'
				},
				{ label: '订单创建时间', key: 'createdTime', prop: 'createdTime', width: '150', disabled: false, sortable: 'custom' },
				{ label: '业务日期', key: 'bizDate', prop: 'bizDate', width: '150', disabled: false, sortable: 'custom' },
				{ label: '总件数', key: 'quantity', prop: 'quantity', disabled: false, width: '150' },
				{ label: '总毛重', key: 'weight', prop: 'weight', disabled: false, width: '150' },
				{ label: '总体积', key: 'volume', prop: 'volume', disabled: false, width: '150' },
				{ label: 'HSCODE', key: 'hscode', prop: 'hscode', disabled: false, width: '150' },
				{ label: '中文品名', key: 'cname', prop: 'cname', disabled: false, width: '150' },
				{ label: '英文品名', key: 'ename', prop: 'ename', disabled: false, width: '150' }
			].map(item => {
				return { ...item, minWidth: item.width }
			})
		}
	},
	// mbl取单列表
	blTakeList: {
		// 默认表头
		defaultColumns: [
			'cscEmployeeName',
			'obdEmployeeName',
			'bdEmployeeName',
			'orderNo',
			'blMode',
			'takeExpTime',
			'payExpTime',
			'blNo',
			'blStatus',
			'takeStatus',
			'etdTime',
			'tdTime',
			'etaTime',
			'custName',
			'shipCarrierCode',
			'bkgAgentSupplierName',
			'takeEmployeeName',
			'takeTime',
			'opEmployeeName',
			'docEmployeeName',
			'rcEmployeeName',
			'cancelReason',
			'cancelRemark',
			'cancelTime',
			'tcEmployeeName',
			'tcDeptName',
			'placeCompName',
			'transferStatus'
		],
		// 自定义表头特殊处理
		specialColumns: {},
		// 表头库
		columnsBase(handleOrderNoInfo) {
			return [
				{ label: '销售', key: 'bdEmployeeName', prop: 'bdEmployeeName', disabled: false, width: '100' },
				{
					label: '销售助理',
					key: 'obdEmployeeName',
					prop: 'obdEmployeeName',
					disabled: false,
					width: '80'
				},
				{ label: '单证', key: 'cscEmployeeName', prop: 'cscEmployeeName', disabled: false, width: 120 },
				{
					label: '工作号',
					key: 'orderNo',
					prop: 'orderNo',
					width: '150',
					disabled: false,
					// fixed: true,
					type: 'text',
					popoverComponent: ColumnTip,
					// formatter: (row, column) => {
					// 	return `<el-button type="text" class="underline">${row.orderNo}</el-button>`
					// },
					method: row => {
						handleOrderNoInfo(row)
					}
				},
				{
					label: '取单客服(MBL)',
					key: 'tcEmployeeName',
					prop: 'tcEmployeeName',
					disabled: false,
					width: '110'
				},
				{ label: '取单客服(MBL)部门', key: 'tcDeptName', prop: 'tcDeptName', disabled: false, width: '130' },
				{
					label: '出单方式',
					key: 'blMode',
					prop: 'blMode',
					disabled: false,
					width: '70',
					formatter: (row, column) => {
						return getDictLabel('blMode', row.blMode)
					}
				},
				{
					label: '提单号',
					key: 'blNo',
					prop: 'blNo',
					// fixed: true,
					disabled: false,
					align: 'left',
					width: '150',
					formatter: (row, column) => {
						let str = ''
						let blTypeStr = row.blType === 'hbl' ? `<i class="icon-hbl2">H</i>` : row.blType === 'mbl' ? `<i class="icon-hbl2">M</i>` : ''
						if (row.isCancel === 'y') str = `<i class="icon-tip icon-cancel">撤</i>`
						return `${str}${blTypeStr}${row.blNo}`
					}
				},

				{
					label: '取单状态',
					key: 'takeStatus',
					prop: 'takeStatus',
					disabled: false,
					width: 70,
					formatter: (row, column) => {
						return row.takeStatus === 'finish' ? '已取单' : '待取单'
					}
				},
				{
					label: '提单状态',
					key: 'blStatus',
					prop: 'blStatus',
					width: 100,
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('woBlStatus', row.blStatus)
					}
				},
				{ label: '预计出发时间', key: 'etdTime', prop: 'etdTime', disabled: false, width: 120 },
				{ label: '取单期限', key: 'takeExpTime', prop: 'takeExpTime', disabled: false, width: 120 },
				{ label: '付款期限', key: 'payExpTime', prop: 'payExpTime', disabled: false, width: 120 },
				{ label: '实际出发时间', key: 'tdTime', prop: 'tdTime', disabled: false, width: 120 },
				{ label: '预计到达时间', key: 'etaTime', prop: 'etaTime', disabled: false, width: 120 },
				{ label: '委托单位', key: 'custName', prop: 'custName', popoverComponent: CustNameShow, disabled: false, width: 120 },
				{ label: '船司/陆港', key: 'shipCarrierCode', prop: 'shipCarrierCode', disabled: false, width: 80 },
				{ label: '订舱代理', key: 'bkgAgentSupplierName', prop: 'bkgAgentSupplierName', disabled: false, width: '150' },
				{ label: '取单人', key: 'takeEmployeeName', prop: 'takeEmployeeName', disabled: false, width: 120 },
				{ label: '取单完成时间', key: 'takeTime', prop: 'takeTime', disabled: false, width: '100' },
				{ label: '操作', key: 'opEmployeeName', prop: 'opEmployeeName', disabled: false, width: 120 },
				{ label: '文件', key: 'docEmployeeName', prop: 'docEmployeeName', disabled: false, width: 120 },
				{ label: '放货组', key: 'rcEmployeeName', prop: 'rcEmployeeName', disabled: false, width: 120 },
				{
					label: '撤回原因',
					key: 'cancelReason',
					prop: 'cancelReason',
					disabled: false,
					width: '70',
					formatter: (row, column) => {
						return getDictLabel('blCancelReason', row.cancelReason) || getDictLabel('blCancelEditReason', row.cancelReason)
					}
				},
				{ label: '撤回备注', key: 'cancelRemark', prop: 'cancelRemark', disabled: false, width: '80' },
				{ label: '撤回时间', key: 'cancelTime', prop: 'cancelTime', disabled: false, width: '100' },
				{
					label: '提单所在地',
					key: 'placeCompName',
					prop: 'placeCompName',
					width: '150',
					disabled: false
				},
				{
					label: '提单转移状态',
					key: 'transferStatus',
					prop: 'transferStatus',
					width: '100',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('blTransferStatus', row.transferStatus)
					}
				}
			].map(item => {
				return { ...item, minWidth: item.width }
			})
		}
	},
	// hbl取单列表
	hblTakeList: {
		// 默认表头
		defaultColumns: [
			'orderNo',
			'obdEmployeeName',
			'bdEmployeeName',
			'businessType',
			'blMode',
			'blNo',
			'blStatus',
			'takeStatus',
			'etdTime',
			'tdTime',
			'etaTime',
			'custName',
			'shipCarrierCode',
			'bkgAgentSupplierName',
			'takeEmployeeName',
			'takeTime',
			'opEmployeeName',
			'docEmployeeName',
			'rcEmployeeName',
			'cancelReason',
			'cancelRemark',
			'cancelTime',
			'tcEmployeeName',
			'tcDeptName'
		],
		// 自定义表头特殊处理
		specialColumns: {},
		// 表头库
		columnsBase(handleOrderNoInfo) {
			return [
				{
					label: '工作号',
					key: 'orderNo',
					prop: 'orderNo',
					width: '150',
					disabled: false,
					// fixed: true,
					type: 'text',
					popoverComponent: ColumnTip,
					// formatter: (row, column) => {
					// 	return `<el-button type="text" class="underline">${row.orderNo}</el-button>`
					// },
					method: row => {
						handleOrderNoInfo(row)
					}
				},
				{ label: '销售', key: 'bdEmployeeName', prop: 'bdEmployeeName', disabled: false, width: '100' },
				{
					label: '销售助理',
					key: 'obdEmployeeName',
					prop: 'obdEmployeeName',
					disabled: false,
					width: '80'
				},
				{
					label: '取单客服(MBL)',
					key: 'tcEmployeeName',
					prop: 'tcEmployeeName',
					disabled: false,
					width: '110'
				},
				{ label: '取单客服(MBL)部门', key: 'tcDeptName', prop: 'tcDeptName', disabled: false, width: '130' },
				{
					label: '出单方式',
					key: 'blMode',
					prop: 'blMode',
					disabled: false,
					width: '70',
					formatter: (row, column) => {
						return getDictLabel('blMode', row.blMode)
					}
				},
				{
					label: '提单号',
					key: 'blNo',
					prop: 'blNo',
					// fixed: true,
					disabled: false,
					width: 100,
					align: 'left',
					formatter: (row, column) => {
						let str = ''
						let blTypeStr = row.blType === 'hbl' ? `<i class="icon-hbl2">H</i>` : row.blType === 'mbl' ? `<i class="icon-hbl2">M</i>` : ''
						if (row.isCancel === 'y') str = `<i class="icon-tip icon-cancel">撤</i>`
						return `${str}${blTypeStr}${row.blNo}`
					}
				},
				{
					label: '业务类型',
					key: 'businessType',
					prop: 'businessType',
					disabled: false,
					width: 100,
					formatter: (row, column) => {
						return getDictLabel('businessType', row.businessType)
					}
				},
				{
					label: '取单状态',
					key: 'takeStatus',
					prop: 'takeStatus',
					disabled: false,
					width: 70,
					formatter: (row, column) => {
						return row.takeStatus === 'finish' ? '已取单' : '待取单'
					}
				},
				{
					label: '提单状态',
					key: 'blStatus',
					prop: 'blStatus',
					width: 100,
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('woBlStatus', row.blStatus)
					}
				},
				{ label: '预计出发时间', key: 'etdTime', prop: 'etdTime', disabled: false, width: 120 },
				{ label: '实际出发时间', key: 'tdTime', prop: 'tdTime', disabled: false, width: 120 },
				{ label: '预计到达时间', key: 'etaTime', prop: 'etaTime', disabled: false, width: 120 },
				{ label: '委托单位', key: 'custName', prop: 'custName', popoverComponent: CustNameShow, disabled: false, width: 100 },
				{ label: '船司/陆港', key: 'shipCarrierCode', prop: 'shipCarrierCode', disabled: false, width: 80 },
				{ label: '订舱代理', key: 'bkgAgentSupplierName', prop: 'bkgAgentSupplierName', disabled: false, width: '150' },
				{ label: '取单人', key: 'takeEmployeeName', prop: 'takeEmployeeName', disabled: false, width: 120 },
				{ label: '取单完成时间', key: 'takeTime', prop: 'takeTime', disabled: false, width: '100' },
				{ label: '操作', key: 'opEmployeeName', prop: 'opEmployeeName', disabled: false, width: 120 },
				{ label: '文件', key: 'docEmployeeName', prop: 'docEmployeeName', disabled: false, width: 120 },
				{ label: '放货组', key: 'rcEmployeeName', prop: 'rcEmployeeName', disabled: false, width: 120 },
				{
					label: '撤回原因',
					key: 'cancelReason',
					prop: 'cancelReason',
					disabled: false,
					width: '70',
					formatter: (row, column) => {
						return getDictLabel('blCancelReason', row.cancelReason) || getDictLabel('blCancelEditReason', row.cancelReason)
					}
				},
				{ label: '撤回备注', key: 'cancelRemark', prop: 'cancelRemark', disabled: false, width: '80' },
				{ label: '撤回时间', key: 'cancelTime', prop: 'cancelTime', disabled: false, width: '100' },
				{ label: '提单纸编码', key: 'paperCode', prop: 'paperCode', disabled: false, width: 120 },
				{ label: '正本页数', key: 'pages', prop: 'pages', disabled: false, width: 100 }
			].map(item => {
				return { ...item, minWidth: item.width }
			})
		}
	},
	// 提单纸列表
	blPagesList: {
		// 默认表头
		defaultColumns: ['paperCode', 'paperStatus', 'orderNo', 'blNo', 'companyName', 'transferStatus', 'expressNo', 'invalidEmployeeName', 'invalidReason', 'invalidRemark', 'invalidTime', 'invalidFileName', 'createdName', 'createdTime'],
		// 自定义表头特殊处理
		specialColumns: {},
		// 表头库
		columnsBase() {
			return [
				{
					label: '提单纸编码',
					key: 'paperCode',
					prop: 'paperCode',
					disabled: false,
					sortable: 'custom',
					width: '100'
				},
				{
					label: '提单纸状态',
					key: 'paperStatus',
					prop: 'paperStatus',
					disabled: false,
					width: '80',
					formatter: (row, column) => {
						return getDictLabel('blPaperStatus', row.paperStatus)
					}
				},
				{
					label: '工作号',
					key: 'orderNo',
					prop: 'orderNo',
					disabled: false,
					width: '100'
				},
				{
					label: '提单号',
					key: 'blNo',
					prop: 'blNo',
					disabled: false,
					sortable: 'custom',
					width: '150'
				},
				{
					label: '提单纸所在分公司',
					key: 'companyName',
					prop: 'companyName',
					disabled: false,
					width: '120'
				},
				{
					label: '转移状态',
					key: 'transferStatus',
					prop: 'transferStatus',
					disabled: false,
					width: '100',
					formatter: (row, column) => {
						return getDictLabel('blPaperTransferStatus', row.transferStatus)
					}
				},
				{
					label: '快递单号',
					key: 'expressNo',
					prop: 'expressNo',
					disabled: false,
					width: '120'
				},
				{
					label: '作废人',
					key: 'invalidEmployeeName',
					prop: 'invalidEmployeeName',
					disabled: false,
					width: '100'
				},
				{
					label: '作废原因',
					key: 'invalidReason',
					prop: 'invalidReason',
					disabled: false,
					width: '100',
					formatter: (row, column) => {
						return getDictLabel('blPaperInvalidReason', row.invalidReason)
					}
				},
				{
					label: '作废备注',
					key: 'invalidRemark',
					prop: 'invalidRemark',
					disabled: false,
					width: '100'
				},
				{
					label: '作废时间',
					key: 'invalidTime',
					prop: 'invalidTime',
					sortable: 'custom',
					disabled: false,
					width: '120'
				},
				{
					label: '作废附件',
					key: 'invalidFileName',
					prop: 'invalidFileName',
					disabled: false,
					width: '120',
					popoverComponent: CloumnFileShow
				},
				{
					label: '创建人',
					key: 'createdName',
					prop: 'createdName',
					disabled: false,
					width: '120'
				},
				{
					label: '创建时间',
					key: 'createdTime',
					prop: 'createdTime',
					sortable: 'custom',
					disabled: false,
					width: '120'
				}
			].map(item => {
				return { ...item, minWidth: item.width }
			})
		}
	},
	// 转移记录列表
	transferRecordsList: {
		// 默认表头
		defaultColumns: [
			'paperCode',
			'pages',
			'applyEmployeeName',
			'receiveEmployeeName',
			'auditEmployeeName',
			'receiveAddress',
			'receivePhone',
			'companyName',
			'transferStatus',
			'expressNo',
			'applyTime',
			'transferStartTime',
			'transferFinishTime',
			'revokeTime',
			'rejectTime',
			'rejectReason'
		],
		// 自定义表头特殊处理
		specialColumns: {},
		// 表头库
		columnsBase() {
			return [
				{
					label: '提单纸编码',
					key: 'paperCode',
					prop: 'paperCode',
					disabled: false,
					width: '100'
				},
				{
					label: '申请份数',
					key: 'pages',
					prop: 'pages',
					disabled: false,
					width: '80'
				},
				{
					label: '申请人',
					key: 'applyEmployeeName',
					prop: 'applyEmployeeName',
					disabled: false,
					width: '80'
				},
				{
					label: '审核人',
					key: 'auditEmployeeName',
					prop: 'auditEmployeeName',
					disabled: false,
					width: '80'
				},
				{
					label: '收件人',
					key: 'receiveEmployeeName',
					prop: 'receiveEmployeeName',
					disabled: false,
					width: '80'
				},
				{
					label: '收件地址',
					key: 'receiveAddress',
					prop: 'receiveAddress',
					disabled: false,
					width: '120'
				},
				{
					label: '收件人联系方式',
					key: 'receivePhone',
					prop: 'receivePhone',
					disabled: false,
					width: '120'
				},
				{
					label: '提单纸所在分公司',
					key: 'companyName',
					prop: 'companyName',
					disabled: false,
					width: '120'
				},
				{
					label: '转移状态',
					key: 'transferStatus',
					prop: 'transferStatus',
					disabled: false,
					width: '100',
					formatter: (row, column) => {
						return getDictLabel('blPaperTransferStatus', row.transferStatus)
					}
				},
				{
					label: '快递单号',
					key: 'expressNo',
					prop: 'expressNo',
					disabled: false,
					width: '100'
				},
				{
					label: '申请时间',
					key: 'applyTime',
					prop: 'applyTime',
					sortable: 'custom',
					disabled: false,
					width: '120'
				},
				{
					label: '开始转移时间',
					key: 'transferStartTime',
					prop: 'transferStartTime',
					sortable: 'custom',
					disabled: false,
					width: '120'
				},
				{
					label: '转移完成时间',
					key: 'transferFinishTime',
					prop: 'transferFinishTime',
					sortable: 'custom',
					disabled: false,
					width: '120'
				},
				{
					label: '撤回转移时间',
					key: 'revokeTime',
					prop: 'revokeTime',
					sortable: 'custom',
					disabled: false,
					width: '120'
				},
				{
					label: '拒绝转移时间',
					key: 'rejectTime',
					prop: 'rejectTime',
					sortable: 'custom',
					disabled: false,
					width: '120'
				},
				{
					label: '拒绝原因',
					key: 'rejectReason',
					prop: 'rejectReason',
					disabled: false,
					width: '120'
				}
			].map(item => {
				return { ...item, minWidth: item.width }
			})
		}
	},
	// 取单列表
	trdeTakeList: {
		// 默认表头
		defaultColumns: [
			'tcEmployeeName',
			'obdEmployeeName',
			'tcDeptName',
			'orderNo',
			'blNo',
			'filesTypeName',
			'takeStatus',
			'orderStatus',
			'etdTime',
			'tdTime',
			'etaTime',
			'custName',
			'takeEmployeeName',
			'takeTime',
			'bdEmployeeName',
			'opEmployeeName',
			'docEmployeeName',
			'rcEmployeeName'
		],
		// 自定义表头特殊处理
		specialColumns: {},
		// 表头库
		columnsBase(handleOrderNoInfo) {
			return [
				{
					label: '工作号',
					key: 'orderNo',
					prop: 'orderNo',
					width: '150',
					disabled: false,
					// fixed: true,
					type: 'text',
					popoverComponent: ColumnTip,
					// formatter: (row, column) => {
					// 	return `<el-button type="text" class="underline">${row.orderNo}</el-button>`
					// },
					method: row => {
						handleOrderNoInfo(row)
					}
				},
				{ label: '销售', key: 'bdEmployeeName', prop: 'bdEmployeeName', disabled: false, width: '100' },
				{
					label: '销售助理',
					key: 'obdEmployeeName',
					prop: 'obdEmployeeName',
					disabled: false,
					width: '80'
				},
				{
					label: '取单客服(MBL)',
					key: 'tcEmployeeName',
					prop: 'tcEmployeeName',
					disabled: false,
					width: '110'
				},
				{ label: '取单客服(MBL)部门', key: 'tcDeptName', prop: 'tcDeptName', disabled: false, width: '130' },
				{
					label: '提单号',
					key: 'blNo',
					prop: 'blNo',
					width: 150
				},
				{
					label: '附件类型',
					key: 'filesTypeName',
					prop: 'filesTypeName',
					width: 100,
					disabled: false
				},
				{
					label: '业务类型',
					width: 100,
					key: 'businessType',
					prop: 'businessType',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('businessType', row.businessType)
					}
				},
				{
					label: '取单状态',
					key: 'takeStatus',
					prop: 'takeStatus',
					disabled: false,
					width: 70,
					formatter: (row, column) => {
						return row.takeStatus === 'finish' ? '已取单' : '待取单'
					}
				},
				{
					label: '订单状态',
					key: 'orderStatus',
					prop: 'orderStatus',
					disabled: false,
					width: 80,
					formatter: (row, column) => {
						return getDictLabel('orderStatus', row.orderStatus)
					}
				},
				{ label: '预计出发时间', key: 'etdTime', prop: 'etdTime', disabled: false, width: 120 },
				{ label: '实际出发时间', key: 'tdTime', prop: 'tdTime', disabled: false, width: 120 },
				{ label: '预计到达时间', key: 'etaTime', prop: 'etaTime', disabled: false, width: 120 },
				{ label: '委托单位', key: 'custName', prop: 'custName', popoverComponent: CustNameShow, disabled: false, width: 120 },
				{ label: '取单人', key: 'takeEmployeeName', prop: 'takeEmployeeName', disabled: false, width: 120 },
				{ label: '取单完成时间', key: 'takeTime', prop: 'takeTime', disabled: false, width: '100' },
				{ label: '操作', key: 'opEmployeeName', prop: 'opEmployeeName', disabled: false, width: 120 },
				{ label: '文件', key: 'docEmployeeName', prop: 'docEmployeeName', disabled: false, width: 120 },
				{ label: '放货组', key: 'rcEmployeeName', prop: 'rcEmployeeName', disabled: false, width: 120 }
			].map(item => {
				return { ...item, minWidth: item.width }
			})
		}
	},
	// 放单列表
	blPutList: {
		// 默认表头
		defaultColumns: [
			'businessType',
			'cscDeptName',
			'blNo',
			'orderNo',
			'etaTime',
			'etdTime',
			'tdTime',
			'blType',
			'custName',
			'custSettleType',
			'custAccountPeriod',
			'custCreditRemain',
			'shipCarrierCode',
			'bkgAgentSupplierName',
			'blMode',
			'auditStatus',
			'takeEmployeeName',
			'takeStatus',
			'isAgreeRelease',
			'telexApplyStatus',
			'telexDownStatus',
			'telexDownTime',
			'takeTime',
			'cancelReason',
			'cancelRemark',
			'cancelTime',
			'fileNo',
			'putStatus',
			'applyTime',
			'tcEmployeeName',
			'tcDeptName',
			'auditTime',
			'bdEmployeeName',
			'bdDeptName',
			'obdEmployeeName',
			'obdDeptName',
			'docEmployeeName',
			'docDeptName',
			'putEmployeeName',
			'putDeptName',
			'auditEmployeeName',
			'placeCompName',
			'transferStatus',
			'unPutFeedbackReason',
			'unPutFeedbackTime'
		],
		// 自定义表头特殊处理
		specialColumns: {
			// podFreeIn: ['podFreeOut', 'podFree']
		},
		// 表头库
		columnsBase(handleOrderNoInfo, handleViewFileList) {
			return [
				{
					label: '工作号',
					key: 'orderNo',
					prop: 'orderNo',
					width: '150',
					disabled: false,
					// fixed: true,
					type: 'text',
					popoverComponent: ColumnTip,
					// formatter: (row, column) => {
					// 	return `<el-button type="text" class="underline">${row.orderNo}</el-button>`
					// },
					method: row => {
						handleOrderNoInfo(row)
					}
				},
				{
					label: '取单客服(MBL)',
					key: 'tcEmployeeName',
					prop: 'tcEmployeeName',
					disabled: false,
					width: '110'
				},
				{ label: '取单客服(MBL)部门', key: 'tcDeptName', prop: 'tcDeptName', disabled: false, width: '130' },
				{
					label: '业务类型',
					key: 'businessType',
					prop: 'businessType',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('businessType', row.businessType)
					},
					width: '100'
				},
				{ label: '销售', key: 'bdEmployeeName', prop: 'bdEmployeeName', disabled: false, width: '100' },
				{ label: '销售部门', key: 'bdDeptName', prop: 'bdDeptName', disabled: false, width: '70' },
				{
					label: '销售助理',
					key: 'obdEmployeeName',
					prop: 'obdEmployeeName',
					disabled: false,
					width: '80'
				},
				{
					label: '销售助理部门',
					key: 'obdDeptName',
					prop: 'obdDeptName',
					disabled: false,
					width: '120'
				},
				{
					label: '文件',
					key: 'docEmployeeName',
					prop: 'docEmployeeName',
					disabled: false,
					width: '100'
				},
				{ label: '文件部门', key: 'docDeptName', prop: 'docDeptName', disabled: false, width: '100' },
				{
					label: '放货人',
					key: 'putEmployeeName',
					prop: 'putEmployeeName',
					disabled: false,
					width: '100'
				},
				{
					label: '放货人部门',
					key: 'putDeptName',
					prop: 'putDeptName',
					disabled: false,
					width: '100'
				},
				{ label: '财务审核人', key: 'auditEmployeeName', prop: 'auditEmployeeName', disabled: false, width: 100 },
				{
					label: '提单号',
					key: 'blNo',
					prop: 'blNo',
					// fixed: true,
					disabled: false,
					align: 'left',
					width: '150',
					formatter: (row, column) => {
						let str = ''
						let blTypeStr = row.blType === 'hbl' ? `<i class="icon-hbl2">H</i>` : row.blType === 'mbl' ? `<i class="icon-hbl2">M</i>` : ''
						if (row.isCancel === 'y') str = `<i class="icon-tip icon-cancel">撤</i>`
						return `<pre>${str}${blTypeStr}${row.blNo}</pre>`
					}
				},
				{ label: '预计到达时间', key: 'etaTime', sortable: 'custom', prop: 'etaTime', disabled: false, width: 100 },
				{ label: '放单审核时间', key: 'auditTime', prop: 'auditTime', sortable: 'custom', disabled: false, width: 100 },
				{ label: '预计出发时间', key: 'etdTime', sortable: 'custom', prop: 'etdTime', disabled: false, width: 100 },
				{ label: '实际出发时间', key: 'tdTime', sortable: 'custom', prop: 'tdTime', disabled: false, width: 100 },
				{
					label: '提单类型',
					key: 'blType',
					prop: 'blType',
					disabled: false,
					width: 70,
					formatter: (row, column) => {
						return getDictLabel('blType', row.blType)
					}
				},
				{ label: '委托单位', key: 'custName', prop: 'custName', popoverComponent: CustNameShow, disabled: false, width: '150' },
				{
					label: '委托单位结算方式',
					key: 'custSettleType',
					prop: 'custSettleType',
					width: '120',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('settleMode', row.custSettleType)
					}
				},
				{ label: '委托单位信用额度', key: 'custCreditRemain', prop: 'custCreditRemain', disabled: false, width: 120 },
				{ label: '委托单位账期', key: 'custAccountPeriod', prop: 'custAccountPeriod', disabled: false, width: 100 },
				{ label: '船司/陆港', key: 'shipCarrierCode', prop: 'shipCarrierCode', disabled: false, width: 80 },
				{ label: '订舱代理', key: 'bkgAgentSupplierName', prop: 'bkgAgentSupplierName', disabled: false, width: '150' },
				{
					label: '出单方式',
					key: 'blMode',
					prop: 'blMode',
					disabled: false,
					width: 70,
					formatter: (row, column) => {
						return getDictLabel('blMode', row.blMode)
					}
				},

				{
					label: '财务审核状态',
					key: 'auditStatus',
					prop: 'auditStatus',
					disabled: false,
					width: 100,
					formatter: (row, column) => {
						return getDictLabel('blFinAuditStatus', row.auditStatus)
					}
				},

				{ label: '取单人', key: 'takeEmployeeName', prop: 'takeEmployeeName', disabled: false, width: 100 },
				{ label: '单证', key: 'cscEmployeeName', prop: 'cscEmployeeName', disabled: false, width: 120 },
				{ label: '单证部门', key: 'cscDeptName', prop: 'cscDeptName', disabled: false, width: 70 },
				{
					label: '正本取单状态',
					key: 'takeStatus',
					prop: 'takeStatus',
					disabled: false,
					width: 100,
					formatter: (row, column) => {
						return row.takeStatus === 'finish' ? '已取单' : '未取单'
					}
				},
				{
					label: '客户是否同意放货',
					key: 'isAgreeRelease',
					prop: 'isAgreeRelease',
					width: '180',
					disabled: false,
					formatter: (row, column) => {
						let str = getDictLabel('isAgreeRelease', row.isAgreeRelease)
						let passStr = row.agreeReleaseStatus === 'pass' ? '(已特殊审批)' : ''
						return `${str}${passStr}`
					}
				},
				{
					label: '船东申请',
					key: 'telexApplyStatus',
					prop: 'telexApplyStatus',
					width: '70',
					disabled: false,
					formatter: (row, column) => {
						return row.telexApplyStatus === 'y' ? '是' : '否'
					}
				},
				{
					label: '船东完成放单',
					key: 'telexDownStatus',
					prop: 'telexDownStatus',
					width: '100',
					disabled: false,
					formatter: (row, column) => {
						return row.telexDownStatus === 'y' ? '是' : '否'
					}
				},
				{ label: '船东完成放单时间', key: 'telexDownTime', sortable: 'custom', prop: 'telexDownTime', disabled: false, width: '130' },
				{ label: '取单完成时间', key: 'takeTime', prop: 'takeTime', sortable: 'custom', disabled: false, width: '100' },
				{
					label: '撤回原因',
					key: 'cancelReason',
					prop: 'cancelReason',
					disabled: false,
					width: '70',
					formatter: (row, column) => {
						return getDictLabel('blCancelReason', row.cancelReason) || getDictLabel('blCancelEditReason', row.cancelReason)
					}
				},
				{ label: '撤回备注', key: 'cancelRemark', prop: 'cancelRemark', disabled: false, width: '80' },
				{ label: '撤回时间', key: 'cancelTime', sortable: 'custom', prop: 'cancelTime', disabled: false, width: '100' },
				{ label: '未放单原因', key: 'unPutFeedbackReason', prop: 'unPutFeedbackReason', disabled: false, width: '120' },
				{ label: '未放单反馈时间', key: 'unPutFeedbackTime', sortable: 'custom', prop: 'unPutFeedbackTime', disabled: false, width: '150' },
				{
					label: '随单附件',
					key: 'fileNo',
					prop: 'fileNo',
					disabled: false,
					width: 70,
					formatter: (row, column) => {
						return `<el-button type="text" class="underline">查看</el-button>`
					},
					method: (index, row) => {
						handleViewFileList(index, row)
					}
				},
				{
					label: '提单放单状态',
					key: 'blPutStatus',
					prop: 'blPutStatus',
					disabled: false,
					width: 120,
					formatter: (row, column) => {
						let text = ''
						if (row.blPutStatus === 'finish') {
							text = '已放单'
						} else {
							text = '未放单'
						}
						return text
					}
				},

				{ label: '申请时间', key: 'applyTime', prop: 'applyTime', sortable: 'custom', disabled: false, width: '150' },
				{
					label: '寄单状态',
					key: 'status',
					prop: 'status',
					disabled: false,
					width: 120,
					formatter: (row, column) => {
						return getDictLabel('postStatus', row.status)
					}
				},
				{
					label: '订舱代理应付结清状态',
					key: 'bkgAgentPaySettleStatus',
					prop: 'bkgAgentPaySettleStatus',
					disabled: false,
					width: 120,
					formatter: (row, column) => {
						return getDictLabel('feeSettleStatus', row.bkgAgentPaySettleStatus)
					}
				},
				{
					label: '提单所在地',
					key: 'placeCompName',
					prop: 'placeCompName',
					width: '150',
					disabled: false
				},
				{
					label: '提单转移状态',
					key: 'transferStatus',
					prop: 'transferStatus',
					width: '100',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('blTransferStatus', row.transferStatus)
					}
				}
			].map(item => {
				return { ...item, minWidth: item.width }
			})
		}
	},

	// 财务审核状态
	finAuditStatusOptions: {
		init: '待提交',
		submit: '待审核',
		pass: '审核通过',
		processing: '处理中',
		refuse: '审核拒绝'
	}
}

const mutations = {
	setOrderFeeCount(state, value) {
		state.isOrderFeeCount = value
	},
	setIsCanModify(state, payload) {
		state.isCanModify = payload
	},
	setOverseasTipMsg(state, payload) {
		state.overseasTipMsg = payload
	},
	setRailCurRole(state, value) {
		state.railCurRole = value
	},
	setServiceList(state, value) {
		state.serviceList = value
	},
	setOrderInfoData(state, value) {
		state.orderInfoData = value
	},
	setOrderInfoDataObj(state, value) {
		state.orderInfoDataObj = value
	},
	setServiceInfoList(state, value) {
		state.serviceInfoList = value
	},
	setIsSoUpdate(state, value) {
		state.isSoUpdate = value
	},
	setDropBdCheckStatus(state, value) {
		state.dropBdCheckStatus = value
	},
	setDropOpStatus(state, value) {
		state.dropOpStatus = value
	},
	setWarehouseActivityKey(state, value) {
		state.warehouseActivityKey = value
	},
	setPodWarehouseActivityKey(state, value) {
		state.podWarehouseActivityKey = value
	},
	setServiceCode(state, value) {
		state.serviceCode = value
	},
	setEditRoles(state, value) {
		state.userEditRoles = value
	},
	setRole(state, value) {
		state.ordDetRole = value
	},
	setSingleOrderRole(state, value) {
		state.orderList.ordDetRolesObj[value.orderNo] = {
			ordDetRole: value.orderDetRole,
			userEditRoles: value.userEditRoles
		}
	},
	deleteSingleOrderRole(state, value) {
		delete state.orderList.ordDetRolesObj[value.orderNo]
	}
}

const actions = {
	setOrderFeeCount(context, params) {
		context.commit('setOrderFeeCount', params)
	},
	setIsCanModify(context, params) {
		context.commit('setIsCanModify', params)
	},
	setOverseasTipMsg(context, params) {
		context.commit('setOverseasTipMsg', params)
	},
	setOrderInfoData(context, params) {
		context.commit('setOrderInfoData', params)
	},
	setOrderInfoDataObj(context, obj) {
		context.commit('setOrderInfoDataObj', obj)
	},
	changeWarehouseComp(context, params) {
		context.commit('setWarehouseActivityKey', params)
	},
	changePodWarehouseComp(context, params) {
		context.commit('setPodWarehouseActivityKey', params)
	},
	changeServiceType(context, params) {
		context.commit('setServiceCode', params)
		sessionStorage.setItem('serviceCode', params)
	},
	setEditRoles(context, params) {
		context.commit('setEditRoles', params)
	},
	setRole(context, params) {
		context.commit('setRole', params)
	},
	setSingleOrderRole(context, params) {
		context.commit('setSingleOrderRole', params)
	},
	deleteSingleOrderRole(context, params) {
		context.commit('setSingleOrderRole', params)
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
					let blob = new Blob([res.data])
					resolve(blob)
				})
				.catch(err => {
					reject(err)
					console.log(err)
				})
		})
	},
	// 输出pdf，xls,doc
	exportBlobFile({ state }, { uri, data }) {
		return new Promise((resolve, reject) => {
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
					if (res.data.type === 'application/json') {
						const reader = new FileReader()
						reader.onload = function () {
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
	// so上传
	soUpload({ state }, { uri, params }) {
		return new Promise((resolve, reject) => {
			let { data, fileName } = params
			let token = getToken()
			let jsonData = {
				fromSystem: 'web_H5',
				toSystem: 'mng_base_server',
				reqId: randomString(),
				reqTime: parseTime(new Date().getTime()),
				data: data
			}
			const form = new FormData()
			form.append('jsonData', JSON.stringify(jsonData))
			if (fileName) {
				if (isArray(fileName)) {
					fileName.forEach(item => {
						form.append('fileName', item.raw)
					})
				} else {
					form.append('fileName', fileName)
				}
			}
			axios({
				// 用axios发送post请求
				method: 'post',
				url: uri, // 请求地址
				data: form, // 参数
				headers: {
					'Content-Type': 'multipart/form-data',
					Authorization: token
				}
			})
				.then(res => {
					if (res.data.code === 0) {
						resolve(res)
					} else {
						// token验证失败，失效
						if (res.data.code === 100004 || res.data.code === 100005) {
							// to re-login
							return MessageBox.confirm('请重新登录', '提示', {
								confirmButtonText: '去登录',
								cancelButtonText: '取消',
								type: 'warning'
							})
								.then(() => {
									store.dispatch('user/resetToken').then(() => {
										location.reload()
									})
								})
								.catch(err => {})
						}
						Message({
							message: res.data.msg || 'Error',
							type: 'error',
							showClose: true
						})
						resolve('error')
					}
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 保险上传
	insuranceUpload({ state }, { uri, params }) {
		return new Promise((resolve, reject) => {
			let { data, fileName } = params
			let token = getToken()
			let jsonData = {
				fromSystem: 'web_H5',
				toSystem: 'mng_base_server',
				reqId: randomString(),
				reqTime: parseTime(new Date().getTime()),
				data: data
			}
			const form = new FormData()
			form.append('jsonData', JSON.stringify(jsonData))

			if (isArray(fileName)) {
				fileName.forEach(item => {
					form.append('fileName', item.raw)
				})
			} else {
				form.append('fileName', fileName ? fileName.raw : null)
			}

			axios({
				// 用axios发送post请求
				method: 'post',
				url: uri, // 请求地址
				data: form, // 参数
				headers: {
					'Content-Type': 'multipart/form-data',
					Authorization: token
				}
			})
				.then(res => {
					if (res.data.code === 0) {
						resolve(res)
					} else {
						// token验证失败，失效
						if (res.data.code === 100004 || res.data.code === 100005) {
							// to re-login
							return MessageBox.confirm('请重新登录', '提示', {
								confirmButtonText: '去登录',
								cancelButtonText: '取消',
								type: 'warning'
							})
								.then(() => {
									store.dispatch('user/resetToken').then(() => {
										location.reload()
									})
								})
								.catch(err => {})
						}
						Message({
							message: res.data.msg || 'Error',
							type: 'error',
							showClose: true
						})
						resolve('error')
					}
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	previewFile({ state }, params) {
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
	// 空运报关附件上传
	airUpload({ state }, { uri, params }) {
		return new Promise((resolve, reject) => {
			let token = getToken()
			let reqDto = {
				fromSystem: 'web_H5',
				toSystem: 'mng_base_server',
				reqId: randomString(),
				reqTime: parseTime(new Date().getTime()),
				data: params.data
			}
			const form = new FormData()
			form.append('reqDto', JSON.stringify(reqDto))
			params.fileName && form.append('file', params.fileName)
			axios({
				// 用axios发送post请求
				method: 'post',
				url: uri, // 请求地址
				data: form, // 参数
				headers: {
					'Content-Type': 'multipart/form-data',
					Authorization: token
				}
			})
				.then(res => {
					if (res.data.code === 0) {
						resolve(res)
					} else {
						// token验证失败，失效
						if (res.data.code === 100004 || res.data.code === 100005) {
							// to re-login
							return MessageBox.confirm('请重新登录', '提示', {
								confirmButtonText: '去登录',
								cancelButtonText: '取消',
								type: 'warning'
							})
								.then(() => {
									store.dispatch('user/resetToken').then(() => {
										location.reload()
									})
								})
								.catch(err => {})
						}
						Message({
							message: res.data.msg || 'Error',
							type: 'error',
							showClose: true
						})
						resolve('error')
					}
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	// 港口下拉数据
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
								label_copy: `${item.portCode}(${item.ename}${item.countryEname ? ',' + item.countryEname : ''})`
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
	// 获取散货部门
	getValueByKeys({ commit }, param) {
		let { custid } = param
		return new Promise((resolve, reject) => {
			getValueByKeys(['lcl_rail_cust_id'])
				.then(response => {
					const configValue = response.data.map(item => item.configValue)
					const results = configValue.includes(custid.toString())
					resolve(results)
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
