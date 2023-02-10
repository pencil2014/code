<template>
	<div class="app-container">
		<!-- <RoleSwitch @callback="initQuery"/> -->
		<div class="search-container">
			<Search fixedCreatedTime :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery" :searchFiledGroup="searchInputGroup" :filterGroups="filterGroups">
				<AddFilter
					fixedCreatedTime
					:searchInputGroup="searchInputGroup"
					:allFilterGroups="allFilterGroups"
					:filterGroups="filterGroups"
					:defaultSearchLength="defaultSearchLength"
					:callback="searchCallBack"
					:index="index"
					:item="item"
					v-for="(item, index) in showSearchInputGroup"
					:key="'filter' + index"
				/>
				<div class="btn-plus-search" @click="handleAddFilter"></div>
			</Search>
		</div>
		<div class="table-container">
			<TableFilter ref="tableFilter" :config="tableConfig" :tableQuery.sync="tableQuery" :callback="tableCallBack" />
			<BaseTableMuti v-loading="loading" :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
		</div>
		<!-- 自定义表头 -->
		<div v-if="customColumnsPopShow">
			<CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
		</div>
		<!-- 拒绝弹窗 -->
		<div v-if="refusePopShow">
			<RefuseJoint @close="refuseJointPopClose" :refuseParam="refuseProp" />
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
// import RoleSwitch from '../orderList/components/roleSwitch'
// 弹出框
import BaseDialog from '@/components/Base/Dialog/index'
import CustomColumns from '@/components/customColumns/index'
import RefuseJoint from './components/refuse'
import { baseEmployeeListName, searchConditionInfo, searchConditionSave, searchConditionDelete, columnWidthConfigInfo, columnWidthConfigSave, companyPageList } from '@/api/base'
import { orderJointList, orderJointListExport, getValueByKey } from '@/api/order/list'
import { customerList } from '@/api/crm/supplier'
import { departmentTreeList } from '@/api/companyResource'
import { getParamMethod } from '@/utils/allKindNumber'
import { formatDate } from '@/utils/index'

const end = new Date()
const start = new Date()
let defaulTime = []
start.setTime(start.getTime() - 3600 * 1000 * 24 * 89)
defaulTime[0] = formatDate(start)
defaulTime[1] = formatDate(end)
const defaultPage = {
	pageSize: -1,
	currPage: 1
}

const defaultTableQuery = {
	columns: [],
	ascColumns: [],
	descColumns: ['createdTime'],
	query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
	tabVal: '0' // tab切换状态 0为全部
}

const defaultSearchInputGroup = [
	{ key: '', value: '', placeholder: '筛选条件', category: 'all', queryValue: '' },
	{
		key: 'createdTime',
		value: defaulTime,
		placeholder: '订单创建时间',
		category: 'all',
		queryValue: ''
	}
]

export default {
	mixins: [routerMixin],
	data() {
		return {
			departmentList: [],
			oldParams: {},
			// isSameCode: false,
			cTimestamp: 0,
			loading: false,
			state: '',
			showVal: null,
			defaultStyle: {
				width: '100%'
			},
			searchConditionList: [], // 自定义搜索模板集合
			defaultSearchLength: 0, // 默认显示搜索框的个数

			allFilterGroups: {
				all: this.filterGroups
			},
			selectDate: '',
			// 查询条件下拉选项
			filterGroups: {
				universalNo: { key: 'universalNo', label: '各类编号', type: 'input', searchType: 'eq', value: '' },
				orderNo: { key: 'orderNo', label: '工作号', type: 'input', searchType: 'like', value: '' },
				whPoNo: { key: 'whPoNo', label: '入舱单号', type: 'input', searchType: 'like', value: '' },
				so: { key: 'so', label: 'SO号', type: 'input', searchType: 'like', value: '' },
				serviceCode: { key: 'serviceCode', label: '服务项', type: 'select', searchType: 'like', value: '', filterable: true, data: [], nonDictionary: true, propInDict: 'orderServiceNameList', saveList: [] },
				custClass: {
					key: 'custClass',
					label: '客户类型',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: store.state.dict.dictMap.customerClassNew,
					nonDictionary: true
				},
				// bdEmployeeName: { key: 'bdEmployeeName', label: '销售员', type: 'input', searchType: 'like', value: '' },
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
				opEmployeeName: {
					key: 'opEmployeeName',
					label: '操作',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
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
				pricingEmployeeName: {
					key: 'pricingEmployeeName',
					label: '商务',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'pricing')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'pricing')
					}
				},
				bkgEmployeeName: {
					key: 'bkgEmployeeName',
					label: '订舱',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'bkg')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'bkg')
					}
				},
				auditTime: { label: '审核时间', key: 'auditTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
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
				rcEmployeeName: {
					key: 'rcEmployeeName',
					label: '放货',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
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
				acEmployeeName: {
					key: 'acEmployeeName',
					label: '应收',
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
				eacEmployeeName: {
					key: 'eacEmployeeName',
					label: '海外应收',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'eac')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'eac')
					}
				},
				lineCsEmployeeName: {
					key: 'lineCsEmployeeName',
					label: '航线客服',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					visibleChange: (val, item) => {
						this.getMulEmployeeName('', item, 'line_cs')
					},
					filterMehod: (val, item) => {
						this.getMulEmployeeName(val, item, 'line_cs')
					}
				},
				bdServiceMode: {
					label: '新旧模式',
					key: 'bdServiceMode',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [],
					nonDictionary: true
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
					nonDictionary: true,
					disabledEdit: true
					// propInDict: 'orderStatus'
				},
				bkgStatus: { label: '整箱订舱状态', key: 'bkgStatus', type: 'select', searchType: 'in', multiple: true, data: [], saveList: [], 'collapse-tags': true, queryValue: '', value: '', nonDictionary: true },
				issueStatusStr: {
					label: '放舱给客户状态',
					key: 'issueStatusStr',
					type: 'select',
					searchType: 'eq',
					data: [],
					propInDict: 'releaseCustomsStatus',
					value: '',
					nonDictionary: true
				},
				whBookStatus: { label: '拼箱订舱状态', key: 'whBookStatus', type: 'select', searchType: 'in', multiple: true, data: [], saveList: [], 'collapse-tags': true, queryValue: '', value: '', nonDictionary: true },
				isOpHandle: {
					label: '操作处理状态',
					key: 'isOpHandle',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [
						{ label: '未处理', value: 'n' },
						{ label: '处理中', value: 'y' },
						{ label: '已完成', value: 'complete' }
					],
					nonDictionary: true
				},
				isTrack: {
					label: '航程跟踪',
					key: 'isTrack',
					type: 'select',
					searchType: 'eq',
					propInDict: 'yesOrNoOptions',
					data: [],
					value: '',
					nonDictionary: true
				},
				custIntrustNo: { key: 'custIntrustNo', label: '客户委托号', type: 'input', searchType: 'like', value: '' },
				mainCompDeptCode: {
					key: 'mainCompDeptCode',
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
				intrustRemark: { key: 'intrustRemark', label: '委托备注', type: 'input', searchType: 'like', value: '' },
				auditRemark: { key: 'auditRemark', label: '商务备注', type: 'input', searchType: 'like', value: '' },
				bkgRemark: { key: 'bkgRemark', label: '订舱备注', type: 'input', searchType: 'like', value: '' },
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
				receiveFeeConfirmStatus: {
					key: 'receiveFeeConfirmStatus',
					label: '应收确认状态',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: store.state.dict.dictMap.feeConfirmStatus,
					nonDictionary: true
				},
				payFeeConfirmStatus: {
					key: 'payFeeConfirmStatus',
					label: '应付确认状态',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: store.state.dict.dictMap.feeConfirmStatus,
					nonDictionary: true
				},
				systemCode: {
					label: '订单来源',
					key: 'systemCode',
					propInDict: 'orderSystemCode',
					type: 'select',
					searchType: 'eq',
					value: '',
					data: [],
					nonDictionary: true
				},
				prefinCloseStatus: { label: '预关账状态', key: 'prefinCloseStatus', type: 'select', searchType: 'eq', value: '', data: store.state.order.orderList.finCloseStatus, nonDictionary: true },
				finCloseStatus: { label: '关账状态', key: 'finCloseStatus', type: 'select', searchType: 'eq', value: '', data: store.state.order.orderList.finCloseStatus, nonDictionary: true },
				businessType: { label: '业务类型', key: 'businessType', propInDict: 'shipBusinessType', type: 'select', searchType: 'in', multiple: true, data: [], saveList: [], 'collapse-tags': true, queryValue: '', value: '', nonDictionary: true },
				serviceType: { label: '服务类型', key: 'serviceType', type: 'select', searchType: 'in', multiple: true, data: [], saveList: [], 'collapse-tags': true, queryValue: '', value: '', nonDictionary: true, propInDict: 'shipServiceType' },
				cargoCname: { key: 'cargoCname', label: '中文品名', type: 'input', searchType: 'like', value: '' },
				blNo: { key: 'blNo', label: '提单号', type: 'input', searchType: 'like', value: '' },
				blType: { key: 'blType', label: '提单类型', type: 'select', searchType: 'eq', value: '', data: [], nonDictionary: true },
				jointNo: { key: 'jointNo', label: '协同单号', type: 'input', searchType: 'like', value: '' },
				createdTime: {
					label: '订单创建时间',
					key: 'createdTime',
					type: 'date',
					searchType: 'eq',
					value: '',
					category: 'daterange',
					format: 'yyyy-MM-dd',
					'default-value': defaulTime,
					clearable: false,
					pickerOptions: {
						// 设置不能选择的日期
						onPick: ({ maxDate, minDate }) => {
							this.selectDate = minDate.getTime()
							if (maxDate) {
								this.selectDate = ''
							}
						},
						disabledDate: time => {
							// 1年365天的时间戳
							let two = 365 * 24 * 3600 * 1000
							// 是否限制的判断条件
							if (this.selectDate) {
								return time > new Date(this.selectDate + two) || time < new Date(this.selectDate - two)
							} else {
								return false
							}
						},
						shortcuts: [
							{
								text: '最近三天',
								onClick(picker) {
									const end = new Date()
									const start = new Date()
									start.setTime(start.getTime() - 3600 * 1000 * 24 * 2)
									picker.$emit('pick', [start, end])
								}
							},
							{
								text: '最近一周',
								onClick(picker) {
									const end = new Date()
									const start = new Date()
									start.setTime(start.getTime() - 3600 * 1000 * 24 * 6)
									picker.$emit('pick', [start, end])
								}
							},
							{
								text: '最近一个月',
								onClick(picker) {
									const end = new Date()
									const start = new Date()
									start.setTime(start.getTime() - 3600 * 1000 * 24 * 29)
									picker.$emit('pick', [start, end])
								}
							},
							{
								text: '最近两个月',
								onClick(picker) {
									const end = new Date()
									const start = new Date()
									start.setTime(start.getTime() - 3600 * 1000 * 24 * 59)
									picker.$emit('pick', [start, end])
								}
							},
							{
								text: '最近三个月',
								onClick(picker) {
									const end = new Date()
									const start = new Date()
									start.setTime(start.getTime() - 3600 * 1000 * 24 * 89)
									picker.$emit('pick', [start, end])
								}
							},
							{
								text: '最近半年',
								onClick(picker) {
									const end = new Date()
									const start = new Date()
									start.setTime(start.getTime() - 3600 * 1000 * 24 * 179)
									picker.$emit('pick', [start, end])
								}
							},
							{
								text: '最近一年',
								onClick(picker) {
									const end = new Date()
									const start = new Date()
									start.setTime(start.getTime() - 3600 * 1000 * 24 * 364)
									picker.$emit('pick', [start, end])
								}
							},
							{
								text: '今年',
								onClick(picker) {
									const end = new Date()
									const start = new Date(end.getFullYear() + '-01-01')
									picker.$emit('pick', [start, end])
								}
							}
						]
					}
				},
				createdBy: {
					key: 'createdBy',
					label: '创建人',
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
				bizDate: { label: '业务日期', key: 'bizDate', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				shipCarrierCode: {
					key: 'shipCarrierCode',
					label: '船公司',
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
							this.shipCarrierQuerySearch('', item)
						}
					},
					filterMehod: (val, item) => {
						this.shipCarrierQuerySearch(val, item)
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
					queryValue: '',
					visibleChange: (val, item) => {
						this.getSupplierList('bkg_agent', '', item)
					},
					filterMehod: (val, item) => {
						this.getSupplierList('bkg_agent', val, item)
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
				destinationArea: { key: 'destinationArea', label: '最终目的地', type: 'input', searchType: 'like', value: '' },
				bargeVessel: {
					key: 'bargeVessel',
					label: '驳船船名',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					'allow-create': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						if (val) {
							this.queryVessleList('', item)
						}
					},
					filterMehod: (val, item) => {
						this.queryVessleList(val, item)
					}
				},
				bargeVoyage: {
					key: 'bargeVoyage',
					label: '驳船航次',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					'allow-create': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						if (val) {
							this.queryVoyageList('', item)
						}
					},
					filterMehod: (val, item) => {
						this.queryVoyageList(val, item)
					}
				},
				vessel: {
					key: 'vessel',
					label: '大船船名',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					'allow-create': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						if (val) {
							this.queryVessleList('', item)
						}
					},
					filterMehod: (val, item) => {
						this.queryVessleList(val, item)
					}
				},
				voyage: {
					key: 'voyage',
					label: '大船航次',
					type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					'allow-create': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
					visibleChange: (val, item) => {
						if (val) {
							this.queryVoyageList('', item)
						}
					},
					filterMehod: (val, item) => {
						this.queryVoyageList(val, item)
					}
				},
				bargeCyCutOff: { label: '驳船截关时间', key: 'bargeCyCutOff', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				cyCutOff: { label: '大船截关时间', key: 'cyCutOff', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				bargeEtdTime: { label: '驳船预计开船时间', key: 'bargeEtdTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				etdTime: { label: '大船预计开船时间', key: 'etdTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				bargeTdTime: { label: '驳船实际开船时间', key: 'bargeTdTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				tdTime: { label: '大船实际开船时间', key: 'tdTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				carrierLineName: { key: 'carrierLineName', label: '承运人航线', type: 'input', searchType: 'like', value: '' },
				siCutOff: { label: '截补料时间', key: 'siCutOff', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				vgmCutOff: { label: '截VGM时间', key: 'vgmCutOff', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				etWhCyCutOff: { label: '预计截仓时间', key: 'etWhCyCutOff', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				whCyCutOff: { label: '实际截仓时间', key: 'whCyCutOff', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' },
				etaTime: { label: '预计到港时间', key: 'etaTime', type: 'date2', searchType: 'eq', value: '', category: 'daterange', format: 'yyyy-MM-dd' }
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
					show: true
				},
				options: {
					// 是否支持解锁列表修改,默认锁定列表不可更改
					lockState: true,
					// 是否支持列表项选中功能
					mutiSelect: true,
					// 多选框状态判断 {false不可选, true可选}
					checkSelectable({ orderNo }) {
						return orderNo ? true : false
					}
				},
				customColumns: {
					show: true,
					handleCustomColumns: this.handleCustomColumns
				},
				defaultEmpty: true, // 数据默认不加载的显示文案
				list: [],
				configColumns: [],
				columns: [],
				allColumns: store.state.order.jointList.columnsBase(this.handleOrderNoInfo),

				// 操作按钮组
				operationBtns: {
					minWidth: '120',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						if (action === 'Info') {
							this.handleInfo(row)
						}

						if (action === 'Refuse') {
							this.handleRefuse(row)
						}

						if (action === 'Audit') {
							this.handleAudit(row)
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

			// 拒绝弹窗
			refusePopShow: false,
			refuseProp: {
				id: '',
				orderNo: '',
				jointNo: ''
			},
			isClickInfo: false,
			resDefaConfList: [] // 后端配置的默认搜索模板
		}
	},
	beforeRouteLeave(to, from, next) {
		if (to.name === 'JointOrderDetail') {
			let views = this.$store.state.tagsView.visitedViews.filter(item => item.params.orderNo === to.params.orderNo)
			// console.log('views', views)
			this.$store.commit('tagsView/DEL_SAMEORDER_VISITED_VIEW', views)
		}
		// console.log(to)
		next()
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
	mounted() {},
	computed: {
		...mapState('user', ['deptCode']),
		...mapState({
			currRole: state => state.order.currRole,
			dictMap: state => state.dict.dictMap,
			jointList: state => state.order.jointList,
			defaultColumns: state => state.order.jointList.defaultColumns,
			specialColumns: state => state.order.jointList.specialColumns,
			columnsBase: state => state.order.jointList.columnsBase()
		}),
		isAc() {
			return this.currRole === 'ac'
		},
		isDoc() {
			return this.currRole === 'doc'
		},
		isOp() {
			return this.currRole === 'op'
		},
		isBd() {
			return this.currRole === 'bd' || this.currRole === 'obd'
		},
		showSearchInputGroup() {
			let index = this.searchInputGroup.findIndex(item => item.key === 'createdTime')
			if (index !== -1) {
				this.searchInputGroup.push(this.searchInputGroup[index])
				this.searchInputGroup.splice(index, 1)
			}
			return this.searchInputGroup
		}
	},
	watch: {},
	components: {
		Search,
		AddFilter,
		BaseTableMuti,
		TableFilter,
		// RoleSwitch,
		BaseDialog,
		CustomColumns,
		RefuseJoint
	},
	methods: {
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
		// 获取委托单位
		getCustList(val, item) {
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
					return {
						...ele,
						label: ele.name,
						value: ele.companyCode || ''
					}
				})
				item.data = [...item.saveList, ...itemList]
			})
		},
		// 获取员工name
		getEmployeeName(val, item, roleCode) {
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
					return { ...ele, label: this.$language === 'en' ? ele.ename : ele.cname, value: ele.employeeId ? Number(ele.employeeId) : '' }
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
		initQuery() {
			this.tableQuery.currPage = 1
			this.tableQuery.query = []
			this.init()
			this.getSearchConditionInfo()
			this.getList()
		},

		init() {
			// 默认登录角色设为op
			// this.$store.dispatch('order/setCurrRole', 'op)
			console.log('jointList-currRole', this.currRole)
			Object.assign(this.allFilterGroups, {
				all: this.filterGroups
			})

			// bd
			if (this.isBd) {
				this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
			}
			// op
			if (this.isOp) {
				this.searchInputGroup = [
					{
						key: 'orderNo',
						value: '',
						placeholder: '各类编号',
						category: 'all',
						queryValue: ''
					},
					{
						key: 'carrierLineName',
						value: '',
						placeholder: '承运人航线',
						category: 'all',
						queryValue: ''
					},
					{
						key: 'bizDate',
						value: '',
						placeholder: '业务日期',
						category: 'all',
						queryValue: ''
					}
				]
			}
		},

		// 增加一条搜索条件
		handleAddFilter() {
			this.searchInputGroup.push({ key: '', value: '', category: 'all', queryValue: '' })
		},

		// 远程搜索港口下拉数据
		portSearch(queryString, portAttribute, state, type, item) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				this.searchSelectVisibleData(data, item)
			})
		},
		// 系统航线下拉列表自动补充的数据
		sysLineQuerySearch(queryString, item) {
			this.$store.dispatch('dict/baseSystemLineList', { name: queryString, state: '' }).then(data => {
				this.searchSelectVisibleData(data, item)
			})
		},
		// 船公司下拉列表自动补充的数据
		shipCarrierQuerySearch(queryString, item) {
			this.$store.dispatch('dict/baseShippingCarrierList', { name: queryString, state: 'valid' }).then(data => {
				this.searchSelectVisibleData(data, item)
			})
		},
		// 船名下拉
		queryVessleList(queryString, item) {
			this.$store.dispatch('dict/queryVessleList', { name: queryString }).then(data => {
				console.log('vessel', data)
				this.searchSelectVisibleData(data, item)
			})
		},
		// 航次下拉
		queryVoyageList(queryString, item) {
			this.$store.dispatch('dict/queryVoyageList', { name: queryString }).then(data => {
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
		// 获取订舱代理
		getSupplierList(type, queryString, item) {
			this.$store.dispatch('dict/queryBkgAgentSupplierList', { category: 'category', value: 'bkg_carrier,bkg_agent', queryString: queryString, categoryType: 'in' }).then(data => {
				let filterArr = data.list.filter(ele => !item.saveList.find(o => o.value === ele.supplierId))
				let itemList = filterArr.map(ele => {
					return { ...ele, label: this.$language == 'en' ? ele.ename : ele.name, value: ele.supplierId ? Number(ele.supplierId) : '' }
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
				// 阻止分页的页码enter键触发全局的监听事件
				let className = window.event.target.parentNode.className
				if (className.includes('el-pagination__editor')) return
				//触发的事件
				this.searchCallBack('Search')
			}
		},

		// 获取列表请求参数
		getListQuery() {
			// console.log('🚀 ~ this.tableQuery.orderStatus', this.tableQuery.query)
			// this.tableQuery.query = this.tableQuery.query.filter(item => item.column !== 'orderStatus')
			let statusQuery = []
			// 全部
			if (this.tableQuery.tabVal === '0') {
				statusQuery = [{ column: 'orderStatus', type: 'in', value: 'pass,cancel,break,complete' }]
			} else if (this.tableQuery.tabVal === '1') {
				statusQuery = [
					{ column: 'isServiceComplete', type: 'eq', value: 'n' },
					{ column: 'orderStatus', type: 'in', value: 'pass,cancel,break' }
				]
			} else if (this.tableQuery.tabVal === '2') {
				statusQuery = [
					{ column: 'cancelApplyStatus', type: 'eq', value: '1' },
					{ column: 'orderStatus', type: 'in', value: 'pass,cancel,break' }
				]
			} else if (this.tableQuery.tabVal === '3') {
				statusQuery = [{ column: 'isServiceComplete', type: 'eq', value: 'y' }]
			}
			// 合并状态参数
			let data = {}
			// console.log(this.tableQuery)
			Object.assign(data, this.tableQuery, {
				query: this.tableQuery.query.concat(statusQuery)
			})
			delete data.tabVal
			return data
		},

		// 列表数据
		async getList() {
			this.loading = true
			let { data } = await columnWidthConfigInfo({
				scenesCode: `${this.$route.name}`
			})
			let { columnWidthList } = data
			let query = this.getListQuery()
			//处理逗号分割的多个订单号
			query.query.map(item => {
				if (['orderNo', 'so', 'blNo', 'carrierLineName', 'whPoNo'].includes(item.column)) {
					// item.type = item.column === 'so' || item.column === 'blNo' ? 'like' : 'in'
					item.type = 'like'
					item.value = item.value
						.split(/[,|，|\s]/)
						.filter(Boolean)
						.join('#')
				}
			})
			getParamMethod(this.$route.name, query).then(queryObj => {
				this.oldParams = queryObj
				orderJointList(queryObj)
					.then(response => {
						let { list, totalCount, allColumns, configColumns, pageSize } = response.data
						list.forEach(item => {
							item.serviceTypeName = getDictLabel('shipServiceType', item.serviceType)
							item.businessTypeCn = getDictLabel('shipBusinessType', item.businessType)
						})
						this.tableConfig.list = list
						// 请求无数据显示的文案
						if (!list || !list.length) {
							this.$set(this.tableConfig, 'defaultEmpty', false)
						}
						this.tableConfig.pagination.total = totalCount
						this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
						this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
						this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
						this.tableConfig.pagination.isLastPage = response.data.isLastPage
						this.tableQuery.currPage = response.data.currPage
						this.tableConfig.configColumns = configColumns.length ? configColumns : this.defaultColumns
						this.tableConfig.configColumns.push('isCancelApply', 'isNotify', 'isChange')
						this.tableConfig.configColumns = new Set(this.tableConfig.configColumns)
						this.tableConfig.configColumns = Array.from(this.tableConfig.configColumns)
						this.tableQuery.pageSize = pageSize
						this.handleFilterColumns(this.tableConfig.configColumns)
						// 设置列宽为服务器返回的新的列宽宽度
						this.tableConfig.columns.map((item, index) => {
							let findItem = columnWidthList.find(ele => ele.column === item.prop)
							let newWidth = findItem ? findItem.width : ''
							let fixedObj = { fixed: index === 0 }
							return Object.assign(item, { width: newWidth || item.width }, fixedObj)
						})
						this.tableColumnsWidthList = this.getTableColumnsWidth()
						// this.getTableColumnWidthInfo()
					})
					.finally(() => {
						this.loading = false
					})
			})
		},

		// 查询组件回调
		async searchCallBack(action, param, isFirstLoad) {
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
									// if (item.value) query.push({ column: item.key, type: 'ge', value: item.value[0] + ' 00:00:00' }, { column: item.key, type: 'le', value: item.value[1] + ' 23:59:59' })
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
								} else if (['prefinCloseStatus', 'finCloseStatus'].includes(item.key)) {
									// 特殊处理预关账状态，关账状态
									if (item.value) {
										// 选择未关账传值不等于yes
										if (item.value === 'yes') {
											Object.assign(tempItem, {
												column: item.key,
												type: 'eq',
												value: 'yes'
											})
										} else {
											Object.assign(tempItem, {
												column: item.key,
												type: 'ne',
												value: 'yes'
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
							query.push(tempItem)
						}
					})
					// 按orderStatus查询，特殊处理表格tab值为空，不按orderStatus查的默认值为all,显示全部tab
					if (this.searchInputGroup.some(ele => ele.key === 'orderStatus' && ele.value && ele.value.length)) {
						this.tableQuery.tabVal = ''
					} else if (!this.tableQuery.orderStatus) {
						this.tableQuery.tabVal = '0'
					} else {
					}
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
				if (this.searchInputGroup.some(item => item.key === 'createdTime')) {
					this.searchInputGroup.map(item => {
						if (item.key === 'createdTime') {
							if (!item.value) item.value = defaulTime
						}
					})
				} else {
					this.searchInputGroup.push({
						key: 'createdTime',
						value: defaulTime,
						placeholder: '订单创建时间',
						category: 'all',
						queryValue: ''
					})
				}
				// this.setSearchOrderStatusValue(isFirstLoad)
			}
			// 刷新
			if (action === 'Refresh') {
				this.loading = true
				let { data } = await columnWidthConfigInfo({
					scenesCode: `${this.$route.name}`
				})
				let { columnWidthList } = data
				orderJointList(this.oldParams)
					.then(response => {
						let { list, totalCount, allColumns, configColumns, pageSize } = response.data
						list.forEach(item => {
							item.serviceTypeName = getDictLabel('shipServiceType', item.serviceType)
							item.businessTypeCn = getDictLabel('shipBusinessType', item.businessType)
						})
						this.tableConfig.list = list
						this.tableConfig.pagination.total = totalCount
						this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
						this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
						this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
						this.tableConfig.pagination.isLastPage = response.data.isLastPage
						this.tableQuery.currPage = response.data.currPage
						this.tableConfig.configColumns = configColumns.length ? configColumns : this.defaultColumns
						this.tableConfig.configColumns.push('isCancelApply', 'isNotify', 'isChange')
						this.tableConfig.configColumns = new Set(this.tableConfig.configColumns)
						this.tableConfig.configColumns = Array.from(this.tableConfig.configColumns)
						this.tableQuery.pageSize = pageSize
						this.handleFilterColumns(this.tableConfig.configColumns)
						// 设置列宽为服务器返回的新的列宽宽度
						this.tableConfig.columns.map((item, index) => {
							let findItem = columnWidthList.find(ele => ele.column === item.prop)
							let newWidth = findItem ? findItem.width : ''
							let fixedObj = { fixed: index === 0 }
							return Object.assign(item, { width: newWidth || item.width }, fixedObj)
						})
						this.tableColumnsWidthList = this.getTableColumnsWidth()
						// this.getTableColumnWidthInfo()
					})
					.finally(() => {
						this.loading = false
					})
			}
		},
		handleSearchValueReset() {
			this.searchInputGroup.map(item => {
				if (item.key !== 'createdTime') {
					item.value = ''
					return { ...item }
				}
			})
			// console.log('重置')
		},
		// 撤回审核
		handleAudit(row) {
			// this.cancelOrderPopShow = true;
		},
		// 反显查询条件的订单状态
		getOrderStatusArr(arr) {
			return this.dictMap.orderStatus.filter(item => arr.includes(item.value)).map(item => ({ label: item.label, value: item.value }))
		},
		// 搜索条件的订单状态的默认下拉选中值
		setSearchOrderStatusValue(isFirstLoad) {
			if (this.searchInputGroup.some(item => item.key === 'orderStatus')) {
				this.searchInputGroup.map(item => {
					if (item.key === 'orderStatus') {
						item.value = []
					}
				})
			}
			// else {
			// 	this.searchInputGroup.push({
			// 		key: 'orderStatus',
			// 		value: [],
			// 		placeholder: '订单状态',
			// 		category: 'all',
			// 		queryValue: '',
			// 		hideDel: true
			// 	})
			// }
			// if (isFirstLoad) {
			// 	this.searchInputGroup.map(item => {
			// 		if (item.key === 'orderStatus') {
			// 			if (this.tableQuery.tabVal === '0') {
			// 				item.value = ['pass','break','complete','cancel']
			// 			}
			// 			// else if (this.tableQuery.tabVal === '1' || this.tableQuery.tabVal === '2' || this.tableQuery.tabVal === '3') {
			// 			// 	item.value = ['pass','break','cancel']
			// 			// }
			// 			this.filterGroups.orderStatus.saveList = this.getOrderStatusArr(item.value)
			// 		}
			// 	})
			// }
		},
		// 导出
		handleExport() {
			let data = this.getListQuery()
			orderJointListExport({
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
		handleSearchByJointStatus() {
			// 按tab查询，如果搜索条件已选了订单状态的可以直接忽略，直接按tab的状态查
			this.tableQuery.query = this.tableQuery.query.filter(item => item.column !== 'orderStatus')
			this.tableQuery.currPage = 1
			this.setSearchOrderStatusValue()
			this.getList()
		},

		handleSizeChange(val) {
			this.getList()
		},

		handleCurrentChange(val) {
			// 刷新页面的先调自定义搜索查询接口，拿到自定义的搜索条件再调getList接口
			// if (val) {
			// 	this.tableQuery.currPage = val
			// 	// this.getSearchConditionInfo()
			// }
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
		// 点击订单号查看详情
		handleOrderNoInfo(row) {
			this.handleInfo(row)
		},
		// 去详情页
		handleInfo(row) {
			let routeUrl = this.$router.resolve({
				name: 'JointOrderDetail',
				params: {
					orderNo: row.orderNo
				},
				query: {
					orderNo: row.orderNo,
					jointNo: row.jointNo,
					source: 'jointList',
					isPendding: row.exportOrderNo ? 'pendding' : '',
					showContainer: !['ship_export_lcl', 'ship_import_lcl', 'ship_oversea_wh', 'ship_bulk_ro'].includes(row.businessType), // 业务类型：拼箱,海外仓，散杂滚装的不显示集装箱tab
					showRelate: false, // this.isSameCode && ['st01', 'st15'].includes(row.serviceType)
					showBl: ['st09', 'st10', 'st11', 'st12'].includes(row.serviceType)
				}
			})
			window.open(routeUrl.href, '_blank')
		},
		// 拒绝
		handleRefuse(row) {
			Object.assign(this.refuseProp, {
				id: row.id,
				orderNo: row.orderNo,
				jointNo: row.jointNo
			})
			this.refusePopShow = true
		},

		// 协同拒绝关闭回调
		refuseJointPopClose(action, value) {
			this.refusePopShow = false
			this.getList()
		},

		// 撤回
		handleCancel(row) {},

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
				this.getList()
			}
		}
	}
}
</script>
<style lang="scss"></style>
