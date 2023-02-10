<template>
	<div class="app-container">
		<div class="search-container">
			<Search ref="search" :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery" :searchFiledGroup="searchInputGroup" :filterGroups="filterGroups">
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
				<div class="btn-plus-search" @click="handleAddFilter" ref="btnPlus"></div>
			</Search>
		</div>
		<div class="table-container" ref="tableCont">
			<TableFilter :config="tableConfig" :tableQuery.sync="tableQuery" :callback="tableCallBack" />
			<BaseTableMuti :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" v-loading="loading" />
		</div>
		<!-- 自定义表头 -->
		<div v-if="customColumnsPopShow">
			<CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
		</div>
		<!-- 客户同意放货弹窗 -->
		<div v-if="blDeliveryApproveShow">
			<BlDeliveryApprove @close="blDeliveryApprovePopClose" :blIdList="blIdList" :blMode="blMode" />
		</div>
		<div v-if="showTransferPop">
			<TransferPop @close="transferPopClose"></TransferPop>
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './components/tableFilter'
// 弹出框
import BaseDialog from '@/components/Base/Dialog/index'
import CustomColumns from '@/components/customColumns/index'
import { baseEmployeeListName, columnWidthConfigInfo, columnWidthConfigSave } from '@/api/base'
import { customerListAllStatus } from '@/api/crm/supplier.js'
import { blAuditList, blAuditListExport, transferCreate } from '@/api/order/bl'
import { getValueByKey } from '@/api/order/list'
import BlDeliveryApprove from './components/blDeliveryApprove'
import { departmentTreeList } from '@/api/companyResource'
import { getParamMethod } from '@/utils/allKindNumber'
// import ColumnTip from '@/views/order/order/components/columnTip.vue'
// import { getDictLabel } from '@/utils/tools'
import TransferPop from '@/views/railway/order/orderList/takeList/components/transferPop'
const defaultPage = {
	pageSize: -1,
	currPage: 1
}
const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: ['createdTime'],
	query: [],
	orderStatus: '' // 订单状态，默认展示未审核
}
const defaultSearchInputGroup = [
	{
		key: 'universalNo',
		value: '',
		placeholder: '各类编号',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'blNo',
		value: '',
		placeholder: '提单号',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'orderNo',
		value: '',
		placeholder: '工作号',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'so',
		value: '',
		placeholder: 'so',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'custid',
		value: '',
		placeholder: 'custid',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'shipCarrierCode',
		value: '',
		placeholder: '',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'bkgAgentSupplierId',
		value: '',
		placeholder: '',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'isDraftConfirm',
		value: '',
		placeholder: '',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'isAgreeRelease',
		value: '',
		placeholder: '',
		category: 'all',
		queryValue: ''
	}
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
			showTransferPop: false,
			departmentList: [],
			blIdList: [],
			blDeliveryApproveShow: false,
			oldParams: {},
			// isSameCode: false,
			cTimestamp: 0,
			loading: false,
			state: '',
			showVal: null,
			orderNo: '',
			defaultSearchLength: 0, // 默认显示搜索框的个数
			allFilterGroups: {
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
				blNo: {
					key: 'blNo',
					label: '提单号',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				blType: {
					label: '提单类型',
					key: 'blType',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [
						// { label: '主单', value: 'mbl' },
						// { label: '分单', value: 'hbl' }
					],
					nonDictionary: true
				},
				isBindContainer: {
					label: '是否关联集装箱',
					key: 'isBindContainer',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [
						{ label: '是', value: 'y' },
						{ label: '否', value: 'n' }
					],
					nonDictionary: true
				},
				so: {
					key: 'so',
					label: 'SO号',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				isDraftConfirm: {
					label: '草单确认',
					key: 'isDraftConfirm',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [
						{ label: '已确认', value: 'y' },
						{ label: '未确认', value: 'n' }
					],
					nonDictionary: true
				},
				auditStatus: {
					key: 'auditStatus',
					label: '财务审核状态',
					type: 'select',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: this.$store.state.dict.dictMap.blFinAuditStatus,
					propInDict: 'customBlFinAuditStatus',
					nonDictionary: true
				},
				auditEmployeeName: {
					key: 'auditEmployeeName',
					label: '财务审核人',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'ac')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'ac')
					}
				},
				siStatus: {
					label: '补料状态',
					key: 'siStatus',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [
						{ label: '未补料', value: '未补料' },
						{ label: '船公司补料完成', value: '船公司补料完成' },
						{ label: 'MBLcopy件单证确认', value: 'MBLcopy件单证确认' },
						{ label: '已收OBD提单', value: '已收OBD提单' },
						{ label: '船公司已取消', value: '船公司已取消' }
					],
					nonDictionary: true
				},
				isAgreeRelease: { label: '客户是否同意放货', key: 'isAgreeRelease', type: 'select', searchType: 'eq', value: '', data: isAgreeReleaseOptions, nonDictionary: true },
				// isAgreeRelease: {
				// 	label: '客户同意放货',
				// 	key: 'isAgreeRelease',
				// 	type: 'select',
				// 	searchType: 'eq',
				// 	value: '',
				// 	data: [
				// 		// { label: '是', value: 'y' },
				// 		// { label: '否', value: 'n' }
				// 	],
				// 	nonDictionary: true
				// },
				takeStatus: {
					label: '正本取单状态',
					key: 'takeStatus',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [
						{ label: '已取单', value: 'finish' },
						{ label: '未取单', value: 'init' }
					],
					nonDictionary: true
				},
				// putStatus: {
				// 	label: '放单状态',
				// 	key: 'putStatus',
				// 	type: 'select',
				// 	searchType: 'eq',
				// 	value: '',
				// 	data: [
				// 		{ label: '已放单', value: 'finish' },
				// 		{ label: '未放单', value: 'init' }
				// 	],
				// 	nonDictionary: true
				// },
				blPutStatus: { label: '放单状态', key: 'blPutStatus', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true },

				blMode: {
					label: '出单方式',
					key: 'blMode',
					type: 'select',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					nonDictionary: true
				},
				consignee: {
					key: 'consignee',
					label: '收货人',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				shipper: {
					key: 'shipper',
					label: '发货人',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				notify1: {
					key: 'notify1',
					label: '通知人',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				bargeVessel: {
					key: 'bargeVessel',
					label: '驳船船名',
					type: 'autocomplete',
					searchType: 'like',
					value: '',
					queryValue: '',
					querySearch: (queryString, cb) => {
						this.$store.dispatch('dict/queryVessleList', { name: queryString }).then(data => {
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
				bargeVoyage: {
					key: 'bargeVoyage',
					label: '驳船航次',
					type: 'autocomplete',
					searchType: 'like',
					value: '',
					queryValue: '',
					querySearch: (queryString, cb) => {
						this.$store.dispatch('dict/queryVoyageList', { name: queryString }).then(data => {
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
				vessel: {
					key: 'vessel',
					label: '大船船名',
					type: 'autocomplete',
					searchType: 'like',
					value: '',
					queryValue: '',
					querySearch: (queryString, cb) => {
						this.$store.dispatch('dict/queryVessleList', { name: queryString }).then(data => {
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
				voyage: {
					key: 'voyage',
					label: '大船航次',
					type: 'autocomplete',
					searchType: 'like',
					value: '',
					queryValue: '',
					querySearch: (queryString, cb) => {
						this.$store.dispatch('dict/queryVoyageList', { name: queryString }).then(data => {
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
				porPortCode: {
					key: 'porPortCode',
					label: '驳船收货地',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						this.portSearch('', 'port_of_feeder', this.state, 'porPortCode', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_feeder', this.state, 'porPortCode', item)
					}
				},
				polPortCode: {
					key: 'polPortCode',
					label: '起运港',
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
						this.portSearch('', 'port_of_basic', this.state, 'polPortCode', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_basic', this.state, 'polPortCode', item)
					}
				},
				unloadingPortCode: {
					key: 'unloadingPortCode',
					label: '卸货港',
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
						this.portSearch('', 'port_of_discharge', this.state, 'unloadingPortCode', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_discharge', this.state, 'unloadingPortCode', item)
					}
				},
				podPortCode: {
					key: 'podPortCode',
					label: '目的地',
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
						this.portSearch('', 'port_of_destination', this.state, 'podPortCode', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_destination', this.state, 'podPortCode', item)
					}
				},
				destinationArea: {
					key: 'destinationArea',
					label: '最终目的地',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				transitPortCode: {
					label: '中转港',
					key: 'transitPortCode',
					type: 'remoteSelect',
					searchType: 'in',
					value: '',
					multiple: true,
					'collapse-tags': true,
					data: [],
					saveList: [],
					visibleChange: (val, item) => {
						this.portSearch('', 'port_of_basic', this.state, 'transitPortCode', item)
					},
					filterMehod: (val, item) => {
						this.portSearch(val, 'port_of_basic', this.state, 'transitPortCode', item)
					}
				},
				opEmployeeName: {
					key: 'opEmployeeName',
					label: '操作',
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
						this.getMulEmployeeName('', item, 'op')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'op')
					}
				},
				cscEmployeeName: {
					key: 'cscEmployeeName',
					label: '单证',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'csc')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'csc')
					}
				},
				bdEmployeeId: {
					key: 'bdEmployeeId',
					label: '销售',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getEmployeeName('', item, 'bd')
					},
					filterMehod: (val, item) => {
						this.getEmployeeName(val, item, 'bd')
					}
				},
				obdEmployeeId: {
					key: 'obdEmployeeId',
					label: '销售助理',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getEmployeeName('', item, 'obd')
					},
					filterMehod: (val, item) => {
						this.getEmployeeName(val, item, 'obd')
					}
				},
				docEmployeeName: {
					key: 'docEmployeeName',
					label: '文件',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'doc')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'doc')
					}
				},
				putEmployeeName: {
					key: 'putEmployeeName',
					label: '放货人',
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
						this.getMulEmployeeName('', item, 'rc')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'rc')
					}
				},
				createdBy: {
					key: 'createdBy',
					label: '提单创建人',
					type: 'remoteSelect',
					searchType: 'eq',
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getEmployeeName('', item)
					},
					filterMehod: (val, item) => {
						this.getEmployeeName(val, item)
					}
				},
				createdTime: {
					label: '提单创建时间',
					key: 'createdTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
				agreeTime: {
					label: '客户同意放货时间',
					key: 'agreeTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
				agreeExpressTime: {
					label: '同意寄单不同意放货时间',
					key: 'agreeExpressTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
				etaTime: {
					label: '预计到港时间',
					key: 'etaTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
				putFinishTime: {
					label: '提单放单完成时间',
					key: 'putFinishTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
				telexDownTime: {
					label: '船东完成放单时间',
					key: 'telexDownTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
				orderNo: {
					key: 'orderNo',
					label: '工作号',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				custid: {
					key: 'custid',
					label: '委托单位',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getCustList('', item)
					},
					filterMehod: (val, item) => {
						this.getCustList(val, item)
					}
				},
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
				sysLineCode: {
					key: 'sysLineCode',
					label: '系统航线',
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
					visibleChange: (val, item) => {
						this.getSupplierList('bkg_agent', '', item)
					},
					filterMehod: (val, item) => {
						this.getSupplierList('bkg_agent', val, item)
					}
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
					label: '放单申请时间',
					key: 'applyTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
				tdTime: {
					label: '大船实际开船时间',
					key: 'tdTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
				// bdDeptName: {
				//   key: 'bdDeptName',
				//   label: '销售部门',
				//   type: 'input',
				//   searchType: 'like',
				//   value: ''
				// },
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
				businessType: {
					label: '业务类型',
					key: 'businessType',
					propInDict: 'shipBusinessType',
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
				cn: {
					key: 'cn',
					label: '柜号',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				expressTime: {
					label: '寄单时间',
					key: 'expressTime',
					type: 'date2',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd'
				},
				transferStatus: {
					label: '提单转移状态',
					key: 'blTransferStatus',
					type: 'select',
					searchType: 'in',
					value: '',
					data: [],
					multiple: true,
					'collapse-tags': true,
					nonDictionary: true
				},
				placeCompCode: {
					label: '提单所在地',
					key: 'placeCompCode',
					type: 'select',
					searchType: 'in',
					filterable: true,
					value: '',
					data: [],
					multiple: true,
					'collapse-tags': true,
					nonDictionary: true
				},
				cargoDesc: {
					key: 'cargoDesc',
					label: '货物描述',
					type: 'input',
					searchType: 'like',
					value: ''
				},
				forwardAgent: {
					key: 'forwardAgent',
					label: '运输代理人',
					type: 'input',
					searchType: 'like',
					value: ''
				}
			},
			// 默认展示的搜索条件，搜索条件分类
			searchInputGroup: JSON.parse(JSON.stringify(defaultSearchInputGroup)),
			searchConfig: [],

			tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
			// table复选框多选的值
			selectedCheckbox: [],
			// table基础组件
			tableConfig: {
				hideTransfer: true,
				style: {},
				tableIndex: {
					show: true
				},
				options: {
					// 是否支持解锁列表修改,默认锁定列表不可更改
					lockState: true,
					// 是否支持列表项选中功能
					mutiSelect: true,
					// 多选框状态判断 {false不可选, true可选}
					checkSelectable: () => {
						return true
					}
				},
				customColumns: {
					show: true,
					handleCustomColumns: this.handleCustomColumns
				},
				defaultEmpty: true, // 数据默认不加载的显示文案
				list: [],
				configColumns: [],
				columns: this.$store.state.order.blInfoList.columnsBase(this.handleOrderNoInfo),
				allColumns: this.$store.state.order.blInfoList.columnsBase(this.handleOrderNoInfo),
				// 操作按钮组
				operationBtns: {
					minWidth: '100',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						if (action === 'Info') {
							this.handleInfo(row, 'BlList')
						}
					},
					data: [
						{
							label: '详情',
							type: 'text',
							show: true,
							action: 'Info'
						}
					]
				},
				// 操作提示
				tips: {
					text: '',
					totalTxt: '',
					show: false
				},
				// 分页
				pagination: {
					show: true,
					total: 0,
					hasNextPage: false,
					hasPreviousPage: false,
					isFirstPage: false,
					isLastPage: false
				}
			},
			tableColumnsWidthList: [],
			// 显示自定义表头的弹窗状态
			customColumnsPopShow: false,
			// 取消订单弹窗
			resDefaConfList: [] // 后端配置的默认搜索模板
		}
	},
	activated() {
		let timestamp = new Date().getTime()
		if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
			this.getList()
		}
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
	},

	deactivated() {
		window.removeEventListener('keydown', this.handleKeyDown)
	},
	created() {
		this.cTimestamp = new Date().getTime()
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
		this.init()
	},
	mounted() {
		// this.getDeptCode()

		console.log('🚀 ~ this.dictMap', this.dictMap)
	},

	computed: {
		...mapState('order', ['serviceList', 'orderList']),
		...mapState('user', ['deptCode', 'userId']),
		...mapState({
			currRole: state => state.order.currRole,
			roles: state => state.user.roles,
			dictMap: state => state.dict.dictMap,
			defaultColumns: state => state.order.blInfoList.defaultColumns,
			specialColumns: state => state.order.blInfoList.specialColumns,
			columnsBase: state => state.order.blInfoList.columnsBase()
		}),

		isRc() {
			return this.currRole === 'rc'
		},
		isAc() {
			return this.currRole === 'ac'
		},
		isDoc() {
			return this.currRole === 'doc'
		},
		isOp() {
			return this.currRole === 'op'
		},
		isLineCs() {
			return this.currRole === 'line_cs'
		},
		isOpTruck() {
			return this.currRole === 'op_truck'
		},
		isBd() {
			return this.currRole === 'bd' || this.currRole === 'obd' || this.currRole === 'asst'
		},
		blMode() {
			return this.selectedCheckbox.length ? this.selectedCheckbox[0].blMode : ''
		}
	},
	watch: {},
	components: {
		Search,
		AddFilter,
		BaseTableMuti,
		TableFilter,
		BaseDialog,
		CustomColumns,
		BlDeliveryApprove,
		TransferPop
	},
	methods: {
		transferPopClose(action, value) {
			if (action === 'Confirm') {
				let orderBls = []
				for (let i = 0; i < this.selectedCheckbox.length; i++) {
					orderBls.push({
						orderNo: this.selectedCheckbox[i].orderNo,
						blId: this.selectedCheckbox[i].blId
					})
				}
				let params = Object.assign(value, {
					orderBls: orderBls
				})

				transferCreate(params).then(res => {
					this.$message.success('提单转移成功')
					this.showTransferPop = false
					this.getList()
				})
			} else {
				this.showTransferPop = false
			}
		},
		// 所属部门下拉框
		getDeptList() {
			departmentTreeList({ state: 'valid' }).then(res => {
				this.departmentList.splice(0, 1000, ...this.getTreeData(res.data || []))

				if (res.data && res.data[0] && res.data[0].childList) {
					let companyListOptions = res.data[0].childList.map(item => {
						return Object.assign({}, item, {
							label: item.deptCname,
							value: item.deptCode
						})
					})
					this.$set(this.filterGroups, 'placeCompCode', {
						label: '提单所在地',
						key: 'placeCompCode',
						type: 'select',
						searchType: 'eq',
						filterable: true,
						value: '',
						data: companyListOptions,
						nonDictionary: true
					})
				}
			})
		},
		// 转化children的空数组为undefined
		getTreeData(data) {
			data.forEach(item => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
			return data
		},
		// 获取委托单位
		//查询散货部门CODE
		// 客户同意放货弹窗关闭回调
		blDeliveryApprovePopClose(action, value) {
			this.blDeliveryApproveShow = false
			if (action === 'Confirm') {
				this.getList()
			}
		},
		// getDeptCode() {
		//   getValueByKey('lcl_company_code').then((res) => {
		//     // console.log('🚀 ~ this.deptCode', this.deptCode)
		//     // 登录用户的deptCode以散货部门code为开头的判断为散货部门
		//     if (res.data.startsWith(this.deptCode)) {
		//       this.isSameCode = true
		//     } else {
		//       this.isSameCode = false
		//     }
		//   })
		// },
		getCustList(val, item) {
			console.log('val', val, item)

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
				let filterArr = res.data.list.filter(ele => !item.saveList.find(o => o.value === ele.custid))
				let itemList = filterArr.map(ele => {
					return {
						...ele,
						label: this.$language == 'en' ? ele.ename : ele.name,
						value: ele.custid
					}
				})
				item.data = [...item.saveList, ...itemList]
			})
		},
		// 获取员工name
		getEmployeeName(val, item, roleCode) {
			// console.log('item.saveList', item.saveList)
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				roleCode: roleCode // 角色
			}
			if (!roleCode) delete data.roleCode
			baseEmployeeListName(data).then(res => {
				// 单选下拉不保存选择后的数据
				if (!item.multiple) item.saveList = []
				let filterArr = res.data.filter(ele => !item.saveList.find(o => o.value === ele.employeeId))
				let itemList = filterArr.map(ele => {
					return {
						...ele,
						label: this.$language === 'en' ? ele.ename : ele.cname,
						value: ele.employeeId ? Number(ele.employeeId) : ''
					}
				})
				item.data = [...item.saveList, ...itemList]
			})
		},
		getMulEmployeeName(val, item, role) {
			// console.log('item.saveList', item.saveList)
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
		// 获取本地table列表的字段和宽为数组集合
		getTableColumnsWidth() {
			let result = this.tableConfig.columns.map(item => {
				return { column: item.prop, width: item.width }
			})
			return result
		},
		// 自定义列宽度保存
		handleSaveColumnWidth(params) {
			let data = this.tableColumnsWidthList.map(item => {
				if (item.column === params.prop) {
					item.width = params.width
				}
				return { ...item }
			})
			columnWidthConfigSave({
				scenesCode: this.$route.name,
				columnWidthList: data
			})
				.then(res => {})
				.finally(() => {})
		},
		init() {
			// 默认展示全部
			Object.assign(this.allFilterGroups, {
				all: this.filterGroups
			})
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
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

		// 远程搜索港口下拉数据
		portSearch(queryString, portAttribute, state, type, item) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				// let portList = data.map(ele => {
				// 	return Object.assign(ele, {
				// 		label: ele.value,
				// 		value: ele.key
				// 	})
				// })
				// item.data = portList
				let filterArr = data.filter(ele => !item.saveList.find(o => o.value === ele.key))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: ele.value, value: ele.key }
				})
				item.data = [...item.saveList, ...itemList]
			})
		},
		// 系统航线下拉列表自动补充的数据
		sysLineQuerySearch(queryString, item) {
			this.$store.dispatch('dict/baseSystemLineList', { name: queryString, state: '' }).then(data => {
				// 单选下拉不保存选择后的数据
				if (!item.multiple) item.saveList = []
				let filterArr = data.filter(ele => !item.saveList.find(o => o.value === ele.key))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: ele.value, value: ele.key }
				})
				item.data = [...item.saveList, ...itemList]
			})
		},
		// 船公司下拉列表自动补充的数据
		shipQuerySearch(queryString, item) {
			this.$store
				.dispatch('dict/baseShippingCarrierList', {
					name: queryString,
					state: ''
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
					// item.data = data.list.map(ele => {
					// 	return Object.assign(ele, {
					// 		label: this.$language == 'en' ? ele.ename : ele.name,
					// 		value: ele.supplierId ? Number(ele.supplierId) : ''
					// 	})
					// })
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

		// enter按键事件
		handleKeyDown(e) {
			let key = null
			if (window.event === undefined) {
				key = e.keyCode
			} else {
				key = window.event.keyCode
			}
			if (key === 13) {
				// console.log(window.event.target)
				// 阻止分页的页码enter键触发全局的监听事件
				let className = window.event.target.parentNode.className
				if (window.event.target.id === 'bdRemark' || className.includes('el-pagination__editor')) return
				//触发的事件
				this.searchCallBack('Search')
			}
		},

		// 获取列表请求参数
		getListQuery() {
			let statusQuery = []
			// 合并状态参数
			let data = {}
			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(statusQuery)
			})
			return data
		},

		// 列表数据
		async getList() {
			this.loading = true
			let query = this.getListQuery()
			//处理逗号分割的多个订单号
			query.query.map(item => {
				if (['orderNo', 'so', 'blNo', 'cn'].includes(item.column)) {
					// item.type = item.column === 'so' || item.column === 'blNo' ? 'like' : 'in'
					item.type = 'like'
					item.value = item.value
						.split(/[,|，|\s]/)
						.filter(Boolean)
						.join('#')
				}
			})
			if (query.query.find(el => el.column === 'siStatus')) {
				if (!query.query.find(el => el.column === 'blType')) {
					query.query.push({
						column: 'blType',
						type: 'eq',
						value: 'mbl'
					})
				}
			}
			this.oldParams = query
			let { data } = await columnWidthConfigInfo({
				scenesCode: this.$route.name
			})
			let { columnWidthList } = data
			getParamMethod(this.$route.name, query).then(queryObj => {
				console.log(queryObj)
				blAuditList(queryObj)
					.then(response => {
						this.oldParams = queryObj
						let { list, totalCount, pageSize, allColumns, configColumns } = response.data
						// 请求无数据显示的文案
						if (!list || !list.length) {
							this.$set(this.tableConfig, 'defaultEmpty', false)
						}
						this.tableConfig.list = list
						this.tableQuery.pageSize = pageSize
						this.tableConfig.pagination.total = totalCount
						this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
						this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
						this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
						this.tableConfig.pagination.isLastPage = response.data.isLastPage
						this.tableQuery.currPage = response.data.currPage
						this.tableConfig.configColumns = configColumns.length ? configColumns : this.defaultColumns
						this.tableConfig.configColumns = new Set(this.tableConfig.configColumns)
						this.tableConfig.configColumns = Array.from(this.tableConfig.configColumns)

						this.handleFilterColumns(this.tableConfig.configColumns)
						// 设置列宽为服务器返回的新的列宽宽度
						// console.log(
						//   'this.tableConfig.columns',
						//   this.tableConfig.configColumns
						// )
						this.tableConfig.columns.map(item => {
							// 取服务器返回的宽度
							let findItem = columnWidthList.find(ele => ele.column === item.prop)
							let newWidth = findItem ? Math.max(findItem.width, item.minWidth) : ''
							return Object.assign(item, { width: newWidth || item.width })
						})
						this.tableColumnsWidthList = this.getTableColumnsWidth()
					})
					.finally(() => {
						this.loading = false
					})
			})
		},
		// 查询组件回调
		async searchCallBack(action, param) {
			let query = []
			// console.log('this.searchInputGroup', this.searchInputGroup)
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
									if (item.value && item.value[1]) {
										query.push({
											column: item.key,
											type: 'le',
											value: item.value[1] + ' 23:59:59'
										})
									}
								} else if (item.key === 'blPutStatus') {
									// 特殊处理已推送文件
									if (item.value === 'pushedDoc') {
										Object.assign(tempItem, {
											column: 'pushedDoc',
											type: 'eq',
											value: 'y'
										})
									} else {
										Object.assign(tempItem, {
											column: 'putStatus',
											type: 'eq',
											value: item.value
										})
									}
								} else if (item.key === 'takeStatus') {
									if (item.value) {
										if (item.value === 'finish') {
											Object.assign(tempItem, {
												column: item.key,
												type: 'eq',
												value: 'finish'
											})
										} else {
											Object.assign(tempItem, {
												column: item.key,
												type: 'ne',
												value: 'finish'
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
				// console.log('serach:', this.tableQuery)
				this.getList()
			}
			if (action === 'Reset') {
				this.handleSearchValueReset()
			}
			// 模板加载后修改搜索组件的数组
			if (action === 'Update') {
				this.searchInputGroup = param.length ? [...param] : [...defaultSearchInputGroup]
			}
			// 刷新
			if (action === 'Refresh') {
				this.loading = true
				let { data } = await columnWidthConfigInfo({
					scenesCode: this.$route.name
				})
				let { columnWidthList } = data
				blAuditList(this.oldParams)
					.then(response => {
						let { list, totalCount, pageSize, allColumns, configColumns } = response.data
						this.tableConfig.list = list
						this.tableQuery.pageSize = pageSize
						this.tableConfig.pagination.total = totalCount
						this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
						this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
						this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
						this.tableConfig.pagination.isLastPage = response.data.isLastPage
						this.tableQuery.currPage = response.data.currPage
						this.tableConfig.configColumns = configColumns.length ? configColumns : this.defaultColumns
						this.tableConfig.configColumns = new Set(this.tableConfig.configColumns)
						this.tableConfig.configColumns = Array.from(this.tableConfig.configColumns)
						this.handleFilterColumns(this.tableConfig.configColumns)
						// 设置列宽为服务器返回的新的列宽宽度
						// console.log('this.tableConfig.columns', this.tableConfig.columns)
						this.tableConfig.columns.map(item => {
							// 取服务器返回的宽度
							let findItem = columnWidthList.find(ele => ele.column === item.prop)
							let newWidth = findItem ? findItem.width : ''
							return Object.assign(item, { width: newWidth || item.width })
						})
						this.tableColumnsWidthList = this.getTableColumnsWidth()
					})
					.finally(() => {
						this.loading = false
					})
			}
		},
		handleSearchValueReset() {
			this.searchInputGroup.map(item => {
				item.value = ''
				return { ...item }
			})
		},
		// 提单转移
		handleTransfer() {
			if (this.selectedCheckbox.length === 0) {
				return this.$message.error('请至少选择一条提单数据!')
			}
			// 前端判断 提单转移的条件
			let result = this.selectedCheckbox.every(el => el.blType === 'mbl' && el.blMode === 'original' && el.transferStatus !== 'PROCESSING' && el.putStatus !== 'finish' && el.takeStatus === 'finish')
			if (!result) {
				return this.$message.warning('提单转移操作需要满足：1.提单的“放单状态”非“已放单”；2.且提单的“正本取单状态”为已取单；3.该提单不存在正在转移中；提单必须是正本M单。')
			}
			this.showTransferPop = true
		},
		// 导出
		handleExport() {
			let data = this.getListQuery()
			blAuditListExport({
				ascColumns: data.ascColumns,
				descColumns: data.descColumns,
				query: this.oldParams.query
			}).then(response => {
				let { filePath } = response.data
				window.location.href = filePath
			})
		},

		// 自定义表头
		handleCustomColumns() {
			this.customColumnsPopShow = true
		},

		// 按订单状态筛选
		handleSearchByOrderStatus() {
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
			// 20220221 默认不请求列表
			if (val === 1) return (this.tableConfig.list = [])
			this.getList()
		},

		// 表格操作回调
		tableCallBack(action, arr) {
			let fn = this['handle' + action]
			if (typeof fn !== 'function') return
			this['handle' + action](arr)
		},
		handleRelease() {
			this.blIdList = this.getBlNos()
			if (this.blIdList.length === 0) {
				return this.$message.warning('请至少选择一条提单数据!')
			}
			this.blDeliveryApproveShow = true
		},

		// 获取table选中行的orderNo
		getBlNos() {
			let blNos = []
			this.selectedCheckbox.forEach(item => {
				blNos.push(item.blId)
			})
			return blNos
		},
		// 点击订单号查看详情
		handleOrderNoInfo(row, path) {
			this.handleInfo(row, path)
		},
		// 去详情页
		async handleInfo(row, path) {
			let action = ''
			// 业务除草稿和拒绝状态都不可编辑
			if (this.isBd && !['draft', 'refuse'].includes(row.orderStatus)) {
				action = 'view'
			}
			// 操作角色非审核通过都不可编辑
			if (this.isOp && !['pass'].includes(row.orderStatus)) {
				action = 'view'
			}
			let isSameCode = await this.$store.dispatch('order/getValueByKeys', {
				custid: row.custid
			})
			let routeUrl = this.$router.resolve({
				name: path,
				params: {
					orderNo: row.orderNo
				},
				query: {
					orderNo: row.orderNo,
					source: 'ShipBlList',
					action: action,
					showContainer: !['st03', 'st04', 'st18', 'st19', 'st11', 'st12'].includes(row.serviceType),
					showBl: true,
					showRelate: isSameCode && ['st01', 'st15', 'st09'].includes(row.serviceType)
					// blId:row.blId
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
			// console.log('tableColumns:', this.tableConfig.columns);
		},

		// 获取特殊处理的自定义表头，例：polCode,需要传polCode,polEname,polCname,podCode, podEname,podCname给后端
		getColumnsValues(value) {
			// 20211202 订单号表头不固定在第一列
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
				// console.log('columnsKeys:',this.tableQuery.columns)
				this.getList()
			}
		}
	}
}
</script>
<style lang="scss"></style>
