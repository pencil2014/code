import axios from 'axios'
import store from '@/store'
import { MessageBox, Message } from 'element-ui'
import { parseTime, randomString } from '@/utils'
import { getDictLabel } from '@/utils/tools'
import { getToken } from '@/utils/auth'
import CustNameShow from '@/views/order/order/components/custNameShow.vue'
// import Ordercolumn from '@/views/airTransport/order/orderList/components/order-column.vue'
import ColumnTip from '@/views/order/order/components/columnTip.vue'
import ColumnJointTip from '@/views/order/order/components/columnJointTip.vue'
const orderList = {
	// 默认表头
	defaultColumns: [
		'orderNo',
		'exportOrderNo',
		'businessType',
		'serviceType',
		'bdEmployeeName',
		'bdDeptCode',
		'bdDeptName',
		'bdServiceMode',
		'orderStatus',
		'bkgStatus',
		'custid',
		'custName',
		'custIntrustNo',
		'intrustRemark',
		'auditRemark',
		'bkgRemark',
		'prefinCloseStatus',
		'prefinCloseTime',
		'finCloseStatus',
		'finCloseTime',
		'receiveFeeCleanStatus',
		'payFeeCleanStatus',
		'receiveFeeConfirmStatus',
		'payFeeConfirmStatus',
		'receiveInvoiceStatus',
		'payFeeApplyStatus',
		'createdTime',
		'bizDate',
		'airLine',
		'polPortCode',
		// 'polPortName',
		// 'bkgAgentSupplierId',
		'bkgAgentSupplierName',
		'etdTime',
		'airCustomsType',
		'airBillType',
		'airSysLineCode',
		'airSysLineName',
		'isJoint',
		'isOpHandle',
		'podPortCode',
		// 'podPortName',
		// 新增
		'mawb',
		'hawb',
		'poNo',
		'voyagePlan',
		'voyageReal',
		'pricingEmployeeName',
		'pricingDeptName',
		'opEmployeeName',
		'opDeptName',
		'csEmployeeName',
		'csDeptName',
		'ecsDeptName',
		'ecsEmployeeName',
		'acEmployeeName',
		'acDeptName',
		'eacEmployeeName',
		'eacDeptName',
		'obdEmployeeName',
		'obdDeptName',
		'asstEmployeeName',
		'asstDeptName',
		'auditTime',

		'predictQuantity',
		'predictWeight',
		'predictVolume',
		'predictChargeWeight',
		'blQuantity',
		'blWeight',
		'blVolume',
		'blChargeWeight',
		'cargoCname',
		'cargoEname',
		'realEtdTime',
		'cargoCustName',
		'transportTerm',
		'billSplitNum',
		'custClass',
		'countryCname',
		'cancelExecTime',
		'epricingEmployeeName',
		'epricingDeptName',
		'serviceName',
		'etaTimePlanVoyage1',
		'etaTimeRealVoyage1',
		'etaTimePlanVoyage0',
		'etaTimeRealVoyage0',
		'deliveryTimes'
	],
	// 自定义表头特殊处理
	specialColumns: {
		porPortCode: ['porPortCode', 'porPortName'],
		polPortCode: ['polPortCode', 'polPortName'],
		transitPortCode: ['transitPortCode', 'transitPortName'],
		podPortCode: ['podPortCode', 'podPortName'],
		receiptPlaceCode: ['receiptPlaceCode', 'receiptPlaceName']
	},
	// 表头库
	columnsBase(handleOrderNoInfo) {
		return [
			{
				label: '工作号',
				key: 'orderNo',
				prop: 'orderNo',
				width: '220',
				minWidth: '220',
				disabled: false,
				// fixed: true,
				type: 'text',
				align: 'center',
				popoverComponent: ColumnTip,
				method: row => {
					handleOrderNoInfo(row)
				}
			},
			{
				label: '出口单号',
				key: 'exportOrderNo',
				prop: 'exportOrderNo',
				width: '180',
				minWidth: '180',
				disabled: false,
				type: 'text',
				align: 'left'
			},
			{
				label: '服务类型',
				key: 'serviceType',
				prop: 'serviceType',
				disabled: false,
				width: '150',
				formatter: (row, column) => {
					return row.serviceTypeName
				}
			},
			{
				label: '服务项',
				key: 'serviceName',
				prop: 'serviceName',
				disabled: false,
				width: '180'
			},
			{
				label: '业务类型',
				key: 'businessType',
				prop: 'businessType',
				width: '120',
				disabled: false,
				formatter: (row, column) => {
					return row.businessTypeCn
				}
			},
			{ label: '销售', key: 'bdEmployeeName', prop: 'bdEmployeeName', width: '120', disabled: false, sortable: 'custom' },
			{ label: '销售部门', key: 'bdDeptName', prop: 'bdDeptName', width: '120', disabled: false, sortable: 'custom' },
			{ label: '销售助理', key: 'obdEmployeeName', prop: 'obdEmployeeName', width: '120', disabled: false },
			{ label: '销售助理部门', key: 'obdDeptName', prop: 'obdDeptName', width: '120', disabled: false },
			{ label: '下单助理', key: 'asstEmployeeName', prop: 'asstEmployeeName', width: '120', disabled: false },
			{ label: '下单助理部门', key: 'asstDeptName', prop: 'asstDeptName', width: '120', disabled: false },
			{ label: '商务', key: 'pricingEmployeeName', prop: 'pricingEmployeeName', width: '120', disabled: false, sortable: 'custom' },
			{ label: '商务部门', key: 'pricingDeptName', prop: 'pricingDeptName', width: '120', disabled: false },
			{ label: '操作', key: 'opEmployeeName', prop: 'opEmployeeName', width: '120', disabled: false, sortable: 'custom' },
			{ label: '操作部门', key: 'opDeptName', prop: 'opDeptName', width: '120', disabled: false },
			{ label: '客服', key: 'csEmployeeName', prop: 'csEmployeeName', width: '120', disabled: false },
			{ label: '客服部门', key: 'csDeptName', prop: 'csDeptName', width: '120', disabled: false },
			{ label: '海外客服', key: 'ecsEmployeeName', prop: 'ecsEmployeeName', width: '120', disabled: false },
			{ label: '海外客服部门', key: 'ecsDeptName', prop: 'ecsDeptName', width: '120', disabled: false },
			{ label: '海外商务', key: 'epricingEmployeeName', prop: 'epricingEmployeeName', width: '120', disabled: false },
			{ label: '海外商务部门', key: 'epricingDeptName', prop: 'epricingDeptName', width: '120', disabled: false },
			{ label: '应收财务', key: 'acEmployeeName', prop: 'acEmployeeName', width: '120', disabled: false },
			{ label: '应收财务部门', key: 'acDeptName', prop: 'acDeptName', width: '120', disabled: false },
			{ label: '海外应收财务', key: 'eacEmployeeName', prop: 'eacEmployeeName', width: '120', disabled: false },
			{ label: '海外应收财务部门', key: 'eacDeptName', prop: 'eacDeptName', width: '120', disabled: false },
			{
				label: '新旧模式',
				key: 'bdServiceMode',
				prop: 'bdServiceMode',
				disabled: false,
				width: '80',
				formatter: (row, column) => {
					return getDictLabel('bdServiceMode', row.bdServiceMode)
				}
			},
			{
				label: '操作处理状态',
				key: 'isOpHandle',
				prop: 'isOpHandle',
				disabled: false,
				width: '120',
				formatter: (row, column) => {
					let str = ''
					str = row.isOpHandle === 'complete' ? '已完成' : row.isOpHandle === 'y' ? '处理中' : '未处理'
					return `<span class="isOpHandle-${row.isOpHandle}">${str}</span>`
				}
			},
			{
				label: '订单状态',
				key: 'orderStatus',
				prop: 'orderStatus',
				width: '120',
				disabled: false,
				sortable: 'custom',
				formatter: (row, column) => {
					let result = getDictLabel('orderStatus', row.orderStatus)
					let color = ''
					// 操作中状态特殊处理 20211216弃用
					// if (row.orderStatus === 'pass' && row.isOpHandle === 'y') {
					// 	result = '操作中'
					// }
					// 待审核
					if (['submit'].includes(row.orderStatus)) {
						color = 'yellow'
					}
					// 审核通过，已完成
					if (row.orderStatus === 'complete' || row.orderStatus === 'pass') {
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
				width: '120',
				formatter: (row, column) => {
					let str = ''
					str = getDictLabel('airBkgStatus', row.bkgStatus)
					if (['draft', 'submit'].includes(row.bkgStatus) || ['st06', 'st14', 'st21', 'st22'].includes(row.serviceType)) {
						str = ''
					}
					return str
				}
			},
			{ label: '委托单位编号', key: 'custid', prop: 'custid', width: '100', disabled: false },
			{ label: '委托单位', key: 'custName', prop: 'custName', popoverComponent: CustNameShow, width: '150', disabled: false, sortable: 'custom' },
			{ label: '客户委托号', key: 'custIntrustNo', prop: 'custIntrustNo', width: '100', disabled: false },
			{ label: '委托备注', key: 'intrustRemark', prop: 'intrustRemark', width: '120', disabled: false },
			{ label: '商务备注', key: 'auditRemark', prop: 'auditRemark', width: '120', disabled: false },
			{ label: '订舱备注', key: 'bkgRemark', prop: 'bkgRemark', width: '120', disabled: false },
			{
				label: '预关账状态',
				key: 'prefinCloseStatus',
				prop: 'prefinCloseStatus',
				width: '120',
				disabled: false,
				formatter: (row, column) => {
					return row.prefinCloseStatus === 'yes' ? '已关账' : '未关账'
				}
			},
			{
				label: '关账状态',
				key: 'finCloseStatus',
				prop: 'finCloseStatus',
				width: '120',
				disabled: false,
				formatter: (row, column) => {
					return row.finCloseStatus === 'yes' ? '已关账' : '未关账'
				}
			},
			{ label: '审核时间', key: 'auditTime', prop: 'auditTime', sortable: 'custom', width: '150' },
			{ label: '预关账时间', key: 'prefinCloseTime', prop: 'prefinCloseTime', width: '120', disabled: false },
			{ label: '关账时间', key: 'finCloseTime', prop: 'finCloseTime', width: '120', disabled: false },
			{ label: '取消/终止/关闭时间', key: 'cancelExecTime', prop: 'cancelExecTime', width: '150', disabled: false },
			{
				label: '应收费用结清状态',
				key: 'receiveFeeCleanStatus',
				prop: 'receiveFeeCleanStatus',
				width: '150',
				disabled: false,
				formatter: (row, column) => {
					return getDictLabel('feeSettleStatus', row.receiveFeeCleanStatus)
				}
			},
			{
				label: '应付费用结清状态',
				key: 'payFeeCleanStatus',
				width: '150',
				prop: 'payFeeCleanStatus',
				disabled: false,
				formatter: (row, column) => {
					return getDictLabel('feeSettleStatus', row.payFeeCleanStatus)
				}
			},
			{
				label: '应收确认状态',
				key: 'receiveFeeConfirmStatus',
				prop: 'receiveFeeConfirmStatus',
				disabled: false,
				width: '150',
				formatter: (row, column) => {
					return getDictLabel('feeConfirmStatus', row.receiveFeeConfirmStatus)
				}
			},
			{
				label: '应付确认状态',
				key: 'payFeeConfirmStatus',
				prop: 'payFeeConfirmStatus',
				disabled: false,
				width: '150',
				formatter: (row, column) => {
					return getDictLabel('feeConfirmStatus', row.payFeeConfirmStatus)
				}
			},
			{ label: '应收发票状态', key: 'receiveInvoiceStatus', prop: 'receiveInvoiceStatus', disabled: false, width: '120' },
			{ label: '请款状态', key: 'payFeeApplyStatus', prop: 'payFeeApplyStatus', disabled: false, width: '100' },
			{ label: '订单创建时间', key: 'createdTime', prop: 'createdTime', width: '150', disabled: false, sortable: 'custom' },
			{ label: '业务日期', key: 'bizDate', prop: 'bizDate', width: '150', disabled: false, sortable: 'custom' },
			// { label: '主单号', key: 'masterOrder', prop: 'masterOrder', disabled: false },
			// { label: '分单号', key: 'seperate', prop: 'seperate', disabled: false },
			{ label: '航空公司', key: 'airLine', prop: 'airLine', disabled: false, width: '120', sortable: 'custom' },
			{
				label: '起运港',
				key: 'polPortCode',
				prop: 'polPortCode',
				width: '150',
				disabled: false,
				sortable: 'custom'
				// formatter: (row, column) => {
				// 	return row.polPortName
				// }
			},
			{
				label: '目的地',
				key: 'podPortCode',
				prop: 'podPortCode',
				width: '150',
				disabled: false,
				sortable: 'custom'
				// formatter: (row, column) => {
				// 	return row.podPortName
				// }
			},
			// {
			// 	label: '目的地代码',
			// 	key: 'podPortCode',
			// 	prop: 'podPortCode',
			// 	width: '150',
			// 	disabled: false
			// },
			// { label: '订舱代理ID', key: 'bkgAgentSupplierId', prop: 'bkgAgentSupplierId', width: '100', disabled: false },
			{ label: '订舱代理', key: 'bkgAgentSupplierName', prop: 'bkgAgentSupplierName', width: '180', disabled: false, sortable: 'custom' },
			{ label: '预计起飞日期', key: 'etdTime', prop: 'etdTime', disabled: false, width: '120', sortable: 'custom' },
			{
				label: '报关方式',
				key: 'airCustomsType',
				prop: 'airCustomsType',
				disabled: false,
				formatter: (row, column) => {
					let str = ''
					str = getDictLabel('airCustomsType', row.airCustomsType)
					if (['draft', 'submit'].includes(row.bkgStatus)) str = ''
					return str
				},
				width: '120'
			},
			{
				label: '运单方式',
				key: 'airBillType',
				prop: 'airBillType',
				disabled: false,
				formatter: (row, column) => {
					return getDictLabel('airTransitWay', row.airBillType)
				},
				width: '120'
			},
			{ label: '航线代码', key: 'airSysLineCode', prop: 'airSysLineCode', disabled: false, width: '120' },
			{ label: '系统航线', key: 'airSysLineName', prop: 'airSysLineName', disabled: false, width: '120', sortable: 'custom' },
			// 新增
			{ label: '主单号', key: 'mawb', prop: 'mawb', disabled: false, width: '120', sortable: 'custom' },
			{ label: '分单号', key: 'hawb', prop: 'hawb', disabled: false, width: '120' },
			{ label: '入仓编号', key: 'poNo', prop: 'poNo', width: '120', disabled: false },
			{ label: '预计航次号', key: 'voyagePlan', prop: 'voyagePlan', width: '120', disabled: false },
			{ label: '实际航次号', key: 'voyageReal', prop: 'voyageReal', width: '120', disabled: false },

			{ label: '预计件数', key: 'predictQuantity', prop: 'predictQuantity', width: '120', sortable: 'custom', disabled: false },
			{ label: '预计毛重', key: 'predictWeight', prop: 'predictWeight', width: '120', sortable: 'custom', disabled: false },
			{ label: '预计体积', key: 'predictVolume', prop: 'predictVolume', width: '120', sortable: 'custom', disabled: false },
			{ label: '预计计费重', key: 'predictChargeWeight', prop: 'predictChargeWeight', width: '120', sortable: 'custom', disabled: false },
			{ label: '制单件数', key: 'blQuantity', prop: 'blQuantity', width: '120', sortable: 'custom', disabled: false },
			{ label: '制单毛重', key: 'blWeight', prop: 'blWeight', width: '120', sortable: 'custom', disabled: false },
			{ label: '制单体积', key: 'blVolume', prop: 'blVolume', width: '120', sortable: 'custom', disabled: false },
			{ label: '制单计费重', key: 'blChargeWeight', prop: 'blChargeWeight', sortable: 'custom', width: '120', disabled: false },
			{ label: '中文品名', key: 'cargoCname', prop: 'cargoCname', width: '120', disabled: false },
			{ label: '英文品名', key: 'cargoEname', prop: 'cargoEname', width: '120', disabled: false },
			{ label: '实际起飞时间', key: 'realEtdTime', prop: 'realEtdTime', disabled: false, width: '120', sortable: 'custom' },
			{ label: '发货单位', key: 'cargoCustName', prop: 'cargoCustName', disabled: false, width: '120' },
			{
				label: '运输条款',
				key: 'transportTerm',
				prop: 'transportTerm',
				disabled: false,
				width: '120',
				formatter: (row, column) => {
					return getDictLabel('airTransportTerm', row.transportTerm)
				}
			},
			{ label: '分单数', key: 'billSplitNum', prop: 'billSplitNum', disabled: false, width: '120', sortable: 'custom' },
			{
				label: '客户类型',
				key: 'custClass',
				prop: 'custClass',
				disabled: false,
				width: '120',
				formatter: (row, column) => {
					if (row.custClass) {
						return getDictLabel('customerClass', row.custClass.toLowerCase())
					} else {
						return ''
					}
				}
			},
			{ label: '国家/地区', key: 'countryCname', prop: 'countryCname', disabled: false, width: '120' },

			{ label: '预计到达日(国际1程)', key: 'etaTimePlanVoyage1', prop: 'etaTimePlanVoyage1', sortable: 'custom', width: '180' },
			{ label: '实际到达日(国际1程)', key: 'etaTimeRealVoyage1', prop: 'etaTimeRealVoyage1', sortable: 'custom', width: '180' },
			{ label: '预计到达日(国内)', key: 'etaTimePlanVoyage0', prop: 'etaTimePlanVoyage0', sortable: 'custom', width: '150' },
			{ label: '实际到达日(国内)', key: 'etaTimeRealVoyage0', prop: 'etaTimeRealVoyage0', sortable: 'custom', width: '150' },
			{ label: '实际派送时间', key: 'deliveryTimes', prop: 'deliveryTimes', width: '150' },
		]
	}
}
const postList = {
	// 默认表头
	defaultColumns: [],

	// 自定义表头特殊处理
	specialColumns: {},

	// 表头库
	columnsBase: []
}

const jointList = {
	defaultColumns: ['jointNo', 'compDeptName', 'mainCompDeptCode', 'mainCompDeptName'],
	columnsBase: [
		// { label: '协同单号', key: '协同单号', prop: 'jointNo', width: '150', disabled: false },
		{
			label: '协同单号',
			key: 'jointNo',
			prop: 'jointNo',
			width: '220',
			minWidth: '220',
			disabled: false,
			// fixed: true,
			type: 'text',
			align: 'center',
			popoverComponent: ColumnJointTip
		},
		{ label: '协同单所属公司', key: 'compDeptName', prop: 'compDeptName', width: '150', disabled: false },
		{ label: '委托单位编号', key: 'mainCompDeptCode', prop: 'mainCompDeptCode', width: '100', disabled: false },
		{ label: '委托单位', key: 'mainCompDeptName', prop: 'mainCompDeptName', disabled: false, width: '150', sortable: 'custom' }
	]
}

const orderReportList = {
	// 默认表头
	defaultColumns: [
		'orderNo',
		'auditTime',
		'serviceType',
		'orderStatus',
		'bkgStatus',
		'prefinCloseStatus',
		'bizDate',
		'bdDeptName',
		'bdEmployeeName',
		'obdEmployeeName',
		'opEmployeeName',
		'opDeptCode',
		'pricingEmployeeName',
		'csEmployeeName',
		'custClass',
		'custName',
		'cargoCustName',
		'polPortCode',
		'podPortCode',
		'airLine',
		'bkgAgentSupplierName',
		'airSysLineName',
		'countryCname',
		'transportTerm',
		'airBillType',
		'billSplitNum',
		'totalQuantity',
		'totalWeight',
		'chargeWeight',
		'totalVolume',
		'cargoCname',
		'cargoEname',
		'mawb',
		'realEflightNumber',
		'custIntrustNo',
		'airCustomsType',
		'businessType',
		'createdTime',
		'planEtdTime',
		'realEtdTime',
		'finCloseStatus',
		'usdProfit',
		'cnyProfit',
		'predictTotalQuantity',
		'predictTotalWeight',
		'predictTotalVolume',
		'predictChargeWeight',
		'serviceNames',
		'etaTimePlanVoyage1',
		'etaTimeRealVoyage1',
		'etaTimePlanVoyage0',
		'etaTimeRealVoyage0',
		'deliveryTimes',
	],
	// 自定义表头特殊处理
	specialColumns: {
		porPortCode: ['porPortCode', 'porPortName'],
		polPortCode: ['polPortCode', 'polPortName'],
		transitPortCode: ['transitPortCode', 'transitPortName'],
		podPortCode: ['podPortCode', 'podPortName'],
		receiptPlaceCode: ['receiptPlaceCode', 'receiptPlaceName']
	},
	// 表头库
	columnsBase(handleOrderNoInfo) {
		return [
			{
				label: '工作号',
				key: 'orderNo',
				prop: 'orderNo',
				width: '120',
				disabled: false,
				formatter: (row, column) => {
					return `<span size="mini" class="underline">${row.orderNo}</span>`
				},
				method: (index, row) => {
					handleOrderNoInfo(row)
				}
			},
			{ label: '审核时间', key: 'auditTime', prop: 'auditTime', width: '150', disabled: false, sortable: 'custom' },
			{
				label: '服务类型',
				key: 'serviceType',
				prop: 'serviceType',
				disabled: false,
				width: '150',
				formatter: (row, column) => {
					return row.serviceTypeName
				}
			},
			{
				label: '订单状态',
				key: 'orderStatus',
				prop: 'orderStatus',
				width: '120',
				disabled: false,
				formatter: (row, column) => {
					let result = getDictLabel('orderStatus', row.orderStatus)
					let color = ''
					// 待审核
					if (['submit'].includes(row.orderStatus)) {
						color = 'yellow'
					}
					// 审核通过，已完成
					if (row.orderStatus === 'complete' || row.orderStatus === 'pass') {
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
				sortable: 'custom',
				width: '120',
				formatter: (row, column) => {
					let str = ''
					str = getDictLabel('airBkgStatus', row.bkgStatus)
					if (['draft', 'submit'].includes(row.bkgStatus) || ['st06', 'st14', 'st21', 'st22'].includes(row.serviceType)) {
						str = ''
					}
					return str
				}
			},
			{
				label: '预关账状态',
				key: 'prefinCloseStatus',
				prop: 'prefinCloseStatus',
				width: '120',
				disabled: false,
				formatter: (row, column) => {
					return row.prefinCloseStatus === 'yes' ? '已关账' : '未关账'
				}
			},
			{ label: '业务日期', key: 'bizDate', prop: 'bizDate', width: '120', disabled: false },
			{ label: '销售部门', key: 'bdDeptName', prop: 'bdDeptName', width: '120', disabled: false },
			{ label: '销售', key: 'bdEmployeeName', prop: 'bdEmployeeName', sortable: 'custom', width: '120', disabled: false },
			{ label: '销售助理', key: 'obdEmployeeName', prop: 'obdEmployeeName', sortable: 'custom', width: '120', disabled: false },
			{ label: '操作', key: 'opEmployeeName', prop: 'opEmployeeName', width: '120', sortable: 'custom', disabled: false },
			{ label: '操作部门code', key: 'opDeptCode', prop: 'opDeptCode', width: '120', disabled: false },
			{ label: '商务', key: 'pricingEmployeeName', prop: 'pricingEmployeeName', width: '120', disabled: false },
			{ label: '客服', key: 'csEmployeeName', prop: 'csEmployeeName', width: '120', disabled: false },
			{
				label: '客户类型',
				key: 'custClass',
				prop: 'custClass',
				disabled: false,
				width: '120',
				formatter: (row, column) => {
					if (row.custClass) {
						return getDictLabel('customerClass', row.custClass.toLowerCase())
					} else {
						return ''
					}
				}
			},
			{ label: '委托单位', key: 'custName', prop: 'custName', popoverComponent: CustNameShow, width: '150', sortable: 'custom', disabled: false },
			{ label: '发货单位', key: 'cargoCustName', prop: 'cargoCustName', disabled: false, width: '120' },
			{ label: '起运港代码', key: 'polPortCode', prop: 'polPortCode', disabled: false, width: '120' },
			{ label: '目的地代码', key: 'podPortCode', prop: 'podPortCode', disabled: false, width: '120' },
			{ label: '航空公司', key: 'airLine', prop: 'airLine', disabled: false, width: '120' },
			{ label: '订舱代理名称', key: 'bkgAgentSupplierName', prop: 'bkgAgentSupplierName', disabled: false, width: '120' },
			{ label: '系统航线', key: 'airSysLineName', prop: 'airSysLineName', disabled: false, width: '120', sortable: 'custom' },
			{ label: '国家/地区', key: 'countryCname', prop: 'countryCname', disabled: false, width: '120', sortable: 'custom' },
			{
				label: '运输条款',
				key: 'transportTerm',
				prop: 'transportTerm',
				disabled: false,
				width: '120',
				formatter: (row, column) => {
					return getDictLabel('airTransportTerm', row.transportTerm)
				}
			},
			{
				label: '运单方式',
				key: 'airBillType',
				prop: 'airBillType',
				disabled: false,
				formatter: (row, column) => {
					return getDictLabel('airTransitWay', row.airBillType)
				},
				width: '120'
			},
			{ label: '分单数', key: 'billSplitNum', prop: 'billSplitNum', disabled: false, width: '120', sortable: 'custom' },
			{ label: '制单件数', key: 'totalQuantity', prop: 'totalQuantity', width: '120', sortable: 'custom', disabled: false },
			{ label: '制单毛重', key: 'totalWeight', prop: 'totalWeight', width: '120', sortable: 'custom', disabled: false },
			{ label: '制单计费重', key: 'chargeWeight', prop: 'chargeWeight', sortable: 'custom', width: '120', disabled: false },
			{ label: '制单体积', key: 'totalVolume', prop: 'totalVolume', sortable: 'custom', width: '120', disabled: false },
			{ label: '中文品名', key: 'cargoCname', prop: 'cargoCname', sortable: 'custom', width: '120', disabled: false },
			{ label: '英文品名', key: 'cargoEname', prop: 'cargoEname', sortable: 'custom', width: '120', disabled: false },
			{ label: '主单号', key: 'mawb', prop: 'mawb', sortable: 'custom', width: '120', disabled: false },
			{ label: '实际航次号', key: 'realEflightNumber', prop: 'realEflightNumber', disabled: false, width: '120', sortable: 'custom' },
			{ label: '客户委托号', key: 'custIntrustNo', prop: 'custIntrustNo', width: '100', disabled: false },
			{
				label: '报关方式',
				key: 'airCustomsType',
				prop: 'airCustomsType',
				disabled: false,
				formatter: (row, column) => {
					let str = ''
					str = getDictLabel('airCustomsType', row.airCustomsType)
					if (['draft', 'submit'].includes(row.bkgStatus)) str = ''
					return str
				},
				width: '120'
			},
			{
				label: '业务类型',
				key: 'businessType',
				prop: 'businessType',
				width: '120',
				disabled: false,
				formatter: (row, column) => {
					return row.businessTypeCn
				}
			},
			{ label: '订单创建时间', key: 'createdTime', prop: 'createdTime', width: '150', disabled: false, sortable: 'custom' },
			{ label: '预计起飞日期', key: 'planEtdTime', prop: 'planEtdTime', disabled: false, width: '120', sortable: 'custom' },
			{ label: '实际起飞日期', key: 'realEtdTime', prop: 'realEtdTime', disabled: false, width: '120', sortable: 'custom' },
			{
				label: '关账状态',
				key: 'finCloseStatus',
				prop: 'finCloseStatus',
				width: '120',
				disabled: false,
				formatter: (row, column) => {
					return row.finCloseStatus === 'yes' ? '已关账' : '未关账'
				}
			},
			{ label: '利润额-折美元含手续费', key: 'usdProfit', prop: 'usdProfit', disabled: false, width: '180', sortable: 'custom' },
			{ label: '利润额-折人民币含手续费', key: 'cnyProfit', prop: 'cnyProfit', disabled: false, width: '180', sortable: 'custom' },
			{ label: '预计件数', key: 'predictTotalQuantity', prop: 'predictTotalQuantity', disabled: false, width: '100' },
			{ label: '预计毛重', key: 'predictTotalWeight', prop: 'predictTotalWeight', disabled: false, width: '100' },
			{ label: '预计体积', key: 'predictTotalVolume', prop: 'predictTotalVolume', disabled: false, width: '100' },
			{ label: '预计计费重', key: 'predictChargeWeight', prop: 'predictChargeWeight', disabled: false, width: '100', sortable: 'custom' },
			{
				label: '服务项',
				key: 'serviceNames',
				prop: 'serviceNames',
				disabled: false,
				width: '180'
			},
			{ label: '预计到达日(国际1程)', key: 'etaTimePlanVoyage1', prop: 'etaTimePlanVoyage1', sortable: 'custom', width: '180' },
			{ label: '实际到达日(国际1程)', key: 'etaTimeRealVoyage1', prop: 'etaTimeRealVoyage1', sortable: 'custom', width: '180' },
			{ label: '预计到达日(国内)', key: 'etaTimePlanVoyage0', prop: 'etaTimePlanVoyage0', sortable: 'custom', width: '150' },
			{ label: '实际到达日(国内)', key: 'etaTimeRealVoyage0', prop: 'etaTimeRealVoyage0', sortable: 'custom', width: '150' },
			{ label: '实际派送时间', key: 'deliveryTimes', prop: 'deliveryTimes', width: '150' },
		]
	}
}

const state = {
	isOrderFeeCount: false,	// 是否有费用
	overseasStatus: 1,
	overseasTipMsg: '',
	orderNo: '',
	custid: '',
	custName: '',
	bkgStatus: '',
	serviceList: [],
	serviceInfoList: [], // 服务项信息，code,id,申请取消状态等
	serviceCode: '', // 服务项code
	allServicesMenu: [
		{
			cname: '订舱',
			ename: 'booking',
			component: 'AirTransportOrderBook',
			code: 'airbook'
		},
		{ cname: '提货', ename: 'Pol Ltl', component: 'AirPolLtl', code: 'pick_up', businessType: 'ship_export_lcl' },
		{
			cname: '报关',
			ename: 'declaration',
			component: 'AirClearance',
			child: [{ cname: '代理报关', ename: 'declaration', code: 'air_pol_declaration', component: 'Agent' }]
		},
		{ cname: '贸易单证', ename: 'douments', component: 'AirDocument', code: 'air_doc' },
		{ cname: '换单', ename: 'change document', component: 'AirChangeDocument', code: 'pod_change_doc' },
		{
			cname: '清关',
			ename: 'Commissioned clearance',
			component: 'AirPodClearance',
			code: 'pod_comm_clearance'
		},
		{
			cname: '目的港仓储',
			ename: 'POD Warehousing',
			component: 'AirPodWarehouseIng',
			code: 'pod_warehouse'
		},
		// {
		// 	cname: '目的港仓储',
		// 	ename: 'POD Warehousing',
		// 	component: 'AirPodWarehouseIng',
		// 	child: [
		// 		{
		// 			cname: '目的港仓储',
		// 			ename: 'warehousing',
		// 			code: 'pod_warehouse',
		// 			component: 'PodWarehouse'
		// 		}
		// 	]
		// },
		{
			cname: '派送',
			ename: 'LTL delivery',
			component: 'AirPodLtlDelivery',
			code: 'pod_ltl_delivery'
		},
		{ cname: '保险', ename: 'insurance', component: 'AirInsurance', code: 'insurance' }
	],
	orderReportList: {
		defaultColumns: orderReportList.defaultColumns,
		specialColumns: orderReportList.specialColumns,
		columnsBase: orderReportList.columnsBase,
		finCloseStatus: [
			{ label: '未关账', value: 'no' },
			{ label: '已关账', value: 'yes' }
		]
	},
	// 订单
	orderList: {
		defaultColumns: orderList.defaultColumns,
		specialColumns: orderList.specialColumns,
		columnsBase: orderList.columnsBase,
		createItem: {
			orderNo: '', // 工作号
			businessType: '', // 业务类型
			serviceType: '', // 服务类型
			submitType: '', // 保存提交类型（draft、submit）
			intrustRemark: '', // 委托备注信息
			polPortCode: '', // 起运港CODE
			podPortCode: '', // 目的地CODE
			airTransitWay: [], // 中转方式
			airSysLineCode: '', // 航线代码
			airSysLineCode: '', // 航线代码
			airLine: '', // 航空公司
			etdTime: '', // 预计起飞日期
			airCustomsType: '', // 报关方式
			airBillType: '', // 运单方式
			billSplitNum: '', // 分单数量
			airPayMode: '', // 付款方式
			airDocumentType: '', // 随机文件
			cargoCustList: [], // 货物信息
			transport: {}, // 货运信息
			serviceList: [], // 货运信息
			workAssign: [], // 货运信息
			// feeWeight:'',
			cargoStat: {
				// 货物统计信息
			},
			bookingFiles: {},
			overseasServiceType: '',
			overseasCompanyCode: '',
			overseasCompanyName: '',
			overseasFirstAgentId: null,
			overseasFirstAgentName: '',
			overseasSecondAgentId: null,
			overseasSecondAgentName: '',
			overseasAgentIds: []
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
			{ label: '业务助理', value: 'obd' },
			{ label: '下单助理', value: 'asst' },
			{ label: '商务', value: 'pricing' },
			{ label: '操作', value: 'op' },
			{ label: '放货', value: 'rc' },
			{ label: '应收财务', value: 'ac' },
			{ label: '海外应收财务', value: 'eac' },
			{ label: '客服', value: 'cs' },
			{ label: '海外客服', value: 'ecs' },
			{ label: '海外商务', value: 'epricing' }
		],
		allRole: ['bd', 'obd', 'asst', 'op', 'cs', 'ecs', 'ac', 'eac', 'pricing', 'rc', 'epricing'],
		// 订单详情可写入角色集合
		allEditRoleArr: ['bd', 'obd', 'asst', 'op', 'cs', 'ecs', 'ac', 'eac', 'pricing', 'epricing'],
		// 登录用户具有的可写入角色集合，含有两种以上需要做角色切换
		userEditRoles: [],
		ordDetRole: '' // 进入订单详情后设置的当前角色
	},
	// 协同订单
	jointList: {
		defaultColumns: jointList.defaultColumns.concat(orderList.defaultColumns).filter(item => !['custid', 'custName'].includes(item)),
		specialColumns: orderList.specialColumns,
		columnsBase: handleOrderNoInfo => {
			return jointList.columnsBase.concat(orderList.columnsBase(handleOrderNoInfo)).filter(item => !['custid', 'custName'].includes(item.key))
		}
	},
	// 仓储
	warehouseActivityKey: '', // 当前table
	podWarehouseActivityKey: '', // 目的港仓储当前table
	// 寄单管理
	postList: {
		defaultColumns: postList.defaultColumns,
		specialColumns: postList.specialColumns,
		columnsBase: postList.columnsBase
	},
	// 放单列表
	blPutList: {
		// 默认表头
		defaultColumns: [
			'blNo',
			'bdEmployeeName',
			'bdEmployeeId',
			'orderNo',
			'auditStatus',
			'takeStatus',
			'putStatus',
			'telexApplyStatus',
			'telexDownStatus',
			'orderStatus',
			'etaTime',
			// 'isPledge',
			'pledgeOrderNo',
			'pledgeSource',
			'etdTime',
			'tdTime',
			'blType',
			'custName',
			'custSettleType',
			'custAccountPeriod',
			'shipCarrierCode',
			'bkgAgentSupplierName',
			'blMode',
			'auditEmployeeName',
			'auditEmployeeId',
			'auditTime',
			'dispatchEmployeeName',
			'dispatchTime',
			'takeEmployeeName',
			'takeTime',
			'isAgreeRelease',
			'telexDownTime',
			'cancelReason',
			'cancelRemark',
			'cancelTime',
			'fileNo'
		],
		// 自定义表头特殊处理
		specialColumns: {
			// podFreeIn: ['podFreeOut', 'podFree']
		},
		// 表头库
		columnsBase(handleOrderNoInfo, handleViewFileList) {
			return [
				{
					label: '提单号',
					key: 'blNo',
					prop: 'blNo',
					fixed: true,
					disabled: false,
					align: 'left',
					formatter: (row, column) => {
						let str = ''
						let blTypeStr = row.blType === 'hbl' ? `<i class="icon-hbl2">H</i>` : row.blType === 'mbl' ? `<i class="icon-hbl2">M</i>` : ''
						if (row.isCancel === 'y') str = `<i class="icon-tip icon-cancel">撤</i>`
						return `<pre>${str}${blTypeStr}${row.blNo}</pre>`
					}
				},
				{
					label: '工作号',
					key: 'orderNo',
					prop: 'orderNo',
					width: '150',
					disabled: false,
					fixed: true,
					type: 'text',
					formatter: (row, column) => {
						return `<el-button type="text" class="underline">${row.orderNo}</el-button>`
					},
					method: (index, row) => {
						handleOrderNoInfo(index, row)
					}
				},
				{ label: '预计到港时间', key: 'etaTime', prop: 'etaTime', disabled: false },
				// {
				// 	label: '是否押单',
				// 	key: 'isPledge',
				// 	prop: 'isPledge',
				// 	disabled: false,
				// 	formatter: (row, column) => {
				// 		return row.isPledge === 'y' ? '是' : '否'
				// 	}
				// },
				{ label: '所押提单号', key: 'pledgeBlNo', prop: 'pledgeBlNo', disabled: false },
				{
					label: '押单来源',
					key: 'pledgeSource',
					prop: 'pledgeSource',
					disabled: false,
					formatter: (row, column) => {
						return row.pledgeSource
						// return getDictLabel('pledgeSource', row.pledgeSource)
					}
				},
				{ label: '预计开船时间', key: 'etdTime', prop: 'etdTime', disabled: false },
				{ label: '实际开船时间', key: 'tdTime', prop: 'tdTime', disabled: false },
				{
					label: '提单类型',
					key: 'blType',
					prop: 'blType',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('blType', row.blType)
					}
				},
				{ label: '委托单位', key: 'custName', prop: 'custName', width: '150', disabled: false },
				{
					label: '委托单位结算方式',
					key: 'custSettleType',
					prop: 'custSettleType',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('settleMode', row.custSettleType)
					}
				},
				{ label: '委托单位账期', key: 'custAccountPeriod', prop: 'custAccountPeriod', disabled: false },
				{ label: '船公司', key: 'shipCarrierCode', prop: 'shipCarrierCode', disabled: false },
				{ label: '订舱代理', key: 'bkgAgentSupplierName', prop: 'bkgAgentSupplierName', disabled: false },
				{
					label: '出单方式',
					key: 'blMode',
					prop: 'blMode',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('blMode', row.blMode)
					}
				},
				{ label: '放单审核人', key: 'auditEmployeeName', prop: 'auditEmployeeName', disabled: false },
				{ label: '放单审核时间', key: 'auditTime', prop: 'auditTime', disabled: false },
				{
					label: '放单审核状态',
					key: 'auditStatus',
					prop: 'auditStatus',
					disabled: false,
					formatter: (row, column) => {
						return state.finAuditStatusOptions[row.auditStatus]
					}
				},
				{
					label: '订单状态',
					key: 'orderStatus',
					prop: 'orderStatus',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('orderStatus', row.orderStatus)
					}
				},
				{ label: '派单人', key: 'dispatchEmployeeName', prop: 'dispatchEmployeeName', disabled: false },
				{ label: '派单时间', key: 'dispatchTime', prop: 'dispatchTime', disabled: false },
				{ label: '取单人', key: 'takeEmployeeName', prop: 'takeEmployeeName', disabled: false },
				{
					label: '取单状态',
					key: 'takeStatus',
					prop: 'takeStatus',
					disabled: false,
					formatter: (row, column) => {
						return row.takeStatus === 'finish' ? '已取单' : '未取单'
					}
				},
				{
					label: '客户是否同意放货',
					key: 'isAgreeRelease',
					prop: 'isAgreeRelease',
					disabled: false,
					formatter: (row, column) => {
						return row.isAgreeRelease === 'y' ? '是' : '否'
					}
				},
				{
					label: '船东电放是否申请',
					key: 'telexApplyStatus',
					prop: 'telexApplyStatus',
					disabled: false,
					formatter: (row, column) => {
						return row.telexApplyStatus === 'y' ? '是' : '否'
					}
				},
				{
					label: '船东电放申请完成',
					key: 'telexDownStatus',
					prop: 'telexDownStatus',
					disabled: false,
					formatter: (row, column) => {
						return row.telexDownStatus === 'y' ? '是' : '否'
					}
				},
				{ label: '船东电放完成时间', key: 'telexDownTime', prop: 'telexDownTime', disabled: false },
				{ label: '取单完成时间', key: 'takeTime', prop: 'takeTime', disabled: false },
				{ label: '撤回原因', key: 'cancelReason', prop: 'cancelReason', disabled: false },
				{ label: '撤回备注', key: 'cancelRemark', prop: 'cancelRemark', disabled: false },
				{ label: '撤回时间', key: 'cancelTime', prop: 'cancelTime', disabled: false },
				{
					label: '附件信息',
					key: 'fileNo',
					prop: 'fileNo',
					disabled: false,
					formatter: (row, column) => {
						return `<el-button type="text" class="underline">查看</el-button>`
					},
					method: (index, row) => {
						handleViewFileList(index, row)
					}
				},
				{
					label: '放单状态',
					key: 'putStatus',
					prop: 'putStatus',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('blPutStatus', row.putStatus)
					}
				},
				{ label: '销售', key: 'bdEmployeeName', prop: 'bdEmployeeName', disabled: false },
				{ label: '销售所属部门', key: 'bdDeptName', prop: 'bdDeptName', disabled: false },
				{ label: '申请时间', key: 'applyTime', prop: 'applyTime', disabled: false }
			]
		}
	},
	// 提单财务审核列表
	blFinList: {
		// 默认表头
		defaultColumns: [
			// 'oid',
			'orderNo',
			'airlineId',
			'airlineName',
			'expectLaunchDate',
			'actualLaunchDate',
			'expectArriveDate',
			'applyStatus',
			'applyReason',
			'applyTime',
			'pledgeOrderNo',
			// 'isPledge',
			'reviewEmployeeName',
			'reviewStatus',
			'reviewTime',
			'handleReason',
			'handleRemark',
			'receiveFeeCleanStatus',
			'payFeeCleanStatus',
			'orderStatus',
			'bizDate',
			'bdEmployeeName',
			'bdDeptName',
			'bkgAgentSupplierName',
			'poNo',
			'clientType',
			'instructCompany',
			'settlementModel',
			'accountPeriod',
			'settlementCompany'
		],
		// 自定义表头特殊处理
		specialColumns: {
			// podFreeIn: ['podFreeOut', 'podFree']
		},
		// 表头库
		columnsBase() {
			return [
				// {
				//   label: '提单号',
				//   key: 'oid',
				//   prop: 'oid',
				//   fixed: true,
				//   disabled: false,
				//   align: 'center',
				//   type: 'text',
				//   // formatter: (row, column) => {
				//   //   return `<el-button type="text" class="underline">${row.oid}</el-button>`
				//   // }
				// },
				// { label: '放货id', key: 'putId', prop: 'putId', disabled: false },
				{
					label: '工作号',
					key: 'orderNo',
					prop: 'orderNo',
					width: '150',
					disabled: false,
					fixed: true,
					type: 'text'
					// formatter: (row, column) => {
					// 	return `<el-button type="text" class="underline">${row.orderNo}</el-button>`
					// }
				},
				{
					label: '航空公司',
					key: 'airlineName',
					prop: 'airlineName',
					disabled: false
				},
				{
					label: '预计起飞日期',
					key: 'expectLaunchDate',
					prop: 'expectLaunchDate',
					disabled: false,
					sortable: 'custom'
				},
				{
					label: '实际起飞日期',
					key: 'actualLaunchDate',
					prop: 'actualLaunchDate',
					disabled: false,
					sortable: 'custom'
				},
				{
					label: '预计到达日期',
					key: 'expectArriveDate',
					prop: 'expectArriveDate',
					disabled: false,
					sortable: 'custom'
				},
				// {
				// 	label: '放单申请状态',
				// 	key: 'applyStatus',
				// 	prop: 'applyStatus',
				// 	disabled: false,
				// 	formatter: (row, column) => {
				// 		let result = ''
				// 		if (row.applyStatus === 'to_apply') {
				// 			result = '未申请'
				// 		} else {
				// 			result = '已申请'
				// 		}
				// 		return result
				// 	}
				// },
				{
					label: '放单申请原因',
					key: 'applyReason',
					prop: 'applyReason',
					disabled: false
				},
				{
					label: '放单申请时间',
					key: 'applyTime',
					prop: 'applyTime',
					disabled: false
				},
				{
					label: '所押提单号',
					key: 'pledgeBlNo',
					prop: 'pledgeBlNo',
					disabled: false
				},
				// {
				// 	label: '是否押单',
				// 	key: 'isPledge',
				// 	prop: 'isPledge',
				// 	disabled: false,
				// 	formatter: (row, column) => {
				// 		let result = ''
				// 		if (row.pledgeBlNo) {
				// 			result = '是'
				// 		} else{
				// 			result = '否'
				// 		}
				// 		return result
				// 	}
				// },
				{
					label: '放单审核人',
					key: 'reviewEmployeeName',
					prop: 'reviewEmployeeName',
					disabled: false
				},
				{
					label: '放单审核状态',
					key: 'reviewStatus',
					prop: 'reviewStatus',
					disabled: false,
					formatter: (row, column) => {
						let result = ''
						if (row.reviewStatus === 'to_review') {
							result = '待审核'
						} else if (row.reviewStatus === 'reviewing') {
							result = '处理中'
						} else if (row.reviewStatus === 'reviewed') {
							result = '已放单'
						}
						return result
					}
				},
				{
					label: '放单审核时间',
					key: 'reviewTime',
					prop: 'reviewTime',
					disabled: false
				},
				{
					label: '处理原因',
					key: 'handleReason',
					prop: 'handleReason',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('blFinAuditProcessingReason', row.handleReason)
					}
				},
				{
					label: '处理备注',
					key: 'handleRemark',
					prop: 'handleRemark',
					disabled: false
				},
				{
					label: '应收费用结清状态',
					key: 'receiveFeeCleanStatus',
					prop: 'receiveFeeCleanStatus',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('feeSettleStatus', row.receiveFeeCleanStatus)
					}
				},
				{
					label: '应付费用结清状态',
					key: 'payFeeCleanStatus',
					prop: 'payFeeCleanStatus',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('feeSettleStatus', row.payFeeCleanStatus)
					}
				},
				{
					label: '订单状态',
					key: 'orderStatus',
					prop: 'orderStatus',
					disabled: false,
					formatter: (row, column) => {
						let result = getDictLabel('orderStatus', row.orderStatus)
						// 操作中状态特殊处理
						if (row.orderStatus === 'pass' && row.isOpHandle === 'y') {
							result = '操作中'
						}
						return result
					}
				},
				{
					label: '业务日期',
					key: 'bizDate',
					prop: 'bizDate',
					disabled: false
				},
				{
					label: '销售',
					key: 'bdEmployeeName',
					prop: 'bdEmployeeName',
					disabled: false
				},
				{
					label: '销售所属部门',
					key: 'bdDeptName',
					prop: 'bdDeptName',
					disabled: false
				},
				{
					label: '订舱代理',
					key: 'bkgAgentSupplierName',
					prop: 'bkgAgentSupplierName',
					disabled: false
				},
				{ label: '入仓编号', key: 'poNo', prop: 'poNo', width: '120', disabled: false },
				{
					label: '客户类型',
					key: 'clientType',
					prop: 'clientType',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('customerClass', row.clientType)
					}
				},
				{ label: '委托单位', key: 'instructCompany', prop: 'instructCompany', width: '150', disabled: false },
				{
					label: '委托单位结算方式',
					key: 'settlementModel',
					prop: 'settlementModel',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('settleMode', row.custSettleType)
					}
				},
				{ label: '委托单位账期', key: 'accountPeriod', prop: 'accountPeriod', disabled: false },
				{ label: '结算单位', key: 'settlementCompany', prop: 'settlementCompany', width: '150', disabled: false }
			]
		},
		isContainerReturnOptions: [
			{ label: '是', value: 'y' },
			{ label: '否', value: 'n' }
		]
	},
	// 放单申请列表
	blFinApplyList: {
		// 表头库
		columnsBase() {
			return [
				// {
				// 	label: '提单号',
				// 	key: 'oid',
				// 	prop: 'oid',
				// 	fixed: true,
				// 	disabled: false,
				// 	align: 'center',
				// 	type: 'text',
				// 	// formatter: (row, column) => {
				// 	// 	return `<el-button type="text" class="underline">${row.oid}</el-button>`
				// 	// }
				// },
				{
					label: '工作号',
					key: 'orderNo',
					prop: 'orderNo',
					width: '150',
					disabled: false,
					fixed: true,
					type: 'text'
					// formatter: (row, column) => {
					// 	return `<el-button type="text" class="underline">${row.orderNo}</el-button>`
					// }
				},
				{ label: '航空公司', key: 'airlineName', prop: 'airlineName', disabled: false },
				{ label: '预计起飞日期', key: 'expectLaunchDate', prop: 'expectLaunchDate', width: '120', disabled: false, sortable: 'custom' },
				{ label: '实际起飞日期', key: 'actualLaunchDate', prop: 'actualLaunchDate', width: '120', disabled: false, sortable: 'custom' },
				{ label: '预计到达日期', key: 'expectArriveDate', prop: 'expectArriveDate', width: '120', disabled: false, sortable: 'custom' },
				{
					label: '放单申请状态',
					key: 'applyStatus',
					prop: 'applyStatus',
					width: '120',
					disabled: false,
					formatter: (row, column) => {
						let result = ''
						if (row.applyStatus === 'to_apply') {
							result = '待申请'
						} else {
							result = '已申请'
						}
						return result
					}
				},
				{
					label: '放单申请原因',
					key: 'applyReason',
					prop: 'applyReason',
					width: '120',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('blFinApplyType', row.applyReason)
					}
				},
				{ label: '放单申请时间', key: 'applyTime', prop: 'applyTime', width: '150', disabled: false },
				{ label: '所押提单号', key: 'pledgeBlNo', prop: 'pledgeBlNo', width: '100', disabled: false },
				// {
				// 	label: '是否押单',
				// 	key: 'isPledge',
				// 	prop: 'isPledge',
				// 	disabled: false,
				// 	formatter: (row, column) => {
				// 		let result = ''
				// 		if (row.pledgeBlNo) {
				// 			result = '是'
				// 		} else{
				// 			result = '否'
				// 		}
				// 		return result
				// 	}
				// },
				{ label: '放单审核人', key: 'reviewEmployeeName', width: '100', prop: 'reviewEmployeeName', disabled: false },
				{
					label: '放单审核状态',
					key: 'reviewStatus',
					prop: 'reviewStatus',
					width: '120',
					disabled: false,
					formatter: (row, column) => {
						let result = ''
						if (row.reviewStatus === 'to_review') {
							result = '待审核'
						} else if (row.reviewStatus === 'reviewing') {
							result = '处理中'
						} else if (row.reviewStatus === 'reviewed') {
							result = '通过'
						}
						return result
					}
				},
				{ label: '放单审核时间', key: 'reviewTime', prop: 'reviewTime', width: '150', disabled: false },
				{
					label: '处理原因',
					key: 'handleReason',
					prop: 'handleReason',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('blFinAuditProcessingReason', row.handleReason)
					}
				},
				{ label: '处理备注', key: 'handleRemark', prop: 'handleRemark', disabled: false },
				{
					label: '应收费用结清状态',
					key: 'receiveFeeCleanStatus',
					prop: 'receiveFeeCleanStatus',
					width: '150',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('feeSettleStatus', row.receiveFeeCleanStatus)
					}
				},
				{
					label: '应付费用结清状态',
					key: 'payFeeCleanStatus',
					prop: 'payFeeCleanStatus',
					disabled: false,
					width: '150',
					formatter: (row, column) => {
						return getDictLabel('feeSettleStatus', row.payFeeCleanStatus)
					}
				},
				{
					label: '订单状态',
					key: 'orderStatus',
					prop: 'orderStatus',
					disabled: false,
					formatter: (row, column) => {
						let result = getDictLabel('orderStatus', row.orderStatus)
						// 操作中状态特殊处理
						if (row.orderStatus === 'pass' && row.isOpHandle === 'y') {
							result = '操作中'
						}
						return result
					}
				},
				{ label: '业务日期', key: 'bizDate', prop: 'bizDate', width: '120', disabled: false },
				{ label: '销售', key: 'bdEmployeeName', prop: 'bdEmployeeName', width: '120', disabled: false },
				{ label: '销售所属部门', key: '	bdDeptName', prop: 'bdDeptName', width: '120', disabled: false },
				{ label: '订舱代理', key: '	bkgAgentSupplierName', prop: 'bkgAgentSupplierName', width: '150', disabled: false },
				{ label: '入仓编号', key: '	poNo', prop: 'poNo', width: '120', disabled: false },
				{
					label: '客户类型',
					key: 'clientType',
					prop: 'clientType',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('customerClass', row.clientType)
					}
				},
				{ label: '委托单位', key: 'instructCompany', prop: 'instructCompany', width: '150', disabled: false },
				{
					label: '委托单位结算方式',
					key: 'settlementModel',
					prop: 'settlementModel',
					width: '150',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('settleMode', row.custSettleType)
					}
				},
				{ label: '委托单位账期', key: 'accountPeriod', prop: 'accountPeriod', width: '120', disabled: false },
				{ label: '结算单位', key: 'settlementCompany', prop: 'settlementCompany', width: '150', disabled: false }
			]
		}
	},
	// 客户类型
	custType: [
		{ label: '国内同行', value: 'domestic_peer' },
		{ label: '国内直客', value: 'domestic_cust' },
		{ label: '国外同行', value: 'foreign_peer' },
		{ label: '国外直客', value: 'foreign_cust' }
	],
	// 财务审核状态
	finAuditStatusOptions: {
		init: '待提交',
		submit: '待审核',
		pass: '审核通过',
		processing: '处理中',
		refuse: '审核拒绝'
	},
	// 订仓类型
	// whBookTypeOptions: store.state.dict.dictMap.whBookType,
	// 所有分公司
	companyList: [],
	airOrderInfo: null
}

const mutations = {
	setOrderFeeCount(state, value) {
		state.isOrderFeeCount = value
	},
	setOverseasStatus(state, payload) {
		state.overseasStatus = payload
	},
	setOverseasTipMsg(state, payload) {
		state.overseasTipMsg = payload
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
		state.orderList.userEditRoles = value
	},
	setRole(state, value) {
		state.orderList.ordDetRole = value
	},
	setAirOrderInfo(state, value) {
		state.airOrderInfo = value
	}
}

const actions = {
	setOrderFeeCount(context, params) {
		context.commit('setOrderFeeCount', params)
	},
	setOverseasStatus(context, params) {
		context.commit('setOverseasStatus', params)
	},
	setOverseasTipMsg(context, params) {
		context.commit('setOverseasTipMsg', params)
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
	// 入仓单上传
	soUpload({ state }, { uri, params }) {
		return new Promise((resolve, reject) => {
			let token = getToken()
			let jsonData = {
				fromSystem: 'web_H5',
				toSystem: 'mng_base_server',
				reqId: randomString(),
				reqTime: parseTime(new Date().getTime()),
				data: params.data
			}
			const form = new FormData()
			console.log(JSON.stringify(jsonData))
			form.append('jsonData', JSON.stringify(jsonData))
			params.fileName && form.append('fileName', params.fileName)
			axios({
				// 用axios发送post请求
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
	setAirOrderInfo(context, params) {
		context.commit('setAirOrderInfo', params)
	},
	// 订单保存
	orderSave({ state }, { uri, params }) {
		return new Promise((resolve, reject) => {
			let token = getToken()
			axios({
				// 用axios发送post请求
				method: 'post',
				url: uri, // 请求地址
				data: params, // 参数
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
						resolve(res) // 'error'
					}
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
