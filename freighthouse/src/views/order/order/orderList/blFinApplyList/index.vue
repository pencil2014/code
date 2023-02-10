<template>
	<div class="">
		<div class="search-container">
			<Search :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery" :searchFiledGroup="searchInputGroup" :filterGroups="filterGroups">
				<AddFilter
					:searchInputGroup="searchInputGroup"
					:allFilterGroups="allFilterGroups"
					:filterGroups="filterGroups"
					:defaultSearchLength="defaultSearchLength"
					:callback="searchCallBack"
					:index="index"
					:item="item"
					v-for="(item, index) in searchInputGroup"
					:key="'filter' + index"
				/>
				<div class="btn-plus-search" @click="handleAddFilter"></div>
			</Search>
		</div>
		<div class="table-container">
			<TableFilter :config="tableConfig" :tableQuery.sync="tableQuery" :callback="tableCallBack" />
			<BaseTableMuti v-loading="loading" :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
		</div>
		<!-- 自定义表头 -->
		<div v-if="customColumnsPopShow">
			<CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
		</div>
		<div v-if="applyShow">
			<Apply :param="applyQuery" @close="applyPopClose" />
		</div>
		<div v-if="soPopShow">
			<SoPop :soListQuery="soListQuery" @close="soPopClose" />
		</div>
		<!-- 日志弹窗 -->
		<div v-if="blLogPopShow">
			<BlLog :params="logParams" @close="blLogPopClose" />
		</div>
		<div v-if="workFlowPopShow">
			<WorkFlowPop :workFlowPopQuery="workFlowPopQuery" @close="workFlowPopClose" />
		</div>
		<!-- 委托单位信控信息 -->
		<div v-if="custNameCrShow">
			<CustNameCr :title="custPopTitle" :custQuery="custQuery" @close="custNameCrPopClose" />
		</div>
		<!-- 附件列表 -->
		<div v-if="blFileListShow">
			<BlFileList @close="blFileListShow = false" :param="listItemQuery" />
		</div>
	</div>
</template>
<script>
import Vue from 'vue'
import store from '@/store'
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './components/tableFilter'
import Apply from './components/apply'
// 弹出框
import SoPop from '../components/soPop'
import BaseDialog from '@/components/Base/Dialog/index'
import CustomColumns from '@/components/customColumns/index'
import { baseBusinessList, searchConditionInfo, searchConditionSave, searchConditionDelete, columnWidthConfigInfo, columnWidthConfigSave, baseEmployeeListName, finApplyEmployeeList, companyPageList } from '@/api/base'
import { blFinList, blFinExport, blFinApply, blFinApplyCancelBatch, checkCanApplyPut, checkCanBatchApply, finSpecialCreate } from '@/api/order/bl'
import { customerListAllStatus, customerSettlementList } from '@/api/crm/supplier'
import { departmentTreeList } from '@/api/companyResource'
import { getParamMethod } from '@/utils/allKindNumber'
import BlLog from './components/blLog'
import WorkFlowPop from './components/workFlowPop'
import CustNameCr from './components/custNameCr'
import { contractTitleSave } from '@/api/order/contract'
import BlFileList from '@/views/order/order/orderList/blFinApplyList/components/blFileList'

const defaultPage = {
	pageSize: -1,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: ['etdTime', 'td_time', 'oid'],
	descColumns: [],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
	auditStatus: 'all', // 补料状态，默认展示未审核
	scenesCode: 'BlFinApplyList'
}
const defaultSearchInputGroup = [
	{
		key: 'universalNo',
		value: '',
		placeholder: '编号类型',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'bizDate',
		value: '',
		placeholder: '时间类型',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'blType',
		value: '',
		placeholder: '筛选类型',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'mainCustId',
		value: '',
		placeholder: '委托单位',
		category: 'all',
		queryValue: ''
	}
]
const confirmOptions = [
	{ label: '是', value: 'y' },
	{ label: '否', value: 'n' }
]
const takeStatusOptions = [
	{ label: '未取单', value: 'init' },
	{ label: '已取单', value: 'finish' }
]
const isAgreeReleaseOptions = [
	{ label: '未同意', value: 'n' },
	{ label: '已同意', value: 'y' },
	{ label: '未同意(已特殊审批)', value: 'ns' },
	{ label: '已同意(已特殊审批)', value: 'ys' }
]
export default {
	mixins: [routerMixin],
	data() {
		return {
			listItemQuery: {},
			blFileListShow: false,
			loading: false,
			blLogPopShow: false,
			logParams: {},
			departmentList: [],
			state: '',
			showVal: null,
			defaultStyle: {
				width: '100%'
			},
			serviceTypeOptions: {},
			orderNo: '',
			// searchConditionList: [], // 自定义搜索模板集合
			defaultSearchLength: 0, // 默认显示搜索框的个数
			// numbers: ['universalNo', 'orderNo', 'blNo', 'soInfo', 'pledgeBlNo', 'pledgeOrderNo', 'pledgeSource'], // 各类编号：工作号,提单号
			// times: ['bizDate', 'etaTime', 'taTime', 'etdTime', 'tdTime', 'auditTime', 'applyTime'], // 预计开船时间,实际开船时间,预计到港时间
			// categorys: [
			// 	'custSettleUnit',
			// 	'businessType',
			// 	'bkgAgentSupplierId',
			// 	'blType',
			// 	'blMode',
			// 	'isPledge',
			// 	// 'custType',
			// 	'custSettleType',
			// 	'applyType',
			// 	'auditStatus',
			// 	'receiveFeeCleanStatus',
			// 	'payFeeCleanStatus',
			// 	'isContainerReturn',
			// 	'bdEmployeeId',
			// 	'applyEmployeeId',
			// 	'bdDeptCode',
			// 	'obdDeptCode',
			// 	'obdEmployeeId',
			// 	'mainCustId',
			// 	'compDeptName',
			// 	'jointCompDeptName',
			// 	'blTakeStatus',
			// 	'transferStatus',
			// 	'placeCompCode'
			// ], // 筛选类型：出单方式
			allFilterGroups: {
				// categorys: {},
				// numbers: {},
				// times: {},
				all: this.filterGroups
			},
			// 查询条件下拉选项

			filterGroups: {
				universalNo: {
					key: 'universalNo',
					label: '各类编号',
					type: 'input',
					searchType: 'eq',
					value: ''
				},
				orderNo: {
					key: 'orderNo',
					label: '工作号',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				soInfo: {
					key: 'soInfo',
					label: 'SO/PO号',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				tAmount: {
					key: 'tAmount',
					label: 'T量',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				pledgeBlNo: {
					key: 'pledgeBlNo',
					label: '押单提单号',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				pledgeOrderNo: {
					key: 'pledgeOrderNo',
					label: '押单工作号',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				// bdDeptName: { key: 'bdDeptName', label: '销售部门', type: 'input', searchType: 'like', value: '' },
				bdDeptCode: {
					specialProp: 'deptCode',
					label: '销售部门',
					key: 'bdDeptCode',
					type: 'cascader',
					searchType: 'in',
					cascaderList: [],
					saveList: [],
					cascaderProps: {
						children: 'childList',
						label: 'deptCname',
						value: 'deptCode',
						checkStrictly: false,
						multiple: true
					}
				},
				obdDeptCode: {
					specialProp: 'deptCode',
					label: '销售助理部门',
					key: 'obdDeptCode',
					type: 'cascader',
					searchType: 'in',
					cascaderList: [],
					saveList: [],
					cascaderProps: {
						children: 'childList',
						label: 'deptCname',
						value: 'deptCode',
						checkStrictly: true,
						checkStrictly: false,
						multiple: true
					}
				},
				// orgDeptCode: {
				// 	label: '协同部门',
				// 	key: 'orgDeptCode',
				// 	type: 'cascader',
				// 	searchType: 'eq',
				// 	cascaderList: [],
				// 	saveList: [],
				// 	cascaderProps: {
				// 		children: 'childList',
				// 		label: 'deptCname',
				// 		value: 'deptCode',
				// 		checkStrictly: true
				// 	}
				// },
				// jointDeptCode: {
				// 	label: '被协同部门',
				// 	key: 'jointDeptCode',
				// 	type: 'cascader',
				// 	searchType: 'eq',
				// 	cascaderList: [],
				// 	saveList: [],
				// 	cascaderProps: {
				// 		children: 'childList',
				// 		label: 'deptCname',
				// 		value: 'deptCode',
				// 		checkStrictly: true
				// 	}
				// },
				orgDeptName: {
					key: 'orgDeptName',
					label: '协同部门',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				jointDeptName: {
					key: 'jointDeptName',
					label: '被协同部门',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				// obdDeptName: { key: 'obdDeptName', label: '销售助理部门', type: 'input', searchType: 'like', value: '' },
				pledgeSource: { label: '被押工作号', key: 'pledgeSource', type: 'input', searchType: 'like', value: '' },
				blType: {
					label: '提单类型',
					key: 'blType',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [],
					nonDictionary: true
				},
				applyEmployeeId: {
					key: 'applyEmployeeId',
					label: '申请人',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getApplyEmployeeName('', item)
					},
					filterMehod: (val, item) => {
						this.getApplyEmployeeName(val, item)
					}
				},
				bdEmployeeName: {
					key: 'bdEmployeeName',
					label: '销售',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					'allow-create': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'bd')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'bd')
					}
				},
				obdEmployeeName: {
					key: 'obdEmployeeName',
					label: '销售助理',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					'allow-create': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'obd')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'obd')
					}
				},
				asstEmployeeName: {
					key: 'asstEmployeeName',
					label: '下单助理',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					'allow-create': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'asst')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'asst')
					}
				},
				businessType: {
					label: '业务类型',
					key: 'businessType',
					propInDict: 'businessType',
					type: 'select',
					searchType: 'in',
					multiple: true,
					data: [],
					saveList: [],
					'collapse-tags': true,
					queryValue: '',
					value: '',
					nonDictionary: true
				},

				blMode: {
					label: '出单方式',
					key: 'blMode',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [],
					nonDictionary: true
				},
				blNo: {
					key: 'blNo',
					label: '提单号',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				blTakeStatus: { label: '正本取单状态', key: 'blTakeStatus', type: 'select', searchType: 'eq', value: '', data: takeStatusOptions, nonDictionary: true },
				isPledge: {
					label: '是否被押',
					key: 'isPledge',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: confirmOptions,
					nonDictionary: true
				},
				bizDate: {
					label: '业务日期',
					key: 'bizDate',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
				etaTime: {
					label: '预计到达时间',
					key: 'etaTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
				taTime: {
					label: '实际到达时间',
					key: 'taTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
				etdTime: {
					label: '预计出发时间',
					key: 'etdTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
				tdTime: {
					label: '实际出发时间',
					key: 'tdTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
				auditTime: {
					label: '财务审核时间',
					key: 'auditTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
				applyTime: {
					label: '申请时间',
					key: 'applyTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
				applyType: {
					label: '申请原因',
					key: 'applyType',
					type: 'select',
					searchType: 'eq',
					value: '',
					// data: store.state.dict.dictMap.blFinApplyType,
					data: [],
					propInDict: 'customBlFinApplyType',
					nonDictionary: true
				},
				// cancelTime: {label: '撤回时间', key: 'cancelTime', type: 'date', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd'},
				// custType: { key: 'custType', label: '客户类型', type: 'select', searchType: 'eq', value: '', data: store.state.order.custType, nonDictionary: true },
				mainCustId: {
					key: 'mainCustId',
					label: '委托单位',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						this.getCustList('', item)
					},
					filterMehod: (val, item) => {
						this.getCustList(val, item)
					}
				},
				custSettleUnit: {
					key: 'custSettleUnit',
					label: '结算单位',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						this.getSettleList('', item)
					},
					filterMehod: (val, item) => {
						this.getSettleList(val, item)
					}
				},
				// custSettleType: {
				// 	label: '委托单位结算方式',
				// 	key: 'custSettleType',
				// 	type: 'select',
				// 	searchType: 'eq',
				// 	value: '',
				// 	data: [],
				// 	propInDict: 'settleCycle',
				// 	nonDictionary: true
				// },
				// custSettlePeriod: {
				// 	label: '委托单位账期',
				// 	key: 'custSettlePeriod',
				// 	type: 'input',
				// 	searchType: 'like',
				// 	value: ''
				// },
				// custSettleUnit: { label: '结算单位', key: 'custSettleUnit', type: 'input', searchType: 'like', value: '' },
				shipCarrierCode: {
					key: 'shipCarrierCode',
					label: '船公司',
					type: 'autocomplete',
					searchType: 'like',
					value: '',
					queryValue: '',
					querySearch: (queryString, cb) => {
						this.$store
							.dispatch('dict/baseShippingCarrierList', {
								name: queryString,
								state: 'valid'
							})
							.then(data => {
								cb(data)
							})
					},
					select: (value, item) => {
						Object.assign(item, {
							queryValue: value.key
						})
					},
					change: (value, item) => {
						Object.assign(item, {
							queryValue: value
						})
					},
					clear: (value, item) => {
						Object.assign(item, {
							queryValue: ''
						})
					}
				},

				bkgAgentSupplierId: {
					key: 'bkgAgentSupplierId',
					label: '订舱代理',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						this.getSupplierList('bkg_agent', '', item)
					},
					filterMehod: (val, item) => {
						this.getSupplierList('bkg_agent', val, item)
					}
				},
				auditEmployeeName: {
					label: '财务审核人',
					key: 'auditEmployeeName',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				auditStatus: { key: 'auditStatus', label: '财务审核状态', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true, propInDict: 'blFinAuditStatus' },
				receiveFeeCleanStatus: {
					key: 'receiveFeeCleanStatus',
					label: '应收费用结清状态',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: store.state.dict.dictMap.feeSettleStatus,
					nonDictionary: true
				},
				payFeeCleanStatus: {
					key: 'payFeeCleanStatus',
					label: '应付费用结清状态',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: store.state.dict.dictMap.feeSettleStatus,
					nonDictionary: true
				},
				isContainerReturn: {
					key: 'isContainerReturn',
					label: '目的港是否还柜',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: store.state.order.blFinList.isContainerReturnOptions,
					nonDictionary: true
				},
				lastDay: {
					label: '即将到港天数',
					key: 'lastDay',
					type: 'input',
					searchType: 'eq',
					value: ''
				},
				wfAuditEmployeeNames: {
					label: '特殊审批参与人',
					key: 'wfAuditEmployeeNames',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				sysLineCode: {
					key: 'sysLineCode',
					label: '小航线',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						if (val) {
							this.sysLineQuerySearch('', item)
						}
					},
					filterMehod: (val, item) => {
						this.sysLineQuerySearch(val, item)
					}
				},
				blStatus: {
					key: 'blStatus',
					label: '提单状态',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [],
					nonDictionary: true,
					propInDict: 'woBlStatus'
				},
				orderStatus: {
					label: '订单状态',
					key: 'orderStatus',
					type: 'select',
					searchType: 'in',
					value: '',
					data: [],
					multiple: true,
					saveList: [],
					'collapse-tags': true,
					queryValue: '',
					nonDictionary: true
					// propInDict: 'orderStatus'
				},
				transferStatus: {
					label: '提单转移状态',
					key: 'transferStatus',
					type: 'select',
					searchType: 'in',
					value: '',
					data: [],
					multiple: true,
					'collapse-tags': true,
					nonDictionary: true,
					propInDict: 'blTransferStatus'
				},
				placeCompCode: {
					key: 'placeCompCode',
					label: '提单所在地',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						if (val) this.getCompanyList('', item)
					},
					filterMehod: (val, item) => {
						this.getCompanyList(val, item)
					}
				},
				compDeptCode: {
					key: 'compDeptCode',
					label: '主单分公司',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						if (val) this.getCompanyList('', item)
					},
					filterMehod: (val, item) => {
						this.getCompanyList(val, item)
					}
				},
				jointCompDeptCode: {
					key: 'jointCompDeptCode',
					label: '协同单分公司',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						if (val) this.getCompanyList('', item)
					},
					filterMehod: (val, item) => {
						this.getCompanyList(val, item)
					}
				},
				isAgreeRelease: { label: '客户是否同意放货', key: 'isAgreeRelease', type: 'select', searchType: 'eq', value: '', data: isAgreeReleaseOptions, nonDictionary: true }
			},
			// 默认展示的搜索条件，搜索条件分类
			searchInputGroup: JSON.parse(JSON.stringify(defaultSearchInputGroup)),
			tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
			searchConfig: [],
			// table复选框多选的值
			selectedCheckbox: [],
			// table基础组件
			tableConfig: {
				style: {},
				tableIndex: {
					show: false
				},
				options: {
					// 是否支持解锁列表修改,默认锁定列表不可更改
					lockState: true,
					// 是否支持列表项选中功能
					mutiSelect: true,
					// 多选框状态判断 {false不可选, true可选}
					checkSelectable({ oid }) {
						return oid ? true : false
					}
				},
				customColumns: {
					show: true,
					handleCustomColumns: this.handleCustomColumns
				},
				defaultEmpty: true, // 数据默认不加载的显示文案
				list: [],
				configColumns: store.state.order.blFinList.defaultColumns,
				columns: [],
				allColumns: store.state.order.blFinApplyList.columnsBase(this.handleViewSo, this.handleViewCustName, this.handleViewCustSettleUnit, this.handleOrderNo, this.handleToOrderFee, this.handleViewWorkFlowActList, this.handleViewFileList),
				// 操作按钮组
				operationBtns: {
					minWidth: '60',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						// if (action === 'Apply') {
						// 	this.handleApply(row)
						// }
						// if (action === 'Recall') {
						// 	this.handleRecall(row)
						// }
						if (action === 'Log') {
							this.handleViewLog(row)
						}
					},
					data: [
						{
							label: '日志',
							type: 'text',
							show: (item, row) => {
								return true
							},
							action: 'Log'
						}
						// {
						// 	label: '撤回',
						// 	type: 'text',
						// 	show: (item, row) => {
						// 		if (row.auditStatus === 'submit' && row.state === 'valid') {
						// 			return true
						// 		} else {
						// 			return false
						// 		}
						// 	},
						// 	action: 'Recall'
						// },
						// {
						// 	label: '放单申请',
						// 	type: 'text',
						// 	// disabled: (item, row) => {
						// 	// 	return row.isPledge === 'y'
						// 	// },
						// 	show: (item, row) => {
						// 		if ((row.auditStatus === 'init' || row.auditStatus === 'refuse') && row.state === 'valid') {
						// 			return true
						// 		} else {
						// 			return false
						// 		}
						// 	},
						// 	action: 'Apply'
						// }
					]
				},
				// 操作提示
				tips: {
					text: '',
					show: false
				},
				// 分页
				pagination: {
					show: true,
					total: 0,
					hasNextPage: false,
					hasPreviousPage: false,
					isFirstPage: false,
					isLastPage: false,
					pageSizeOptions: [
						{
							value: 10,
							label: '10条/页'
						},
						{
							value: 15,
							label: '15条/页'
						},
						{
							value: 20,
							label: '20条/页'
						},
						{
							value: 30,
							label: '30条/页'
						},
						{
							value: 50,
							label: '50条/页'
						},
						{
							value: 100,
							label: '100条/页'
						}
					]
				}
			},
			tableColumnsWidthList: [],
			// 显示自定义表头的弹窗状态
			customColumnsPopShow: false,
			// 点击的是补料列表里的详情
			isClickInfo: false,
			applyShow: false,
			applyQuery: {},
			soPopShow: false, // so弹窗
			soListQuery: {},
			resDefaConfList: [], // 后端配置的默认搜索模板
			oldParams: {},
			workFlowPopQuery: {},
			workFlowPopShow: false,
			custNameCrShow: false,
			custQuery: {},
			custPopTitle: ''
		}
	},
	activated() {
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
	},
	deactivated() {
		window.removeEventListener('keydown', this.handleKeyDown)
	},
	created() {
		this.getDeptList()
		this.$set(this.filterGroups, 'bdDeptCode', {
			specialProp: 'deptCode',
			label: '销售部门',
			key: 'bdDeptCode',
			type: 'cascader',
			searchType: 'in',
			cascaderList: this.departmentList,
			saveList: [],
			cascaderProps: {
				children: 'childList',
				label: 'deptCname',
				value: 'deptCode',
				checkStrictly: false,
				multiple: true
			}
		})
		this.$set(this.filterGroups, 'obdDeptCode', {
			specialProp: 'deptCode',
			label: '销售助理部门',
			key: 'obdDeptCode',
			type: 'cascader',
			searchType: 'in',
			cascaderList: this.departmentList,
			saveList: [],
			cascaderProps: {
				children: 'childList',
				label: 'deptCname',
				value: 'deptCode',
				checkStrictly: true,
				checkStrictly: false,
				multiple: true
			}
		})
		// this.$set(this.filterGroups, 'orgDeptCode', {
		// 	label: '协同部门',
		// 	key: 'orgDeptCode',
		// 	type: 'cascader',
		// 	searchType: 'eq',
		// 	cascaderList: this.departmentList,
		// 	saveList: [],
		// 	cascaderProps: {
		// 		children: 'childList',
		// 		label: 'deptCname',
		// 		value: 'deptCode',
		// 		checkStrictly: true
		// 	}
		// })
		// this.$set(this.filterGroups, 'jointDeptCode', {
		// 	label: '被协同部门',
		// 	key: 'jointDeptCode',
		// 	type: 'cascader',
		// 	searchType: 'eq',
		// 	cascaderList: this.departmentList,
		// 	saveList: [],
		// 	cascaderProps: {
		// 		children: 'childList',
		// 		label: 'deptCname',
		// 		value: 'deptCode',
		// 		checkStrictly: true
		// 	}
		// })
		this.init()
		// // 保存url中的orderNo
		// let queryOrderNo = this.$route.query.orderNo || ''
		// sessionStorage.setItem('queryOrderNo', queryOrderNo)
		// // 有orderNo 请求列表接口
		// queryOrderNo && this.getList()
		// // this.getSearchConditionInfo()

		console.log('🚀 ~ this.dictMap', this.dictMap)
	},
	mounted() {
		console.log('🚀 ~ this.columnsBase', this.columnsBase)
	},

	computed: {
		...mapState({
			currRole: state => state.order.currRole,
			dictMap: state => state.dict.dictMap,
			blFinList: state => state.order.blFinList,
			defaultColumns: state => state.order.blFinList.defaultColumns,
			specialColumns: state => state.order.blFinList.specialColumns,
			columnsBase: state => state.order.blFinApplyList.columnsBase()
		})
	},
	watch: {},
	components: {
		Search,
		AddFilter,
		BaseTableMuti,
		TableFilter,
		BaseDialog,
		CustomColumns,
		Apply,
		SoPop,
		BlLog,
		WorkFlowPop,
		CustNameCr,
		BlFileList
	},
	methods: {
		// 查看附件弹窗
		handleViewFileList(index, row) {
			console.log('🚀 ~ row', row)
			this.blFileListShow = true
			this.listItemQuery = {
				fileNo: row.fileNo,
				blNo: row.blNo
			}
		},

		refresh() {
			this.getList()
		},
		// 分公司下拉
		getCompanyList(val, item) {
			let data = {
				query: [
					{ column: 'companyName', type: 'like', value: val },
					{ column: 'state', type: 'eq', value: 'valid' }
				],
				pageSize: 1000
			}
			companyPageList(data).then(res => {
				let filterArr = res.data.list.filter(ele => !item.saveList.find(o => o.value === ele.companyCode))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: ele.name, value: ele.companyCode || '' }
				})
				item.data = [...item.saveList, ...itemList]
			})
		},
		// 获取放单申请人
		getApplyEmployeeName(val, item) {
			let data = val ? val.replace(/^\s+|\s+$/g, '') : ''
			finApplyEmployeeList(data).then(res => {
				// 单选下拉不保存选择后的数据
				if (!item.multiple) item.saveList = []
				let filterArr = res.data.filter(ele => !item.saveList.find(o => o.value === ele.code))
				let itemList = filterArr.map(ele => {
					return {
						...ele,
						label: ele.name,
						value: ele.code ? ele.code : ''
					}
				})
				item.data = [...item.saveList, ...itemList]
			})
		},
		// 系统航线下拉列表自动补充的数据
		sysLineQuerySearch(queryString, item) {
			this.$store.dispatch('dict/baseSystemLineList', { name: queryString, state: '' }).then(data => {
				this.searchSelectVisibleData(data, item)
			})
		},
		// 搜索条件el-select下拉数据处理
		searchSelectVisibleData(data, item) {
			// 单选下拉不保存选择后的数据
			if (!item.multiple) item.saveList = []
			let filterArr = data.filter(ele => !item.saveList.find(o => o.value === ele.key))
			let itemList = filterArr.map(ele => {
				return { ...ele, label: ele.value, value: ele.key }
			})
			item.data = [...item.saveList, ...itemList]
		},
		handleViewLog(row) {
			this.logParams = row
			this.blLogPopShow = true
		},
		blLogPopClose(action) {
			this.blLogPopShow = false
		},
		// 搜索条件el-select下拉数据处理
		searchSelectVisibleData(data, item) {
			// 单选下拉不保存选择后的数据
			if (!item.multiple) item.saveList = []
			let filterArr = data.filter(ele => !item.saveList.find(o => o.value === ele.key))
			let itemList = filterArr.map(ele => {
				return { ...ele, label: ele.value, value: ele.key }
			})
			item.data = [...item.saveList, ...itemList]
		},
		// 系统航线下拉列表自动补充的数据
		sysLineQuerySearch(queryString, item) {
			this.$store.dispatch('dict/baseSystemLineList', { name: queryString, state: '' }).then(data => {
				this.searchSelectVisibleData(data, item)
			})
		},
		// 所属部门下拉框
		getDeptList() {
			departmentTreeList({ state: 'valid' }).then(res => {
				this.departmentList.splice(0, 1000, ...this.getTreeData(res.data || []))
			})
		},
		// 转化children的空数组为undefined
		getTreeData(data) {
			data.forEach(item => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
			return data
		},
		getMulEmployeeName(val, item, role) {
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				roleCode: role // 角色
			}
			baseEmployeeListName(data).then(res => {
				let list = res.data.map(ele => {
					return {
						...ele,
						label: this.$language === 'en' ? ele.ename : ele.cname,
						value: this.$language === 'en' ? ele.ename : ele.cname
					}
				})
				let formatArr = () => {
					let map = new Map()
					for (let item of list) {
						if (!map.has(item.value)) {
							map.set(item.value, item)
						}
					}
					return [...map.values()]
				}
				let newArr = formatArr()
				let filterArr = newArr.filter(ele => !item.saveList.find(o => o.value === ele.value))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: ele.label, value: ele.value }
				})
				item.data = [...item.saveList, ...itemList]
			})
		},
		// 获取结算单位
		getSettleList(val, item) {
			let data = {
				currPage: 1,
				pageSize: 50,
				query: val ? [{ column: 'name', type: 'like', value: val }] : []
			}
			customerSettlementList(data).then(res => {
				let list = res.data.list.map(ele => {
					return {
						...ele,
						label: ele.name,
						value: ele.name
					}
				})
				let formatArr = () => {
					let map = new Map()
					for (let item of list) {
						if (!map.has(item.value)) {
							map.set(item.value, item)
						}
					}
					return [...map.values()]
				}
				let newArr = formatArr()
				let filterArr = newArr.filter(ele => !item.saveList.find(o => o.value === ele.value))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: ele.label, value: ele.value }
				})
				item.data = [...item.saveList, ...itemList]
			})
		},
		// 获取委托单位
		getCustList(val, item) {
			let data = {
				currPage: 1,
				pageSize: 50,
				query: val
					? [
							{ column: 'name', type: 'like', value: val },
							{ column: 'roleType', type: 'eq', value: 'client' }
					  ]
					: [{ column: 'roleType', type: 'eq', value: 'client' }]
			}
			customerListAllStatus(data).then(res => {
				let list = res.data.list.map(ele => {
					return {
						...ele,
						label: ele.name,
						value: ele.custid
					}
				})
				let formatArr = () => {
					let map = new Map()
					for (let item of list) {
						if (!map.has(item.value)) {
							map.set(item.value, item)
						}
					}
					return [...map.values()]
				}
				let newArr = formatArr()
				let filterArr = newArr.filter(ele => !item.saveList.find(o => o.value === ele.value))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: ele.label, value: ele.value }
				})
				item.data = [...item.saveList, ...itemList]
			})
		},
		getOids(data) {
			let arr = []
			for (let i = 0; i < data.length; i++) {
				arr.push(data[i].oid)
			}
			return arr
		},
		handleAuditRecall(list) {
			let data = {
				oids: this.getOids(list)
			}
			blFinApplyCancelBatch(data).then(res => {
				this.$message({
					type: 'success',
					message: '撤回成功',
					duration: 1000,
					onClose: () => {
						this.getList()
					}
				})
			})
		},
		// 撤回
		handleRecall() {
			if (this.selectedCheckbox.length === 0) return this.$message.error('请至少选择一条撤回放单申请的提单!')
			if (this.selectedCheckbox.some(item => !['submit'].includes(item.auditStatus) || item.state !== 'valid')) return this.$message.error('请选择财务审核状态为已提交待财务审核的提单!')

			this.$confirm('是否确认撤回，请仔细核对，谨慎操作。', '提示', {
				dangerouslyUseHTMLString: true,
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					this.handleAuditRecall(this.selectedCheckbox)
				})
				.catch(() => {})
		},
		// 自定义列宽查询
		getTableColumnWidthInfo() {
			columnWidthConfigInfo({
				scenesCode: `${this.$route.name}`
			}).then(res => {
				// console.log('res', res)
				// console.log('this.tableConfig.columns', this.tableConfig.columns)
				let { columnWidthList } = res.data
				// table列宽重新渲染
				this.tableConfig.columns.map(item => {
					let findItem = columnWidthList.find(ele => ele.column === item.prop)
					// 服务器返回的新的列宽宽度
					let newWidth = findItem ? findItem.width : ''
					return Object.assign(item, { width: newWidth || item.width })
				})
				this.tableColumnsWidthList = this.getTableColumnsWidth()
				console.log('this.tableColumnsWidthList', this.tableColumnsWidthList)
			})
		},
		// 获取本地table列表的字段和宽为数组集合
		getTableColumnsWidth() {
			let result = this.tableConfig.columns.map(item => {
				return { column: item.prop, width: item.width }
			})
			return result
		},
		// 自定义列宽度保存
		handleSaveColumnWidth(params) {
			console.log(params)
			let data = this.tableColumnsWidthList.map(item => {
				if (item.column === params.prop) {
					item.width = params.width
				}
				return { ...item }
			})
			columnWidthConfigSave({
				scenesCode: `${this.$route.name}`,
				columnWidthList: data
			})
				.then(res => {})
				.finally(() => {})
		},
		// 过滤对象分类，按各种编号，各种时间，筛选类型分类
		filterObj(values) {
			const result = {}
			Object.keys(this.filterGroups)
				.filter(key => {
					return values.includes(key)
				})
				.forEach(key => {
					result[key] = this.filterGroups[key]
				})
			return result
		},
		init() {
			// 默认展示全部
			this.tableQuery.auditStatus = 'all'
			Object.assign(this.allFilterGroups, {
				// categorys: this.filterObj(this.categorys),
				// numbers: this.filterObj(this.numbers),
				// times: this.filterObj(this.times),
				all: this.filterGroups
			})
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
		},
		// 船公司下拉列表自动补充的数据
		shipQuerySearch(queryString, item) {
			this.$store
				.dispatch('dict/baseShippingCarrierList', {
					name: queryString,
					state: 'valid'
				})
				.then(data => {
					item.data = data.map(ele => {
						return Object.assign(ele, {
							label: ele.value,
							value: ele.key
						})
					})
				})
		},
		// 获取订舱代理
		getSupplierList(type, queryString, item) {
			this.$store
				.dispatch('dict/queryBkgAgentSupplierList', {
					category: 'category',
					value: 'bkg_carrier,bkg_agent',
					queryString: queryString,
					categoryType: 'in'
				})
				.then(data => {
					let filterArr = data.list.filter(ele => !item.saveList.find(o => o.value === ele.supplierId))
					let itemList = filterArr.map(ele => {
						return {
							...ele,
							label: this.$language == 'en' ? ele.ename : ele.name,
							value: ele.supplierId ? Number(ele.supplierId) : ''
						}
					})
					item.data = [...item.saveList, ...itemList]
				})
		},
		// 增加一条搜索条件
		handleAddFilter() {
			this.searchInputGroup.push({
				key: '',
				value: '',
				category: 'all',
				queryValue: ''
			})
		},
		// enter按键事件
		handleKeyDown(e) {
			let key = null
			if (window.event === undefined) {
				key = e.keyCode
			} else {
				key = window.event.keyCode
			}
			if (key === 13) {
				// 阻止分页的页码enter键触发全局的监听事件
				let className = window.event.target.parentNode.className
				if (className.includes('el-pagination__editor')) return
				//触发的事件
				this.searchCallBack('Search')
			}
		},
		// 获取列表请求参数
		getListQuery(blNo, orderNo) {
			let statusQuery = []
			let delQuery = [{ column: 'state', type: 'eq', value: 'valid' }]
			// 全部
			if (this.tableQuery.auditStatus === 'all') {
				statusQuery = []
				delQuery = []
			}
			// 待申请
			if (this.tableQuery.auditStatus === 'init') {
				statusQuery = [
					{ column: 'auditStatus', type: 'in', value: 'init,refuse' },
					{ column: 'orderStatus', type: 'ne', value: 'cancel' },
					{ column: 'orderStatus', type: 'ne', value: 'break' },
					{ column: 'isPledge', type: 'ne', value: 'y' }
				]
			}
			// 待财务审核
			if (this.tableQuery.auditStatus === 'submit') {
				statusQuery = [{ column: 'auditStatus', type: 'eq', value: 'submit' }]
			}
			// 财务审核处理中
			if (this.tableQuery.auditStatus === 'processing') {
				statusQuery = [{ column: 'auditStatus', type: 'eq', value: 'processing' }]
			}
			// 财务审核通过
			if (this.tableQuery.auditStatus === 'pass') {
				statusQuery = [{ column: 'auditStatus', type: 'eq', value: 'pass' }]
			}
			// 已取消
			if (this.tableQuery.auditStatus === 'state') {
				delQuery = [{ column: 'state', type: 'eq', value: 'invalid' }]
			}
			// 撤回提单
			if (this.tableQuery.auditStatus === 'isCancel') {
				statusQuery = [{ column: 'isCancel', type: 'eq', value: 'y' }]
			}
			// 被押提单
			if (this.tableQuery.auditStatus === 'isPledge') {
				statusQuery = [{ column: 'isPledge', type: 'eq', value: 'y' }]
			}
			// 从外链跳转过来的根据url上的blNo,orderNo查询
			if (blNo) {
				this.tableQuery.query.push({ column: 'blNo', type: 'like', value: blNo })
			}
			if (orderNo) {
				this.tableQuery.query.push({ column: 'orderNo', type: 'like', value: orderNo })
			}
			// 合并状态参数
			let data = {}
			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(statusQuery, delQuery)
			})
			delete data.auditStatus
			return data
		},
		// 把url中的orderNo加入到查询参数中
		mapOrderNo(query) {
			let queryOrderNo = sessionStorage.getItem('queryOrderNo')
			if (queryOrderNo) {
				let ind = -1
				if (query.query) {
					ind = query.query.findIndex(item => item.column === 'orderNo')
				}
				if (ind !== -1) {
					console.log('查询条件有orderNo字段')
					query.query.splice(ind, 1, {
						column: 'orderNo',
						value: queryOrderNo,
						type: 'like'
					})
				} else {
					console.log('查询条件没有orderNo字段')
					query.query.push({
						column: 'orderNo',
						value: queryOrderNo,
						type: 'like'
					})
				}
			}
			sessionStorage.removeItem('queryOrderNo')
		},
		externalSearch() {
			let { blNo, orderNo } = this.$route.query
			let queryOrderNo = orderNo || ''
			sessionStorage.setItem('queryOrderNo', queryOrderNo)
			// 有orderNo或blNo 请求列表接口
			if (blNo || orderNo) {
				this.getList(blNo, orderNo)
			}
		},
		// 列表数据
		async getList(blNo, orderNo) {
			let { data } = await columnWidthConfigInfo({
				scenesCode: `${this.$route.name}`
			})
			let { columnWidthList } = data
			let query = this.getListQuery(blNo, orderNo)
			// 处理url中的orderNo
			this.mapOrderNo(query)
			//处理逗号分割的多个订单号
			query.query.map(item => {
				if (['orderNo', 'pledgeBlNo', 'pledgeOrderNo', 'blNo', 'soInfo'].includes(item.column)) {
					item.type = 'like'
					item.value = item.value
						.split(/[,|，|\s]/)
						.filter(Boolean)
						.join('#')
				}
			})
			getParamMethod(this.$route.name, query).then(queryObj => {
				this.loading = true
				blFinList(queryObj)
					.then(response => {
						this.oldParams = queryObj
						let { list, totalCount, allColumns, configColumns, pageSize } = response.data
						// 请求无数据显示的文案
						if (!list || !list.length) {
							this.$set(this.tableConfig, 'defaultEmpty', false)
						}
						list.forEach(item => {
							item.serviceTypeName = item.serviceType ? this.serviceTypeOptions[item.serviceType] : ''
						})
						this.tableConfig.list = list
						this.tableConfig.pagination.total = totalCount
						this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
						this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
						this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
						this.tableConfig.pagination.isLastPage = response.data.isLastPage
						this.tableQuery.currPage = response.data.currPage
						this.tableQuery.pageSize = pageSize
						this.tableConfig.configColumns = configColumns.length ? configColumns : this.defaultColumns

						// this.tableConfig.configColumns.push('isCancelApply', 'isNotify', 'isChange')
						this.tableConfig.configColumns = new Set(this.tableConfig.configColumns)
						this.tableConfig.configColumns = Array.from(this.tableConfig.configColumns)
						this.handleFilterColumns(this.tableConfig.configColumns)
						// 设置列宽为服务器返回的新的列宽宽度
						this.tableConfig.columns.map(item => {
							let findItem = columnWidthList.find(ele => ele.column === item.prop)
							let newWidth = findItem ? findItem.width : ''
							return Object.assign(item, { width: newWidth || item.width })
						})
						this.tableColumnsWidthList = this.getTableColumnsWidth()
						// this.getTableColumnWidthInfo()
						// this.fillPolName()
					})
					.finally(() => {
						this.loading = false
					})
			})
		},

		// 查询组件回调
		searchCallBack(action, param) {
			let query = []
			if (action === 'Search') {
				// 新增的查询条件组装tableQuery参数
				if (this.searchInputGroup.length) {
					this.searchInputGroup.forEach((item, index) => {
						let tempItem = {}
						if (item.key) {
							// 非自动补全的查询参数从item.value中取值合并到query
							if (this.filterGroups[item.key].type !== 'autocomplete') {
								// 多选下拉框
								if (this.filterGroups[item.key].type === 'cascader') {
									if (this.filterGroups[item.key].cascaderProps.multiple) {
										let arr = []
										if (item.value && item.value.length) {
											for (let i = 0; i < item.value.length; i++) {
												if (item.value[i] && item.value[i].length) {
													arr.push(item.value[i][item.value[i].length - 1])
												}
											}
										}
										Object.assign(tempItem, {
											column: item.key,
											type: this.filterGroups[item.key].searchType || 'in',
											value: arr.length ? arr.toString() : ''
										})
									} else {
										Object.assign(tempItem, {
											column: item.key,
											type: 'eq',
											value: item.value ? item.value[item.value.length - 1] : ''
										})
									}
								} else if (this.filterGroups[item.key].multiple) {
									Object.assign(tempItem, {
										column: item.key,
										type: this.filterGroups[item.key].searchType || 'eq',
										value: item.value ? item.value.toString() : ''
									})
									// 中转港特殊处理
									if (item.key === 'transitPortCode') {
										Object.assign(tempItem, {
											column: 'transitPortCodeStr',
											type: 'like',
											value: item.value ? item.value.join('#') : ''
										})
									}
								} else if (this.filterGroups[item.key].category === 'daterange') {
									// 时间区间组件的value值是数组，['beginDate','endDate'],要转换成后端需要的两个字段
									if (item.value && item.value[0]) {
										if (item.value[0] === '-') {
											query.push({
												column: item.key,
												type: 'empty',
												value: '-'
											})
										} else {
											query.push({
												column: item.key,
												type: 'ge',
												value: item.value[0] + ' 00:00:00'
											})
										}
									}
									if (item.value && item.value[1]) query.push({ column: item.key, type: 'le', value: item.value[1] + ' 23:59:59' })
								} else if (['isContainerReturn'].includes(item.key)) {
									// 特殊处理目的港是否还柜
									// 选择否传值不等于yes
									if (item.value) {
										if (item.value === 'y') {
											Object.assign(tempItem, {
												column: item.key,
												type: 'eq',
												value: 'y'
											})
										} else {
											Object.assign(tempItem, {
												column: item.key,
												type: 'ne',
												value: 'y'
											})
										}
									}
								} else {
									Object.assign(tempItem, {
										column: item.key,
										type: this.filterGroups[item.key].searchType || 'eq',
										value: item.value
									})
								}
							} else {
								Object.assign(tempItem, {
									column: item.key,
									type: this.filterGroups[item.key].searchType || 'eq',
									value: this.filterGroups[item.key].queryValue
								})
							}
							if (item.key === 'auditStatus') {
								this.tableQuery.auditStatus = item.value
							}
							if (item.key === 'isAgreeRelease') {
								if (tempItem.value === 'ys') {
									Object.assign(tempItem, {
										column: item.key,
										type: 'eq',
										value: 'y'
									})
									query.push(tempItem)
									query.push({
										column: 'agreeReleaseStatus',
										type: 'eq',
										value: 'pass'
									})
								} else if (tempItem.value === 'ns') {
									Object.assign(tempItem, {
										column: item.key,
										type: 'ne',
										value: 'y'
									})
									query.push(tempItem)
									query.push({
										column: 'agreeReleaseStatus',
										type: 'eq',
										value: 'pass'
									})
								} else {
									query.push(tempItem)
								}
							} else {
								query.push(tempItem)
							}
						}
					})
				}
				Object.assign(this.tableQuery, {
					query: query.filter(item => {
						return item.value
					}),
					currPage: 1
				})
				this.getList()
			}
			if (action === 'Reset') {
				this.handleSearchValueReset()
			}
			// 模板加载后修改搜索组件的数组
			if (action === 'Update') {
				this.searchInputGroup = param.length ? [...param] : [...defaultSearchInputGroup]
				let { blNo, orderNo } = this.$route.query
				if (blNo) {
					if (this.searchInputGroup.some(item => item.key === 'blNo')) {
						this.searchInputGroup.map(item => {
							if (item.key === 'blNo') {
								if (!item.value) item.value = blNo
							}
						})
					} else {
						this.searchInputGroup.push({
							key: 'blNo',
							value: blNo,
							placeholder: '提单号',
							category: 'all',
							queryValue: ''
						})
					}
				}
				if (orderNo) {
					if (this.searchInputGroup.some(item => item.key === 'orderNo')) {
						this.searchInputGroup.map(item => {
							if (item.key === 'orderNo') {
								if (!item.value) item.value = orderNo
							}
						})
					} else {
						this.searchInputGroup.push({
							key: 'orderNo',
							value: orderNo,
							placeholder: '工作单号',
							category: 'all',
							queryValue: ''
						})
					}
				}
			}
			// if (action === 'Reset') {
			// 	// 存在自定义的模板
			// 	if (param.composeKey) {
			// 		this.setSearchCondition(param.composeKey)
			// 	} else {
			// 		// 后端有配置默认模板
			// 		if (this.resDefaConfList.length) {
			// 			let composeKey = this.resDefaConfList[0].composeKey
			// 			this.setSearchCondition(composeKey, this.resDefaConfList)
			// 		} else {
			// 			// 后端无配置默认模板
			// 			this.init()
			// 		}
			// 	}
			// 	// this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
			// 	Object.assign(this.tableQuery, defaultTableQuery, {
			// 		currPage: 1
			// 	})
			// 	this.getList()
			// 	Object.assign(this.tableConfig, { tips: { text: '', show: false } })
			// }
			// 保存搜索模板
		},
		handleSearchValueReset() {
			this.searchInputGroup.map(item => {
				item.value = ''
				return { ...item }
			})
			// console.log('重置')
		},
		// 自定义表头
		handleCustomColumns() {
			this.customColumnsPopShow = true
		},
		// 按补料状态筛选
		handleSearchByAuditStatus() {
			this.tableQuery.currPage = 1
			this.getList()
		},
		// 多选
		handleMuti(arr) {
			this.selectedCheckbox = arr
		},
		handleSizeChange() {
			this.getList()
		},
		handleCurrentChange(val) {
			if (val === 1) return (this.tableConfig.list = [])
			// 刷新页面的先调自定义搜索查询接口，拿到自定义的搜索条件再调getList接口
			if (val) {
				this.tableQuery.currPage = val
				// this.getSearchConditionInfo()
			}
			this.getList()
		},
		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		// 查看so弹窗
		handleViewSo(index, row) {
			this.soListQuery = {
				blId: row.blId,
				orderNo: row.orderNo,
				businessType: row.businessType
			}
			this.soPopShow = true
		},
		// 查看特殊审批参与人
		handleViewWorkFlowActList(index, row) {
			this.workFlowPopQuery = {
				actId: row.wfActId
			}
			this.workFlowPopShow = true
		},
		// 特殊审批参与人弹窗关闭回调
		workFlowPopClose(action, value) {
			this.workFlowPopShow = false
		},
		// so弹窗关闭回调
		soPopClose(action, value) {
			this.soPopShow = false
		},
		// 获取table选中行的orderNo
		getOrderNos() {
			let orderNos = []
			this.selectedCheckbox.forEach(item => {
				orderNos.push(item.orderNo)
			})
			return orderNos
		},
		getOrderBls() {
			return this.selectedCheckbox.map(item => {
				return {
					orderNo: item.orderNo,
					blId: item.blId
				}
			})
		},
		handleApply(row) {
			this.routerPushTab('BlFinApplyDetail', {
				orderNo: row.orderNo,
				blId: row.blId,
				blNo: row.blNo,
				blMode: row.blMode,
				tAmount: row.tAmount,
				blType: row.blType,
				bdEmployeeName: row.bdEmployeeName,
				businessType: row.businessType,
				isAbroad: row.isAbroad,
				custName: row.custName,
				isExw: row.isExw,
				isOriginalToPod: row.isOriginalToPod
			})
		},
		// 打开申请弹窗
		// handleApply(row) {
		// 	console.log('🚀 ~ row', row)
		// 	let orderBl = [
		// 		{
		// 			orderNo: row.orderNo,
		// 			blId: row.blId
		// 		}
		// 	]
		// 	this.applyQuery = {
		// 		batchApply: false,
		// 		oid: row.oid,
		// 		orderNo: row.orderNo,
		// 		orderBl,
		// 		orderBls: orderBl,
		// 		blId: row.blId,
		// 		tAmount: row.tAmount,
		// 		blType: row.blType,
		// 		bdEmployeeId: row.bdEmployeeId,
		// 		bdEmployeeName: row.bdEmployeeName,
		// 		businessType: row.businessType,
		// 		isAbroad: row.isAbroad
		// 	}
		// 	this.applyShow = true
		// },
		// 批量放单申请
		handleBatchApply() {
			console.log('🚀 ~ selectedCheckbox', this.selectedCheckbox)
			if (this.selectedCheckbox.length === 0) return this.$message.error('请选择要批量放单申请的提单!')
			// 只有待提交,拒绝的的才可以发起批量放单申请
			if (this.selectedCheckbox.some(item => !['init', 'refuse'].includes(item.auditStatus) || item.state !== 'valid')) return this.$message.error('请选择财务审核状态为待提交的提单!')
			// 选择一条的去单个申请页面
			if (this.selectedCheckbox.length === 1) {
				return this.handleApply(this.selectedCheckbox[0])
			}
			let orderBls = this.selectedCheckbox.map(item => {
				return {
					orderNo: item.orderNo,
					blId: item.blId
				}
			})
			let data = {
				orderBls,
				isAudit: false
			}
			// 选中的提单都是hbl的,是否都为EXW的
			let blType = ''
			let isExw = ''
			if (this.selectedCheckbox.every(item => item.blType === 'hbl')) {
				blType = 'hbl'
			}
			if (this.selectedCheckbox.every(item => item.isExw === 'Y')) {
				isExw = 'Y'
			}
			checkCanBatchApply(data).then(res => {
				if (res.msg === 'success') {
					let orderBls = res.data.map(item => {
						return {
							orderNo: item.orderNo,
							blId: item.blId
						}
					})
					this.applyQuery = {
						batchApply: true,
						blType,
						isExw,
						oid: '',
						orderBl: orderBls,
						orderBls: orderBls,
						orderNo: orderBls[0].orderNo,
						blId: orderBls[0].blId,
						bdEmployeeName: this.selectedCheckbox[0].bdEmployeeName
						// tAmount: data[0].tAmount,
						// blType: data[0].blType,
						// bdEmployeeId: data[0].bdEmployeeId,
						// businessType: data[0].businessType
					}
					this.applyShow = true
				}
			})
		},
		// 申请弹窗关闭回调
		async applyPopClose(action, value, isSpecial) {
			console.log('value', value)
			if (action === 'Confirm') {
				// 20220602废弃掉这个功能
				// // 校验是否允许放单 新增applyType参数
				// let { msg } = await checkCanApplyPut({
				// 	orderNo: value.orderNo,
				// 	custId: value.custId,
				// 	applyType: value.applyType
				// })
				// // 非批量放单申请 才校验
				// if (!value.batchApply && msg && msg != 'success') {
				// 	this.$confirm(msg, '提示', {
				// 		confirmButtonText: '确定',
				// 		cancelButtonText: '取消',
				// 		type: 'warning'
				// 	})
				// 		.then(() => {
				// 			this.handleAuditApply(value, isSpecial)
				// 		})
				// 		.catch(() => {})
				// } else {
				// 	this.handleAuditApply(value, isSpecial)
				// }

				// 接口传参处理：custId,custSettleUnit,custSettleUnitCode都需要为字符串。
				value.custId = value.custId.toString()
				value.custSettleUnit = value.custSettleUnit.toString()
				value.custSettleUnitCode = value.custSettleUnitCode.toString()
				this.handleAuditApply(value, isSpecial)
			} else {
				this.applyShow = false
			}
		},
		handleAuditApply(value, isSpecial) {
			delete value.tAmount
			delete value.orderBls
			// let func = isSpecial ? finSpecialCreate : blFinApply
			if (isSpecial) {
				finSpecialCreate(value).then(res => {
					this.$message({
						type: 'success',
						message: '放单申请成功',
						duration: 1000,
						onClose: () => {
							this.applyShow = false
							this.getList()
						}
					})
				})
			} else {
				// 业务发起放单给财务审核
				let params = {
					data: value
				}
				this.$store
					.dispatch('order/soUpload', {
						uri: '/order/fin/apply',
						params: params
					})
					.then(res => {
						if (res.data && res.data.code === 0) {
							this.$message({
								type: 'success',
								message: '放单申请成功',
								duration: 1000,
								onClose: () => {
									this.applyShow = false
									this.getList()
								}
							})
						}
					})
			}
		},
		// 打开委托单位弹窗
		handleViewCustName(row, title) {
			this.custPopTitle = title
			let custNameObj = {}
			let custSettleUnitArr = row.custSettleUnit.split(',')
			let custIdArr = row.custId.split(',')
			if (title === '委托单位信控信息') {
				custNameObj = {
					[custIdArr[0]]: row.custName
				}
			} else {
				custSettleUnitArr.map((item, index) => {
					custNameObj[custIdArr[index]] = item
				})
			}
			this.custQuery = {
				...row,
				custName: row.custName,
				custNameObj,
				custid: row.custId
			}
			// console.log('custNameObj', custNameObj)
			this.custNameCrShow = true
		},
		custNameCrPopClose(action) {
			this.custNameCrShow = false
		},
		// 结算单位弹窗
		handleViewCustSettleUnit() {},
		//处理工作号跳转
		handleOrderNo(row) {
			let routeUrl = this.$router.resolve({
				name: 'OrderRedirect',
				query: {
					orderNo: row.orderNo
				}
			})
			window.open(routeUrl.href, '_blank')
		},
		//跳转到费用页面
		handleToOrderFee(row) {
			console.log('🚀 ~ row', row)
			let name = 'OrderFee'
			let businessBroad = ''
			if (['rail_export_lcl', 'rail_export_fcl'].includes(row.businessType)) {
				name = 'OrderFee' // RailwayOrderFee
				businessBroad = 'rail'
			}
			if (['air_export', 'air_import'].includes(row.businessType)) {
				name = 'OrderFee' // AirOrderFee
				businessBroad = 'air'
			}

			let routeUrl = this.$router.resolve({
				name: name,
				params: { orderNo: row.orderNo },
				query: {
					orderNo: row.orderNo,
					source: 'blFinList',
					businessBroad: businessBroad
				}
			})
			window.open(routeUrl.href, '_blank')
		},
		// 排序
		handleSort(query) {
			this.getList()
		},
		// 过滤显示自定义的表头
		handleFilterColumns(value) {
			let { allColumns, columns } = this.tableConfig
			let temp = []
			let arr = []
			temp = allColumns.filter((item, index) => {
				return value.includes(item.prop)
			})

			// 排序 temp
			temp.sort((prev, next) => {
				const p = value.indexOf(prev.prop)
				const n = value.indexOf(next.prop)
				return p - n
			})

			temp.map(item => {
				arr.push(item.prop)
			})

			Object.assign(this.tableConfig, {
				columns: temp,
				configColumns: arr
			})
		},
		// 获取特殊处理的自定义表头，例：polCode,需要传polCode,polEname,polCname,podCode, podEname,podCname给后端
		getColumnsValues(value) {
			// 取消固定工作号 v20220415
			let result = []
			value.map(item => {
				if (this.specialColumns[item]) {
					result = result.concat(this.specialColumns[item])
				} else {
					result.push(item)
				}
			})

			result = Array.from(new Set(result))
			return result
		},
		// 自定义表头关闭回调
		customColumnsPopClose(action, value) {
			this.customColumnsPopShow = false
			if (action === 'Confirm') {
				let columnsKeys = this.getColumnsValues(value)
				Object.assign(this.tableQuery, {
					columns: columnsKeys
				})
				this.getList()
			}
		},
		// 导出
		handleExport() {
			let data = this.getListQuery()
			blFinExport({
				ascColumns: data.ascColumns,
				descColumns: data.descColumns,
				query: this.oldParams.query,
				scenesCode: 'BlFinApplyList'
			}).then(response => {
				let { filePath } = response.data
				window.location.href = filePath
			})
		}
	}
}
</script>
<style lang="scss">
.icon-hbl2 {
	display: inline-block;
	width: 14px;
	height: 14px;
	background: #3e80f5;
	border-radius: 2px;
	color: #fff;
	line-height: 14px;
	text-align: center;
	font-style: normal;
	margin-right: 5px;
}
.icon-joint-dept {
	display: inline-block;
	padding: 0 2px;
	background: #3e80f5;
	border-radius: 2px;
	color: #fff;
	font-style: normal;
	margin-right: 5px;
}
</style>
