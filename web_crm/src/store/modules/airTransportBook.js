import { getDictLabel } from '@/utils/tools'
const state = {
	bookList: {
		// 默认表头
		defaultColumns: [
			'orderNo',
			'bdEmployeeId',
			'bdEmployeeName',
			'bdDeptCode',
			'bdDeptName',
			'obdEmployeeId',
			'obdEmployeeName',
			'obdDeptCode',
			'obdDeptName',
			'orderStatus',
			'bkgStatus',
			'custid',
			'custName',
			'intrustRemark',
			'auditRemark',
			'bkgRemark',
			'submitTime',
			'auditPassTime',
			'airLine',
			'polPortCode',
			'polPortName',
			// 'unloadingPortCode',
			'unloadingPortName',
			'bkgAgentSupplierId',
			'bkgAgentSupplierName',
			'etdTime',
			'airSysLineName',
			'cname',
			'ename',
			'propertyName',
			'voyagePlan',
			'transportTerm',
			'contractNo',
			'createdTime'
		],

		// 自定义表头特殊处理
		specialColumns: {
			porPortCode: ['porPortCode', 'porPortName'],
			polPortCode: ['polPortCode', 'polPortName'],
			transitPortCode: ['transitPortCode', 'transitPortName'],
			podPortCode: ['podPortCode', 'podPortName'],
			// unloadingPortCode: ['unloadingPortCode', 'unloadingPortName']
		},

		// 表头库
		columnsBase(handleBkgReqNoInfo) {
			return [
				{
					label: '工作号',
					key: 'orderNo',
					prop: 'orderNo',
					width: '150px',
					disabled: false,
					sortable: 'custom',
					fixed: true,
					type: 'text',
					formatter: (row, column) => {
						return `<el-button type="text" class="underline">${row.orderNo}</el-button>`
					},
					method: (index, row) => {
						handleBkgReqNoInfo(index, row)
					}
				},
				// { label: '销售ID', key: 'bdEmployeeId', prop: 'bdEmployeeId', width: '150px', disabled: false },
				{ label: '销售', key: 'bdEmployeeName', prop: 'bdEmployeeName', width: '150px', disabled: false },
				// { label: '销售部门编码', key: 'bdDeptCode', prop: 'bdDeptCode', width: '150px', disabled: false },
				// { label: '销售部门名称', key: 'bdDeptName', prop: 'bdDeptName', width: '150px', disabled: false },
				// { label: '销售助理ID', key: 'obdEmployeeId', prop: 'obdEmployeeId', width: '150px', disabled: false },
				{ label: '销售助理', key: 'obdEmployeeName', prop: 'obdEmployeeName', width: '150px', disabled: false },
				// { label: '销售助理部门编码', key: 'obdDeptCode', prop: 'obdDeptCode', width: '150px', disabled: false },
				// { label: '销售助理部门名称', key: 'obdDeptName', prop: 'obdDeptName', width: '150px', disabled: false },
				{
					label: '订单状态', key: 'orderStatus', prop: 'orderStatus', width: '150px', disabled: false, 
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
					width: '150px',
					disabled: false,
					formatter: (row, column) => {
						// REFUSE
						let result = getDictLabel('airBkgStatus', row.bkgStatus)
						let color = ''
						if(row.bkgStatus==='REFUSE'){
							color = 'bkgStatus-refuse'
						}
						if(row.bkgStatus==='BOOK_RELEASE'){
							color = 'bkgStatus-book_release'
						}
						if(row.bkgStatus==='BOOKED'){
							color = 'bkgStatus-complete'
						}
						return `<span class="${color}">${result}</span>`
					}
				},
				{ label: '委托单位编号', key: 'custid', prop: 'custid', width: '150px', disabled: false }, //
				{ label: '委托单位', key: 'custName', prop: 'custName', width: '150px', disabled: false },
				{ label: '委托备注', key: 'intrustRemark', prop: 'intrustRemark', width: '150px', disabled: false },
				{ label: '商务备注', key: 'auditRemark', prop: 'auditRemark', width: '150px', disabled: false },
				{ label: '订舱备注', key: 'bkgRemark', prop: 'bkgRemark', width: '150px', disabled: false },
				{ label: '提交时间', key: 'submitTime', prop: 'submitTime', width: '150px', disabled: false, sortable: 'custom' },
				{ label: '商务审核通过时间', key: 'auditPassTime', prop: 'auditPassTime', width: '150px', disabled: false, sortable: 'custom' },
				{ label: '航空公司', key: 'airLine', prop: 'airLine', width: '150px', disabled: false },
				{
					label: '起运港',
					key: 'polPortCode',
					prop: 'polPortCode',
					width: '150px',
					disabled: false,
					formatter: (row, column) => {
						return row.polPortName
					}
				},
				{
					label: '目的地',
					key: 'podPortName',
					prop: 'podPortName',
					width: '150px',
					disabled: false,
					formatter: (row, column) => {
						return row.podPortName
					}
				},
				// {
				// 	label: '卸货港',
				// 	key: 'unloadingPortCode',
				// 	prop: 'unloadingPortCode',
				// 	width: '150px',
				// 	disabled: false,
				// 	formatter: (row, column) => {
				// 		return row.unloadingPortName
				// 	}
				// },
				{
					label: '订舱代理',
					key: 'bkgAgentSupplierName',
					prop: 'bkgAgentSupplierName',
					width: '150px',
					disabled: false
				},
				{ label: '预计起飞日期', key: 'etdTime', prop: 'etdTime', width: '150px', disabled: false, sortable: 'custom' },
				{ label: '航线', key: 'airSysLineName', prop: 'airSysLineName', width: '150px', disabled: false },
				{ label: '中文品名', key: 'cname', prop: 'cname', width: '150px', disabled: false },
				{ label: '英文品名', key: 'ename', prop: 'ename', width: '150px', disabled: false },
				{label: '货物性质', key: 'propertyName', prop: 'propertyName', width: '150px', disabled: false},
				{ label: '预计航次号', key: 'voyagePlan', prop: 'voyagePlan', width: '150px', disabled: false },
				{ label: '运输条款', key: 'transportTerm', prop: 'transportTerm', width: '150px', disabled: false },
				{ label: '合约号', key: 'contractNo', prop: 'contractNo', width: '150px', disabled: false },
				{ label: '创建时间', key: 'createdTime', prop: 'createdTime', width: '150px', disabled: false },
			]
		},

		// 游离so列表表头
		freeSocolumnsBase: [
			{ label: 'so号', key: 'so', prop: 'so', width: '150px', disabled: false },
			{ label: '箱型箱量', key: 'containerInfo', prop: 'containerInfo', width: '150px', disabled: false },
			{ label: '截关日期', key: 'cutOffDate', prop: 'cutOffDate', width: '150px', disabled: false },
			{ label: '船名/航次', key: 'vesselAndVoyage', prop: 'vesselAndVoyage', width: '150px', disabled: false },
			{ label: '船公司', key: 'shipCarrierCode', prop: 'shipCarrierCode', width: '150px', disabled: false },
			{ label: '订舱代理', key: 'bkgAgentSupplierName', prop: 'bkgAgentSupplierName', width: '150px', disabled: false },
			{
				label: '驳船收货地',
				key: 'porPortCode',
				prop: 'porPortCode',
				width: '150px',
				disabled: false,
				formatter: (row, column) => {
					return row.porPortName
				}
			},
			{
				label: '大船起运港',
				key: 'polPortCode',
				prop: 'polPortCode',
				width: '150px',
				disabled: false,
				formatter: (row, column) => {
					return row.polPortName
				}
			},
			{
				label: '目的港',
				key: 'podPortCode',
				prop: 'podPortCode',
				width: '150px',
				disabled: false,
				formatter: (row, column) => {
					return row.podPortName
				}
			}
		],

		// so列表表头
		socolumnsBase: [
			{
				label: 'so号',
				key: 'so',
				prop: 'so',
				width: '150px',
				disabled: false,
				formatter: (row, column) => {
					let str = ''
					if (row.isOnlyBook === 'y') str = `<i class="icon-tip icon-change">占</i>`
					return `${str}${row.so}`
				}
			},
			{ label: '箱型箱量', key: 'containerInfo', prop: 'containerInfo', width: '150px', disabled: false },
			{ label: '截关日期', key: 'cutOffDate', prop: 'cutOffDate', width: '150px', disabled: false },
			{ label: '船名/航次', key: 'vesselAndVoyage', prop: 'vesselAndVoyage', width: '150px', disabled: false },
			{ label: '船公司', key: 'shipCarrierCode', prop: 'shipCarrierCode', width: '150px', disabled: false },
			{ label: '订舱代理', key: 'bkgAgentSupplierName', prop: 'bkgAgentSupplierName', width: '150px', disabled: false },
			{
				label: '驳船收货地',
				key: 'porPortCode',
				prop: 'porPortCode',
				width: '150px',
				disabled: false,
				formatter: (row, column) => {
					return row.porPortName
				}
			},
			{
				label: '大船起运港',
				key: 'polPortCode',
				prop: 'polPortCode',
				width: '150px',
				disabled: false,
				formatter: (row, column) => {
					return row.polPortName
				}
			},
			{
				label: '目的港',
				key: 'podPortCode',
				prop: 'podPortCode',
				width: '150px',
				disabled: false,
				formatter: (row, column) => {
					return row.podPortName
				}
			},
			{
				label: '是否绑定',
				key: 'isBindOrder',
				prop: 'isBindOrder',
				width: '150px',
				disabled: false,
				formatter: (row, column) => {
					return row.isBindOrder === 'y' ? '是' : '否'
				}
			}
			// {label: '放舱给客户', key: 'issueStatus', prop: 'issueStatus', width: '150px', disabled: false, formatter: (row, column) => {
			//   return row.issueStatus === 'y' ? '是' : row.issueStatus === 'n' ? '否' : ''
			// }},
		]
	}
}

const mutations = {}

const actions = {}

export default {
	namespaced: true,
	state,
	mutations,
	actions
}
