import axios from 'axios'
import store from '@/store'
import { MessageBox, Message, Loading } from 'element-ui'
import { parseTime, randomString, isArray } from '@/utils'
import { getDictLabel } from '@/utils/tools'
import { getToken } from '@/utils/auth'
import ColumnTip from '@/views/order/order/components/columnTip.vue'
import ColumnJointTip from '@/views/order/order/components/columnJointTip.vue'
import CustNameShow from '@/views/order/order/components/custNameShow.vue'
import ColumnCustName from '@/views/order/order/orderList/blFinApplyList/components/custNameShow.vue'
import ColumnSiCopy from '@/views/order/order/components/columnSiCopy.vue'
import ColumnFinCopy from '@/views/order/order/components/columnFinCopy.vue'
import BdRemark from '@/views/order/order/orderList/components/bdRemark.vue'
import { basePortListByCodes, baseShipCarrierInfo } from '@/api/base'
import { getValueByKeys, orderCustInfo } from '@/api/order/list'
import { getUserCompanyInfo } from '@/api/user'
import { getDefaultExpress } from '@/api/order/expressConfig'
import { getWorkExceptionTypeList, getWorkExceptionReasonList } from '@/api/order/workException'
const bulkRoBkgStatusObj = {
	pass: '未订舱',
	booked: '已订舱',
	book_release: '上家已放舱',
	release_custom: '已放舱给客户'
}
const orderList = {
	// 默认表头
	defaultColumns: [
		'whPoNo',
		'cancelExecTime',
		'shipperName',
		'payMode',
		'serviceName',
		'tcEmployeeName',
		'tcDeptName',
		'orderNo',
		'exportOrderNo',
		'bdEmployeeName',
		'bdDeptName',
		'obdEmployeeName',
		'obdDeptName',
		'asstEmployeeName',
		'asstDeptName',
		'pricingEmployeeName',
		'pricingDeptName',
		'bkgEmployeeName',
		'bkgDeptName',
		'auditTime',
		'opEmployeeName',
		'opDeptName',
		'docEmployeeName',
		'docDeptName',
		'cscEmployeeName',
		'cscDeptName',
		'rcEmployeeName',
		'rcDeptName',
		'acEmployeeName',
		'acDeptName',
		'eacEmployeeName',
		'eacDeptName',
		'lineCsEmployeeName',
		'lineCsDeptName',
		'bdServiceMode',
		'orderStatus',
		'bkgStatus',
		'isOpHandle',
		'isTrack',
		'priceType',
		'custid',
		'custIntrustNo',
		'custName',
		'bdRemark',
		'intrustRemark',
		'auditRemark',
		'bkgRemark',
		'prefinCloseStatus',
		'finCloseStatus',
		'prefinCloseTime',
		'finCloseTime',
		'businessType',
		'bkgFinishTime',
		'createdTime',
		'createdName',
		'bizDate',
		'so',
		// 'blNo',
		'serviceType',
		'whBookStatus',
		'shipCarrierCode',
		'bkgAgentSupplierName',
		'porPortCode',
		'polPortCode',
		'transitPortCode',
		'transitPortCode1',
		'transitPortCode2',
		'podPortCode',
		'receiptPlaceName',
		'whBookType',
		'lclStatus',
		'fclOrderNo',
		'unloadingPortCode',
		'destinationArea',
		'bargeVessel',
		'bargeVoyage',
		'vessel',
		'voyage',
		'bargeCyCutOff',
		'cyCutOff',
		'bargeEtdTime',
		'etdTime',
		'bargeTdTime',
		'tdTime',
		'containerInfo',
		'amountT',
		'cn',
		'sn',
		'cargoCname',
		'carrierLineName',
		'siCutOff',
		'vgmCutOff',
		'isChange',
		'issueNotifyStatus',
		'isNotify',
		'isDrop',
		'isCancelApply',
		'blType',
		'hbl',
		'mbl',
		'receiveFeeCleanStatus',
		'payFeeCleanStatus',
		'receiveFeeConfirmStatus',
		'payFeeConfirmStatus',
		'receiveInvoiceStatus',
		'payFeeApplyStatus',
		'shipRefNo',
		'etWhCyCutOff',
		'whCyCutOff',
		'issueStatusStr',
		'etaTime',
		'sysLineCode',
		'sysLineName',
		'epricingEmployeeName',
		'epricingDeptName',
		'ecsEmployeeName',
		'ecsDeptName',
		'custClass',
		'systemCode'
	],
	// 自定义表头特殊处理
	specialColumns: {
		porPortCode: ['porPortCode', 'porPortName'],
		polPortCode: ['polPortCode', 'polPortName'],
		transitPortCode: ['transitPortCode', 'transitPortName'],
		transitPortCode1: ['transitPortCode1', 'transitPortName1'],
		transitPortCode2: ['transitPortCode2', 'transitPortName2'],
		podPortCode: ['podPortCode', 'podPortName'],
		unloadingPortCode: ['unloadingPortCode', 'unloadingPortName']
		// receiptPlaceCode: ['receiptPlaceCode', 'receiptPlaceName']
	},
	// 表头库
	columnsBase(handleOrderNoInfo, handleClickBdRemark, handleSaveRemark) {
		return [
			{
				label: '工作号',
				key: 'orderNo',
				prop: 'orderNo',
				width: '230',
				minWidth: '230',
				disabled: false,
				fixed: true,
				type: 'text',
				align: 'right',
				popoverComponent: ColumnTip,
				// minWidthDrag: true,
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
			{ label: '取消/终止/关闭时间', key: 'cancelExecTime', prop: 'cancelExecTime', width: '150', disabled: false },
			{
				label: '入舱单号',
				key: 'whPoNo',
				prop: 'whPoNo',
				disabled: false,
				width: '150'
			},
			{
				label: '销售',
				key: 'bdEmployeeName',
				prop: 'bdEmployeeName',
				disabled: false,
				sortable: 'custom',
				width: '80'
			},
			{
				label: '销售部门',
				key: 'bdDeptName',
				prop: 'bdDeptName',
				disabled: false,
				width: '100'
			},
			{
				label: '取单客服(MBL)',
				key: 'tcEmployeeName',
				prop: 'tcEmployeeName',
				disabled: false,
				width: '110'
			},
			{
				label: '取单客服(MBL)部门',
				key: 'tcDeptName',
				prop: 'tcDeptName',
				disabled: false,
				width: '130'
			},
			{
				label: '销售助理',
				key: 'obdEmployeeName',
				prop: 'obdEmployeeName',
				disabled: false,
				sortable: 'custom',
				width: '80'
			},
			{
				label: '销售助理部门',
				key: 'obdDeptName',
				prop: 'obdDeptName',
				disabled: false,
				width: '100'
			},
			{
				label: '下单助理',
				key: 'asstEmployeeName',
				prop: 'asstEmployeeName',
				disabled: false,
				width: '80'
			},
			{
				label: '下单助理部门',
				key: 'asstDeptName',
				prop: 'asstDeptName',
				disabled: false,
				width: '100'
			},
			{
				label: '商务',
				key: 'pricingEmployeeName',
				prop: 'pricingEmployeeName',
				disabled: false,
				width: '80'
			},
			{
				label: '商务部门',
				key: 'pricingDeptName',
				prop: 'pricingDeptName',
				disabled: false,
				width: '100'
			},
			{
				label: '订舱',
				key: 'bkgEmployeeName',
				prop: 'bkgEmployeeName',
				disabled: false,
				width: '80'
			},
			{
				label: '订舱部门',
				key: 'bkgDeptName',
				prop: 'bkgDeptName',
				disabled: false,
				width: '100'
			},
			{
				label: '操作',
				key: 'opEmployeeName',
				prop: 'opEmployeeName',
				disabled: false,
				sortable: 'custom',
				width: '80'
			},
			{ label: '海外客服', key: 'ecsEmployeeName', prop: 'ecsEmployeeName', width: '120', disabled: false },
			{ label: '海外客服部门', key: 'ecsDeptName', prop: 'ecsDeptName', width: '120', disabled: false },
			{ label: '海外商务', key: 'epricingEmployeeName', prop: 'epricingEmployeeName', width: '120', disabled: false },
			{ label: '海外商务部门', key: 'epricingDeptName', prop: 'epricingDeptName', width: '120', disabled: false },
			{
				label: '审核时间',
				key: 'auditTime',
				prop: 'auditTime',
				sortable: 'custom',
				width: '150'
			},
			{
				label: '操作部门',
				key: 'opDeptName',
				prop: 'opDeptName',
				disabled: false,
				width: '100'
			},
			{
				label: '文件',
				key: 'docEmployeeName',
				prop: 'docEmployeeName',
				disabled: false,
				sortable: 'custom',
				width: '100'
			},
			{
				label: '文件部门',
				key: 'docDeptName',
				prop: 'docDeptName',
				disabled: false,
				width: '100'
			},
			{
				label: '单证',
				key: 'cscEmployeeName',
				prop: 'cscEmployeeName',
				disabled: false,
				width: '80'
			},
			{
				label: '单证部门',
				key: 'cscDeptName',
				prop: 'cscDeptName',
				disabled: false,
				width: '100'
			},
			{
				label: '放货',
				key: 'rcEmployeeName',
				prop: 'rcEmployeeName',
				disabled: false,
				width: '80'
			},
			{
				label: '放货部门',
				key: 'rcDeptName',
				prop: 'rcDeptName',
				disabled: false,
				width: '100'
			},
			{
				label: '应收',
				key: 'acEmployeeName',
				prop: 'acEmployeeName',
				disabled: false,
				width: '80'
			},
			{
				label: '应收部门',
				key: 'acDeptName',
				prop: 'acDeptName',
				disabled: false,
				width: '100'
			},
			{
				label: '海外应收',
				key: 'eacEmployeeName',
				prop: 'eacEmployeeName',
				disabled: false,
				width: '80'
			},
			{
				label: '海外应收部门',
				key: 'eacDeptName',
				prop: 'eacDeptName',
				disabled: false,
				width: '100'
			},
			{
				label: '航线客服',
				key: 'lineCsEmployeeName',
				prop: 'lineCsEmployeeName',
				disabled: false,
				width: '80'
			},
			{
				label: '航线客服部门',
				key: 'lineCsDeptName',
				prop: 'lineCsDeptName',
				disabled: false,
				width: '100'
			},
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
				label: '订单状态',
				key: 'orderStatus',
				prop: 'orderStatus',
				disabled: false,
				width: '80',
				sortable: 'custom',
				formatter: (row, column) => {
					let result = getDictLabel('orderStatus', row.orderStatus)
					let color = ''
					// 20211216弃用
					// 操作中状态特殊处理
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
				width: '80',
				formatter: (row, column) => {
					let str = ''
					str = getDictLabel('bkgStatus', row.bkgStatus)
					if (['draft', 'submit'].includes(row.bkgStatus)) str = ''
					// 散杂滚装的订舱状态特殊处理
					if (row.businessType === 'ship_bulk_ro') {
						for (var i in bulkRoBkgStatusObj) {
							if (i === row.bkgStatus) {
								str = bulkRoBkgStatusObj[row.bkgStatus]
							}
						}
					}
					return `<span class="bkgStatus-${row.bkgStatus}">${str}</span>`
				}
			},
			{
				label: '操作处理状态',
				key: 'isOpHandle',
				prop: 'isOpHandle',
				disabled: false,
				width: '80',
				formatter: (row, column) => {
					let str = ''
					str = row.isOpHandle === 'complete' ? '已完成' : row.isOpHandle === 'y' ? '处理中' : '未处理'
					return `<span class="isOpHandle-${row.isOpHandle}">${str}</span>`
				}
			},
			{
				label: '航程跟踪',
				key: 'isTrack',
				prop: 'isTrack',
				disabled: false,
				width: '70',
				formatter: (row, column) => {
					return getDictLabel('yesOrNoOptions', row.isTrack)
				}
			},
			{
				label: '拿价类型',
				key: 'priceType',
				prop: 'priceType',
				disabled: false,
				width: '85',
				formatter: (row, column) => {
					let priceType = row.priceType ? row.priceType.toLowerCase() : ''
					let str = getDictLabel('priceType', priceType)
					return str
				}
			},
			// { label: '委托单位编号', key: 'custid', prop: 'custid', disabled: false },
			{
				label: '客户委托号',
				key: 'custIntrustNo',
				prop: 'custIntrustNo',
				disabled: false,
				width: '150'
			},
			{
				label: '委托单位',
				key: 'custName',
				prop: 'custName',
				popoverComponent: CustNameShow,
				disabled: false,
				width: '180'
			},
			{ label: 'SO信息', key: 'so', prop: 'so', disabled: false, width: '150' },
			{
				label: '备注',
				key: 'bdRemark',
				prop: 'bdRemark',
				width: '200',
				disabled: false,
				popoverComponent: BdRemark,
				noRowSelect: true,
				method: (row, val) => {
					handleClickBdRemark(row, val)
					// handleSaveRemark(row, val)
				}
			},
			{
				label: '委托备注',
				key: 'intrustRemark',
				prop: 'intrustRemark',
				disabled: false,
				width: '150'
			},
			{
				label: '商务备注',
				key: 'auditRemark',
				prop: 'auditRemark',
				disabled: false,
				width: '150'
			},
			{
				label: '订舱备注',
				key: 'bkgRemark',
				prop: 'bkgRemark',
				disabled: false,
				width: '150'
			},
			{
				label: '预关账状态',
				key: 'prefinCloseStatus',
				prop: 'prefinCloseStatus',
				width: '100',
				disabled: false,
				sortable: 'custom',
				formatter: (row, column) => {
					return row.prefinCloseStatus === 'yes' ? '已关账' : '未关账'
					// let sItem = state.orderList.finCloseStatus.find(item => item.value === row.prefinCloseStatus)
					// return sItem ? sItem.label : row.prefinCloseStatus
				}
			},
			{
				label: '关账状态',
				key: 'finCloseStatus',
				prop: 'finCloseStatus',
				disabled: false,
				sortable: 'custom',
				width: '80',
				formatter: (row, column) => {
					return row.finCloseStatus === 'yes' ? '已关账' : '未关账'
					// let sItem = state.orderList.finCloseStatus.find(item => item.value === row.finCloseStatus)
					// return sItem ? sItem.label : row.finCloseStatus
				}
			},
			{
				label: '预关账时间',
				key: 'prefinCloseTime',
				prop: 'prefinCloseTime',
				sortable: 'custom',
				width: '150'
			},
			{
				label: '关账时间',
				key: 'finCloseTime',
				prop: 'finCloseTime',
				sortable: 'custom',
				width: '150'
			},
			{
				label: '开仓/港时间',
				key: 'openDate',
				prop: 'openDate',
				sortable: 'custom',
				width: '150'
			},
			{
				label: '中转港1预计开船时间',
				key: 'transitEtdDate',
				prop: 'transitEtdDate',
				sortable: 'custom',
				width: '150'
			},
			{
				label: '中转港1实际开船时间',
				key: 'transitTdDate',
				prop: 'transitTdDate',
				sortable: 'custom',
				width: '150'
			},
			{
				label: '中转港2预计开船时间',
				key: 'transitEtdDate1',
				prop: 'transitEtdDate1',
				sortable: 'custom',
				width: '150'
			},
			{
				label: '中转港2实际开船时间',
				key: 'transitTdDate1',
				prop: 'transitTdDate1',
				sortable: 'custom',
				width: '150'
			},
			{
				label: '中转港3预计开船时间',
				key: 'transitEtdDate2',
				prop: 'transitEtdDate2',
				sortable: 'custom',
				width: '150'
			},
			{
				label: '中转港3实际开船时间',
				key: 'transitTdDate2',
				prop: 'transitTdDate2',
				sortable: 'custom',
				width: '150'
			},
			{
				label: '实际到港时间',
				key: 'taTime',
				prop: 'taTime',
				sortable: 'custom',
				width: '150'
			},
			{
				label: '目的港提货时间',
				key: 'podTakeDate',
				prop: 'podTakeDate',
				sortable: 'custom',
				width: '150'
			},
			{
				label: '目的港还柜时间',
				key: 'podReturnDate',
				prop: 'podReturnDate',
				sortable: 'custom',
				width: '150'
			},
			{
				label: '业务类型',
				key: 'businessType',
				prop: 'businessType',
				disabled: false,
				width: '100',
				formatter: (row, column) => {
					return row.businessTypeCn
					// return getDictLabel('businessType', row.businessType)
				}
			},
			{
				label: 'BKG放舱时间',
				key: 'bkgFinishTime',
				prop: 'bkgFinishTime',
				width: '150',
				disabled: false,
				sortable: 'custom'
			},
			{
				label: '订单创建时间',
				key: 'createdTime',
				prop: 'createdTime',
				width: '150',
				disabled: false,
				sortable: 'custom'
			},
			{
				label: this.$t('Common.createdBy'),
				key: 'createdName',
				prop: 'createdName',
				width: '80',
				disabled: false
			},
			{
				label: '业务日期',
				key: 'bizDate',
				prop: 'bizDate',
				width: '100',
				disabled: false,
				sortable: 'custom'
			},
			// { label: 'MBL/HBL单号', key: 'blNo', prop: 'blNo', disabled: false },
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
				label: '拼箱订舱状态',
				key: 'whBookStatus',
				prop: 'whBookStatus',
				disabled: false,
				width: '95',
				// formatter: (row, column) => {
				// 	return getDictLabel('whBookStatus', row.whBookStatus)
				// },
				formatter: (row, column) => {
					let result = getDictLabel('whBookStatus', row.whBookStatus)
					let color = row.whBookStatus
					return `<span class="${color}">${result}</span>`
				}
			},
			{
				label: '船公司',
				key: 'shipCarrierCode',
				prop: 'shipCarrierCode',
				disabled: false,
				width: '100'
			},
			// {label: '订舱代理', key: 'bkgAgentSupplierId', prop: 'bkgAgentSupplierId', disabled: false},
			{
				label: '订舱代理',
				key: 'bkgAgentSupplierName',
				prop: 'bkgAgentSupplierName',
				disabled: false,
				width: '150'
			},
			{
				label: '驳船收货地',
				key: 'porPortCode',
				prop: 'porPortCode',
				disabled: false,
				width: '150',
				formatter: (row, column) => {
					return row.porPortName
				}
			},
			{
				label: '大船起运港',
				key: 'polPortCode',
				prop: 'polPortCode',
				width: '150',
				disabled: false,
				formatter: (row, column) => {
					return row.polPortName
				}
			},
			{
				label: '中转港1',
				key: 'transitPortCode',
				prop: 'transitPortCode',
				width: '150',
				disabled: false,
				formatter: (row, column) => {
					return row.transitPortName
				}
			},
			{
				label: '中转港2',
				key: 'transitPortCode1',
				prop: 'transitPortCode1',
				width: '150',
				disabled: false,
				formatter: (row, column) => {
					return row.transitPortName1
				}
			},
			{
				label: '中转港3',
				key: 'transitPortCode2',
				prop: 'transitPortCode2',
				width: '150',
				disabled: false,
				formatter: (row, column) => {
					return row.transitPortName2
				}
			},
			{
				label: '卸货港',
				key: 'unloadingPortCode',
				prop: 'unloadingPortCode',
				width: '150',
				disabled: false,
				formatter: (row, column) => {
					return row.unloadingPortName
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
				label: '装货地',
				key: 'receiptPlaceName',
				prop: 'receiptPlaceName',
				width: '100',
				disabled: false,
				formatter: (row, column) => {
					return row.receiptPlaceName
				}
			},
			{
				label: '系统航线代码',
				key: 'sysLineCode',
				prop: 'sysLineCode',
				disabled: false,
				width: 100
			},
			{
				label: '系统航线',
				key: 'sysLineName',
				prop: 'sysLineName',
				disabled: false,
				width: 100
			},
			{
				label: '订舱类型',
				key: 'whBookType',
				prop: 'whBookType',
				width: '80',
				disabled: false,
				formatter: (row, column) => {
					return getDictLabel('whBookType', row.whBookType)
				}
			},
			{
				label: '拼箱状态',
				key: 'lclStatus',
				prop: 'lclStatus',
				width: '80',
				disabled: false,
				formatter: (row, column) => {
					return getDictLabel('lclStatus', row.lclStatus)
				}
			},
			{
				label: '拼箱后的整柜单号',
				key: 'fclOrderNo',
				prop: 'fclOrderNo',
				width: '130',
				disabled: false
			},
			{
				label: '最终目的地',
				key: 'destinationArea',
				prop: 'destinationArea',
				width: '150',
				disabled: false
			},
			{
				label: '驳船船名',
				key: 'bargeVessel',
				prop: 'bargeVessel',
				disabled: false,
				width: '120'
			},
			{
				label: '驳船航次',
				key: 'bargeVoyage',
				prop: 'bargeVoyage',
				disabled: false,
				width: '120'
			},
			{
				label: '大船船名',
				key: 'vessel',
				prop: 'vessel',
				disabled: false,
				width: '120'
			},
			{
				label: '大船航次',
				key: 'voyage',
				prop: 'voyage',
				disabled: false,
				width: '120'
			},
			{
				label: '驳船截关时间',
				key: 'bargeCyCutOff',
				prop: 'bargeCyCutOff',
				disabled: false,
				sortable: 'custom',
				width: '120'
			},
			{
				label: '大船截关时间',
				key: 'cyCutOff',
				prop: 'cyCutOff',
				disabled: false,
				sortable: 'custom',
				width: '120'
			},
			{
				label: '驳船预计开船时间',
				key: 'bargeEtdTime',
				prop: 'bargeEtdTime',
				disabled: false,
				sortable: 'custom',
				width: '150'
			},
			{
				label: '大船预计开船时间',
				key: 'etdTime',
				prop: 'etdTime',
				disabled: false,
				sortable: 'custom',
				width: '150'
			},
			{
				label: '驳船实际开船时间',
				key: 'bargeTdTime',
				prop: 'bargeTdTime',
				disabled: false,
				sortable: 'custom',
				width: '150'
			},
			{
				label: '大船实际开船时间',
				key: 'tdTime',
				prop: 'tdTime',
				disabled: false,
				sortable: 'custom',
				width: '150'
			},
			{
				label: '箱型箱量',
				key: 'containerInfo',
				prop: 'containerInfo',
				disabled: false,
				width: '150'
			},
			{
				label: 'T量',
				key: 'amountT',
				prop: 'amountT',
				disabled: false,
				width: '60'
			},
			{ label: '柜号', key: 'cn', prop: 'cn', disabled: false, width: '150' },
			{ label: '封号', key: 'sn', prop: 'sn', disabled: false, width: '150' },
			{
				label: '中文品名',
				key: 'cargoCname',
				prop: 'cargoCname',
				disabled: false,
				width: '150'
			},
			{
				label: '承运人航线',
				key: 'carrierLineName',
				prop: 'carrierLineName',
				disabled: false,
				width: '120'
			},
			{
				label: '截补料时间',
				key: 'siCutOff',
				prop: 'siCutOff',
				disabled: false,
				sortable: 'custom',
				width: '150'
			},
			{
				label: '截VGM时间',
				key: 'vgmCutOff',
				prop: 'vgmCutOff',
				disabled: false,
				sortable: 'custom',
				width: '150'
			},
			{
				label: '预计截仓时间',
				key: 'etWhCyCutOff',
				prop: 'etWhCyCutOff',
				disabled: false,
				sortable: 'custom',
				width: '150'
			},
			{
				label: '实际截仓时间',
				key: 'whCyCutOff',
				prop: 'whCyCutOff',
				disabled: false,
				sortable: 'custom',
				width: '150'
			},
			{
				label: '是否改船',
				key: 'isChange',
				prop: 'isChange',
				disabled: true,
				width: '80',
				formatter: (row, column) => {
					return row.isChange === '0' ? '否' : '是'
				}
			},
			{
				label: '已通知放舱',
				key: 'issueNotifyStatus',
				prop: 'issueNotifyStatus',
				disabled: true,
				width: '100',
				formatter: (row, column) => {
					return row.issueNotifyStatus === 'y' ? '是' : row.issueNotifyStatus === 'n' ? '否' : ''
				}
			},
			{
				label: '申请取消',
				key: 'isCancelApply',
				prop: 'isCancelApply',
				disabled: true,
				width: '',
				formatter: (row, column) => {
					return row.isCancelApply === '0' ? '否' : '是'
				}
			},
			{
				label: '提单类型',
				key: 'blType',
				prop: 'blType',
				disabled: false,
				width: '100',
				formatter: (row, column) => {
					return getDictLabel('blType', row.blType)
				}
			},
			{ label: 'HBL', key: 'hbl', prop: 'hbl', disabled: false, width: '150' },
			{ label: 'MBL', key: 'mbl', prop: 'mbl', disabled: false, width: '150' },
			{
				label: '应收费用结清状态',
				key: 'receiveFeeCleanStatus',
				prop: 'receiveFeeCleanStatus',
				disabled: false,
				width: '140',
				formatter: (row, column) => {
					return getDictLabel('feeSettleStatus', row.receiveFeeCleanStatus)
				}
			},
			{
				label: '应付费用结清状态',
				key: 'payFeeCleanStatus',
				prop: 'payFeeCleanStatus',
				disabled: false,
				width: '140',
				formatter: (row, column) => {
					return getDictLabel('feeSettleStatus', row.payFeeCleanStatus)
				}
			},
			{
				label: '应收确认状态',
				key: 'receiveFeeConfirmStatus',
				prop: 'receiveFeeConfirmStatus',
				disabled: false,
				width: '140',
				formatter: (row, column) => {
					return getDictLabel('feeConfirmStatus', row.receiveFeeConfirmStatus)
				}
			},
			{
				label: '应付确认状态',
				key: 'payFeeConfirmStatus',
				prop: 'payFeeConfirmStatus',
				disabled: false,
				width: '140',
				formatter: (row, column) => {
					return getDictLabel('feeConfirmStatus', row.payFeeConfirmStatus)
				}
			},
			{
				label: '应收发票状态',
				key: 'receiveInvoiceStatus',
				prop: 'receiveInvoiceStatus',
				disabled: false,
				width: '120'
			},
			{
				label: '请款状态',
				key: 'payFeeApplyStatus',
				prop: 'payFeeApplyStatus',
				disabled: false,
				width: '100'
			},
			{
				label: '船东参考号',
				key: 'shipRefNo',
				prop: 'shipRefNo',
				width: '100',
				disabled: false
			},
			{
				label: '放舱给客户状态',
				key: 'issueStatusStr',
				prop: 'issueStatusStr',
				width: '120',
				disabled: false
				// formatter: (row, column) => {
				// 	return row.serviceType === 'st02' ? '' : row.issueStatusStr
				// }
			},
			{
				label: '预计到港时间',
				key: 'etaTime',
				prop: 'etaTime',
				width: '120',
				sortable: 'custom',
				disabled: false
			},
			{
				label: '发货单位',
				key: 'shipperName',
				prop: 'shipperName',
				disabled: false,
				width: '150'
			},
			{
				label: '付款方式',
				key: 'payMode',
				prop: 'payMode',
				disabled: false,
				width: '100',
				formatter: (row, column) => {
					return getDictLabel('payMode', row.payMode)
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
			{
				label: '订单来源',
				key: 'systemCode',
				prop: 'systemCode',
				disabled: false,
				width: '100',
				formatter: (row, column) => {
					return getDictLabel('orderSystemCode', row.systemCode)
				}
			}
			// {label: '客户委托单号', key: 'custIntrustNo', prop: 'custIntrustNo', sortable: 'custom', width: '150', disabled: false},
			// {label: '订单来源', key: 'source', prop: 'source', disabled: false},
			// {label: '货物来源', key: 'cargoSource', prop: 'cargoSource', disabled: false},
		].map(item => {
			return { ...item, minWidth: item.width }
		})
	}
}
const postList = {
	// 默认表头
	defaultColumns: [
		'expressCode',
		'expressNo',
		'receisendType',
		'postType',
		'status',
		'expressType',
		'businessType',
		'expressSupplierName',
		'postTime',
		'postUser',
		'amt',
		'currency',
		'relates',
		'payer',
		'signTime',
		'signUser',
		'receiveCompany',
		'receiveAddress',
		'recipient',
		'recipientPhone',
		'sendCompany',
		'sendAddress',
		'sender',
		'senderPhone',
		'companyName',
		'remark',
		'transferFee',
		'feeStatus',
		'createdName',
		'createdTime',
		'updatedName',
		'updatedTime'
	],

	// 自定义表头特殊处理
	specialColumns: {},

	// 表头库
	columnsBase(handleExpNoInfo, shareFee) {
		return [
			{
				label: '寄单编号',
				key: 'expressCode',
				prop: 'expressCode',
				width: '150',
				disabled: false,
				type: 'text',
				fixed: true,
				formatter: (row, column) => {
					return `<el-button type="text" class="underline">${row.expressCode}</el-button>`
				},
				method: (index, row) => {
					handleExpNoInfo(index, row)
				}
			},
			{
				label: '快递单号',
				key: 'expressNo',
				prop: 'expressNo',
				width: '120',
				fixed: true,
				align: 'left',
				disabled: false
			},
			{
				label: '收寄类型',
				key: 'receisendType',
				prop: 'receisendType',
				width: '100',
				disabled: false,
				formatter: (row, column) => {
					return getDictLabel('receisendType', row.receisendType)
				}
			},
			{
				label: '寄单方式',
				key: 'postType',
				prop: 'postType',
				width: '100',
				disabled: false,
				formatter: (row, column) => {
					return getDictLabel('postType', row.postType)
				}
			},
			{
				label: '费用状态',
				key: 'feeStatus',
				prop: 'feeStatus',
				disabled: false,
				width: '100',
				formatter: (row, column) => {
					return getDictLabel('expressFeeStatus', row.feeStatus)
				}
			},
			{
				label: '业务类型',
				key: 'businessType',
				prop: 'businessType',
				width: '150',
				disabled: false,
				formatter: (row, column) => {
					return getDictLabel('businessType', row.businessType)
				}
			},
			{
				label: '寄件状态',
				key: 'status',
				prop: 'status',
				disabled: false,
				width: '100',
				formatter: (row, column) => {
					return getDictLabel('postStatus', row.status)
				}
			},
			{
				label: '快件类型',
				key: 'expressType',
				prop: 'expressType',
				disabled: false,
				width: '100',
				formatter: (row, column) => {
					return getDictLabel('expressType', row.expressType)
				}
			},
			{
				label: '快递公司',
				key: 'expressSupplierName',
				prop: 'expressSupplierName',
				disabled: false,
				width: '150'
			},
			{
				label: '寄单时间',
				key: 'postTime',
				prop: 'postTime',
				width: '150',
				disabled: false
			},
			{
				label: '寄单人',
				key: 'postUser',
				prop: 'postUser',
				disabled: false,
				width: '100'
			},
			{ label: '金额', key: 'amt', prop: 'amt', disabled: false, width: '100' },
			{
				label: '币种',
				key: 'currency',
				prop: 'currency',
				disabled: false,
				width: '100'
			},
			{
				label: '关联工作单号/业务员',
				key: 'relates',
				prop: 'relates',
				width: '200',
				disabled: false,
				formatter: (row, column) => {
					// let html = ''
					// row.relates.forEach(item => {
					//   html += `<div>${item}</div>`
					// })
					// return html
					return row.relates.toString()
				}
			},
			{
				label: '付款方',
				key: 'payer',
				prop: 'payer',
				width: '100',
				disabled: false,
				formatter: (row, column) => {
					return getDictLabel('expressPayer', row.payer)
				}
			},
			{
				label: '签收时间',
				key: 'signTime',
				prop: 'signTime',
				width: '150',
				disabled: false
			},
			{
				label: '签收人',
				key: 'signUser',
				prop: 'signUser',
				width: '100',
				disabled: false
			},
			{
				label: '收件方公司',
				key: 'receiveCompany',
				prop: 'receiveCompany',
				width: '150',
				disabled: false
			},
			{
				label: '收件方地址',
				key: 'receiveAddress',
				prop: 'receiveAddress',
				disabled: false,
				width: '150'
			},
			{
				label: '收件人',
				key: 'recipient',
				prop: 'recipient',
				disabled: false,
				width: '100'
			},
			{
				label: '收件人电话',
				key: 'recipientPhone',
				prop: 'recipientPhone',
				width: '150',
				disabled: false
			},
			{
				label: '发件方公司',
				key: 'sendCompany',
				prop: 'sendCompany',
				width: '150',
				disabled: false
			},
			{
				label: '发件方地址',
				key: 'sendAddress',
				prop: 'sendAddress',
				width: '150',
				disabled: false
			},
			{
				label: '发件人',
				key: 'sender',
				prop: 'sender',
				disabled: false,
				width: '100'
			},
			{
				label: '发件电话',
				key: 'senderPhone',
				prop: 'senderPhone',
				disabled: false,
				width: '150'
			},
			{
				label: '付款分公司',
				key: 'companyName',
				prop: 'companyName',
				disabled: false,
				width: '150'
			},
			{
				label: '备注',
				key: 'remark',
				prop: 'remark',
				disabled: false,
				width: '150'
			},
			{
				label: '快递费分摊',
				key: 'shareFee',
				prop: 'shareFee',
				disabled: false,
				width: '100',
				formatter: (row, column) => {
					return `<el-button type="text" class="underline">查看</el-button>`
				},
				method: (index, row) => {
					shareFee(index, row)
				}
			},
			// {
			// 	label: '费用确认状态',
			// 	key: 'feeStatus',
			// 	prop: 'feeStatus',
			// 	disabled: false,
			// 	width: '120',
			// 	formatter: (row, column) => {
			// 		return getDictLabel('expressFeeStatus', row.feeStatus)
			// 	}
			// },
			{
				label: this.$t('Common.createdBy'),
				key: 'createdName',
				prop: 'createdName',
				disabled: false,
				width: '100'
			},
			{
				label: this.$t('Common.createTime'),
				key: 'createdTime',
				prop: 'createdTime',
				disabled: false,
				width: '150'
			},
			{
				label: '修改人',
				key: 'updatedName',
				prop: 'updatedName',
				disabled: false,
				width: '100'
			},
			{
				label: '修改时间',
				key: 'updatedTime',
				prop: 'updatedTime',
				disabled: false,
				width: '150'
			}
		].map(item => {
			return { ...item, minWidth: item.width }
		})
	}
}

const jointList = {
	defaultColumns: ['jointNo', 'compDeptName', 'mainCompDeptName'],
	columnsBase: [
		{
			label: '协同单号',
			key: 'jointNo',
			prop: 'jointNo',
			width: '220',
			minWidth: '220',
			disabled: false,
			type: 'text',
			align: 'center',
			popoverComponent: ColumnJointTip
		},
		{
			label: '协同单所属公司',
			key: 'compDeptName',
			prop: 'compDeptName',
			width: '150',
			disabled: false
		},
		{
			label: '委托单位',
			key: 'mainCompDeptName',
			prop: 'mainCompDeptName',
			disabled: false,
			width: '180'
		}
	]
}
const blInfoList = {
	defaultColumns: ['cargoDesc', 'forwardAgent'],
	columnsBase: [
		{
			label: '货物描述',
			key: 'cargoDesc',
			prop: 'cargoDesc',
			width: '150',
			disabled: false
		},
		{
			label: '运输代理人',
			key: 'forwardAgent',
			prop: 'forwardAgent',
			width: '150',
			disabled: false
		}
	]
}

// 提单列表
const blList = {
	// 默认表头
	defaultColumns: [
		'blNo',
		'orderNo',
		'blType',
		'auditTime',
		'obdEmployeeName',
		'obdDeptName',
		'isBindContainer',
		'so',
		'isDraftConfirm',
		'siStatus',
		'isAgreeRelease',
		'retrieveStatus',
		'putStatus',
		'blMode',
		'consignee',
		'shipper',
		'notify1',
		'bargeVessel',
		'bargeVoyage',
		'vessel',
		'voyage',
		'porPortCode',
		'polPortCode',
		'unloadingPortCode',
		'podPortCode',
		'destinationArea',
		'transitPortCode',
		'transitPortCode1',
		'transitPortCode2',
		'bdEmployeeName',
		'bdDeptName',
		'opEmployeeName',
		'opDeptName',
		'docEmployeeName',
		'docDeptName',
		'cscEmployeeName',
		'cscDeptName',
		'createdName',
		'createdTime',
		'custName',
		'sysLineName',
		'shipCarrierCode',
		'bkgAgentSupplierName',
		'bizDate',
		'orderStatus',
		'auditStatus',
		'etaTime',
		'putEmployeeName',
		'applyTime',
		'tdTime',
		'businessType',
		'cn',
		'auditEmployeeName',
		'putFinishTime',
		'telexDownTime',
		'expressTime',
		'placeCompName',
		'transferStatus',
		'takeStatus',
		'agreeTime',
		'agreeExpressTime'
	],
	// 自定义表头特殊处理
	specialColumns: {
		porPortCode: ['porPortCode', 'porPortName'],
		polPortCode: ['polPortCode', 'polPortName'],
		transitPortCode: ['transitPortCode', 'transitPortName'],
		transitPortCode1: ['transitPortCode1', 'transitPortName1'],
		transitPortCode2: ['transitPortCode2', 'transitPortName2'],
		podPortCode: ['podPortCode', 'podPortName'],
		unloadingPortCode: ['unloadingPortCode', 'unloadingPortName']
		// receiptPlaceCode: ['receiptPlaceCode', 'receiptPlaceName']
	},
	// 表头库
	columnsBase(handleOrderNoInfo) {
		return [
			{
				label: '提单号',
				key: 'blNo',
				prop: 'blNo',
				width: '150',
				minWidth: '150',
				// minWidthDrag: true,
				disabled: false,
				type: 'text',

				formatter: (row, column) => {
					return `<span class="underline">${row.blNo}</span>`
				},
				method: (index, row) => {
					handleOrderNoInfo(row, 'BlList')
				}
			},
			{
				label: '工作号',
				key: 'orderNo',
				prop: 'orderNo',
				width: '150',
				minWidth: '150',
				// minWidthDrag: true,
				disabled: false,
				popoverComponent: ColumnTip,
				// formatter: (row, column) => {
				// 	return `<span class="underline">${row.orderNo}</span>`
				// },
				method: row => {
					handleOrderNoInfo(row, 'OrderDetail')
				}
			},
			{
				label: '提单类型',
				key: 'blType',
				prop: 'blType',
				disabled: false,
				width: '100',
				minWidth: '100',
				// minWidthDrag: true,
				formatter: (row, column) => {
					return getDictLabel('blType', row.blType)
				}
			},
			{
				label: '财务审核时间',
				key: 'auditTime',
				prop: 'auditTime',
				disabled: false,
				sortable: 'custom',
				width: '150'
			},

			{
				label: '订单状态',
				key: 'orderStatus',
				prop: 'orderStatus',
				disabled: false,
				minWidth: '100',
				// minWidthDrag: true,
				width: '100',
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
				label: '是否关联集装箱',
				key: 'isBindContainer',
				prop: 'isBindContainer',
				disabled: false,
				width: '150',
				minWidth: '150',
				// minWidthDrag: true,
				formatter: (row, column) => {
					return row.isBindContainer === 'y' ? '是' : '否'
				}
			},
			{
				label: 'SO信息',
				key: 'so',
				prop: 'so',
				disabled: false,
				minWidth: '150',
				// minWidthDrag: true,
				width: '150'
			},
			{
				label: '草单确认',
				key: 'isDraftConfirm',
				prop: 'isDraftConfirm',
				disabled: false,
				width: '100',
				minWidth: '100',
				// minWidthDrag: true,
				formatter: (row, column) => {
					return row.isDraftConfirm === 'y' ? '已确认' : '未确认'
				}
			},
			{
				label: '补料状态',
				key: 'siStatus',
				prop: 'siStatus',
				disabled: false,
				width: '100',
				minWidth: '100',
				formatter: (row, column) => {
					return row.blType === 'hbl' ? '--' : row.siStatus
				}
			},
			{
				label: '客户同意放货',
				key: 'isAgreeRelease',
				prop: 'isAgreeRelease',
				disabled: false,
				width: '100',
				minWidth: '100',
				// minWidthDrag: true,
				formatter: (row, column) => {
					let str = getDictLabel('isAgreeRelease', row.isAgreeRelease)
					let passStr = row.agreeReleaseStatus === 'pass' ? '(已特殊审批)' : ''
					return `${str}${passStr}`
				}
			},
			{
				label: '正本取单状态',
				key: 'takeStatus',
				prop: 'takeStatus',
				disabled: false,
				width: '100',
				minWidth: '100',
				// minWidthDrag: true,
				formatter: (row, column) => {
					return row.takeStatus === 'finish' ? '已取单' : '未取单'
				}
			},
			{
				label: '放单状态',
				key: 'putStatus',
				prop: 'putStatus',
				disabled: false,
				width: '100',
				minWidth: '100',
				// minWidthDrag: true,
				// formatter: (row, column) => {
				// 	return row.putStatus === 'finish' ? '已放单' : '未放单'
				// },
				formatter: (row, column) => {
					let text = ''
					if (row.putStatus === 'finish') {
						text = '已放单'
					} else if (row.putStatus != 'finish' && row.isUploadTelex != '0' && row.blType === 'mbl') {
						text = '已推送文件'
					} else {
						text = '未放单'
					}
					return text
				}
			},
			{
				label: '出单方式',
				key: 'blMode',
				prop: 'blMode',
				disabled: false,
				width: '100',
				minWidth: '100',
				// minWidthDrag: true,
				formatter: (row, column) => {
					return getDictLabel('blMode', row.blMode)
				}
			},
			{
				label: '收货人',
				key: 'consignee',
				prop: 'consignee',
				disabled: false,
				minWidth: '200',
				// minWidthDrag: true,
				width: '200'
			},
			{
				label: '发货人',
				key: 'shipper',
				prop: 'shipper',
				disabled: false,
				minWidth: '200',
				// minWidthDrag: true,
				width: '200'
			},
			{
				label: '放货人',
				key: 'putEmployeeName',
				prop: 'putEmployeeName',
				disabled: false,
				minWidth: '200',
				// minWidthDrag: true,
				width: '200'
			},

			{
				label: '通知人',
				key: 'notify1',
				prop: 'notify1',
				disabled: false,
				minWidth: '200',
				// minWidthDrag: true,
				width: '200'
			},
			{
				label: '驳船船名',
				key: 'bargeVessel',
				prop: 'bargeVessel',
				disabled: false,
				minWidth: '120',
				// minWidthDrag: true,
				width: '120'
			},
			{
				label: '驳船航次',
				key: 'bargeVoyage',
				prop: 'bargeVoyage',
				disabled: false,
				minWidth: '120',
				// minWidthDrag: true,
				width: '120'
			},
			{
				label: '大船船名',
				key: 'vessel',
				prop: 'vessel',
				disabled: false,
				minWidth: '120',
				// minWidthDrag: true,
				width: '120'
			},
			{
				label: '大船航次',
				key: 'voyage',
				prop: 'voyage',
				disabled: false,
				minWidth: '120',
				// minWidthDrag: true,
				width: '120'
			},
			{
				label: '驳船收货地',
				key: 'porPortCode',
				prop: 'porPortCode',
				disabled: false,
				width: '150',
				minWidth: '150',
				// minWidthDrag: true,
				formatter: (row, column) => {
					return row.porPortName
				}
			},
			{
				label: '大船起运港',
				key: 'polPortCode',
				prop: 'polPortCode',
				width: '150',
				minWidth: '150',
				// minWidthDrag: true,
				disabled: false,
				formatter: (row, column) => {
					return row.polPortName
				}
			},
			{
				label: '卸货港',
				key: 'unloadingPortCode',
				prop: 'unloadingPortCode',
				width: '150',
				minWidth: '150',
				// minWidthDrag: true,
				disabled: false,
				formatter: (row, column) => {
					return row.unloadingPortName
				}
			},
			{
				label: '目的地',
				key: 'podPortCode',
				prop: 'podPortCode',
				width: '150',
				minWidth: '150',
				// minWidthDrag: true,
				disabled: false,
				formatter: (row, column) => {
					return row.podPortName
				}
			},
			{
				label: '最终目的地',
				key: 'destinationArea',
				prop: 'destinationArea',
				width: '150',
				minWidth: '150',
				// minWidthDrag: true,
				disabled: false
			},
			{
				label: '中转港1',
				key: 'transitPortCode',
				prop: 'transitPortCode',
				width: '150',
				minWidth: '150',
				// minWidthDrag: true,
				disabled: false,
				formatter: (row, column) => {
					return row.transitPortName
				}
			},
			{
				label: '中转港2',
				key: 'transitPortCode1',
				prop: 'transitPortCode1',
				width: '150',
				minWidth: '150',
				// minWidthDrag: true,
				disabled: false,
				formatter: (row, column) => {
					return row.transitPortName1
				}
			},
			{
				label: '中转港3',
				key: 'transitPortCode2',
				prop: 'transitPortCode2',
				width: '150',
				minWidth: '150',
				// minWidthDrag: true,
				disabled: false,
				formatter: (row, column) => {
					return row.transitPortName2
				}
			},
			{
				label: '销售',
				key: 'bdEmployeeName',
				prop: 'bdEmployeeName',
				disabled: false,
				minWidth: '150',
				// minWidthDrag: true,
				width: '150'
			},
			{
				label: '销售部门',
				key: 'bdDeptName',
				prop: 'bdDeptName',
				disabled: false,
				minWidth: '100',
				// minWidthDrag: true,
				width: '100'
			},
			{
				label: '销售助理',
				key: 'obdEmployeeName',
				prop: 'obdEmployeeName',
				disabled: false,
				minWidth: '80',
				// minWidthDrag: true,
				width: '80'
			},
			{
				label: '销售助理部门',
				key: 'obdDeptName',
				prop: 'obdDeptName',
				disabled: false,
				minWidth: '100',
				// minWidthDrag: true,
				width: '100'
			},
			// {
			// 	label: '下单助理',
			// 	key: 'asstEmployeeName',
			// 	prop: 'asstEmployeeName',
			// 	disabled: false,
			// 	minWidth: '80',
			// minWidthDrag: true,
			// 	width: '80'
			// },
			// {
			// 	label: '下单助理部门',
			// 	key: 'asstDeptName',
			// 	prop: 'asstDeptName',
			// 	disabled: false,
			// 	minWidth: '100',
			// 	minWidthDrag: true,
			// 	width: '100'
			// },
			// {
			// 	label: '商务',
			// 	key: 'pricingEmployeeName',
			// 	prop: 'pricingEmployeeName',
			// 	disabled: false,
			// 	minWidth: '80',
			// 	minWidthDrag: true,
			// 	width: '80'
			// },
			// {
			// 	label: '商务部门',
			// 	key: 'pricingDeptName',
			// 	prop: 'pricingDeptName',
			// 	disabled: false,
			// 	minWidth: '100',
			// 	minWidthDrag: true,
			// 	width: '100'
			// },
			// {
			// 	label: '订舱',
			// 	key: 'bkgEmployeeName',
			// 	prop: 'bkgEmployeeName',
			// 	disabled: false,
			// 	minWidth: '80',
			// 	minWidthDrag: true,
			// 	width: '80'
			// },
			// {
			// 	label: '订舱部门',
			// 	key: 'bkgDeptName',
			// 	prop: 'bkgDeptName',
			// 	disabled: false,
			// 	minWidth: '100',
			// 	minWidthDrag: true,
			// 	width: '100'
			// },
			{
				label: '操作',
				key: 'opEmployeeName',
				prop: 'opEmployeeName',
				disabled: false,
				minWidth: '150',
				// minWidthDrag: true,
				width: '150'
			},
			{
				label: '操作部门',
				key: 'opDeptName',
				prop: 'opDeptName',
				disabled: false,
				minWidth: '100',
				// minWidthDrag: true,
				width: '100'
			},
			{
				label: '文件',
				key: 'docEmployeeName',
				prop: 'docEmployeeName',
				disabled: false,
				minWidth: '150',
				// minWidthDrag: true,
				width: '150'
			},
			{
				label: '文件部门',
				key: 'docDeptName',
				prop: 'docDeptName',
				disabled: false,
				minWidth: '100',
				// minWidthDrag: true,
				width: '100'
			},
			{
				label: '单证',
				key: 'cscEmployeeName',
				prop: 'cscEmployeeName',
				disabled: false,
				minWidth: '150',
				// minWidthDrag: true,
				width: '150'
			},
			{
				label: '单证部门',
				key: 'cscDeptName',
				prop: 'cscDeptName',
				disabled: false,
				minWidth: '100',
				// minWidthDrag: true,
				width: '100'
			},
			{
				label: '财务审核人',
				key: 'auditEmployeeName',
				prop: 'auditEmployeeName',
				disabled: false,
				minWidth: '150',
				// minWidthDrag: true,
				width: '150'
			},
			// {
			// 	label: '放货部门',
			// 	key: 'rcDeptName',
			// 	prop: 'rcDeptName',
			// 	disabled: false,
			// 	minWidth: '100',
			// 	minWidthDrag: true,
			// 	width: '100'
			// },
			// {
			// 	label: '应收',
			// 	key: 'acEmployeeName',
			// 	prop: 'acEmployeeName',
			// 	disabled: false,
			// 	minWidth: '80',
			// 	minWidthDrag: true,
			// 	width: '80'
			// },
			// {
			// 	label: '应收部门',
			// 	key: 'acDeptName',
			// 	prop: 'acDeptName',
			// 	disabled: false,
			// 	minWidth: '100',
			// 	minWidthDrag: true,
			// 	width: '100'
			// },
			// {
			// 	label: '海外应收',
			// 	key: 'eacEmployeeName',
			// 	prop: 'eacEmployeeName',
			// 	disabled: false,
			// 	minWidth: '80',
			// 	minWidthDrag: true,
			// 	width: '80'
			// },
			// {
			// 	label: '海外应收部门',
			// 	key: 'eacDeptName',
			// 	prop: 'eacDeptName',
			// 	disabled: false,
			// 	minWidth: '100',
			// 	minWidthDrag: true,
			// 	width: '100'
			// },
			{
				label: '提单创建人',
				key: 'createdName',
				prop: 'createdName',
				disabled: false,
				minWidth: '150',
				// minWidthDrag: true,
				width: '150'
			},
			{
				label: '提单创建时间',
				key: 'createdTime',
				prop: 'createdTime',
				disabled: false,
				minWidth: '150',
				// minWidthDrag: true,
				width: '150'
			},
			{
				label: '委托单位',
				key: 'custName',
				prop: 'custName',
				popoverComponent: CustNameShow,
				disabled: false,
				minWidth: '180',
				// minWidthDrag: true,
				width: '180'
			},
			{
				label: '系统航线',
				key: 'sysLineName',
				prop: 'sysLineName',
				disabled: false,
				minWidth: '100',
				// minWidthDrag: true,
				width: 100
			},
			{
				label: '船公司',
				key: 'shipCarrierCode',
				prop: 'shipCarrierCode',
				disabled: false,
				minWidth: '100',
				// minWidthDrag: true,
				width: '100'
			},
			{
				label: '订舱代理',
				key: 'bkgAgentSupplierName',
				prop: 'bkgAgentSupplierName',
				disabled: false,
				minWidth: '150',
				// minWidthDrag: true,
				width: '150'
			},
			{
				label: '业务日期',
				key: 'bizDate',
				prop: 'bizDate',
				minWidth: '100',
				// minWidthDrag: true,
				width: '100',
				disabled: false,
				sortable: 'custom'
			},
			{
				label: '大船实际开船时间',
				key: 'tdTime',
				prop: 'tdTime',
				minWidth: '150',
				// minWidthDrag: true,
				width: '150',
				disabled: false,
				sortable: 'custom'
			},
			{
				label: '提单放单完成时间',
				key: 'putFinishTime',
				prop: 'putFinishTime',
				minWidth: '150',
				// minWidthDrag: true,
				width: '150',
				disabled: false,
				sortable: 'custom'
			},
			{
				label: '船东完成放单时间',
				key: 'telexDownTime',
				prop: 'telexDownTime',
				minWidth: '150',
				// minWidthDrag: true,
				width: '150',
				disabled: false,
				sortable: 'custom'
			},
			{
				label: '财务审核状态',
				key: 'auditStatus',
				prop: 'auditStatus',
				disabled: false,
				width: '100',
				minWidth: '100',
				// minWidthDrag: true,
				// formatter: (row, column) => {
				// 	return getDictLabel('blFinAuditStatus', row.auditStatus)
				// },
				formatter: (row, column) => {
					let result = getDictLabel('customBlFinAuditStatus', row.auditStatus)
					let color = ''
					// 待审核,处理中
					if (['processing', 'submit'].includes(row.auditStatus)) {
						color = 'yellow'
					}
					// 审核通过，已完成
					if (row.auditStatus === 'pass') {
						color = 'green'
					}
					//已拒绝，已取消，已终止
					if (['refuse'].includes(row.auditStatus)) {
						color = 'red'
					}
					return `<span class="${color}">${result}</span>`
				}
			},
			{
				label: '预计到港时间',
				key: 'etaTime',
				prop: 'etaTime',
				minWidth: '120',
				// minWidthDrag: true,
				width: '120',
				disabled: false,
				sortable: 'custom'
			},
			{
				label: '放单申请时间',
				key: 'applyTime',
				prop: 'applyTime',
				disabled: false,
				minWidth: '150',
				// minWidthDrag: true,
				width: '150'
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
				label: '柜号',
				key: 'cn',
				prop: 'cn',
				minWidth: '120',
				// minWidthDrag: true,
				width: '120',
				disabled: false,
				sortable: 'custom'
			},
			{
				label: '寄单时间',
				key: 'expressTime',
				prop: 'expressTime',
				width: '150',
				disabled: false
			},
			{
				label: '客户同意放货时间',
				key: 'agreeTime',
				prop: 'agreeTime',
				width: '150',
				disabled: false
			},
			{
				label: '同意寄单不同意放货时间',
				key: 'agreeExpressTime',
				prop: 'agreeExpressTime',
				width: '150',
				disabled: false
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
}
// 海外仓订单列表
const whOrderList = {
	// 默认表头
	defaultColumns: [
		'orderNo',
		'exportOrderNo',
		// 'jointNo',
		'businessType',
		'serviceName',
		'custName',
		'custIntrustNo',
		'polPortCode',
		'unloadintPortCode',
		'podPortCode',
		'orderStatus',
		'bizDate',
		'prefinCloseStatus',
		'finCloseStatus',
		'prefinCloseTime',
		'finCloseTime',
		'payMode',
		'transportTerm',
		'bdEmployeeName',
		'bdDeptName',
		'obdEmployeeName',
		'obdDeptName',
		'asstEmployeeName',
		'asstDeptName',
		'opEmployeeName',
		'opDeptName',
		'docEmployeeName',
		'doctDeptName',
		'ecsEmployeeName',
		'ecstDeptName',
		'acEmployeeName',
		'acDeptName',
		'custClass'
	],
	// 自定义表头特殊处理
	specialColumns: {
		porPortCode: ['porPortCode', 'porPortName'],
		polPortCode: ['polPortCode', 'polPortName'],
		transitPortCode: ['transitPortCode', 'transitPortName'],
		transitPortCode1: ['transitPortCode1', 'transitPortName1'],
		transitPortCode2: ['transitPortCode2', 'transitPortName2'],
		podPortCode: ['podPortCode', 'podPortName'],
		unloadingPortCode: ['unloadingPortCode', 'unloadingPortName']
		// receiptPlaceCode: ['receiptPlaceCode', 'receiptPlaceName']
	},
	// 表头库
	columnsBase(handleOrderNoInfo) {
		return [
			{
				label: '工作号',
				key: 'orderNo',
				prop: 'orderNo',
				width: '150',
				minWidth: '150',
				disabled: false,
				popoverComponent: ColumnTip,
				method: row => {
					handleOrderNoInfo(row, 'OrderDetail')
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
			// {
			// 	label: '协同单号',
			// 	key: 'jointNo',
			// 	prop: 'jointNo',
			// 	width: '150',
			// 	minWidth: '150',
			// 	disabled: false
			// },
			{
				label: '业务类型',
				key: 'businessType',
				prop: 'businessType',
				width: '80',
				formatter: (row, column) => {
					return row.businessTypeCn
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
				label: '委托单位',
				key: 'custName',
				prop: 'custName',
				popoverComponent: CustNameShow,
				disabled: false,
				minWidth: '180',
				width: '180'
			},
			{
				label: '客户委托号',
				key: 'custIntrustNo',
				prop: 'custIntrustNo',
				disabled: false,
				minWidth: '100',
				width: '180'
			},
			{
				label: '大船起运港',
				key: 'polPortCode',
				prop: 'polPortCode',
				width: '150',
				disabled: false,
				formatter: (row, column) => {
					return row.polPortName
				}
			},
			{
				label: '卸货港',
				key: 'unloadingPortCode',
				prop: 'unloadingPortCode',
				width: '150',
				disabled: false,
				formatter: (row, column) => {
					return row.unloadingPortName
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
				label: '订单状态',
				key: 'orderStatus',
				prop: 'orderStatus',
				disabled: false,
				minWidth: '100',
				// minWidthDrag: true,
				width: '100',
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
				label: '业务日期',
				key: 'bizDate',
				prop: 'bizDate',
				width: '150',
				disabled: false,
				sortable: 'custom'
			},
			{
				label: '预关账状态',
				key: 'prefinCloseStatus',
				prop: 'prefinCloseStatus',
				width: '100',
				disabled: false,
				sortable: 'custom',
				formatter: (row, column) => {
					return row.prefinCloseStatus === 'yes' ? '已关账' : '未关账'
				}
			},
			{
				label: '关账状态',
				key: 'finCloseStatus',
				prop: 'finCloseStatus',
				disabled: false,
				sortable: 'custom',
				width: '90',
				formatter: (row, column) => {
					return row.finCloseStatus === 'yes' ? '已关账' : '未关账'
				}
			},
			{
				label: '预关账时间',
				key: 'prefinCloseTime',
				prop: 'prefinCloseTime',
				sortable: 'custom',
				width: '150'
			},
			{
				label: '关账时间',
				key: 'finCloseTime',
				prop: 'finCloseTime',
				sortable: 'custom',
				width: '150'
			},
			{
				label: '付款方式',
				key: 'payMode',
				prop: 'payMode',
				disabled: false,
				width: '100',
				formatter: (row, column) => {
					return getDictLabel('payMode', row.payMode)
				}
			},
			{
				label: '运输条款',
				key: 'transportTerm',
				prop: 'transportTerm',
				disabled: false,
				width: '100',
				formatter: (row, column) => {
					return getDictLabel('shipTerms', row.transportTerm)
				}
			},
			{
				label: '销售',
				key: 'bdEmployeeName',
				prop: 'bdEmployeeName',
				disabled: false,
				sortable: 'custom',
				width: '90'
			},
			{
				label: '销售部门',
				key: 'bdDeptName',
				prop: 'bdDeptName',
				disabled: false,
				width: '100'
			},
			{
				label: '销售助理',
				key: 'obdEmployeeName',
				prop: 'obdEmployeeName',
				disabled: false,
				sortable: 'custom',
				width: '100'
			},
			{
				label: '销售助理部门',
				key: 'obdDeptName',
				prop: 'obdDeptName',
				disabled: false,
				width: '100'
			},
			{
				label: '下单助理',
				key: 'asstEmployeeName',
				prop: 'asstEmployeeName',
				disabled: false,
				width: '90'
			},
			{
				label: '下单助理部门',
				key: 'asstDeptName',
				prop: 'asstDeptName',
				disabled: false,
				width: '100'
			},
			{
				label: '操作',
				key: 'opEmployeeName',
				prop: 'opEmployeeName',
				disabled: false,
				sortable: 'custom',
				width: '80'
			},
			{
				label: '操作部门',
				key: 'opDeptName',
				prop: 'opDeptName',
				disabled: false,
				width: '100'
			},
			{
				label: '文件',
				key: 'docEmployeeName',
				prop: 'docEmployeeName',
				disabled: false,
				sortable: 'custom',
				width: '100'
			},
			{
				label: '文件部门',
				key: 'docDeptName',
				prop: 'docDeptName',
				disabled: false,
				width: '100'
			},
			{ label: '海外客服', key: 'ecsEmployeeName', prop: 'ecsEmployeeName', width: '120', disabled: false },
			{ label: '海外客服部门', key: 'ecsDeptName', prop: 'ecsDeptName', width: '120', disabled: false },
			{
				label: '应收',
				key: 'acEmployeeName',
				prop: 'acEmployeeName',
				disabled: false,
				width: '80'
			},
			{
				label: '应收部门',
				key: 'acDeptName',
				prop: 'acDeptName',
				disabled: false,
				width: '100'
			},
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
			}
		].map(item => {
			return { ...item, minWidth: item.width }
		})
	}
}
// 报关订单列表
const cdOrderList = {
	// 默认表头
	defaultColumns: [
		'orderNo',
		'custName',
		'businessType',
		'serviceType',
		'orderStatus',
		'opCustomsEmployeeName',
		'customsNumber',
		'exportOrderNo',
		'customsDate',
		'bizDate',
		'prefinCloseStatus',
		'prefinCloseTime',
		'finCloseTime',
		'finCloseStatus',
		'createdTime',
		'createdName',
		'cancelExecTime',
		'custClass'
	],
	// 自定义表头特殊处理
	specialColumns: {
		porPortCode: ['porPortCode', 'porPortName'],
		polPortCode: ['polPortCode', 'polPortName'],
		podPortCode: ['podPortCode', 'podPortName']
	},
	// 表头库
	columnsBase(handleOrderNoInfo) {
		return [
			{
				label: '工作号',
				key: 'orderNo',
				prop: 'orderNo',
				width: '150',
				minWidth: '150',
				disabled: false,
				popoverComponent: ColumnTip,
				method: row => {
					handleOrderNoInfo(row, 'OrderDetail')
				}
			},
			{ label: '委托单位', key: 'custName', prop: 'custName', disabled: false, popoverComponent: CustNameShow, width: '200' },
			{
				label: '业务类型',
				key: 'businessType',
				prop: 'businessType',
				width: '100',
				formatter: (row, column) => {
					return row.businessTypeCn
				}
			},
			{
				label: '服务类型',
				key: 'serviceType',
				prop: 'serviceType',
				width: '150',
				formatter: (row, column) => {
					return row.serviceTypeName
				}
			},
			{
				label: '订单状态',
				key: 'orderStatus',
				prop: 'orderStatus',
				disabled: false,
				minWidth: '100',
				// minWidthDrag: true,
				width: '100',
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
			{ label: '关务操作', key: 'opCustomsEmployeeName', prop: 'opCustomsEmployeeName', width: '120' },
			{
				label: '报关单号',
				key: 'customsNumber',
				prop: 'customsNumber',
				disabled: false,
				width: '180'
			},
			{
				label: '出口单号',
				key: 'exportOrderNo',
				prop: 'exportOrderNo',
				disabled: false,
				width: '180'
			},
			{
				label: '申报时间',
				key: 'customsDate',
				prop: 'customsDate',
				sortable: 'custom',
				width: '150'
			},
			{ label: '业务日期', key: 'bizDate', prop: 'bizDate', width: '150', sortable: 'custom' },
			{
				label: '预关账状态',
				key: 'prefinCloseStatus',
				prop: 'prefinCloseStatus',
				width: '100',
				disabled: false,
				sortable: 'custom',
				formatter: (row, column) => {
					return row.prefinCloseStatus === 'yes' ? '已关账' : '未关账'
				}
			},
			{
				label: '预关账时间',
				key: 'prefinCloseTime',
				prop: 'prefinCloseTime',
				sortable: 'custom',
				width: '150'
			},
			{
				label: '关账时间',
				key: 'finCloseTime',
				prop: 'finCloseTime',
				sortable: 'custom',
				width: '150'
			},
			{
				label: '关账状态',
				key: 'finCloseStatus',
				prop: 'finCloseStatus',
				width: '100',
				formatter: (row, column) => {
					return row.finCloseStatus === 'yes' ? '已关账' : '未关账'
				}
			},
			{
				label: '订单创建时间',
				key: 'createdTime',
				prop: 'createdTime',
				width: '150',
				disabled: false,
				sortable: 'custom'
			},
			{
				label: this.$t('Common.createdBy'),
				key: 'createdName',
				prop: 'createdName',
				width: '150',
				disabled: false
			},
			{ label: '取消/终止/关闭时间', key: 'cancelExecTime', prop: 'cancelExecTime', width: '150', disabled: false },
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
			}
		].map(item => {
			return { ...item, minWidth: item.width }
		})
	}
}
const whJointList = {
	defaultColumns: ['jointNo'],
	columnsBase: [
		{
			label: '协同单号',
			key: 'jointNo',
			prop: 'jointNo',
			width: '220',
			minWidth: '220',
			disabled: false,
			type: 'text',
			align: 'center',
			popoverComponent: ColumnJointTip
		},
		{
			label: '委托单位',
			key: 'mainCompDeptName',
			prop: 'mainCompDeptName',
			disabled: false,
			width: '180'
		}
	]
}
const orderReportList = {
	// 默认表头
	defaultColumns: [
		'orderNo',
		'source',
		'businessType',
		'serviceType',
		'serviceItems',
		'custName',
		'createTime',
		'bargeEtdTime',
		'eboxTime',
		'cyCutOff',
		'etaTime',
		'so',
		'cargoQuantity',
		'taTime',
		'tdTime',
		'bizDate',
		'blType',
		'mbl',
		'pricingEmployeeName',
		'bdEmployeeName',
		'bdDeptName',
		'opEmployeeName',
		'bkgEmployeeName',
		'cscEmployeeName',
		'auditEmployeeName',
		'csEmployeeName',
		'compDeptCode',
		'compDeptName',
		'branchCompDeptCode',
		'branchCompDeptName',
		'bkgStatus',
		'orderStatus',
		'prefinCloseStatus',
		'finCloseStatus',
		'containerInfo',
		'amountT',
		'amountTR',
		'cn',
		'shipCarrierCode',
		'bkgAgentSupplierName',
		'polPortCode',
		'polPortName',
		'porPortCode',
		'porPortName',
		'podPortCode',
		'podPortName',
		'podPortCountryEname',
		'podPortCountryCname',
		'destinationArea',
		'sysLineName',
		'settleOrderType',
		'recvFeeUnconfCount',
		'recvFeeConfirmStatus',
		'payFeeUnconfCount',
		'payFeeConfirmStatus',
		'usdProfit',
		'cnyProfit',
		'cnyReceiveAmt',
		'cnyProfitReceiveAmt',
		'cnyPayAmt',
		'cnyProfitPayAmt',
		'usdReceiveAmt',
		'usdProfitReceiveAmt',
		'usdPayAmt',
		'usdProfitPayAmt'
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
				fixed: true,
				type: 'text',
				formatter: (row, column) => {
					return `<el-button type="text" class="underline">${row.orderNo}</el-button>`
				},
				method: (index, row) => {
					handleOrderNoInfo(row)
				}
			},
			{
				label: '委托来源',
				key: 'source',
				prop: 'source',
				disabled: false,
				width: '100',
				formatter: (row, column) => {
					return getDictLabel('orderSource', row.source)
				}
			},
			{
				label: '业务类型',
				key: 'businessType',
				prop: 'businessType',
				width: '100',
				formatter: (row, column) => {
					return row.businessTypeCn
				}
			},
			{
				label: '服务类型',
				key: 'serviceType',
				prop: 'serviceType',
				width: '150',
				formatter: (row, column) => {
					return row.serviceTypeName
				}
			},
			{
				label: '服务内容',
				key: 'serviceItems',
				prop: 'serviceItems',
				width: '150'
			},
			{ label: '委托单位', key: 'custName', prop: 'custName', popoverComponent: CustNameShow, disabled: false, width: '180' },
			{ label: '业务创建日期', key: 'createTime', prop: 'createTime', width: '150', sortable: 'custom' },
			{ label: '驳船预计开船日期', key: 'bargeEtdTime', prop: 'bargeEtdTime', width: '150', sortable: 'custom' },
			{ label: '预计装箱日期', key: 'eboxTime', prop: 'eboxTime', width: '150', sortable: 'custom' },
			{ label: '预计开航日期', key: 'etdTime', prop: 'etdTime', width: '150', sortable: 'custom' },
			{ label: '截关日期', key: 'cyCutOff', prop: 'cyCutOff', width: '150', sortable: 'custom' },
			{ label: '预计到港日期', key: 'etaTime', prop: 'etaTime', width: '150', sortable: 'custom' },
			{ label: 'SO号', key: 'so', prop: 'so', disabled: false, width: '150' },
			{ label: '件数实际', key: 'cargoQuantity', prop: 'cargoQuantity', disabled: false, width: '100' },
			{ label: '实际到港日期', key: 'taTime', prop: 'taTime', width: '150', sortable: 'custom' },
			{ label: '实际开航日期', key: 'tdTime', prop: 'tdTime', width: '150', sortable: 'custom' },
			{ label: '业务日期', key: 'bizDate', prop: 'bizDate', width: '150', sortable: 'custom' },
			{
				label: '提单类型',
				key: 'blType',
				prop: 'blType',
				width: '100',
				formatter: (row, column) => {
					return getDictLabel('blType', row.blType)
				}
			},
			{ label: 'M单号', key: 'mbl', prop: 'mbl', disabled: false, width: '150' },
			{ label: '拿价人姓名', key: 'pricingEmployeeName', prop: 'pricingEmployeeName', width: '120' },
			{ label: '销售人员', key: 'bdEmployeeName', prop: 'bdEmployeeName', width: '120' },
			{ label: '销售员部门', key: 'bdDeptName', prop: 'bdDeptName', disabled: false, width: '100' },
			{ label: '操作人员', key: 'opEmployeeName', prop: 'opEmployeeName', width: '120' },
			{ label: '订舱人员', key: 'bkgEmployeeName', prop: 'bkgEmployeeName', width: '120' },
			{ label: '单证人员', key: 'cscEmployeeName', prop: 'cscEmployeeName', width: '100' },
			{ label: '商务人员', key: 'auditEmployeeName', prop: 'auditEmployeeName', width: '120' },
			{ label: '客服人员', key: 'csEmployeeName', prop: 'csEmployeeName', width: '120' },
			{ label: '结算公司代码', key: 'compDeptCode', prop: 'compDeptCode', width: '100' },
			{ label: '结算公司名称', key: 'compDeptName', prop: 'compDeptName', width: '150' },
			{ label: '分公司代码', key: 'branchCompDeptCode', prop: 'branchCompDeptCode', width: '100' },
			{ label: '分公司名称', key: 'branchCompDeptName', prop: 'branchCompDeptName', width: '150' },
			{
				label: '订舱状态',
				key: 'bkgStatus',
				prop: 'bkgStatus',
				width: '80',
				formatter: (row, column) => {
					return getDictLabel('bkgStatus', row.bkgStatus)
				}
			},
			{
				label: '订单状态',
				key: 'orderStatus',
				prop: 'orderStatus',
				width: '80',
				formatter: (row, column) => {
					return getDictLabel('orderStatus', row.orderStatus)
				}
			},
			{
				label: '预关账状态',
				key: 'prefinCloseStatus',
				prop: 'prefinCloseStatus',
				width: '100',
				formatter: (row, column) => {
					return row.prefinCloseStatus === 'yes' ? '已关账' : '未关账'
				}
			},
			{
				label: '关账状态',
				key: 'finCloseStatus',
				prop: 'finCloseStatus',
				width: '100',
				formatter: (row, column) => {
					return row.finCloseStatus === 'yes' ? '已关账' : '未关账'
				}
			},

			{ label: '箱型箱量', key: 'containerInfo', prop: 'containerInfo', disabled: false, width: '150' },
			{ label: 'TEU量', key: 'amountT', prop: 'amountT', disabled: false, width: '80' },
			{ label: '做柜TEU量', key: 'amountTR', prop: 'amountTR', disabled: false, width: '100' },
			{ label: '箱号', key: 'cn', prop: 'cn', disabled: false, width: '150' },
			{ label: '承运人', key: 'shipCarrierCode', prop: 'shipCarrierCode', disabled: false, width: '120' },
			{ label: '订舱代理', key: 'bkgAgentSupplierName', prop: 'bkgAgentSupplierName', disabled: false, width: '150' },
			{
				label: '大船起运港代码',
				key: 'polPortCode',
				prop: 'polPortCode',
				width: '120'
			},
			{
				label: '大船起运港名称',
				key: 'polPortName',
				prop: 'polPortName',
				width: '150'
			},
			{
				label: '驳船起运港代码',
				key: 'porPortCode',
				prop: 'porPortCode',
				width: '120'
			},
			{
				label: '驳船起运港名称',
				key: 'porPortName',
				prop: 'porPortName',
				width: '150'
			},
			{
				label: '目的地代码',
				key: 'podPortCode',
				prop: 'podPortCode',
				width: '120'
			},
			{
				label: '目的地名称',
				key: 'podPortName',
				prop: 'podPortName',
				width: '150'
			},
			{
				label: '目的地国家英文',
				key: 'podPortCountryEname',
				prop: 'podPortCountryEname',
				width: '150'
			},
			{
				label: '目的地国家中文',
				key: 'podPortCountryCname',
				prop: 'podPortCountryCname',
				width: '150'
			},
			{
				label: '最终目的地名称',
				key: 'destinationArea',
				prop: 'destinationArea',
				width: '150'
			},
			{
				label: '系统航线',
				key: 'sysLineName',
				prop: 'sysLineName',
				width: '120'
			},
			{
				label: this.$t('Settle.orderType'),
				key: 'settleOrderType',
				prop: 'settleOrderType',
				width: '100'
			},
			{
				label: '收入费用未确认数目',
				key: 'recvFeeUnconfCount',
				prop: 'recvFeeUnconfCount',
				width: '150'
			},
			{
				label: '收入费用全部确认状态',
				key: 'recvFeeConfirmStatus',
				prop: 'recvFeeConfirmStatus',
				width: '150',
				formatter: (row, column) => {
					return row.recvFeeConfirmStatus === 'yes' ? '已确认' : '未确认'
				}
			},
			{
				label: '支出费用未确认数目',
				key: 'payFeeUnconfCount',
				prop: 'payFeeUnconfCount',
				width: '150'
			},
			{
				label: '支出费用全部确认状态',
				key: 'payFeeConfirmStatus',
				prop: 'payFeeConfirmStatus',
				width: '150',
				formatter: (row, column) => {
					return row.payFeeConfirmStatus === 'yes' ? '已确认' : '未确认'
				}
			},
			{
				label: '利润额折美元含手续费',
				key: 'usdProfit',
				prop: 'usdProfit',
				width: '150'
			},
			{
				label: '利润额折人民币含手续费',
				key: 'cnyProfit',
				prop: 'cnyProfit',
				width: '180'
			},
			{
				label: 'CNY总应收',
				key: 'cnyReceiveAmt',
				prop: 'cnyReceiveAmt',
				width: '150'
			},
			{
				label: 'CNY统计利润的应收',
				key: 'cnyProfitReceiveAmt',
				prop: 'cnyProfitReceiveAmt',
				width: '150'
			},
			{
				label: 'CNY总应付',
				key: 'cnyPayAmt',
				prop: 'cnyPayAmt',
				width: '150'
			},
			{
				label: 'CNY统计利润的应付',
				key: 'cnyProfitPayAmt',
				prop: 'cnyProfitPayAmt',
				width: '150'
			},
			{
				label: 'USD总应收',
				key: 'usdReceiveAmt',
				prop: 'usdReceiveAmt',
				width: '150'
			},
			{
				label: 'USD统计利润的应收',
				key: 'usdProfitReceiveAmt',
				prop: 'usdProfitReceiveAmt',
				width: '150'
			},
			{
				label: 'USD总应付',
				key: 'usdPayAmt',
				prop: 'usdPayAmt',
				width: '150'
			},
			{
				label: 'USD统计利润的应付',
				key: 'usdProfitPayAmt',
				prop: 'usdProfitPayAmt',
				width: '150'
			}
		]
	}
}
const blFinList = {
	defaultColumns: [
		'preAuditTime',
		'applyEmployeeName',
		'sysLineName',
		'sysLineGroupName',
		// 'sysLineCode',
		'compDeptName',
		'jointCompDeptName',
		'blStatus',
		'bdDeptName',
		'obdDeptName',
		'asstEmployeeName',
		'obdEmployeeName',
		'orderNo',
		'blNo',
		'businessType',
		'blType',
		'pledgeOrderNo',
		'pledgeBlNo',
		'pledgeAmount',
		'auditStatus',
		'wfIndexAuditEmployeeId',
		'receiveFeeCleanStatus',
		'payFeeCleanStatus',
		'orderStatus',
		'soInfo',
		'tAmount',
		'bizDate',
		'isPledge',
		'pledgeSource',
		'etdTime',
		'tdTime',
		'etaTime',
		'taTime',
		// 'custType',
		'custName',
		'custSettleType',
		// 'custSettlePeriod',
		'custSettleUnit',
		'shipCarrierCode',
		'bkgAgentSupplierName',
		'blMode',
		'applyTime',
		'applyRemark',
		'applyType',
		'auditEmployeeName',
		'realAuditEmployeeName',
		'auditTime',
		'auditReason',
		'auditRemark',
		'bdEmployeeName',
		'orgDeptName',
		'jointDeptName',
		'putStatus',
		'isContainerReturn',
		'lastDay',
		'blTakeStatus',
		'placeCompName',
		'transferStatus',
		'isAgreeRelease',
		'isExw'
	]
}
const state = {
	isOrderFeeCount: false, // 是否有费用
	overseasStatus: 1,
	overseasTipMsg: '',
	orderInfoDataObj: {}, // 订单详情数据
	custInfoObj: {}, // 客商信息
	currRole: '', // 当前角色
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
      cname: '订舱',
      ename: 'Booking',
      component: 'OrderBook',
      child: [
        // {cname: '舱单', ename: 'booking', code: 'book', component: ''},
        // {
        //   cname: '放舱详情',
        //   ename: 'booking',
        //   code: 'proxy_book',
        //   component: 'Book'
        // },
        { cname: '放舱详情', ename: 'Booking', code: 'book', component: 'Book' }
        // {cname: '提单', ename: 'bill of loading', code: 'bill_of_loading', component: 'Bl'},
        // { cname: 'VGM', ename: 'vgm', code: 'vgm', component: 'Vgm' },
        // { cname: '危险品', ename: 'dangerous goods', code: 'dangerous', component: 'Dangerous' }
      ]
    },
    {
      cname: '订舱',
      ename: 'whbook ',
      component: 'LclWhBook',
      code: 'proxy_whbook'
    },
    // {cname: '代订舱', ename: 'booking', code: 'proxy_book', component: 'ProxyBook'},
    {
      cname: '起运港拖柜',
      ename: 'Container towing at port of loading',
      component: 'ShippingTruck',
      code: 'truck'
    },
    {
      cname: '买箱',
      ename: 'Buying container',
      component: 'BuyingContainer',
      code: 'buy_container'
    },
    {
      cname: '起运港报关',
      ename: 'Customs declaration',
      component: 'Clearance',
      child: [
        {
          cname: '代理报关',
          ename: 'Customs declaration',
          code: 'pol_declaration',
          component: 'Agent'
        },
        {
          cname: '代垫关税',
          ename: 'advance tariff',
          code: 'pol_advance_tariff',
          component: 'AdvanceTariff'
        },
        {
          cname: '代理报检',
          ename: 'inspection at the port of loading',
          code: 'pol_inspection',
          component: 'Inspection'
        }
      ]
    },
    {
      cname: '起运港仓储',
      ename: 'Warehousing',
      component: 'Warehouse',
      child: [
        {
          cname: '仓储方式',
          ename: 'Warehousing',
          code: 'pol_warehouse',
          component: 'Warehouse'
        }
        // {cname: '散车收货', ename: 'LTL', code: 'pol_ltl', component: 'Car'}
      ]
    },
    {
      cname: '起运港散车',
      ename: 'Bulk vehicles at the port of loading',
      component: 'PolLtl',
      code: 'pol_ltl',
      businessType: 'ship_export_lcl'
    }, // 拼箱服务项
    // {
    //   cname: '散车',
    //   ename: 'Pol ltl',
    //   component: 'PolLtl',
    //   child: [
    //     { cname: '散车信息', ename: 'Pol ltl', code: 'pol_ltl', component: 'PolLtl', businessType: 'ship_export_lcl' }
    //   ]
    // },
    // { cname: '目的港散车派送', ename: 'LTL delivery', component: 'PodLtl', code: 'pod_ltl_delivery', businessType: 'ship_export_lcl' }, // 拼箱服务项
    {
      cname: '堆场装箱',
      ename: 'Packing',
      component: 'YardBox',
      code: 'stuffing'
    },
    {
      cname: '保险',
      ename: 'Insurance',
      component: 'Insurance',
      code: 'insurance'
    },
    {
      cname: '贸易单证',
      ename: 'Trade docs',
      component: 'Document',
      code: 'doc'
    },
    {
      cname: '各类检验',
      ename: 'Various inspections',
      component: 'InspectionAndDetection',
      code: 'ciq'
      // child: [
      //   { cname: 'CIQ', ename: 'CIQ', code: 'ciq', component: 'Ciq' },
      //   { cname: 'BV', ename: 'BV', code: 'bv', component: 'Bv' },
      //   { cname: 'COC/SASO', ename: 'COC/SASO', code: 'coc_saso', component: 'CocSosa' }
      // ]
    },
    { cname: '熏蒸', ename: 'Fumigation', code: 'fume', component: 'Fume' },
    {
      cname: '目的港换单',
      ename: 'Exchange of documents at destination port',
      component: 'PodChangeDoc',
      code: 'pod_change_doc'
    },
    {
      cname: '目的港委托清关',
      ename: 'Customs clearance entrusted at the port of destination',
      component: 'PodCommClearance',
      code: 'pod_comm_clearance'
    },
    {
      cname: '目的港拖柜派送',
      ename: 'Container delivery at destination port',
      component: 'PodFclDelivery',
      code: 'pod_fcl_delivery'
    },
    {
      cname: '目的港仓储',
      ename: 'Storage at destination port',
      component: 'PodWarehouseIng',
      child: [
        {
          cname: '目的港仓储',
          ename: 'Storage at destination port',
          code: 'pod_warehouse',
          component: 'PodWarehouse'
        }
        // { cname: '进仓事项', ename: 'WH matter', code: 'pod_wh_matter', component: 'PodWhMatter' }
        // { cname: '散车派送', ename: 'LTL delivery', code: 'pod_ltl_delivery', component: 'PodLtlDelivery' }
      ]
    },
    {
      cname: '目的港散车派送',
      ename: 'Bulk delivery at destination port',
      component: 'PodLtlDelivery',
      code: 'pod_ltl_delivery'
    },
    { cname: '订舱', ename: 'whbook', component: 'LclWhBook', code: 'whbook' },
    {
      cname: '代录舱单',
      ename: 'Manifest ',
      component: 'BehalfRecordManifest',
      code: 'ocean_manifest'
    },
    {
      cname: '排载',
      ename: 'Unloading ',
      component: 'DischargeRelease',
      code: 'discharge_release'
    },
    {
      cname: '打单/箱单',
      ename: 'Printing/packing list',
      component: 'MakePackingList',
      code: 'make_packing_list'
    },
    {
      cname: '内贸驳船',
      ename: 'Domestic Barge ',
      component: 'InternalTradeBarge',
      code: 'internal_trade_barge'
    },
    {
      cname: '地面服务',
      ename: 'Ground service ',
      component: 'GroundService',
      code: 'ground_service'
    }
  ],
	cdOrderList: {
		defaultColumns: cdOrderList.defaultColumns,
		specialColumns: cdOrderList.specialColumns,
		columnsBase: cdOrderList.columnsBase
	},
	whOrderList: {
		defaultColumns: whOrderList.defaultColumns,
		specialColumns: whOrderList.specialColumns,
		columnsBase: whOrderList.columnsBase
	},
	whJointList: {
		defaultColumns: whJointList.defaultColumns.concat(whOrderList.defaultColumns).filter(item => !['custName'].includes(item)),
		specialColumns: whOrderList.specialColumns,
		columnsBase: handleOrderNoInfo => {
			return whJointList.columnsBase
				.concat(whOrderList.columnsBase(handleOrderNoInfo))
				.filter(item => !['custName'].includes(item.key))
				.map(item => {
					return { ...item, minWidth: item.width }
				})
		}
		// columnsBase: whOrderList.columnsBase
	},
	blList: {
		defaultColumns: blList.defaultColumns,
		specialColumns: blList.specialColumns,
		columnsBase: blList.columnsBase
	},
	// 提单信息列表
	blInfoList: {
		defaultColumns: blInfoList.defaultColumns.concat(blList.defaultColumns),
		specialColumns: blList.specialColumns,
		columnsBase: handleOrderNoInfo => {
			return blInfoList.columnsBase.concat(blList.columnsBase(handleOrderNoInfo)).map(item => {
				return { ...item, minWidth: item.width }
			})
		}
	},
	orderReportList: {
		defaultColumns: orderReportList.defaultColumns,
		specialColumns: orderReportList.specialColumns,
		columnsBase: orderReportList.columnsBase,
		finCloseStatus: [
			{ label: '未关账', value: 'no' },
			{ label: '已关账', value: 'yes' }
		]
	},
	// 海运价-大船
	orderList: {
		defaultColumns: orderList.defaultColumns,
		specialColumns: orderList.specialColumns,
		columnsBase: orderList.columnsBase,
		createItem: {
			whBookStatus: '',
			bizDate: '', // 业务日期
			isDraftCust: '', // 可编辑委托单位标识
			orderNo: '', // 工作号
			businessType: '', // 业务类型
			serviceType: '', // 服务类型
			submitType: '', // 保存提交类型（draft、submit）
			intrustRemark: '', // 委托备注信息
			bdRemark: '', // 备注
			payMode: 'prepaid', // 支付方式
			transitPayMode: '', // 中转费付款方式
			isWoodenPackage: '', // 是否木质包装
			serviceList: [], // 服务项
			barge: {
				// 驳船信息
				porPortCode: '', // 驳船收货地/驳船起运港
				transitWay: '', // 驳船中转方式
				etdTime: '', // 驳船预计开船时间
				cyCutOff: '' // 驳船截关时间
			},
			ship: {
				// 船运信息
				roLoadingPortCode: '',
				roArrivalPortCode: '',
				shipCarrierCode: '', // 船公司
				etdTime: '', // 大船预计开船时间
				etaTime: '', // 预计到港时间
				taTime: '', // 实际到港时间
				cyCutOff: '', // 大船截关时间
				polPortCode: '', // 大船起运港
				unloadingPortCode: '', // 卸货港
				podPortCode: '', // 目的港
				transitPortCode: '', // 中转港
				transitWay: '', // 内陆中转方式
				blType: '', // 提单类型
				contractNo: '', // 合约号
				issueMode: 'prompt', // 放舱要求
				sysLineCode: '', // 航线代码
				freetimeSys: '', // 免用免堆系统备注
				isNodrop: 'n', // 是否申请不甩柜
				isTrack: 'n', // 是否显示航程跟踪
				blMode: '', // 出单方式/类型
				ccCutOff: '', // 截报关时间
				cvCutOff: '', // 截放行时间
				priceType: 'pricing' // 拿价类型
			},
			soContainerList: [], // SO箱型箱量
			cargoList: [
				// 货品信息
				{
					// hscode: 'hscode',
					// cname: '',  // 中文品名
					// ename: '',  // 英文品名
					// property: '', // 货物性质
					boxRemark: '无' // 装箱特殊要求
					// commodityTypeCode: '',  // 货品分类
					// dangerousGrade: '',   // 危险等级
					// dangerousCode: '',  // 国际危险品编码
					// packageGroup: ''  // 包装组别
				}
			],
			transport: {
				// 货运信息
				tradeTermsCode: '', // 贸易条款
				transportTerm: '', // 运输条款
				destinationArea: '', // 最终目的地
				deliveryPlace: '', // 交货详细地点
				// overseaAgentSupplierId: '', // 海外代理人信息
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
			height: '高',
			isWoodenPackage: '木质包装'
		},
		opCargoItemImport: {
			oid: '',
			quantity: '件数',
			hscode: 'HS Code',
			cname: '中文品名',
			ename: '英文品名',
			commodityTypeCode: '货品分类',
			property: '货物性质',
			boxRemark: '装箱要求',
			dangerousGrade: '危险等级',
			dangerousCode: '国际危码',
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
			height: '高',
			packageGroup: '包装组别',
			commodityDesc: '货物描述',
			isWoodenPackage: '木质包装'
		},
		opSizeItem: {
			sizeBefore: '',
			sizeAfter: '',
			sizeLeft: '',
			sizeRight: '',
			sizeTop: '',
			containerGroup: ''
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
			{ label: '操作', value: 'op' },
			{ label: '关务操作', value: 'op_customs' },
			{ label: '仓储操作', value: 'op_wh' },
			{ label: '拖车操作', value: 'op_truck' },
			{ label: '航线客服', value: 'line_cs' },
			{ label: '文件', value: 'doc' },
			{ label: '单证', value: 'csc' },
			// {label: '放货', value: 'rc'},
			{ label: '应收财务', value: 'ac' },
			{ label: '海外应收财务', value: 'eac' },
			{ label: '海外商务', value: 'epricing' },
			{ label: '海外客服', value: 'ecs' }
		],
		// 报关订单列表所有角色集合
		cdRoleCodesOptions: [
			{ label: '业务', value: 'bd' },
			{ label: '业务助理', value: 'obd' },
			{ label: '下单助理', value: 'asst' },
			{ label: '关务操作', value: 'op_customs' },
			{ label: '应收财务', value: 'ac' }
		],
		// 订单详情可写入角色集合
		allEditRoleArr: ['bd', 'obd', 'asst', 'op', 'op_truck', 'op_customs', 'op_wh', 'doc', 'ac', 'eac', 'line_cs', 'bkg', 'csc', 'ecs', 'epricing', 'pricing'],
		// 登录用户具有的可写入角色集合，含有两种以上需要做角色切换
		// ordDetRolesObj: {},
		userEditRoles: [],
		specialEditRoles: [], // 用户保存拖报操作，关务操作，仓储操作的角色数组
		ordDetRole: '', // 进入订单详情后设置的当前角色
		// 出口整箱-委托订舱，进口整箱-委托订舱的订单详情非bd类参与人
		workAssignObj: {
			obd: {
				orgEmpId: '',
				empId: '',
				empName: '',
				name: '销售助理'
			},
			asst: {
				orgEmpId: '',
				empId: '',
				empName: '',
				name: '下单助理'
			},
			pricing: {
				orgEmpId: '',
				empId: '',
				empName: '',
				name: '商务'
			},
			bkg: {
				orgEmpId: '',
				empId: '',
				empName: '',
				name: '订舱'
			},
			op: {
				orgEmpId: '',
				empId: '',
				empName: '',
				name: '操作'
			},
			line_cs: {
				orgEmpId: '',
				empId: '',
				empName: '',
				name: '航线客服'
			},
			op_customs: {
				orgEmpId: '',
				empId: '',
				empName: '',
				name: '关务操作'
			},
			op_wh: {
				orgEmpId: '',
				empId: '',
				empName: '',
				name: '仓储操作'
			},
			op_truck: {
				orgEmpId: '',
				empId: '',
				empName: '',
				name: '拖车操作'
			},
			doc: {
				orgEmpId: '',
				empId: '',
				empName: '',
				name: '文件'
			},
			csc: {
				orgEmpId: '',
				empId: '',
				empName: '',
				name: '单证'
			},
			tc: {
				orgEmpId: '',
				empId: '',
				empName: '',
				name: '取单客服'
			},
			rc: {
				orgEmpId: '',
				empId: '',
				empName: '',
				name: '放货'
			},
			ac: {
				orgEmpId: '',
				empId: '',
				empName: '',
				name: '应收财务'
			},
			eac: {
				orgEmpId: '',
				empId: '',
				empName: '',
				name: '海外应收财务'
			},
			ecs: {
				orgEmpId: '',
				empId: '',
				empName: '',
				name: '海外客服'
			},
			epricing: {
				orgEmpId: '',
				empId: '',
				empName: '',
				name: '海外商务'
			}
		}
	},
	// 外运订仓列表
	lclList: {
		defaultColumns: [
			'blNo',
			'orderNo',
			'bdEmployeeName',
			'bdDeptName',
			'whPoNo',
			'orderStatus',
			'whBookStatus',
			'whBookType',
			'custid',
			'custName',
			'intrustRemark',
			'auditRemark',
			'prefinCloseStatus',
			'finCloseStatus',
			'businessType',
			'createdTime',
			'bizDate',
			'sysLineName',
			'etWhCyCutOff',
			'whCyCutOff'
		],
		specialColumns: [],
		// 表头库
		columnsBase(handleOrderNoInfo) {
			return [
				{
					label: '工作号',
					key: 'orderNo',
					prop: 'orderNo',
					width: '160',
					disabled: false,
					// fixed: true,
					type: 'text',
					align: 'right',
					popoverComponent: ColumnTip,
					// formatter: (row, column) => {
					// 	let str = ''
					// 	let jointStr = ''
					// 	// if (row.orderStatus === 'cancel' || row.orderStatus === 'break') str = `<i class="icon-tip icon-cancel">取</i>`
					// 	// if (row.isEdit === 'y') str = `<i class="icon-tip icon-change">改</i>`
					// 	return `<el-button type="text" class="underline">${jointStr}${str}${row.orderNo}</el-button>`
					// },
					method: row => {
						handleOrderNoInfo(row)
					}
				},
				{
					label: '提单号',
					key: 'blNo',
					prop: 'blNo',
					disabled: false,
					width: '150'
				},
				{
					label: '销售',
					key: 'bdEmployeeName',
					prop: 'bdEmployeeName',
					disabled: false,
					width: 120
				},
				{
					label: '销售部门',
					key: 'bdDeptName',
					prop: 'bdDeptName',
					disabled: false,
					width: 120
				},
				{
					label: '入舱单号',
					key: 'whPoNo',
					prop: 'whPoNo',
					disabled: false,
					width: 120
				},
				{
					label: '订单状态',
					key: 'orderStatus',
					prop: 'orderStatus',
					disabled: false,
					width: 80,
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
						// 20211216弃用
						// // 操作中状态特殊处理
						// if (row.orderStatus === 'pass' && row.isOpHandle === 'y') {
						// 	result = '操作中'
						// }
						return `<span class="${color}">${result}</span>`
					}
				},
				{
					label: '拼箱订舱状态',
					key: 'whBookStatus',
					prop: 'whBookStatus',
					disabled: false,
					width: 100,
					formatter: (row, column) => {
						return `<span class="whBookStatus-${row.whBookStatus}">${getDictLabel('whBookStatus', row.whBookStatus)}</span>`
					}
				},
				{
					label: '订舱类型',
					key: 'whBookType',
					prop: 'whBookType',
					width: 100,
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('whBookType', row.whBookType)
					}
				},
				{
					label: '委托单位',
					key: 'custName',
					prop: 'custName',
					popoverComponent: CustNameShow,
					disabled: false,
					width: '150'
				},
				{
					label: '委托备注',
					key: 'intrustRemark',
					prop: 'intrustRemark',
					disabled: false,
					width: '150'
				},
				{
					label: '商务备注',
					key: 'auditRemark',
					prop: 'auditRemark',
					disabled: false,
					width: '150'
				},
				{
					label: '预关账状态',
					key: 'prefinCloseStatus',
					prop: 'prefinCloseStatus',
					disabled: false,
					width: 100,
					formatter: (row, column) => {
						return row.prefinCloseStatus === 'yes' ? '已关账' : '未关账'
					}
				},
				{
					label: '关账状态',
					key: 'finCloseStatus',
					prop: 'finCloseStatus',
					disabled: false,
					width: 100,
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
					formatter: (row, column) => {
						return row.businessTypeCn
					}
				},
				{
					label: '订单创建时间',
					key: 'createdTime',
					prop: 'createdTime',
					width: '150',
					disabled: false,
					sortable: 'custom'
				},
				{
					label: '业务日期',
					key: 'bizDate',
					prop: 'bizDate',
					width: '120',
					disabled: false,
					sortable: 'custom'
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
					label: '订舱代理',
					key: 'whAgentSupplierName',
					prop: 'whAgentSupplierName',
					disabled: false
				},
				{
					label: '装货地',
					key: 'receiptPlaceName',
					prop: 'receiptPlaceName',
					width: '150',
					disabled: false,
					formatter: (row, column) => {
						return row.receiptPlaceName
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
					label: '拼箱状态',
					key: 'lclStatus',
					prop: 'lclStatus',
					width: 100,
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('lclStatus', row.lclStatus)
					}
				},
				{
					label: '拼箱后的整柜单号',
					key: 'fclOrderNo',
					prop: 'fclOrderNo',
					width: '150',
					disabled: false
				},
				{
					label: '预计截仓时间',
					key: 'etWhCyCutOff',
					prop: 'etWhCyCutOff',
					disabled: false,
					sortable: 'custom',
					width: '150'
				},
				{
					label: '大船预计开船时间',
					key: 'etdTime',
					prop: 'etdTime',
					disabled: false,
					sortable: 'custom',
					width: '150'
				},
				{
					label: '总件数',
					key: 'quantity',
					prop: 'quantity',
					disabled: false,
					width: 100
				},
				{
					label: '总毛重',
					key: 'weight',
					prop: 'weight',
					disabled: false,
					width: 100
				},
				{
					label: '总体积',
					key: 'volume',
					prop: 'volume',
					disabled: false,
					width: 100
				},
				{
					label: '系统航线',
					key: 'sysLineName',
					prop: 'sysLineName',
					disabled: false,
					width: 120
				},
				{
					label: '实际截仓时间',
					key: 'whCyCutOff',
					prop: 'whCyCutOff',
					disabled: false,
					sortable: 'custom',
					width: '150'
				},
				{
					label: '提单类型',
					key: 'blType',
					prop: 'blType',
					disabled: false,
					width: 120,
					formatter: (row, column) => {
						return getDictLabel('blType', row.blType)
					}
				},
				{
					label: '应收费用结清状态',
					key: 'receiveFeeCleanStatus',
					prop: 'receiveFeeCleanStatus',
					disabled: false,
					width: '150',
					formatter: (row, column) => {
						return getDictLabel('feeSettleStatus', row.payFeeCleanStatus)
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
					label: '应收发票状态',
					key: 'receiveInvoiceStatus',
					prop: 'receiveInvoiceStatus',
					disabled: false,
					width: 120
				},
				{
					label: '请款状态',
					key: 'payFeeApplyStatus',
					prop: 'payFeeApplyStatus',
					disabled: false,
					width: 100
				}
			].map(item => {
				return { ...item, minWidth: item.width }
			})
		}
	},
	// 关联订单列表
	lclRelateList: {
		defaultColumns: [
			'orderNo',
			'serviceType',
			'blNo',
			'podPortCode',
			'bdEmployeeName',
			'bdDeptName',
			'whPoNo',
			'orderStatus',
			'whBookStatus',
			'whBookType',
			'custid',
			'custName',
			'intrustRemark',
			'auditRemark',
			'prefinCloseStatus',
			'finCloseStatus',
			'businessType',
			'createdTime',
			'bizDate',
			'quantity',
			'weight',
			'volume',
			'bizDate',
			'hscode',
			'cname',
			'ename'
		],
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
						let jointStr = ''
						if (row.orderStatus === 'cancel' || row.orderStatus === 'break') str = `<i class="icon-tip icon-cancel">取</i>`
						return `<el-button type="text" class="underline">${jointStr}${str}${row.orderNo}</el-button>`
					},
					method: (index, row) => {
						handleOrderNoInfo(index, row)
					}
				},
				{
					label: '入舱单号',
					key: 'whPoNo',
					prop: 'whPoNo',
					disabled: false,
					width: '150'
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
					label: 'HBL单号',
					key: 'blNo',
					prop: 'blNo',
					disabled: false,
					width: '150'
				},
				{
					label: '装货地',
					key: 'receiptPlaceName',
					prop: 'receiptPlaceName',
					width: '150',
					disabled: false,
					formatter: (row, column) => {
						return row.receiptPlaceName
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
					key: 'bdEmployeeName',
					prop: 'bdEmployeeName',
					disabled: false,
					width: '150'
				},

				{
					label: '订单创建时间',
					key: 'createdTime',
					prop: 'createdTime',
					width: '150',
					disabled: false,
					sortable: 'custom'
				},
				{
					label: '业务日期',
					key: 'bizDate',
					prop: 'bizDate',
					width: '150',
					disabled: false,
					sortable: 'custom'
				},

				{
					label: '总件数',
					key: 'quantity',
					prop: 'quantity',
					disabled: false,
					width: '150'
				},
				{
					label: '总毛重',
					key: 'weight',
					prop: 'weight',
					disabled: false,
					width: '150'
				},
				{
					label: '总体积',
					key: 'volume',
					prop: 'volume',
					disabled: false,
					width: '150'
				},
				{
					label: 'HSCODE',
					key: 'hscode',
					prop: 'hscode',
					disabled: false,
					width: '150'
				},
				{
					label: '中文品名',
					key: 'cname',
					prop: 'cname',
					disabled: false,
					width: '150'
				},
				{
					label: '英文品名',
					key: 'ename',
					prop: 'ename',
					disabled: false,
					width: '150'
				}
			].map(item => {
				return { ...item, minWidth: item.width }
			})
		}
	},
	// 协同订单
	jointList: {
		defaultColumns: jointList.defaultColumns.concat(orderList.defaultColumns).filter(item => !['bdRemark', 'custName'].includes(item)),
		specialColumns: orderList.specialColumns,
		columnsBase: handleOrderNoInfo => {
			return jointList.columnsBase
				.concat(orderList.columnsBase(handleOrderNoInfo))
				.filter(item => !['bdRemark', 'custName'].includes(item.key))
				.map(item => {
					return { ...item, minWidth: item.width }
				})
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
	// 补料列表
	blSiList: {
		// 默认表头
		defaultColumns: [
			'orderNo',
			'shipCarrierCode',
			'bdEmployeeName',
			'bdDeptName',
			'sysLineName',
			'jointNo',
			'blNo',
			'blStatus',
			'siCutOff',
			'soInfo',
			'blMode',
			'copySiCheck',
			'etdTime',
			'dnGet',
			'dnFeeInput',
			'obdCheck',
			'freetimeSys',
			'siRemark',
			'siCancel',
			'tcEmployee'
		],
		// 自定义表头特殊处理
		specialColumns: {
			// podFreeIn: ['podFreeIn','podFreeOut','podFree']
		},
		// 表头库
		columnsBase(handleOrderNoInfo, handleViewSo, handleViewSiRemark) {
			return [
				{
					label: '工作号',
					key: 'orderNo',
					prop: 'orderNo',
					width: '150',
					disabled: false,
					// fixed: true,
					type: 'text',
					align: 'right',
					popoverComponent: ColumnSiCopy,
					// formatter: (row, column) => {
					// 	let str = ''
					// 	let jointStr = ''
					// 	if (row.dnCheckStatus === 'refuse') str = `<i class="icon-tip icon-change">拒</i>`
					// 	if (row.changeFlag === 1) str = `<i class="icon-tip icon-change">改</i>`
					// 	if (row.jointNo) jointStr = `<i class="icon-tip icon-joint2">协</i>`
					// 	return `<el-button type="text" class="underline">${jointStr}${str}${row.orderNo}</el-button>`
					// },
					method: row => {
						handleOrderNoInfo(row)
					}
				},
				{
					label: '取单客服(MBL)',
					key: 'tcEmployee',
					prop: 'tcEmployee',
					disabled: false,
					width: '150'
				},
				{
					label: '船公司',
					key: 'shipCarrierCode',
					prop: 'shipCarrierCode',
					disabled: false,
					width: '100'
				},
				{
					label: '销售',
					key: 'bdEmployeeName',
					prop: 'bdEmployeeName',
					disabled: false,
					width: 150
				},
				{
					label: '销售部门',
					key: 'bdDeptName',
					prop: 'bdDeptName',
					disabled: false,
					width: 150
				},
				{
					label: '系统航线',
					key: 'sysLineName',
					prop: 'sysLineName',
					disabled: false,
					width: '150'
				},
				{
					label: '提单号',
					key: 'blNo',
					prop: 'blNo',
					disabled: false,
					width: '150'
				},
				{
					label: '协同单号',
					key: 'jointNo',
					prop: 'jointNo',
					disabled: false,
					width: '150'
				},
				{
					label: '截补料时间',
					key: 'siCutOff',
					prop: 'siCutOff',
					disabled: false,
					width: '150'
				},
				{
					label: '提单状态',
					key: 'blStatus',
					prop: 'blStatus',
					disabled: false,
					width: '150',
					formatter: (row, column) => {
						return getDictLabel('woBlStatus', row.blStatus)
					}
				},
				{
					label: 'SO号',
					key: 'soInfo',
					prop: 'soInfo',
					disabled: false,
					width: '150',
					type: 'btns',
					formatter: (row, column) => {
						return `<el-button type="text" class="underline">${row.soInfo}</el-button>`
					},
					method: (index, row) => {
						handleViewSo(index, row)
					}
				},
				{
					label: '出单方式',
					key: 'blMode',
					prop: 'blMode',
					disabled: false,
					width: '100',
					formatter: (row, column) => {
						return getDictLabel('blMode', row.blMode)
					}
				},
				{
					label: 'Copy件单证确认',
					key: 'copySiCheck',
					prop: 'copySiCheck',
					disabled: false,
					width: '120',
					formatter: (row, column) => {
						return row.copySiCheck === 'y' ? '是' : '否'
					}
				},
				{
					label: '预计开船时间',
					key: 'etdTime',
					prop: 'etdTime',
					disabled: false,
					width: '120'
				},
				{
					label: 'D/N是否收到',
					key: 'dnGet',
					prop: 'dnGet',
					disabled: false,
					width: '100',
					formatter: (row, column) => {
						return row.dnGet === 'y' ? '是' : '否'
					}
				},
				{
					label: 'D/N是否录入',
					key: 'dnFeeInput',
					prop: 'dnFeeInput',
					disabled: false,
					width: '100',
					formatter: (row, column) => {
						return row.dnFeeInput === 'y' ? '是' : '否'
					}
				},
				{
					label: 'OBD提单是否收到',
					key: 'obdCheck',
					prop: 'obdCheck',
					disabled: false,
					width: '140',
					formatter: (row, column) => {
						return row.obdCheck === 'y' ? '是' : '否'
					}
				},
				{
					label: '船公司已取消',
					key: 'siCancel',
					prop: 'siCancel',
					disabled: false,
					width: '110',
					formatter: (row, column) => {
						return row.siCancel === 'y' ? '是' : '否'
					}
				},
				// {label: '取单状态', key: 'takeApplyStatus', prop: 'takeApplyStatus', disabled: false,
				//   formatter: (row, column) => {
				//     return getDictLabel('takeApplyStatus', row.takeApplyStatus)
				//   }
				// },
				{
					label: '免用免堆',
					key: 'freetimeSys',
					prop: 'freetimeSys',
					disabled: false,
					width: '150'
				},
				// {label: '免用免堆', key: 'podFreeIn', prop: 'podFreeIn', disabled: false,
				//   formatter: (row, column) => {
				//     let podFreeIn = row.podFreeIn ? `场内${row.podFreeIn}` : ''
				//     let podFreeOut = row.podFreeOut ? `场外${row.podFreeOut}` : ''
				//     let podFree = row.podFree ? `组合${row.podFree}` : ''
				//     return podFreeIn + podFreeOut + podFree
				//   }
				// },
				{
					label: '异常/备注',
					key: 'siRemark',
					prop: 'siRemark',
					disabled: false,
					width: '80',
					formatter: (row, column) => {
						return `<el-button type="text" class="underline">查看</el-button>`
					},
					method: (index, row) => {
						handleViewSiRemark(index, row)
					}
				}
			].map(item => {
				return { ...item, minWidth: item.width }
			})
		}
	},
	// 费用审核列表
	blSiDnList: {
		// 默认表头
		defaultColumns: ['orderNo', 'blNo', 'shipCarrierCode', 'bkgAgentSupplierName', 'vessel', 'voyage', 'etdTime', 'cyCutOff', 'dnCheckApplyRemark'],
		// 自定义表头特殊处理
		specialColumns: {
			// podFreeIn: ['podFreeIn','podFreeOut','podFree']
		},
		// 表头库
		columnsBase(handleViewSo) {
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
						if (row.dnCheckStatus === 'refuse') str = `<i class="icon-tip icon-cancel">拒</i>`
						return `${str}${row.orderNo}`
					}
				},
				{
					label: '提单号',
					key: 'blNo',
					prop: 'blNo',
					disabled: false,
					width: '180'
				},
				{
					label: '船公司',
					key: 'shipCarrierCode',
					prop: 'shipCarrierCode',
					disabled: false,
					width: 150
				},
				{
					label: '订舱代理',
					key: 'bkgAgentSupplierName',
					prop: 'bkgAgentSupplierName',
					disabled: false,
					width: '200'
				},
				{
					label: '大船船名',
					key: 'vessel',
					prop: 'vessel',
					disabled: false,
					width: 150
				},
				{
					label: '大船航次',
					key: 'voyage',
					prop: 'voyage',
					disabled: false,
					width: 150
				},
				{
					label: '预计开船时间',
					key: 'etdTime',
					prop: 'etdTime',
					disabled: false,
					width: 150
				},
				{
					label: '大船截关时间',
					key: 'cyCutOff',
					prop: 'cyCutOff',
					disabled: false,
					width: 150
				},
				{
					label: '备注信息',
					key: 'dnCheckApplyRemark',
					prop: 'dnCheckApplyRemark',
					disabled: false,
					width: ''
				}
			].map(item => {
				return { ...item, minWidth: item.width }
			})
		}
	},
	// 取单列表
	blTakeList: {
		// 默认表头
		defaultColumns: [
			'blNo',
			'orderNo',
			'takeStatus',
			'orderStatus',
			'etdTime',
			'tdTime',
			'etaTime',
			'blType',
			'custName',
			'shipCarrierCode',
			'bkgAgentSupplierId',
			'bkgAgentSupplierName',
			'blMode',
			'takeEmployeeName',
			'takeTime',
			'cancelReason',
			'cancelRemark',
			'cancelTime',
			'takeExpTime',
			'payExpTime'
		],
		// 自定义表头特殊处理
		specialColumns: {
			// podFreeIn: ['podFreeOut', 'podFree']
		},
		// 表头库
		columnsBase(handleOrderNoInfo) {
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
						return `${str}${blTypeStr}${row.blNo}`
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
				{
					label: '预计开船时间',
					key: 'etdTime',
					prop: 'etdTime',
					disabled: false,
					width: 120
				},
				{
					label: '实际开船时间',
					key: 'tdTime',
					prop: 'tdTime',
					disabled: false,
					width: 120
				},
				{
					label: '预计到港时间',
					key: 'etaTime',
					prop: 'etaTime',
					disabled: false,
					width: 120
				},
				{
					label: '提单类型',
					key: 'blType',
					prop: 'blType',
					width: 100,
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('blType', row.blType)
					}
				},
				{
					label: '委托单位',
					key: 'custName',
					prop: 'custName',
					disabled: false
				},
				{
					label: '船公司',
					key: 'shipCarrierCode',
					prop: 'shipCarrierCode',
					disabled: false,
					width: 100
				},
				{
					label: '订舱代理',
					key: 'bkgAgentSupplierName',
					prop: 'bkgAgentSupplierName',
					disabled: false,
					width: '150'
				},
				{
					label: '出单方式',
					key: 'blMode',
					prop: 'blMode',
					disabled: false,
					width: 120,
					formatter: (row, column) => {
						return getDictLabel('blMode', row.blMode)
					}
				},
				// {label: '派单人', key: 'createdBy', prop: 'createdBy', disabled: false},
				// {label: '派单时间', key: 'createdTime', prop: 'createdTime', disabled: false},
				{
					label: '取单人',
					key: 'takeEmployeeName',
					prop: 'takeEmployeeName',
					disabled: false,
					width: 120
				},
				{
					label: '取单状态',
					key: 'takeStatus',
					prop: 'takeStatus',
					disabled: false,
					width: 100,
					formatter: (row, column) => {
						return row.takeStatus === 'finish' ? '已取单' : '待取单'
					}
				},
				{
					label: '放单状态',
					key: 'putStatus',
					prop: 'putStatus',
					disabled: false,
					width: 100,
					formatter: (row, column) => {
						return getDictLabel('blPutStatus', row.putStatus)
					}
				},
				// { label: '实际到港时间', key: 'tdTime', prop: 'tdTime', disabled: false },
				{
					label: '订单状态',
					key: 'orderStatus',
					prop: 'orderStatus',
					disabled: false,
					width: 100,
					formatter: (row, column) => {
						return getDictLabel('orderStatus', row.orderStatus)
					}
				},
				{
					label: '取单完成时间',
					key: 'takeTime',
					prop: 'takeTime',
					disabled: false,
					width: '150'
				},
				{
					label: '取单期限',
					key: 'takeExpTime',
					prop: 'takeExpTime',
					disabled: false,
					width: 120
				},
				{
					label: '付款期限',
					key: 'payExpTime',
					prop: 'payExpTime',
					disabled: false,
					width: 120
				},
				{
					label: '撤回原因',
					key: 'cancelReason',
					prop: 'cancelReason',
					disabled: false,
					width: '150',
					formatter: (row, column) => {
						return getDictLabel('blCancelReason', row.cancelReason) || getDictLabel('blCancelEditReason', row.cancelReason)
					}
				},
				{
					label: '撤回备注',
					key: 'cancelRemark',
					prop: 'cancelRemark',
					disabled: false,
					width: '150'
				},
				{
					label: '撤回时间',
					key: 'cancelTime',
					prop: 'cancelTime',
					disabled: false,
					width: '150'
				},
				{
					label: '取单备注',
					key: 'remark',
					prop: 'remark',
					disabled: false,
					width: '150'
				},
				{ label: 'SO号', key: 'so', prop: 'so', disabled: false, width: '150' },
				{
					label: '销售',
					key: 'bdEmployeeName',
					prop: 'bdEmployeeName',
					disabled: false,
					width: 120
				},
				{
					label: '销售所属部门',
					key: 'bdDeptName',
					prop: 'bdDeptName',
					disabled: false,
					width: 120
				},
				{
					label: '单证',
					key: 'cscEmployeeName',
					prop: 'cscEmployeeName',
					disabled: false,
					width: 120
				},
				{
					label: '单证所属部门',
					key: 'cscDeptName',
					prop: 'cscDeptName',
					disabled: false,
					width: 120
				},
				{
					label: '操作',
					key: 'opEmployeeName',
					prop: 'opEmployeeName',
					disabled: false,
					width: 120
				},
				{
					label: '操作所属部门',
					key: 'opDeptName',
					prop: 'opDeptName',
					disabled: false,
					width: 120
				},
				{
					label: '商务',
					key: 'pricingEmployeeName',
					prop: 'pricingEmployeeName',
					disabled: false,
					width: 120
				},
				{
					label: '商务所属部门',
					key: 'pricingDeptName',
					prop: 'pricingDeptName',
					disabled: false,
					width: 120
				},
				{
					label: '放单审核人',
					key: 'acEmployeeName',
					prop: 'acEmployeeName',
					disabled: false,
					width: 120
				},
				{
					label: '放单审核时间',
					key: 'auditTime',
					prop: 'auditTime',
					disabled: false,
					width: '150'
				},
				{
					label: '船东电放申请状态',
					key: 'telexApplyStatus',
					prop: 'telexApplyStatus',
					disabled: false,
					width: '150',
					formatter: (row, column) => {
						let str = ''
						if (row.telexApplyStatus === 'n') {
							str = '未申请'
						} else if (row.telexApplyStatus === 'y') {
							str = '已申请'
						}
						return `${str}`
					}
				},
				{
					label: '船东电放申请人姓名',
					key: 'telexApplyEmployeeName',
					prop: 'telexApplyEmployeeName',
					disabled: false,
					width: '150'
				},
				{
					label: '船东电放申请时间',
					key: 'telexApplyTime',
					prop: 'telexApplyTime',
					disabled: false,
					width: '150'
				},
				{
					label: '快递单号',
					key: 'expressNo',
					prop: 'expressNo',
					disabled: false,
					width: '150'
				},
				{
					label: '寄单状态',
					key: 'status',
					prop: 'status',
					disabled: false,
					width: 120,
					formatter: (row, column) => {
						return getDictLabel('postStatus', row.status)
					}
				}
				// { label: '船公司', key: 'shipCarrierCode', prop: 'shipCarrierCode', disabled: false },
				// { label: '取单期限', key: 'takeExpTime', prop: 'takeExpTime', disabled: false },
				// { label: '付款期限', key: 'payExpTime', prop: 'payExpTime', disabled: false }
			].map(item => {
				return { ...item, minWidth: item.width }
			})
		}
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
			'isPledge',
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
					width: '150',
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
				{
					label: '预计到港时间',
					key: 'etaTime',
					prop: 'etaTime',
					disabled: false,
					width: 120
				},
				{
					label: '是否被押',
					key: 'isPledge',
					prop: 'isPledge',
					disabled: false,
					width: 80,
					formatter: (row, column) => {
						return row.isPledge === 'y' ? '是' : '否'
					}
				},
				{
					label: '被押工作号',
					key: 'pledgeOrderNo',
					prop: 'pledgeOrderNo',
					disabled: false,
					width: '150'
				},
				{
					label: '押单来源',
					key: 'pledgeSource',
					prop: 'pledgeSource',
					disabled: false,
					formatter: (row, column) => {
						return row.pledgeSource
					}
				},
				{
					label: '预计开船时间',
					key: 'etdTime',
					prop: 'etdTime',
					disabled: false,
					width: 120
				},
				{
					label: '实际开船时间',
					key: 'tdTime',
					prop: 'tdTime',
					disabled: false,
					width: 120
				},
				{
					label: '提单类型',
					key: 'blType',
					prop: 'blType',
					disabled: false,
					width: 100,
					formatter: (row, column) => {
						return getDictLabel('blType', row.blType)
					}
				},
				{
					label: '委托单位',
					key: 'custName',
					prop: 'custName',
					disabled: false,
					width: '150'
				},
				{
					label: '委托单位结算方式',
					key: 'custSettleType',
					prop: 'custSettleType',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('settleCycle', row.custSettleType)
					}
				},
				{
					label: '委托单位账期',
					key: 'custAccountPeriod',
					prop: 'custAccountPeriod',
					disabled: false,
					width: 120
				},
				{
					label: '船公司',
					key: 'shipCarrierCode',
					prop: 'shipCarrierCode',
					disabled: false,
					width: 100
				},
				{
					label: '订舱代理',
					key: 'bkgAgentSupplierName',
					prop: 'bkgAgentSupplierName',
					disabled: false,
					width: '150'
				},
				{
					label: '出单方式',
					key: 'blMode',
					prop: 'blMode',
					disabled: false,
					width: 100,
					formatter: (row, column) => {
						return getDictLabel('blMode', row.blMode)
					}
				},
				{
					label: '放单审核人',
					key: 'auditEmployeeName',
					prop: 'auditEmployeeName',
					disabled: false,
					width: 120
				},
				{
					label: '放单审核时间',
					key: 'auditTime',
					prop: 'auditTime',
					disabled: false,
					width: '150'
				},
				{
					label: '放单审核状态',
					key: 'auditStatus',
					prop: 'auditStatus',
					disabled: false,
					width: 120,
					formatter: (row, column) => {
						// return state.finAuditStatusOptions[row.auditStatus]
						return getDictLabel('blFinAuditStatus', row.auditStatus)
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
				{
					label: '派单人',
					key: 'dispatchEmployeeName',
					prop: 'dispatchEmployeeName',
					disabled: false,
					width: 120
				},
				{
					label: '派单时间',
					key: 'dispatchTime',
					prop: 'dispatchTime',
					disabled: false,
					width: '150'
				},
				{
					label: '取单人',
					key: 'takeEmployeeName',
					prop: 'takeEmployeeName',
					disabled: false,
					width: 120
				},
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
					width: '150',
					disabled: false,
					formatter: (row, column) => {
						return row.isAgreeRelease === 'y' ? '是' : '否'
					}
				},
				{
					label: '船东电放是否申请',
					key: 'telexApplyStatus',
					prop: 'telexApplyStatus',
					width: '150',
					disabled: false,
					formatter: (row, column) => {
						return row.telexApplyStatus === 'y' ? '是' : '否'
					}
				},
				{
					label: '船东电放申请完成',
					key: 'telexDownStatus',
					prop: 'telexDownStatus',
					width: '150',
					disabled: false,
					formatter: (row, column) => {
						return row.telexDownStatus === 'y' ? '是' : '否'
					}
				},
				{
					label: '船东电放完成时间',
					key: 'telexDownTime',
					prop: 'telexDownTime',
					disabled: false,
					width: '150'
				},
				{
					label: '取单完成时间',
					key: 'takeTime',
					prop: 'takeTime',
					disabled: false,
					width: '150'
				},
				{
					label: '撤回原因',
					key: 'cancelReason',
					prop: 'cancelReason',
					disabled: false,
					width: '150',
					formatter: (row, column) => {
						return getDictLabel('blCancelReason', row.cancelReason) || getDictLabel('blCancelEditReason', row.cancelReason)
					}
				},
				{
					label: '撤回备注',
					key: 'cancelRemark',
					prop: 'cancelRemark',
					disabled: false,
					width: '150'
				},
				{
					label: '撤回时间',
					key: 'cancelTime',
					prop: 'cancelTime',
					disabled: false,
					width: '150'
				},
				{
					label: '附件信息',
					key: 'fileNo',
					prop: 'fileNo',
					disabled: false,
					width: 100,
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
					width: 100,
					formatter: (row, column) => {
						return getDictLabel('blPutStatus', row.putStatus)
					}
				},
				{
					label: '销售',
					key: 'bdEmployeeName',
					prop: 'bdEmployeeName',
					disabled: false,
					width: 120
				},
				{
					label: '销售所属部门',
					key: 'bdDeptName',
					prop: 'bdDeptName',
					disabled: false,
					width: 120
				},
				{
					label: '申请时间',
					key: 'applyTime',
					prop: 'applyTime',
					disabled: false,
					width: '150'
				}
			].map(item => {
				return { ...item, minWidth: item.width }
			})
		}
	},
	// 提单财务审核列表
	blFinList: {
		// 默认表头
		defaultColumns: blFinList.defaultColumns.concat(['isSpecial']),
		// 自定义表头特殊处理
		specialColumns: {
			// podFreeIn: ['podFreeOut', 'podFree']
		},
		// 表头库
		columnsBase(handleViewSo, handleViewCustName, handleOrderNo, handleToOrderFee, handleArrearAmt, handleOverQuotaAmt, handleViewWorkFlowActList, handleViewFileList) {
			return [
				{
					label: '是否特殊申请',
					key: 'isSpecial',
					prop: 'isSpecial',
					width: '100',
					disabled: false,
					formatter: (row, column) => {
						return row.isSpecial === 'Y' ? '是' : '否'
					}
				},
				{
					label: '申请人',
					sortable: 'custom',
					key: 'applyEmployeeName',
					prop: 'applyEmployeeName',
					disabled: false,
					width: '120'
				},
				{
					label: '销售助理部门',
					key: 'obdDeptName',
					prop: 'obdDeptName',
					disabled: false,
					width: '120'
				},
				{
					label: '主单分公司',
					key: 'compDeptName',
					prop: 'compDeptName',
					disabled: false,
					width: '150'
				},
				{
					label: '协同单分公司',
					key: 'jointCompDeptName',
					prop: 'jointCompDeptName',
					disabled: false,
					width: '150'
				},
				// {
				// 	label: '财务审核备注',
				// 	key: 'auditRemark',
				// 	prop: 'auditRemark',
				// 	disabled: false,
				// 	width: '120'
				// },
				{
					label: '销售助理',
					sortable: 'custom',
					key: 'obdEmployeeName',
					prop: 'obdEmployeeName',
					disabled: false,
					width: '80'
				},
				{
					label: '下单助理',
					key: 'asstEmployeeName',
					prop: 'asstEmployeeName',
					disabled: false,
					width: '80'
				},
				{
					label: '小航线',
					key: 'sysLineName',
					prop: 'sysLineName',
					disabled: false,
					minWidth: '100',
					// minWidthDrag: true,
					width: 100
				},
				{
					label: '大航线',
					key: 'sysLineGroupName',
					prop: 'sysLineGroupName',
					disabled: false,
					minWidth: '100',
					// minWidthDrag: true,
					width: 100
				},
				{
					label: '提单状态',
					key: 'blStatus',
					prop: 'blStatus',
					disabled: false,
					width: '150',
					formatter: (row, column) => {
						return getDictLabel('woBlStatus', row.blStatus)
					}
				},

				{
					label: '业务类型',
					key: 'businessType',
					prop: 'businessType',
					width: '150',
					formatter: (row, column) => {
						return getDictLabel('businessType', row.businessType)
					}
				},
				{
					label: '提单号',
					sortable: 'custom',
					key: 'blNo',
					prop: 'blNo',
					disabled: false,
					align: 'left',
					width: '150',
					formatter: (row, column) => {
						let str = ''
						let blTypeStr = row.blType === 'hbl' ? `<i class="icon-hbl2">H</i>` : row.blType === 'mbl' ? `<i class="icon-hbl2">M</i>` : ''
						return `<el-button type="text" class="underline">${str}${blTypeStr}${row.blNo}</el-button>`
					},
					method: (index, row) => {
						handleToOrderFee(row)
					}
				},
				{
					label: '放单状态',
					key: 'putStatus',
					prop: 'putStatus',
					disabled: false,
					width: 100,
					formatter: (row, column) => {
						return row.putStatus === 'finish' ? '已放单' : '未放单'
					}
				},
				{
					label: '工作号',
					sortable: 'custom',
					key: 'orderNo',
					prop: 'orderNo',
					width: '150',
					disabled: false,
					type: 'text',
					popoverComponent: ColumnFinCopy,
					// formatter: (row, column) => {
					// 	let jointStr = row.orgDeptName ? `<i class="icon-joint-dept">协-订</i>` : ''
					// 	return `${jointStr}<el-button type="text" class="underline">${row.orderNo}</el-button>`
					// },

					method: row => {
						handleOrderNo(row)
					}
				},
				{
					label: 'SO/PO号',
					key: 'soInfo',
					prop: 'soInfo',
					width: '150',
					disabled: false,
					formatter: (row, column) => {
						return `<el-button type="text" class="underline">${row.soInfo}</el-button>`
					},
					method: (index, row) => {
						handleViewSo(index, row)
					}
				},
				{
					label: '订单状态',
					key: 'orderStatus',
					prop: 'orderStatus',
					disabled: false,
					width: 100,
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
					label: 'T量',
					key: 'tAmount',
					prop: 'tAmount',
					width: 100,
					disabled: false
				},
				{
					label: '业务日期',
					sortable: 'custom',
					key: 'bizDate',
					prop: 'bizDate',
					disabled: false,
					width: 100
				},
				{
					label: '预计到达时间',
					sortable: 'custom',
					key: 'etaTime',
					prop: 'etaTime',
					disabled: false,
					width: 120
				},
				{
					label: '预计出发时间',
					sortable: 'custom',
					key: 'etdTime',
					prop: 'etdTime',
					disabled: false,
					width: 120
				},
				{
					label: '实际出发时间',
					sortable: 'custom',
					key: 'tdTime',
					prop: 'tdTime',
					disabled: false,
					width: 120
				},
				{
					label: '实际到达时间',
					sortable: 'custom',
					key: 'taTime',
					prop: 'taTime',
					disabled: false,
					width: 120
				},
				{
					label: '是否被押',
					key: 'isPledge',
					prop: 'isPledge',
					disabled: false,
					width: 100,
					formatter: (row, column) => {
						return row.isPledge === 'y' ? '是' : '否'
					},
					headerSign: {
						text: '本单是否被其他单押了'
					}
				},
				{
					label: '所押T量',
					key: 'pledgeAmount',
					prop: 'pledgeAmount',
					disabled: false,
					width: 150,
					headerSign: {
						text: '本单押了其他单的多少T量'
					}
				},
				{
					label: '押单工作号',
					key: 'pledgeOrderNo',
					prop: 'pledgeOrderNo',
					disabled: false,
					width: '150',
					headerSign: {
						text: '本单押了哪个工作号'
					}
				},
				{
					label: '押单提单号',
					key: 'pledgeBlNo',
					prop: 'pledgeBlNo',
					disabled: false,
					width: 150,
					headerSign: {
						text: '本单押了哪个提单号'
					}
				},
				{
					label: '被押工作号',
					key: 'pledgeSource',
					prop: 'pledgeSource',
					disabled: false,
					width: '150',
					headerSign: {
						text: '本单被哪个工作号押了'
					}
				},
				// {
				// 	label: '客户类型',
				// 	key: 'custType',
				// 	prop: 'custType',
				// 	disabled: false,
				// 	width: 120,
				// 	formatter: (row, column) => {
				// 		return getDictLabel('customerClass', row.custType)
				// 	}
				// },
				{
					label: '提单类型',
					key: 'blType',
					prop: 'blType',
					disabled: false,
					width: 100,
					formatter: (row, column) => {
						return getDictLabel('blType', row.blType)
					}
				},
				{
					label: '委托单位',
					sortable: 'custom',
					key: 'custName',
					prop: 'custName',
					// popoverComponent: CustNameShow,
					popoverComponent: ColumnCustName,
					disabled: false,
					width: '150',
					// formatter: (row, column) => {
					// 	return `<el-button type="text" class="underline">${row.custName}</el-button>`
					// },
					method: row => {
						handleViewCustName(row, '委托单位信控信息')
					}
				},
				{
					label: '附件',
					key: 'fileName',
					prop: 'fileName',
					disabled: false,
					width: 100,
					formatter: (row, column) => {
						return row.fileNo ? `<el-button type="text" class="underline">查看</el-button>` : ''
					},
					method: (index, row) => {
						handleViewFileList(index, row)
					}
				},
				{
					label: '委托单位结算方式',
					key: 'custSettleType',
					prop: 'custSettleType',
					width: '150',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('settleCycle', row.custSettleType)
					}
				},
				// {
				// 	label: '委托单位账期',
				// 	key: 'custSettlePeriod',
				// 	prop: 'custSettlePeriod',
				// 	disabled: false,
				// 	width: 120
				// },
				{
					label: '结算单位',
					key: 'custSettleUnit',
					prop: 'custSettleUnit',
					disabled: false,
					width: '150',
					formatter: (row, column) => {
						let result = row.custSettleUnit
						if (row.custSettleUnit.split(',').length > 1) {
							result = '查看'
						}
						return `<el-button type="text" class="underline">${result}</el-button>`
					},
					method: (index, row) => {
						if (row.custSettleUnit.split(',').length > 1) {
							return handleViewCustName(row, '结算单位信控信息')
						}
						handleViewCustName(row, '委托单位信控信息')
					}
				},
				{
					label: '船/航司/陆港',
					key: 'shipCarrierCode',
					prop: 'shipCarrierCode',
					disabled: false,
					width: 100
				},
				{
					label: '订舱代理',
					sortable: 'custom',
					key: 'bkgAgentSupplierName',
					prop: 'bkgAgentSupplierName',
					disabled: false,
					width: '150'
				},
				{
					label: '出单方式',
					sortable: 'custom',
					key: 'blMode',
					prop: 'blMode',
					disabled: false,
					width: 120,
					formatter: (row, column) => {
						return getDictLabel('blMode', row.blMode)
					}
				},
				{
					label: '申请时间',
					sortable: 'custom',
					key: 'applyTime',
					prop: 'applyTime',
					disabled: false,
					width: '150'
				},
				{
					label: '放单申请备注',
					key: 'applyRemark',
					prop: 'applyRemark',
					disabled: false,
					width: '150'
				},
				{
					label: '申请原因',
					key: 'applyType',
					prop: 'applyType',
					width: '150',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('blFinApplyType', row.applyType)
					}
				},
				{
					label: '财务审核人',
					key: 'auditEmployeeName',
					prop: 'auditEmployeeName',
					disabled: false,
					width: 120
				},
				{
					label: '实际财务审核人',
					key: 'realAuditEmployeeName',
					prop: 'realAuditEmployeeName',
					disabled: false,
					width: 120
				},
				{
					label: '放单审核时间',
					sortable: 'custom',
					key: 'auditTime',
					prop: 'auditTime',
					disabled: false,
					width: '150'
				},
				{
					label: '财务审核状态',
					key: 'auditStatus',
					prop: 'auditStatus',
					width: '150',
					disabled: false,
					formatter: (row, column) => {
						let result = getDictLabel('blFinAuditStatus', row.auditStatus)
						let color = ''
						// 待审核
						if (['submit'].includes(row.auditStatus)) {
							color = 'yellow'
						}
						// 审核通过
						if (row.auditStatus === 'pass') {
							color = 'green'
						}
						// 处理中
						if (['processing'].includes(row.auditStatus)) {
							color = 'blue'
						}
						// 拒绝
						if (['refuse'].includes(row.auditStatus)) {
							color = 'red'
						}
						return `<span class="${color}">${result}</span>`
					}
				},
				{
					label: '特殊审批参与人',
					key: 'wfIndexAuditEmployeeId',
					prop: 'wfIndexAuditEmployeeId',
					width: '110',
					disabled: false,
					formatter: (row, column) => {
						let result = ''
						if (row.isSpecial === 'Y') {
							result = `<el-button type="text" class="underline">查看</el-button>`
						}
						return result
					},
					method: (index, row) => {
						handleViewWorkFlowActList(index, row)
					}
				},
				{
					label: '处理原因',
					key: 'auditReason',
					prop: 'auditReason',
					disabled: false,
					width: '150',
					formatter: (row, column) => {
						return getDictLabel('blFinAuditProcessingReason', row.auditReason)
					}
				},
				{ label: '处理备注', key: 'auditRemark', prop: 'auditRemark', width: '150', disabled: false },
				{
					label: '销售',
					sortable: 'custom',
					key: 'bdEmployeeName',
					prop: 'bdEmployeeName',
					disabled: false,
					width: 120
				},
				{
					label: '协同部门',
					key: 'orgDeptName',
					prop: 'orgDeptName',
					disabled: false,
					width: 100
				},
				{
					label: '被协同部门',
					key: 'jointDeptName',
					prop: 'jointDeptName',
					disabled: false,
					width: 100
				},
				{
					label: '销售部门',
					key: 'bdDeptName',
					prop: 'bdDeptName',
					disabled: false,
					width: 120
				},
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
					width: '150',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('feeSettleStatus', row.payFeeCleanStatus)
					}
				},
				{
					label: '是否超额',
					key: 'isOverQuota',
					prop: 'isOverQuota',
					disabled: false
				},
				// {
				// 	label: '超额币种',
				// 	key: 'creditCurrency',
				// 	prop: 'creditCurrency',
				// 	disabled: false
				// },
				{
					label: '超额金额',
					key: 'overQuotaAmt',
					prop: 'overQuotaAmt',
					disabled: false,
					width: '100',
					type: 'btns',
					formatter: (row, column) => {
						// return `<el-button type="text" class="underline">${row.overQuotaAmt === null ? '' : row.overQuotaAmt}</el-button>`
						return `<el-button type="text" class="underline">${!row.overQuotaAmt ? '' : '查看'}</el-button>`
					},
					method: (index, row) => {
						handleOverQuotaAmt(index, row, '')
					}
				},
				{
					label: '未付金额',
					key: 'unpayAmt',
					prop: 'unpayAmt',
					width: '100',
					disabled: false,
					formatter: (row, column) => {
						return `<el-button type="text" class="underline">${row.unpayAmt === null ? '' : row.unpayAmt}</el-button>`
					},
					method: (index, row) => {
						handleOverQuotaAmt(index, row, 'pay')
					}
				},
				{
					label: '未收金额',
					key: 'unrecvAmt',
					prop: 'unrecvAmt',
					width: '100',
					disabled: false,
					formatter: (row, column) => {
						return `<el-button type="text" class="underline">${row.unrecvAmt === null ? '' : row.unrecvAmt}</el-button>`
					},
					method: (index, row) => {
						handleOverQuotaAmt(index, row, 'receive')
					}
				},
				{
					label: '是否超期',
					key: 'isArrear',
					prop: 'isArrear',
					disabled: false
				},
				// {
				// 	label: '超期币种',
				// 	key: 'arrearCurrency',
				// 	prop: 'arrearCurrency',
				// 	disabled: false
				// },
				{
					label: '超期金额',
					key: 'arrearAmt',
					prop: 'arrearAmt',
					type: 'text',
					disabled: false,
					formatter: (row, column) => {
						// return `<el-button type="text" class="underline">${row.arrearAmt === null ? '' : row.arrearAmt}</el-button>`
						return `<el-button type="text" class="underline">${!row.arrearAmt ? '' : '查看'}</el-button>`
					},
					method: (index, row) => {
						handleArrearAmt(index, row)
					}
				},
				{
					label: '目的港是否还柜',
					key: 'isContainerReturn',
					prop: 'isContainerReturn',
					width: '150',
					disabled: false,
					formatter: (row, column) => {
						return row.isContainerReturn === 'y' ? '是' : '否'
						// return getDictLabel('isContainerReturn', row.isContainerReturn)
					}
				},
				{
					label: '即将到港天数',
					key: 'lastDay',
					prop: 'lastDay',
					disabled: false,
					width: 120
				},
				{
					label: '财务上次审核记录',
					key: 'preAuditTime',
					prop: 'preAuditTime',
					disabled: false,
					width: 200,
					formatter: (row, column) => {
						return `${row.preAuditTime} ${getDictLabel('blFinAuditStatus', row.preAuditStatus)}`
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
				},
				{
					label: '正本取单状态',
					key: 'blTakeStatus',
					prop: 'blTakeStatus',
					disabled: false,
					width: '100',
					minWidth: '100',
					formatter: (row, column) => {
						return row.blTakeStatus === 'finish' ? '已取单' : '未取单'
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
					label: '是否EXW',
					key: 'isExw',
					prop: 'isExw',
					width: '80',
					disabled: false,
					formatter: (row, column) => {
						return row.isExw === 'Y' ? '是' : row.isExw === 'N' ? '否' : ''
					}
				},
			].map(item => {
				return { ...item, minWidth: item.width }
			})
		},

		isContainerReturnOptions: [
			{ label: '是', value: 'y' },
			{ label: '否', value: 'n' }
		]
	},
	// 放单申请列表
	blFinApplyList: {
		defaultColumns: blFinList.defaultColumns,
		// 表头库
		columnsBase(handleViewSo, handleViewCustName, handleViewCustSettleUnit, handleOrderNo, handleToOrderFee, handleViewWorkFlowActList, handleViewFileList) {
			return [
				{
					label: '申请人',
					key: 'applyEmployeeName',
					prop: 'applyEmployeeName',
					disabled: false,
					width: '100'
				},
				{
					label: '工作号',
					key: 'orderNo',
					prop: 'orderNo',
					width: '150',
					disabled: false,
					type: 'text',
					popoverComponent: ColumnFinCopy,
					method: row => {
						handleOrderNo(row)
					}
					// formatter: (row, column) => {
					// 	let jointStr = row.orgDeptName ? `<i class="icon-joint-dept">协-订</i>` : ''
					// 	return `${jointStr}${row.orderNo}`
					// }
				},
				{
					label: '提单号',
					key: 'blNo',
					prop: 'blNo',
					disabled: false,
					align: 'left',
					width: '150',
					formatter: (row, column) => {
						let str = ''
						let blTypeStr = row.blType === 'hbl' ? `<i class="icon-hbl2">H</i>` : row.blType === 'mbl' ? `<i class="icon-hbl2">M</i>` : ''
						return `<el-button type="text" class="underline">${str}${blTypeStr}${row.blNo}</el-button>`
					},
					method: (index, row) => {
						handleToOrderFee(row)
					}
				},
				{
					label: '财务上次审核记录',
					key: 'preAuditTime',
					prop: 'preAuditTime',
					disabled: false,
					width: 200,
					formatter: (row, column) => {
						return `${row.preAuditTime} ${getDictLabel('blFinAuditStatus', row.preAuditStatus)}`
					}
				},
				// {
				// 	label: '系统航线代码',
				// 	key: 'sysLineCode',
				// 	prop: 'sysLineCode',
				// 	disabled: false,
				// 	width: 100
				// },
				{
					label: '主单分公司',
					key: 'compDeptName',
					prop: 'compDeptName',
					disabled: false,
					width: '150'
				},
				{
					label: '协同单分公司',
					key: 'jointCompDeptName',
					prop: 'jointCompDeptName',
					disabled: false,
					width: '150'
				},
				{
					label: '小航线',
					key: 'sysLineName',
					prop: 'sysLineName',
					disabled: false,
					minWidth: '100',
					// minWidthDrag: true,
					width: 100
				},
				{
					label: '大航线',
					key: 'sysLineGroupName',
					prop: 'sysLineGroupName',
					disabled: false,
					minWidth: '100',
					// minWidthDrag: true,
					width: 100
				},
				{
					label: '业务类型',
					key: 'businessType',
					prop: 'businessType',
					width: '150',
					formatter: (row, column) => {
						return getDictLabel('businessType', row.businessType)
					}
				},
				{
					label: '提单类型',
					key: 'blType',
					prop: 'blType',
					disabled: false,
					width: 80,
					formatter: (row, column) => {
						return getDictLabel('blType', row.blType)
					}
				},
				{
					label: '销售部门',
					key: 'bdDeptName',
					prop: 'bdDeptName',
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
					label: '销售助理',
					key: 'obdEmployeeName',
					prop: 'obdEmployeeName',
					disabled: false,
					width: '80'
				},
				{
					label: '下单助理',
					key: 'asstEmployeeName',
					prop: 'asstEmployeeName',
					disabled: false,
					width: '80'
				},
				{
					label: '所押T量',
					key: 'pledgeAmount',
					prop: 'pledgeAmount',
					disabled: false,
					width: 150,
					headerSign: {
						text: '本单押了其他单的多少T量'
					}
				},
				{
					label: '押单工作号',
					key: 'pledgeOrderNo',
					prop: 'pledgeOrderNo',
					disabled: false,
					width: '150',
					headerSign: {
						text: '本单押了哪个工作号'
					}
				},
				{
					label: '押单提单号',
					key: 'pledgeBlNo',
					prop: 'pledgeBlNo',
					disabled: false,
					width: '150',
					headerSign: {
						text: '本单押了哪个提单号'
					}
				},
				{
					label: '被押工作号',
					key: 'pledgeSource',
					prop: 'pledgeSource',
					disabled: false,
					width: '150',
					headerSign: {
						text: '本单被哪个工作号押了'
					}
				},
				{
					label: '财务审核状态',
					key: 'auditStatus',
					prop: 'auditStatus',
					disabled: false,
					width: 120,
					formatter: (row, column) => {
						let result = getDictLabel('blFinAuditStatus', row.auditStatus)
						let color = ''
						// 待审核
						if (['submit'].includes(row.auditStatus)) {
							color = 'yellow'
						}
						// 审核通过
						if (row.auditStatus === 'pass') {
							color = 'green'
						}
						// 处理中
						if (['processing'].includes(row.auditStatus)) {
							color = 'blue'
						}
						// 拒绝
						if (['refuse'].includes(row.auditStatus)) {
							color = 'red'
						}
						return `<span class="${color}">${result}</span>`
						// return getDictLabel('blFinAuditStatus', row.auditStatus)
					}
				},
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
					width: '150',
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
					width: '80',
					// formatter: (row, column) => {
					// 	return getDictLabel('orderStatus', row.orderStatus)
					// },
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
					label: '提单状态',
					key: 'blStatus',
					prop: 'blStatus',
					disabled: false,
					width: '150',
					formatter: (row, column) => {
						return getDictLabel('woBlStatus', row.blStatus)
					}
				},
				{
					label: 'SO/PO号',
					key: 'soInfo',
					prop: 'soInfo',
					width: '150',
					disabled: false,
					formatter: (row, column) => {
						return `<el-button type="text" class="underline">${row.soInfo}</el-button>`
					},
					method: (index, row) => {
						handleViewSo(index, row)
					}
				},
				{
					label: '附件',
					key: 'fileName',
					prop: 'fileName',
					disabled: false,
					width: 100,
					formatter: (row, column) => {
						return row.fileNo ? `<el-button type="text" class="underline">查看</el-button>` : ''
					},
					method: (index, row) => {
						handleViewFileList(index, row)
					}
				},
				{
					label: 'T量',
					key: 'tAmount',
					prop: 'tAmount',
					width: 80,
					disabled: false
				},
				{
					label: '业务日期',
					key: 'bizDate',
					prop: 'bizDate',
					disabled: false,
					width: 100
				},
				{
					label: '是否被押',
					key: 'isPledge',
					prop: 'isPledge',
					disabled: false,
					width: 80,
					formatter: (row, column) => {
						return row.isPledge === 'y' ? '是' : '否'
					},
					headerSign: {
						text: '本单是否被其他单押了'
					}
				},
				{
					label: '预计出发时间',
					key: 'etdTime',
					prop: 'etdTime',
					disabled: false,
					width: 100
				},
				{
					label: '实际出发时间',
					key: 'tdTime',
					prop: 'tdTime',
					disabled: false,
					width: 100
				},
				{
					label: '预计到达时间',
					key: 'etaTime',
					prop: 'etaTime',
					disabled: false,
					width: 100
				},
				{
					label: '实际到达时间',
					sortable: 'custom',
					key: 'taTime',
					prop: 'taTime',
					disabled: false,
					width: 120
				},
				// {
				// 	label: '客户类型',
				// 	key: 'custType',
				// 	prop: 'custType',
				// 	width: '150',
				// 	disabled: false,
				// 	formatter: (row, column) => {
				// 		return getDictLabel('customerClass', row.custType)
				// 	}
				// },
				{
					label: '委托单位',
					key: 'custName',
					prop: 'custName',
					// popoverComponent: CustNameShow,
					popoverComponent: ColumnCustName,
					disabled: false,
					width: '150',
					// formatter: (row, column) => {
					// 	return `<el-button type="text" class="underline">${row.custName}</el-button>`
					// },
					method: row => {
						handleViewCustName(row, '委托单位信控信息')
					}
				},
				{
					label: '委托单位结算方式',
					key: 'custSettleType',
					prop: 'custSettleType',
					width: '150',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('settleCycle', row.custSettleType)
					}
				},
				// {
				// 	label: '委托单位账期',
				// 	key: 'custSettlePeriod',
				// 	prop: 'custSettlePeriod',
				// 	disabled: false,
				// 	width: 120
				// },
				{
					label: '结算单位',
					key: 'custSettleUnit',
					prop: 'custSettleUnit',
					disabled: false,
					width: '150',
					formatter: (row, column) => {
						let result = row.custSettleUnit
						if (row.custSettleUnit.split(',').length > 1) {
							result = '查看'
						}
						return `<el-button type="text" class="underline">${result}</el-button>`
					},
					method: (index, row) => {
						if (row.custSettleUnit.split(',').length > 1) {
							return handleViewCustName(row, '结算单位信控信息')
						}
						handleViewCustName(row, '委托单位信控信息')
					}
				},
				{
					label: '船/航司/陆港',
					key: 'shipCarrierCode',
					prop: 'shipCarrierCode',
					disabled: false,
					width: 100
				},
				{
					label: '订舱代理',
					key: 'bkgAgentSupplierName',
					prop: 'bkgAgentSupplierName',
					disabled: false,
					width: '150'
				},
				{
					label: '出单方式',
					key: 'blMode',
					prop: 'blMode',
					disabled: false,
					width: 100,
					formatter: (row, column) => {
						return getDictLabel('blMode', row.blMode)
					}
				},
				{
					label: '申请时间',
					key: 'applyTime',
					prop: 'applyTime',
					disabled: false,
					width: '150'
				},
				{
					label: '放单申请备注',
					key: 'applyRemark',
					prop: 'applyRemark',
					disabled: false,
					width: '150'
				},
				{
					label: '申请原因',
					key: 'applyType',
					prop: 'applyType',
					width: '150',
					disabled: false,
					formatter: (row, column) => {
						return getDictLabel('blFinApplyType', row.applyType)
					}
				},
				{
					label: '财务审核人',
					key: 'auditEmployeeName',
					prop: 'auditEmployeeName',
					disabled: false,
					width: 100
				},
				{
					label: '实际财务审核人',
					key: 'realAuditEmployeeName',
					prop: 'realAuditEmployeeName',
					disabled: false,
					width: 100
				},
				{
					label: '财务审核时间',
					key: 'auditTime',
					prop: 'auditTime',
					disabled: false,
					sortable: 'custom',
					width: '150'
				},
				{
					label: '特殊审批参与人',
					key: 'wfIndexAuditEmployeeId',
					prop: 'wfIndexAuditEmployeeId',
					width: '110',
					disabled: false,
					formatter: (row, column) => {
						let result = ''
						if (row.isSpecial === 'Y') {
							result = `<el-button type="text" class="underline">查看</el-button>`
						}
						return result
					},
					method: (index, row) => {
						handleViewWorkFlowActList(index, row)
					}
				},
				{
					label: '处理原因',
					key: 'auditReason',
					prop: 'auditReason',
					disabled: false,
					width: '150',
					formatter: (row, column) => {
						return getDictLabel('blFinAuditProcessingReason', row.auditReason)
					}
				},
				{
					label: '处理备注',
					key: 'auditRemark',
					prop: 'auditRemark',
					width: '150',
					disabled: false
				},

				{
					label: '销售',
					key: 'bdEmployeeName',
					prop: 'bdEmployeeName',
					disabled: false,
					width: 100
				},
				{
					label: '协同部门',
					key: 'orgDeptName',
					prop: 'orgDeptName',
					disabled: false,
					width: 100
				},
				{
					label: '被协同部门',
					key: 'jointDeptName',
					prop: 'jointDeptName',
					disabled: false,
					width: 100
				},
				{
					label: '目的港是否还柜',
					key: 'isContainerReturn',
					prop: 'isContainerReturn',
					width: '150',
					disabled: false,
					width: 140,
					formatter: (row, column) => {
						return row.isContainerReturn === 'y' ? '是' : '否'
					}
				},
				{
					label: '即将到港天数',
					key: 'lastDay',
					prop: 'lastDay',
					disabled: false,
					width: 120
				},
				{
					label: '正本取单状态',
					key: 'blTakeStatus',
					prop: 'blTakeStatus',
					disabled: false,
					width: '100',
					minWidth: '100',
					formatter: (row, column) => {
						return row.blTakeStatus === 'finish' ? '已取单' : '未取单'
					}
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
				},
				{
					label: '提单所在地',
					key: 'placeCompName',
					prop: 'placeCompName',
					width: '150',
					disabled: false
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
					label: '是否EXW',
					key: 'isExw',
					prop: 'isExw',
					width: '80',
					disabled: false,
					formatter: (row, column) => {
						return row.isExw === 'Y' ? '是' : row.isExw === 'N' ? '否' : ''
					}
				},
			].map(item => {
				return { ...item, minWidth: item.width }
			})
		}
	},
	// 订仓列表
	lclAuditList: {
		// 默认表头
		defaultColumns: [
			'cancelExecTime',
			'orderNo',
			'whPoNo',
			'unloadingPortName',
			'bdEmployeeName',
			'bdDeptName',
			'obdEmployeeName',
			'obdDeptName',
			'orderStatus',
			'whBookType',
			'whBookStatus',
			'custid',
			'custName',
			'intrustRemark',
			'auditRemark',
			'businessType',
			'createdTime',
			'serviceType',
			'receiptPlaceName',
			'podPortName',
			// 'cyCutOff',
			'etdTime',
			'quantity',
			'weight',
			'volume',
			'hscode',
			'cname',
			'ename',
			'auditPassTime',
			'sysLineName',
			'whAgentSupplierId',
			'whAgentSupplierName',
			'lclOpEmployeeId',
			'lclOpEmployeeName',
			'etWhCyCutOff',
			'whCyCutOff'
		],
		// 自定义表头特殊处理
		specialColumns: {},
		// 表头库
		columnsBase(handleOrderNo) {
			return [
				{
					label: '工作号',
					key: 'orderNo',
					prop: 'orderNo',
					width: 160,
					disabled: false,
					// fixed: true,
					type: 'text',
					popoverComponent: ColumnTip,
					// formatter: (row, column) => {
					// 	return `<el-button type="text" class="underline">${row.orderNo}</el-button>`
					// },
					method: row => {
						handleOrderNo(row)
					}
				},
				{ label: '取消/终止/关闭时间', key: 'cancelExecTime', prop: 'cancelExecTime', width: '150', disabled: false },
				{
					label: '入舱单号',
					key: 'whPoNo',
					prop: 'whPoNo',
					width: '150',
					disabled: false
				},
				{
					label: '销售',
					key: 'bdEmployeeName',
					prop: 'bdEmployeeName',
					disabled: false,
					width: 100
				},
				// { label: '销售部门', key: 'bdDeptName', prop: 'bdDeptName', disabled: false },
				{
					label: '销售助理',
					key: 'obdEmployeeName',
					prop: 'obdEmployeeName',
					disabled: false,
					width: 100
				},
				// { label: '销售助理部门', key: 'obdDeptName', prop: 'obdDeptName', disabled: false },
				{
					label: '订单状态',
					key: 'orderStatus',
					prop: 'orderStatus',
					disabled: false,
					width: 80,
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
					label: '订舱类型',
					key: 'whBookType',
					prop: 'whBookType',
					disabled: false,
					width: 80,
					formatter: (row, column) => {
						return getDictLabel('whBookType', row.whBookType)
					}
				},
				{
					label: '订舱状态',
					key: 'whBookStatus',
					prop: 'whBookStatus',
					disabled: false,
					width: 80,
					formatter: (row, column) => {
						let result = getDictLabel('whBookStatus', row.whBookStatus)
						let color = row.whBookStatus
						return `<span class="${color}">${result}</span>`
					}
				},
				// { label: '委托单位编号', key: 'custid', prop: 'custid', disabled: false },
				{
					label: '委托单位',
					key: 'custName',
					prop: 'custName',
					popoverComponent: CustNameShow,
					disabled: false,
					width: '150'
				},
				// { label: '委托备注', key: 'intrustRemark', prop: 'intrustRemark', disabled: false },
				// { label: '商务备注', key: 'auditRemark', prop: 'auditRemark', disabled: false },
				// {
				// 	label: '业务类型',
				// 	key: 'businessType',
				// 	prop: 'businessType',
				// 	disabled: false,
				// 	formatter: (row, column) => {
				// 		return getDictLabel('businessType', row.businessType)
				// 	}
				// },
				// { label: '订单创建时间', key: 'createdTime', prop: 'createdTime', disabled: false },
				// {
				// 	label: '服务类型',
				// 	key: 'serviceType',
				// 	prop: 'serviceType',
				// 	disabled: false,
				// 	formatter: (row, column) => {
				// 		return row.serviceTypeName
				// 	}
				// },
				{
					label: '装货地',
					key: 'receiptPlaceName',
					prop: 'receiptPlaceName',
					disabled: false,
					width: 100
				},
				{
					label: '卸货港',
					key: 'unloadingPortName',
					prop: 'unloadingPortName',
					disabled: false,
					width: '150'
				},
				{
					label: '目的地',
					key: 'podPortName',
					prop: 'podPortName',
					disabled: false,
					width: '150'
				},
				{
					label: '预计截仓时间',
					key: 'etWhCyCutOff',
					prop: 'etWhCyCutOff',
					disabled: false,
					sortable: 'custom',
					width: '150'
				},
				{
					label: '实际截仓时间',
					key: 'whCyCutOff',
					prop: 'whCyCutOff',
					disabled: false,
					sortable: 'custom',
					width: '150'
				},
				// { label: '大船截关时间', key: 'cyCutOff', prop: 'cyCutOff', disabled: false, width: 120 },
				{
					label: '大船预计开船时间',
					key: 'etdTime',
					prop: 'etdTime',
					disabled: false,
					width: '150'
				},
				{
					label: '总件数',
					key: 'quantity',
					prop: 'quantity',
					disabled: false,
					width: 80
				},
				{
					label: '总毛重',
					key: 'weight',
					prop: 'weight',
					disabled: false,
					width: 80
				},
				{
					label: '总体积',
					key: 'volume',
					prop: 'volume',
					disabled: false,
					width: 80
				},
				{
					label: 'HS Code',
					key: 'hscode',
					prop: 'hscode',
					disabled: false,
					width: 120
				},
				{
					label: '中文品名',
					key: 'cname',
					prop: 'cname',
					disabled: false,
					width: 100
				},
				{
					label: '英文品名',
					key: 'ename',
					prop: 'ename',
					disabled: false,
					width: 100
				},
				{
					label: '审核时间',
					key: 'auditPassTime',
					prop: 'auditPassTime',
					disabled: false,
					width: '150'
				},
				{
					label: '系统航线',
					key: 'sysLineName',
					prop: 'sysLineName',
					disabled: false,
					width: 100
				},
				// { label: '订舱代理ID', key: 'whAgentSupplierId', prop: 'whAgentSupplierId', disabled: false },
				{
					label: '订舱代理名称',
					key: 'whAgentSupplierName',
					prop: 'whAgentSupplierName',
					disabled: false,
					width: '150'
				},
				// { label: '散货操作ID', key: 'lclOpEmployeeId', prop: 'lclOpEmployeeId', disabled: false },
				{
					label: '订舱操作',
					key: 'lclOpEmployeeName',
					prop: 'lclOpEmployeeName',
					disabled: false,
					width: 120
				}
			].map(item => {
				return { ...item, minWidth: item.width }
			})
		}
	},
	// 工厂不同意列表
	factoryDisagree: {
		defaultColumns: [
			'blNo',
			'orderNo',
			'taTime',
			'custName',
			'businessType',
			'blMode',
			'isDraftConfirm',
			'siStatus',
			'copyCheckStatus',
			'isAgreeRelease',
			'auditStatus',
			'takeStatus',
			'putStatus',
			'agreeReleaseStatus',
			'agreeApplyEmployeeName',
			'agreeApplyReason',
			'agreeAuditEmployeeName',
			'agreeAuditPresidentEmployeeName',
			'agreeAuditReason'
		],
		specialColumns: [],
		// 表头库
		columnsBase(handleOrderNoInfo) {
			return [
				{
					label: '工作号',
					key: 'orderNo',
					prop: 'orderNo',
					width: '150',
					disabled: false,
					type: 'text',
					align: 'left'
					// popoverComponent: ColumnSiCopy,
					// method: row => {
					// 	handleOrderNoInfo(row)
					// }
				},
				{
					label: '提单号',
					key: 'blNo',
					prop: 'blNo',
					disabled: false,
					width: '180',
					formatter: (row, column) => {
						let blTypeStr = row.hblList && row.hblList.length ? `<i class="icon-hbl2">M</i>` : `<i class="icon-hbl2">H</i>`
						return `${blTypeStr}${row.blNo}`
					}
				},
				{
					label: '实际到港时间',
					key: 'taTime',
					prop: 'taTime',
					sortable: 'custom',
					width: '150'
				},
				{
					label: '委托单位',
					key: 'custName',
					prop: 'custName',
					disabled: false,
					width: '150'
				},
				{
					label: '业务类型',
					key: 'businessType',
					prop: 'businessType',
					disabled: false,
					width: '100',
					formatter: (row, column) => {
						return getDictLabel('shipBusinessType', row.businessType)
					}
				},
				{
					label: '出单方式',
					key: 'blMode',
					prop: 'blMode',
					disabled: false,
					width: '100',
					formatter: (row, column) => {
						return getDictLabel('blMode', row.blMode)
					}
				},
				{
					label: '草单确认',
					key: 'isDraftConfirm',
					prop: 'isDraftConfirm',
					disabled: false,
					width: '100',
					minWidth: '100',
					// minWidthDrag: true,
					formatter: (row, column) => {
						return row.isDraftConfirm === 'y' ? '已确认' : '未确认'
					}
				},
				{
					label: '补料状态',
					key: 'siStatus',
					prop: 'siStatus',
					disabled: false,
					width: '100',
					minWidth: '100'
					// formatter: (row, column) => {
					// 	return row.siStatus
					// }
				},
				{
					label: 'copy件客户确认',
					key: 'copyCheckStatus',
					prop: 'copyCheckStatus',
					disabled: false,
					width: '120',
					formatter: (row, column) => {
						return row.copyCheckStatus === 'pass' ? '已确认' : row.copyCheckStatus === 'submit' ? '未确认' : '--'
					}
				},
				{
					label: '客户同意放货',
					key: 'isAgreeRelease',
					prop: 'isAgreeRelease',
					disabled: false,
					width: '100',
					minWidth: '100',
					// minWidthDrag: true,
					formatter: (row, column) => {
						let str = getDictLabel('isAgreeRelease', row.isAgreeRelease)
						let passStr = row.agreeReleaseStatus === 'pass' ? '(已特殊审批)' : ''
						return `${str}${passStr}`
					}
				},
				{
					label: '放单审核状态',
					key: 'auditStatus',
					prop: 'auditStatus',
					disabled: false,
					width: 120,
					formatter: (row, column) => {
						return state.finAuditStatusOptions[row.auditStatus]
						// return getDictLabel('blFinAuditStatus', row.auditStatus)
					}
				},
				{
					label: '正本取单状态',
					key: 'takeStatus',
					prop: 'takeStatus',
					disabled: false,
					width: '100',
					minWidth: '100',
					// minWidthDrag: true,
					formatter: (row, column) => {
						return row.takeStatus === 'finish' ? '已取单' : '未取单'
					}
				},
				{
					label: '放单状态',
					key: 'putStatus',
					prop: 'putStatus',
					disabled: false,
					width: 100,
					formatter: (row, column) => {
						return row.putStatus === 'finish' ? '已放单' : row.isUploadTelex != '0' && !row.parentBlId ? '已推送文件' : '未放单'
					}
				},
				{
					label: '审批状态',
					key: 'agreeReleaseStatus',
					prop: 'agreeReleaseStatus',
					disabled: false,
					width: 120,
					formatter: (row, column) => {
						return getDictLabel('agreeReleaseStatus', row.agreeReleaseStatus)
					}
				},
				{
					label: '申请人',
					sortable: 'custom',
					key: 'agreeApplyEmployeeName',
					prop: 'agreeApplyEmployeeName',
					disabled: false,
					width: '120'
				},
				{
					label: '申请原因',
					key: 'agreeApplyReason',
					prop: 'agreeApplyReason',
					width: '150',
					disabled: false
				},
				{
					label: '一级审批人',
					key: 'agreeAuditEmployeeName',
					prop: 'agreeAuditEmployeeName',
					disabled: false,
					width: 120
				},
				{
					label: '二级审批人',
					key: 'agreeAuditPresidentEmployeeName',
					prop: 'agreeAuditPresidentEmployeeName',
					disabled: false,
					width: 120
				}
				// {
				// 	label: '拒绝原因',
				// 	key: 'agreeAuditReason',
				// 	prop: 'agreeAuditReason',
				// 	disabled: false,
				// 	width: 150
				// },
			].map(item => {
				return { ...item, minWidth: item.width }
			})
		}
	},
	// 客户类型 已弃用 改用字典取值 v20220407
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
	// whBookTypeOptions: store.state.dict.whBookType,
	// 所有分公司
	companyList: [],
	defaultSignAddress: '',
	speciesStrArr: '',
	workExceptionTypeObj: {},
	bulkRoBkgStatusObj,
	defaultExpressObj: [],
	caclShipInfoHeightSwitch: false,
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
	setCurrRole(state, payload) {
		state.currRole = payload
	},
	setServiceList(state, value) {
		state.serviceList = value
	},
	setOrderInfoData(state, value) {
		state.orderInfoData = value
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
		state.orderList.userEditRoles = value
	},
	setSpecialEditRoles(state, value) {
		state.orderList.specialEditRoles = value
	},
	setRole(state, value) {
		state.orderList.ordDetRole = value
	},
	setOrderInfoDataObj(state, value) {
		state.orderInfoDataObj = value
	},
	setSingleOrderRole(state, value) {
		// console.log('setSingleOrderRole', value)
		state.orderList.ordDetRolesObj[value.orderNo] = {
			ordDetRole: value.orderDetRole,
			userEditRoles: value.userEditRoles
		}
	},
	deleteSingleOrderRole(state, value) {
		delete state.orderList.ordDetRolesObj[value.orderNo]
	},
	SET_USER_COMPANY_INFO: (state, val) => {
		state.defaultSignAddress = val
	},
	SET_CUST_INFO: (state, val) => {
		state.custInfoObj = val
	},
	SET_SPECIES_STR: (state, arr) => {
		state.speciesStrArr = arr
	},
	SET_WORKEXCEPTION_DATA: (state, obj) => {
		state.workExceptionTypeObj = obj
	},
	SET_DEFAULT_EXPRESS_COMPANY: (state, obj) => {
		state.defaultExpressObj[obj.key] = obj.value
	},
	SET_CALC_SHIPINFO_HEIGHT: (state) => {
		state.caclShipInfoHeightSwitch = !state.caclShipInfoHeightSwitch
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
	// 设置角色
	setCurrRole(context, params) {
		context.commit('setCurrRole', params)
	},
	setOrderInfoData(context, params) {
		context.commit('setOrderInfoData', params)
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
	setSpecialEditRoles(context, params) {
		context.commit('setSpecialEditRoles', params)
	},
	setRole(context, params) {
		context.commit('setRole', params)
	},
	setOrderInfoDataObj(context, obj) {
		context.commit('setOrderInfoDataObj', obj)
	},
	setSingleOrderRole(context, params) {
		context.commit('setSingleOrderRole', params)
	},
	deleteSingleOrderRole(context, params) {
		context.commit('setSingleOrderRole', params)
	},

	// 请求下载blob流文件
	downloadBlobFile({ state }, { uri, params, type }) {
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
					let blob = null
					if (type) {
						blob = new Blob([res.data], { type })
					} else {
						blob = new Blob([res.data])
					}
					// let blob = new Blob([res.data], {type: "application/msword"});
					// let blob = new Blob([res.data])
					resolve(blob)
				})
				.catch(err => {
					reject(err)
					console.log(err)
				})
		})
	},
	// 输出pdf，xls,doc
	exportBlobFile({ state }, { uri, data, isPreview }) {
		return new Promise((resolve, reject) => {
			const loading = Loading.service({
				lock: true,
				text: 'Loading',
				spinner: 'el-icon-loading',
				background: 'rgba(0, 0, 0, 0.5)'
			})
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
					// console.log('res', res)
					loading.close()
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
					if (isPreview) {
						resolve(res.data)
					}
					// let blob = new Blob([res.data], {type: "application/vnd.ms-excel"});
					let blob = new Blob([res.data])
					resolve(blob)
				})
				.catch(err => {
					reject(err)
					loading.close()
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
						} else if (data.isSyncBkgAgent === 'N' && res.data.code === 100117) {
							MessageBox.confirm(res.data.msg, '提示', {
								confirmButtonText: '确定',
								cancelButtonText: '取消',
								type: 'warning'
							})
								.then(() => {
									resolve('isSyncBkgAgent')
								})
								.catch(() => {})
						} else {
							Message({
								message: res.data.msg || 'Error',
								type: 'error',
								showClose: true
							})
							resolve('error')
						}
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
			console.log('🚀 ~ fileName', fileName)
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
	getPreViewFile({ state }, params) {
		return new Promise((resolve, reject) => {
			let { fileNo, fileName } = params
			if (!fileNo || !fileName) {
				reject('err')
				return
			}
			let reg = /(.*)\.(xls|XLS|xlsx|XLSX|doc|DOC|docx|DOCX|PPT|PPTX|ppt|pptx)$/ //office后缀正则
			let locationHref = window.location.href
			let onlinePreview = locationHref.includes('oss.longsailing.net') || locationHref.includes('81.71.10.108') //线上域名、IP检测
			let fileUrl = ''
			if (onlinePreview && reg.test(fileName)) {
				let href = `https://oss.longsailing.net/base/fileView/preview/${fileNo}/${fileName}`
				fileUrl = `http://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(href)}`
			} else {
				let nameArr = fileName.split('.')
				let name = nameArr[nameArr.length - 1]
				name = name.toLowerCase()
				fileUrl = `${window.location.origin}/base/fileView/preview/${fileNo}/${fileNo}.${name}`
			}
			resolve(fileUrl)
		})
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
			getValueByKeys(['lcl_cust_id', 'lcl_yf_cust_id'])
				.then(response => {
					const configValue = response.data.map(item => item.configValue)
					const results = configValue.includes(custid)
					resolve(results)
				})
				.catch(error => {
					reject(error)
				})
		})
	},
	getUserCompanyInfoAction({ commit }, data = {}) {
		return new Promise((resolve, reject) => {
			// 获取当前登录账号所属公司信息
			if (state.defaultSignAddress) {
				resolve(state.defaultSignAddress)
			} else {
				getUserCompanyInfo(data)
					.then(res => {
						console.log('所属公司信息', res)
						let signAddress = (res.data && res.data.signAddress) || ''
						commit('SET_USER_COMPANY_INFO', signAddress)
						resolve(signAddress)
					})
					.catch(error => {
						reject(error)
					})
			}
		})
	},
	setCustInfo({ commit }, param) {
		let { orderNo, latest } = param
		// lastst 字段代表取实时数据标识，例如：取单，放单页面
		return new Promise((resolve, reject) => {
			if (!latest && state.custInfoObj.orderNo) {
				resolve(state.custInfoObj)
			} else {
				orderCustInfo({ orderNo })
					.then(res => {
						let obj = {
							...res.data,
							custName: param.custName || '',
							bdServiceMode: param.bdServiceMode || '',
							compDeptName: param.compDeptName || '',
							isJoint: param.isJoint,
							businessType: param.businessType,
							jointCompDeptCode: param.jointCompDeptCode
						}
						console.log('客商信息：', obj)
						commit('SET_CUST_INFO', obj)
						resolve(obj)
					})
					.catch(error => {
						reject(error)
					})
			}
		})
	},
	// 获取船公司官网
	getShippingCarrierWebUrl({ state }, params) {
		// console.log(params)
		let { carrierCode } = params
		baseShipCarrierInfo({
			carrierCode
		})
			.then(res => {
				let { data } = res
				if (data && data.webUrl) {
					window.open(data.webUrl)
				} else {
					Message({
						type: 'error',
						message: '还未配置该船司官网，请联系管理员配置。'
					})
				}
			})
			.catch(err => {
				console.log('err', err)
			})
	},
	setSpeciesStr({ commit }, str) {
		if (!str || !str.trim().length) {
			commit('SET_SPECIES_STR', [])
		} else {
			commit('SET_SPECIES_STR', str.split(','))
		}
	},
	getWorkExceptionData({ commit }) {
		return new Promise((resolve, reject) => {
			if (state.workExceptionTypeObj.typeList) {
				resolve(state.workExceptionTypeObj)
			} else {
				Promise.all([getWorkExceptionTypeList({}), getWorkExceptionReasonList({})]).then(res => {
					let allTypeList = (res && res[0] && res[0].data) || []
					let typeList = getTypeTreeList(allTypeList)
					let reasonList = (res && res[1] && res[1].data) || []
					let obj = {
						allTypeList,
						typeList,
						reasonList
					}
					commit('SET_WORKEXCEPTION_DATA', obj)
					resolve(obj)
				})
			}
		})
	},
	// 获取默认快递公司
	getDefaultExpressCompany({ commit }, param = {}) {
		let { expressType } = param
		expressType = expressType || 'domestic'
		return new Promise((resolve, reject) => {
			if (state.defaultExpressObj && state.defaultExpressObj[expressType] && state.defaultExpressObj[expressType].expressSupplierId) {
				resolve(state.defaultExpressObj[expressType])
			} else {
				let data = {
					companyCode: store.state.user.compCode,
					expressType
				}
				getDefaultExpress(data).then(res => {
					let obj = {}
					if (res.data && res.data.expressSupplierId) {
						obj = {
							value: res.data.expressSupplierId,
							label: res.data.expressSupplierName,
							...res.data
						}
					}
					commit('SET_DEFAULT_EXPRESS_COMPANY', { key: expressType, value: obj })
					resolve(obj)
				})
			}
		})
	},
	// 客户copy件确认
	getCustBlcopyConfirm({ state }, params) {
		return new Promise((resolve, reject) => {
			let token = getToken()
			let data = {
				fromSystem: 'web_H5',
				toSystem: 'mng_base_server',
				reqId: randomString(),
				reqTime: parseTime(new Date().getTime()),
				data: params
			}
			axios({
				// 用axios发送post请求
				method: 'post',
				url: '/order/cust/bl/si/copy/confirm', // 请求地址
				data, // 参数
				headers: {
					Authorization: token
				}
			})
				.then(res => {
					console.log(res)
					resolve(res)
				})
				.catch(err => {
					reject(err)
					console.log(err)
				})
		})
	},
	calcShipInfoHeightSwitch({ commit }) {
		commit('SET_CALC_SHIPINFO_HEIGHT')
	}
}
function getTypeTreeList(list) {
	let targetList = []
	if (list.length) {
		let firstNodeList = []
		let secondNodeList = []
		list.forEach(item => {
			if (item.expParentId === 0) {
				firstNodeList.push({
					...item,
					label: item.expTypeName,
					value: item.expTypeCode
				})
			} else {
				secondNodeList.push({
					...item,
					label: item.expTypeName,
					value: item.expTypeCode
				})
			}
		})
		firstNodeList.forEach(item => {
			targetList.push({
				...item,
				children: secondNodeList.filter(o => item.oid === o.expParentId)
			})
		})
		return targetList
	} else {
		return []
	}
}
export default {
	namespaced: true,
	state,
	mutations,
	actions
}
