import { getDictLabel } from '@/utils/tools'
import { soLog } from '@/api/order/bl'
import store from '@/store'
import ColumnTip from '@/views/order/order/components/columnCopy.vue'
import CustNameShow from '@/views/order/order/components/custNameShow.vue'
const bookList = {
	defaultColumns: [
		'businessType',
		'serviceType',
		'isOnline',
		'cancelExecTime',
		'bkgReqNo',
		'orderNo',
		'jointNo',
		'custid',
		'custName',
		'so',
		'bkgStatus',
		'refuseReason',
		'refuseRemark',
		'shipCarrierCode',
		'shipRefNo',
		'shipCarrierOrderNo',
		'auditTime',
		'cyCutOff',
		'bargeCyCutOff',
		'orderStatus',
		'priceType',
		'destinationArea',
		'deliveryPlace',
		'porPortCode',
		'polPortCode',
		'podPortCode',
		'transitPortCode',
		'unloadingPortCode',
		'transportTerm',
		'payMode',
		'amountT',
		// 'bkgAmountT',
		// 'bkgContainerInfo',
		'containerInfo',
		'carrierLineName',
		'carrierService',
		'bargeVessel',
		'bargeVoyage',
		'vessel',
		'voyage',
		'bargeEtdTime',
		'etdTime',
		'contractNo',
		'bkgAgentSupplierName',
		'auditEmployeeName',
		'bkgEmployeeName',
		'priceEmployeeName',
		'launchEmployeeName',
		'reqType',
		'obdEmployeeName',
		'bdEmployeeName',
		'opEmployeeName',
		'cargoCname',
		'cargoEname',
		'createdTime',
		'sysLineCode',
		'sysLineName',
		'propertyName',
		'hscode',
		'contractCompany',
		'freetimeSys',
		'isExternal',
		'bdDeptName',
		'containerWeight',
		'auditRemark',
		'intrustRemark',
		'bkgRemark',
		'bizDate',
		'bkgBookedTime',
	],
	specialColumns: {
		porPortCode: ['porPortCode', 'porPortName'],
		polPortCode: ['polPortCode', 'polPortName'],
		transitPortCode: ['transitPortCode', 'transitPortName'],
		transitPortCode1: ['transitPortCode1', 'transitPortName1'],
		transitPortCode2: ['transitPortCode2', 'transitPortName2'],
		podPortCode: ['podPortCode', 'podPortName'],
		unloadingPortCode: ['unloadingPortCode', 'unloadingPortName']
	},
	columnsBase(handleBkgReqNoInfo, roles, type) {
		// console.log(roles, type)
		let sourceData = [
			{
				label: '申请单号',
				key: 'bkgReqNo',
				prop: 'bkgReqNo',
				sortable: 'custom',
				width: '180',
				disabled: false,
				// fixed: true,
				type: 'text',
				formatter: (row, column) => {
					let str = '',
						jointStr = ''
					if (row.reqType === 'change') str = `<i class="icon-tip icon-change">改</i>`
					if (row.reqType === 'add') str = `<i class="icon-tip icon-add">调</i>`
					// 审核人不是登录用户的显示协
					if (row.orgAuditEmployeeId && row.auditEmployeeId && row.auditEmployeeId !== store.state.user.userId) jointStr = `<i class="icon-tip icon-joint2">协</i>`
					if (state.currRole === 'bkg') jointStr = ''
					return `<el-button type="text" class="underline">${str}${jointStr}${row.bkgReqNo}</el-button>`
				},
				method: (index, row) => {
					handleBkgReqNoInfo(row)
				}
			},
			{
				label: '工作号',
				key: 'orderNo',
				prop: 'orderNo',
				sortable: 'custom',
				width: '180',
				disabled: false,
				type: 'text',
				align: 'right',
				popoverComponent: ColumnTip,
				// formatter: (row, column) => {
				// 	let str = '',
				// 		jointStr = ''
				// 	if (row.reqType === 'change') str = `<i class="icon-tip icon-change">改</i>`
				// 	if (row.reqType === 'add') str = `<i class="icon-tip icon-add">调</i>`
				// 	// 审核人不是登录用户的显示协
				// 	if (row.orgAuditEmployeeId && row.auditEmployeeId && row.auditEmployeeId !== store.state.user.userId) jointStr = `<i class="icon-tip icon-joint2">协</i>`
				// 	if (roles === 'bkg') jointStr = ''
				// 	return `<el-button type="text" class="underline">${str}${jointStr}${row.orderNo}</el-button>`
				// },
				method: row => {
					handleBkgReqNoInfo(row)
				}
			},
			{ label: '协同单号', key: 'jointNo', prop: 'jointNo', width: 130, disabled: false },
			{
				label: '业务类型',
				key: 'businessType',
				prop: 'businessType',
				disabled: false,
				width: '100',
				formatter: (row, column) => {
					return row.businessTypeCn
				}
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
			{ label: '业务日期', key: 'bizDate', prop: 'bizDate', width: 100, disabled: false, sortable: 'custom' },
			{ label: '已订舱时间', key: 'bkgBookedTime', prop: 'bkgBookedTime', width: 150, disabled: false, sortable: 'custom' },
			{ label: '取消/终止/关闭时间', key: 'cancelExecTime', prop: 'cancelExecTime', width: '150', disabled: false },
			{ label: '委托单位', key: 'custName', prop: 'custName', popoverComponent: CustNameShow, width: 180, disabled: false },
			{ label: 'SO号', key: 'so', prop: 'so', width: 150, disabled: false },
			{
				label: '订舱状态',
				key: 'bkgStatus',
				prop: 'bkgStatus',
				width: 100,
				disabled: false,
				formatter: (row, column) => {
					let result = getDictLabel('bkgStatus', row.bkgStatus)
					let { bulkRoBkgStatusObj } = store.state.order
					// console.log('bulkRoBkgStatusObj', bulkRoBkgStatusObj)
					// 散杂滚装的订舱状态特殊处理
					if (row.businessType === 'ship_bulk_ro') {
						for (var i in bulkRoBkgStatusObj) {
							if (i === row.bkgStatus) {
								result = bulkRoBkgStatusObj[row.bkgStatus]
							}
						}
					}
					return `<span class="bkgStatus-${row.bkgStatus}">${result}</span>`
				}
			},
			{
				label: '拒绝原因',
				key: 'refuseReason',
				prop: 'refuseReason',
				width: 150,
				disabled: false,
				formatter: (row, column) => {
					return getDictLabel('bkgRefuseReason', row.refuseReason)
				}
			},
			{ label: '拒绝备注', key: 'refuseRemark', prop: 'refuseRemark', width: 150, disabled: false },
			{ label: '船东参考号', key: 'shipRefNo', prop: 'shipRefNo', width: 100, disabled: false },
			{ label: '船司订单号', key: 'shipCarrierOrderNo', prop: 'shipCarrierOrderNo', width: 150, disabled: false },
			{ label: '审核时间', key: 'auditTime', prop: 'auditTime', width: '150', disabled: false, sortable: 'custom' },
			{ label: '船公司', key: 'shipCarrierCode', prop: 'shipCarrierCode', width: 100, disabled: false, sortable: 'custom' },
			{ label: '大船截关时间', key: 'cyCutOff', prop: 'cyCutOff', width: 120, disabled: false, sortable: 'custom' },
			{ label: '驳船截关时间', key: 'bargeCyCutOff', prop: 'bargeCyCutOff', width: 120, disabled: false, sortable: 'custom' },
			{
				label: '订单状态',
				key: 'orderStatus',
				prop: 'orderStatus',
				width: 100,
				disabled: type === 'occupy' ? true : false,
				formatter: (row, column) => {
					let result = getDictLabel('orderStatus', row.orderStatus)
					// // 操作中状态特殊处理
					// if (row.orderStatus === 'pass' && row.isOpHandle === 'y') {
					// 	result = '操作中'
					// }
					return result
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
			{
				label: '驳船收货地',
				key: 'porPortCode',
				prop: 'porPortCode',
				width: 120,
				disabled: false,
				formatter: (row, column) => {
					return row.porPortName
				}
			},
			{
				label: '大船起运港',
				key: 'polPortCode',
				prop: 'polPortCode',
				width: 150,
				disabled: false,
				formatter: (row, column) => {
					return row.polPortName
				}
			},
			{
				label: '目的地',
				key: 'podPortCode',
				prop: 'podPortCode',
				width: 150,
				disabled: false,
				formatter: (row, column) => {
					return row.podPortName
				}
			},
			{
				label: '中转港1',
				key: 'transitPortCode',
				prop: 'transitPortCode',
				width: 150,
				disabled: false,
				formatter: (row, column) => {
					return row.transitPortName
				}
			},
			{
				label: '中转港2',
				key: 'transitPortCode1',
				prop: 'transitPortCode1',
				width: 150,
				disabled: false,
				formatter: (row, column) => {
					return row.transitPortName1
				}
			},
			{
				label: '中转港3',
				key: 'transitPortCode2',
				prop: 'transitPortCode2',
				width: 150,
				disabled: false,
				formatter: (row, column) => {
					return row.transitPortName2
				}
			},
			{
				label: '卸货港',
				key: 'unloadingPortCode',
				prop: 'unloadingPortCode',
				width: 150,
				disabled: false,
				formatter: (row, column) => {
					return row.unloadingPortName
				}
			},
			{ label: '最终目的地', key: 'destinationArea', prop: 'destinationArea', width: '150', disabled: false },
			{ label: '交货地', key: 'deliveryPlace', prop: 'deliveryPlace', width: 120, disabled: false },
			{
				label: '运输条款',
				key: 'transportTerm',
				prop: 'transportTerm',
				width: 100,
				disabled: false,
				formatter: (row, column) => {
					return getDictLabel('shipTerms', row.transportTerm)
				}
			},
			{
				label: '付款方式',
				key: 'payMode',
				prop: 'payMode',
				width: 100,
				disabled: false,
				formatter: (row, column) => {
					return getDictLabel('payMode', row.payMode)
				}
			},
			{ label: 'T量', key: 'amountT', prop: 'amountT', width: 80, disabled: false, sortable: 'custom',
				formatter: (row, column) => {
					return state.currRole === 'bkg' ? row.bkgAmountT : row.amountT
				} 
			},
			{ label: '箱型箱量', key: 'containerInfo', prop: 'containerInfo', width: '150', disabled: false, 
				formatter: (row, column) => {
					return state.currRole === 'bkg' ? row.bkgContainerInfo : row.containerInfo
				} 
			},
			{ label: '承运人航线', key: 'carrierLineName', prop: 'carrierLineName', width: 120, disabled: false },
			{ label: '承运人航线代码', key: 'carrierService', prop: 'carrierService', width: 100, disabled: false },
			{ label: '系统航线', key: 'sysLineName', prop: 'sysLineName', disabled: false, width: 100 },
			{ label: '系统航线代码', key: 'sysLineCode', prop: 'sysLineCode', width: 100, disabled: false },
			{ label: '驳船船名', key: 'bargeVessel', prop: 'bargeVessel', width: 120, disabled: false },
			{ label: '驳船船次', key: 'bargeVoyage', prop: 'bargeVoyage', width: 120, disabled: false },
			{ label: '大船船名', key: 'vessel', prop: 'vessel', width: 120, disabled: false },
			{ label: '大船航次', key: 'voyage', prop: 'voyage', width: 120, disabled: false },
			{ label: '驳船预计开船时间', key: 'bargeEtdTime', prop: 'bargeEtdTime', width: '150', disabled: false, sortable: 'custom' },
			{ label: '大船预计开船时间', key: 'etdTime', prop: 'etdTime', width: '150', disabled: false, sortable: 'custom' },
			{ label: '合约号', key: 'contractNo', prop: 'contractNo', width: '150', disabled: false },
			{ label: '订舱代理', key: 'bkgAgentSupplierName', prop: 'bkgAgentSupplierName', width: '150', disabled: false },
			{ label: '商务', key: 'auditEmployeeName', prop: 'auditEmployeeName', width: 120, disabled: false },
			{ label: '订舱处理', key: 'bkgEmployeeName', prop: 'bkgEmployeeName', width: 120, disabled: false },
			// { label: '拿价人', key: 'priceEmployeeName', prop: 'priceEmployeeName', width: 120, disabled: false },
			{ label: '发起人', key: 'launchEmployeeName', prop: 'launchEmployeeName', width: 120, disabled: false },
			{ label: '销售助理', key: 'obdEmployeeName', prop: 'obdEmployeeName', width: 120, disabled: false },
			{ label: '原单审核人', key: 'orgAuditEmployeeName', prop: 'orgAuditEmployeeName', width: 120, disabled: false },
			{ label: '销售', key: 'bdEmployeeName', prop: 'bdEmployeeName', width: 120, disabled: false },
			{ label: '操作', key: 'opEmployeeName', prop: 'opEmployeeName', width: 120, disabled: false },
			{ label: '中文品名', key: 'cargoCname', prop: 'cargoCname', width: 120, disabled: false },
			{ label: '英文品名', key: 'cargoEname', prop: 'cargoEname', width: 120, disabled: false },
			{ label: '创建时间', key: 'createdTime', prop: 'createdTime', width: '150', disabled: false, sortable: 'custom' },
			{ label: '货物性质', key: 'propertyName', prop: 'propertyName', width: 120, disabled: false },
			{ label: 'HS CODE', key: 'hscode', prop: 'hscode', width: 120, disabled: false },
			{ label: '合约方', key: 'contractCompany', prop: 'contractCompany', width: 100, disabled: false },
			{ label: '免用免堆', key: 'freetimeSys', prop: 'freetimeSys', width: '150', disabled: false },
			{
				label: '是否外配',
				key: 'isExternal',
				prop: 'isExternal',
				width: 150,
				disabled: false,
				formatter: (row, column) => {
					let text = ''
					if (row.isExternal === 'y') {
						text = '是'
					}
					if (row.isExternal === 'n') {
						text = '否'
					}
					return text
				}
			},
			{
				label: '是否线上',
				key: 'isOnline',
				prop: 'isOnline',
				width: 150,
				disabled: false,
				formatter: (row, column) => {
					let text = ''
					if (row.isOnline === 'Y') {
						text = '是'
					}
					if (row.isOnline === 'N') {
						text = '否'
					}
					return text
				}
			},
			{ label: '销售部门', key: 'bdDeptName', prop: 'bdDeptName', width: 150, disabled: false },
			{ label: '总重', key: 'containerWeight', prop: 'containerWeight', width: 150, disabled: false },
			{ label: '审单备注', key: 'auditRemark', prop: 'auditRemark', width: 180, disabled: false },
			{ label: '委托备注', key: 'intrustRemark', prop: 'intrustRemark', width: 180, disabled: false },
			{ label: '订舱备注', key: 'bkgRemark', prop: 'bkgRemark', width: 180, disabled: false }
		]
		// let result = sourceData
		// // 占舱
		// if (type === 'occupy') {
		// 	result = sourceData
		// 		.filter(item => !['orderNo', 'jointNo', 'orderStatus', 'isExternal', 'bdDeptName', 'containerWeight'].includes(item.key))
		// 		.map(item => {
		// 			return { ...item, minWidth: item.width }
		// 		})
		// }
		// if (type === 'order') {
		// 	result = sourceData
		// 		.filter(item => !['bkgReqNo'].includes(item.key))
		// 		.map(item => {
		// 			return { ...item, minWidth: item.width }
		// 		})
		// }
		return sourceData
	}
}

const state = {
	currRole: '',
	soNo: '',
	soLogData: [],
	showLogs: false,
	// 整柜订舱列表
	bookList: {
		// 订舱列表，表头不显示申请号
		order: {
			defaultColumns: bookList.defaultColumns.filter(item => item !== 'bkgReqNo'),
			specialColumns: bookList.specialColumns,
			columnsBase: (handleBkgReqNoInfo, roles, type) => {
				return bookList
					.columnsBase(handleBkgReqNoInfo, roles, type)
					.filter(item => !['bkgReqNo'].includes(item.key))
					.map(item => {
						return { ...item, minWidth: item.width }
					})
			}
		},
		// 占舱列表，表头不显示工作号,订单状态,协同单号,是否外配，销售部门，总重等字段
		occupy: {
			defaultColumns: bookList.defaultColumns.filter(item => !['orderNo', 'jointNo', 'orderStatus', 'isExternal', 'bdDeptName', 'containerWeight', 'orgAuditEmployeeName', 'bizDate'].includes(item)),
			specialColumns: bookList.specialColumns,
			columnsBase: (handleBkgReqNoInfo, roles, type) => {
				return bookList
					.columnsBase(handleBkgReqNoInfo, roles, type)
					.filter(item => !['orderNo', 'jointNo', 'orderStatus', 'isExternal', 'bdDeptName', 'containerWeight', 'bizDate'].includes(item.key))
					.map(item => {
						return { ...item, minWidth: item.width }
					})
			}
		},
		// 默认表头
		defaultColumns: bookList.defaultColumns,
		soDefaultSoColumns: [
			'so',
			'amount',
			'orderNo',
			'bkgBeginTime',
			'bindOrderTime',
			'vessel',
			'voyage',
			'cutOffDate',
			'bdEmployeeName',
			'obdEmployeeName',
			'opEmployeeName',
			'porPortCode',
			'polPortCode',
			'podPortCode',
			'transitPortCode',
			'transitPortCode1',
			'transitPortCode2',
			'unloadingPortCode',
			'containerInfo',
			'isHeavy',
			'bkgRemark',
			'isNodrop',
			'shipCarrierCode',
			'bkgAgentSupplierName',
			'custName',
			'isCancelCust',
			'isCancel',
			'remark',
			'cancelReason',
			'cancelRemark',
			'isDrop',
			'isSoUpdate',
			'dropBdCheckStatus',
			'bkgReqNo',
			'isOnlyBook',
			'sysLineCode',
			'sysLineName',
			'bargeCutOff',
			'bargeTdTime',
			'manifestCutOff',
			'cvCutOff',
			'siCutOff',
			'etdTime',
			'earlyPickupDate',
			'latestReturnDate',
			'soFileNo',
			'soFileName',
			'isBindOrder',
			// 'log',
			'custLevel',
			'createdName'
		],

		// 自定义表头特殊处理
		specialColumns: bookList.specialColumns,

		// 表头库
		columnsBase: bookList.columnsBase(),

		// 游离so列表表头
		freeSocolumnsBase: [
			{ label: 'so号', key: 'so', prop: 'so', width: '150', disabled: false },
			{ label: '箱型箱量', key: 'containerInfo', prop: 'containerInfo', width: '150', disabled: false },
			{ label: '截关日期', key: 'cutOffDate', prop: 'cutOffDate', width: 100, disabled: false },
			{ label: '船名/航次', key: 'vesselAndVoyage', prop: 'vesselAndVoyage', width: '150', disabled: false },
			{ label: '船公司', key: 'shipCarrierCode', prop: 'shipCarrierCode', width: 100, disabled: false },
			{ label: '订舱代理', key: 'bkgAgentSupplierName', prop: 'bkgAgentSupplierName', width: '150', disabled: false },
			{
				label: '驳船收货地',
				key: 'porPortCode',
				prop: 'porPortCode',
				width: '150',
				disabled: false,
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
				label: '目的地',
				key: 'podPortCode',
				prop: 'podPortCode',
				width: '150',
				disabled: false,
				formatter: (row, column) => {
					return row.podPortName
				}
			}
			// {label: 'so编号', key: 'so', prop: 'so', width: '150', disabled: false},
			// {label: '业务来源', key: 'orderNo', prop: 'orderNo', width: '150', disabled: false},
			// {label: '订舱状态', key: 'bkgStatus', prop: 'bkgStatus', width: '150', disabled: false},
			// {label: '业务类型', key: 'businessType', prop: 'businessType', width: '150', disabled: false},
			// {label: '船公司', key: 'vessel', prop: 'vessel', width: '150', disabled: false},
			// {label: '大船起运港', key: 'polPortCode', prop: 'polPortCode', width: '150', disabled: false},
			// {label: '截关日期', key: 'cutOffDate', prop: 'cutOffDate', width: '150', disabled: false},
			// {label: '货物类型', key: 'cargoSource', prop: 'cargoSource', width: '150', disabled: false},
			// {label: '业务日期', key: 'bizDate', prop: 'bizDate', width: '150', disabled: false},
		],

		// so列表表头
		socolumnsBase: [
			{ label: '工作号', key: 'orderNo', prop: 'orderNo', width: 150 },
			{ label: 'T量', key: 'amount', prop: 'amount', width: 150 },
			{
				label: 'SO号',
				fixed: 'left',
				align: 'left',
				key: 'so',
				prop: 'so',
				width: 150,
				disabled: false,
				formatter: (row, column) => {
					let str = ''
					let dropStr = ''
					if (row.isOnlyBook === 'y' && row.isBindOrder != 'y') str = `<i class="icon-tip icon-change">占</i>`
					if (row.isDrop === 'Y') dropStr = `<i class="icon-tip icon-drop">甩</i>`
					if (row.dropBdCheckStatus === 'DISAGREE') dropStr = `<i class="icon-tip icon-refuse">不</i>`
					return `${str}${dropStr}${row.so}`
				}
			},
			{ label: '订舱时间', key: 'bkgBeginTime', prop: 'bkgBeginTime', width: 150, sortable: 'custom' },
			{ label: '放舱时间', key: 'bindOrderTime', prop: 'bindOrderTime', width: 150, sortable: 'custom' },
			{ label: '大船船名', key: 'vessel', prop: 'vessel', width: 120, sortable: 'custom' },
			{ label: '大船航次', key: 'voyage', prop: 'voyage', width: 120, sortable: 'custom' },
			{ label: '大船截关时间', key: 'cutOffDate', prop: 'cutOffDate', width: 100, sortable: 'custom' },
			{ label: '销售', key: 'bdEmployeeName', prop: 'bdEmployeeName', width: 120 },
			{ label: '销售助理', key: 'obdEmployeeName', prop: 'obdEmployeeName', width: 120 },
			{ label: '操作', key: 'opEmployeeName', prop: 'opEmployeeName', width: 120 },
			{
				label: '驳船收货地',
				key: 'porPortCode',
				prop: 'porPortCode',
				width: 150,
				formatter: (row, column) => {
					return row.porPortName
				}
			},
			{
				label: '大船起运港',
				key: 'polPortCode',
				prop: 'polPortCode',
				width: 150,
				formatter: (row, column) => {
					return row.polPortName
				}
			},
			{
				label: '目的地',
				key: 'podPortCode',
				prop: 'podPortCode',
				width: 150,
				formatter: (row, column) => {
					return row.podPortName
				}
			},
			{
				label: '中转港',
				key: 'transitPortCode',
				prop: 'transitPortCode',
				width: 150,
				formatter: (row, column) => {
					return row.transitPortName
				}
			},
			{
				label: '卸货港',
				key: 'unloadingPortCode',
				prop: 'unloadingPortCode',
				width: 150,
				formatter: (row, column) => {
					return row.unloadingPortName
				}
			},
			{ label: '箱型箱量', key: 'containerInfo', prop: 'containerInfo', width: 150 },
			{
				label: '是否重柜',
				key: 'isHeavy',
				prop: 'isHeavy',
				width: 80,
				formatter: (row, column) => {
					return row.isHeavy === 'y' ? '是' : row.isHeavy === 'n' ? '否' : ''
				}
			},
			{ label: '订舱备注', key: 'bkgRemark', prop: 'bkgRemark', width: 150 },
			{
				label: '是否申请不甩柜',
				key: 'isNodrop',
				prop: 'isNodrop',
				width: 110,
				formatter: (row, column) => {
					return row.isNodrop === 'y' ? '是' : row.isNodrop === 'n' ? '否' : ''
				}
			},
			{ label: '船公司', key: 'shipCarrierCode', prop: 'shipCarrierCode', width: 80 },
			{ label: '订舱代理', key: 'bkgAgentSupplierName', prop: 'bkgAgentSupplierName', width: '150' },
			{ label: '委托单位', key: 'custName', prop: 'custName', popoverComponent: CustNameShow, width: '150' },
			{
				label: '客户取消',
				key: 'isCancelCust',
				prop: 'isCancelCust',
				width: 80,
				formatter: (row, column) => {
					return row.isCancelCust === 'y' ? '是' : row.isCancelCust === 'n' ? '否' : ''
				}
			},
			{
				label: '船东取消',
				key: 'isCancel',
				prop: 'isCancel',
				width: 80,
				formatter: (row, column) => {
					return row.isCancel === 'y' ? '是' : row.isCancel === 'n' ? '否' : ''
				}
			},
			{ label: 'SO备注', key: 'remark', prop: 'remark', width: 150 },
			{ label: '取消原因', key: 'cancelReason', prop: 'cancelReason', width: 150 },
			{ label: '取消备注', key: 'cancelRemark', prop: 'cancelRemark', width: 150 },
			{
				label: '是否被甩',
				key: 'isDrop',
				prop: 'isDrop',
				width: 100,
				formatter: (row, column) => {
					return row.isDrop.toLocaleLowerCase() === 'y' ? '是' : row.isDrop.toLocaleLowerCase() === 'n' ? '否' : ''
				}
			},
			{
				label: '是否更新',
				key: 'isSoUpdate',
				prop: 'isSoUpdate',
				width: 100,
				formatter: (row, column) => {
					return row.isSoUpdate.toLocaleLowerCase() === 'y' ? '是' : row.isSoUpdate.toLocaleLowerCase() === 'n' ? '否' : ''
				}
			},
			{
				label: '甩柜BD审核状态',
				key: 'dropBdCheckStatus',
				prop: 'dropBdCheckStatus',
				width: 100,
				formatter: (row, column) => {
					return getDictLabel('dropBdCheckStatus', row.dropBdCheckStatus)
				}
			},
			{ label: '订舱编号', key: 'bkgReqNo', prop: 'bkgReqNo', width: 150 },
			{
				label: '是否占舱',
				key: 'isOnlyBook',
				prop: 'isOnlyBook',
				width: 100,
				formatter: (row, column) => {
					return row.isOnlyBook === 'y' ? '是' : row.isOnlyBook === 'n' ? '否' : ''
				}
			},
			{ label: '航线代码', key: 'sysLineCode', prop: 'sysLineCode', width: 100 },
			{ label: '系统航线', key: 'sysLineName', prop: 'sysLineName', width: 100 },
			// { label: '解析状态', key: 'parseStatus', prop: 'parseStatus', width: 120},
			{ label: '驳船截关时间', key: 'bargeCutOff', prop: 'bargeCutOff', width: 150, sortable: 'custom' },
			{ label: '驳船开船时间', key: 'bargeTdTime', prop: 'bargeTdTime', width: 150, sortable: 'custom' },
			{ label: '截舱单时间', key: 'manifestCutOff', prop: 'manifestCutOff', width: 150, sortable: 'custom' },
			{ label: '截港时间', key: 'cvCutOff', prop: 'cvCutOff', width: 150, sortable: 'custom' },
			{ label: '截单时间', key: 'siCutOff', prop: 'siCutOff', width: 150, sortable: 'custom' },
			{ label: '预计开船时间', key: 'etdTime', prop: 'etdTime', width: 120, sortable: 'custom' },
			{ label: '最早提柜时间', key: 'earlyPickupDate', prop: 'earlyPickupDate', width: 120, sortable: 'custom' },
			{ label: '柜号', key: 'cn', prop: 'cn', width: 150 },
			{
				label: '做柜状态',
				key: 'cnState',
				prop: 'cnState',
				width: 100,
				formatter: (row, column) => {
					let obj = {
						'nocn': '未做柜',
						'partcn': '部分做柜',
						'allcn': '已做柜'
					}
					return obj[row.cnState] || ''
				}
			},
			{
				label: '查做柜状态',
				key: 'cnReplyState',
				prop: 'cnReplyState',
				width: 100,
				formatter: (row, column) => {
					let obj = {
						'unsend': '未发起',
						'unreply': '待回复',
						'replied': '已回复'
					}
					return obj[row.cnReplyState] || ''
				}
			},
			{ label: '做柜备注', key: 'cnRemark', prop: 'cnRemark', width: 150 },
			{ label: '预计提柜时间', key: 'takePreTime', prop: 'takePreTime', width: 120, },
			{ label: '最晚还柜时间', key: 'latestReturnDate', prop: 'latestReturnDate', width: 120, sortable: 'custom' },
			{ label: 'SO附件编号', key: 'soFileNo', prop: 'soFileNo', width: 150 },
			{
				label: 'SO附件名称',
				key: 'soFileName',
				prop: 'soFileName',
				width: 150,
				formatter: (row, column) => {
					return `<el-button type="text" class="underline">${row.soFileName}</el-button>`
				},
				method: (index, row) => {
					handleView(row)
				}
			},
			{
				label: '是否绑定订单',
				key: 'isBindOrder',
				prop: 'isBindOrder',
				width: 100,
				formatter: (row, column) => {
					return row.isBindOrder === 'y' ? '是' : row.isBindOrder === 'n' ? '否' : ''
				}
			},
			{ label: '客户等级', key: 'custLevel', prop: 'custLevel', width: 120, sortable: 'custom' },
			{ label: '订舱人', key: 'createdName', prop: 'createdName', width: 120, sortable: 'custom' }
			// { label: '是否甩柜', key: 'isThrowOff', prop: 'isThrowOff', width: 100, formatter: (row, column) => {	return row.isThrowOff === 'y' ? '是' : row.isThrowOff === 'n' ? '否' : ''}},
			// {
			// 	label: '日志',
			// 	key: 'log',
			// 	prop: 'log',
			// 	disabled: false,
			// 	width: 80,
			// 	formatter: (row, column) => {
			// 		return `<el-button type="text" class="underline">查看</el-button>`
			// 	},
			// 	method: (index, row) => {
			// 		getLogList(row)
			// 	}
			// }
		].map(item => {
			return { ...item, minWidth: item.width }
		})
	},
	bookInfo: {}
}
let getLogList = row => {
	soLog({ so: row.so }).then(res => {
		state.soLogData = res.data
		state.soNo = row.so
	})
	state.showLogs = true
}
let handleView = row => {
	store.dispatch('order/previewFile', { fileNo: row.soFileNo, fileName: row.soFileName })
}
const mutations = {
	setShowLogs(state, payload) {
		state.showLogs = payload
	},
	setSoLogData(state, payload) {
		state.soLogData = payload
	},
	setSoNo(state, payload) {
		state.soNo = payload
	},
	setBookInfo(state, payload) {
		state.bookInfo = payload
	},
	setBookRole(state, payload) {
		state.currRole = payload
	}
}

const actions = {
	setBookInfo(context, params) {
		context.commit('setBookInfo', params)
	},
	// 设置角色
	setBookRole(context, params) {
		context.commit('setBookRole', params)
	}
}

export default {
	namespaced: true,
	state,
	mutations,
	actions
}
